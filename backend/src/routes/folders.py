from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from src.database.db import get_db
from src.schemas import FolderResponse, FolderCreate, FolderUpdate
from src.repository import folders as repository_folders

router = APIRouter(prefix='/folders', tags=["folders"])


@router.post(
    "",
    response_model=FolderResponse,
    status_code=status.HTTP_201_CREATED
)
def create_folder(
        body: FolderCreate,
        db: Session = Depends(get_db)
):
    """
    Create a new folder, optionally nested in a parent folder.
    The depth is calculated automatically based on the parent folder.

    Parameters:
    - body: FolderCreate containing:
      - name: Folder name (required)
      - parent_folder_id: UUID of parent folder (optional, null for root folders)
      - data_room_id: UUID of the data room (required)

    Returns:
    - 201: Folder created successfully

    Errors:
    - 400: Empty folder name
    - 400: Folder name exceeds 50 characters
    - 400: Invalid characters in name (/ \\ : * ? " < > |)
    - 400: Folder with same name already exists in location
    - 404: Parent folder not found
    - 422: Invalid UUID format
    - 500: Database constraint error
    - 500: Unexpected server error

    Notes:
    - If parent_folder_id is null, depth will be set to 0 (root folder)
    - If parent_folder_id is provided, depth will be set to parent.depth + 1
    """
    try:
        # Validate folder name
        if not body.name or not body.name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Folder name cannot be empty"
            )

        # Validate folder name length
        if len(body.name) > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Folder name cannot exceed 50 characters"
            )

        # Validate folder name doesn't contain invalid characters
        invalid_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
        if any(char in body.name for char in invalid_chars):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Folder name cannot contain: {', '.join(invalid_chars)}"
            )

        created_folder = repository_folders.create_folder(db, body)

        if created_folder is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent folder with ID '{body.parent_folder_id}' not found"
            )

        return created_folder

    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A folder with the name '{body.name}' already exists in this location"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get(
    "/{folder_id}",
    response_model=FolderResponse
)
def get_folder(
        folder_id: UUID,
        db: Session = Depends(get_db)
):
    """
    Get a folder by ID with its immediate subfolders and files.

    Use this endpoint to expand a folder in the UI tree view.
    For the initial data room view, use GET /api/data-rooms/{data_room_id} instead.

    Parameters:
    - folder_id: UUID of the folder (required)

    Returns:
    - 200: Folder retrieved successfully with subfolders and files

    Errors:
    - 404: Folder not found
    - 422: Invalid UUID format
    - 500: Unexpected server error
    """
    try:
        folder = repository_folders.get_folder(db, folder_id)

        if folder is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Folder with ID '{folder_id}' not found"
            )

        return folder

    except HTTPException as e:
        raise


@router.put(
    "/{folder_id}",
    response_model=FolderResponse
)
def update_folder_name(
        body: FolderUpdate,
        folder_id: UUID,
        db: Session = Depends(get_db)
):
    """
    Update a folder's name.

    Parameters:
    - folder_id: UUID of the folder (required)
    - name: New folder name (required, max 50 characters)

    Returns:
    - 200: Folder name updated successfully

    Errors:
    - 400: Empty folder name
    - 400: Folder name exceeds 50 characters
    - 400: Invalid characters in name (/ \\ : * ? " < > |)
    - 400: Folder with same name already exists in location
    - 404: Folder not found
    - 422: Invalid UUID format
    - 500: Database constraint error
    - 500: Unexpected server error
    """
    try:
        print('body',body)
        name = body.name
        # Validate folder name
        if not name or not name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Folder name cannot be empty"
            )

        # Validate folder name length
        if len(name) > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Folder name cannot exceed 50 characters"
            )

        # Validate folder name doesn't contain invalid characters
        invalid_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
        if any(char in name for char in invalid_chars):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Folder name cannot contain: {', '.join(invalid_chars)}"
            )

        folder = repository_folders.update_folder_name(db, folder_id, name)

        if folder is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Folder with ID '{folder_id}' not found"
            )

        return folder

    except IntegrityError as e:
        db.rollback()
        if "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A folder named '{name}' already exists in this location"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update folder due to database constraint"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating the folder"
        )


@router.delete(
    "/{folder_id}",
    response_model=FolderResponse,
    responses={
        200: {"description": "Folder deleted successfully"},
        404: {"description": "Folder not found"},
        422: {"description": "Invalid UUID format"},
        500: {"description": "Internal server error"}
    }
)
def delete_folder(
        folder_id: UUID,
        db: Session = Depends(get_db)
):
    """
    Delete a folder and all its nested contents (cascade delete).

    Parameters:
    - folder_id: UUID of the folder (required)

    Returns:
    - 200: Folder deleted successfully

    Errors:
    - 404: Folder not found
    - 422: Invalid UUID format
    - 500: Unexpected server error
    """
    try:
        folder = repository_folders.delete_folder(folder_id, db)

        if folder is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Folder with ID '{folder_id}' not found"
            )

        return folder

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while deleting the folder"
        )
