from typing import List, Optional
from uuid import UUID
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File as FastAPIFile
from fastapi.responses import FileResponse as FastAPIFileResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from src.database.db import get_db
from src.schemas import FileResponse, FileUpdate
from src.repository import files as repository_files
from src.logger import get_logger

import os

logger = get_logger(__name__)
IS_PRODUCTION = os.getenv("ENVIRONMENT") == "production"

router = APIRouter(prefix='/files', tags=["files"])


@router.post("/upload", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
def upload_file(
        file: UploadFile = FastAPIFile(...),
        name: str = FastAPIFile(...),
        folder_id: UUID = FastAPIFile(...),
        db: Session = Depends(get_db)
):
    """
    Upload a PDF file to a folder.

    Parameters:
    - file: PDF file to upload (required)
    - name: File name without extension (required)
    - folder_id: UUID of the target folder (required)

    Returns:
    - 201: File uploaded successfully

    Errors:
    - 400: No file provided
    - 400: Invalid file type (not PDF)
    - 400: Empty file name
    - 400: File name exceeds 50 characters
    - 400: Invalid characters in name (/ \\ : * ? " < > |)
    - 400: File size exceeds 100MB
    - 400: Empty file (0 bytes)
    - 404: Folder not found
    - 409: File with same name already exists
    - 500: Database constraint error
    - 500: Unexpected server error

    Notes:
    - Original filename is automatically truncated to 100 characters if needed
    """
    try:
        # Validate file exists
        if not file or not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No file provided"
            )

        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are supported. Please upload a .pdf file"
            )

        # Validate file name
        if not name or not name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File name cannot be empty"
            )

        # Validate file name length
        if len(name) > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File name cannot exceed 50 characters"
            )

        # Validate file name doesn't contain invalid characters
        invalid_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
        if any(char in name for char in invalid_chars):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File name cannot contain: {', '.join(invalid_chars)}"
            )

        # Validate file size (max 100MB)
        max_file_size = 100 * 1024 * 1024  # 100MB
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)

        if file_size > max_file_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds maximum allowed size of 100MB. Your file is {file_size / (1024 * 1024):.2f}MB"
            )

        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty. Please upload a valid PDF file"
            )

        uploaded_file = repository_files.upload_file(db, file, folder_id, name)

        if uploaded_file is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Folder with ID '{folder_id}' not found"
            )

        if uploaded_file.content_type == "duplicate":
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A file named '{name}.pdf' already exists in this folder. Please choose a different name or delete the existing file first."
            )

        return uploaded_file
    except SQLAlchemyError as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
        )

@router.get("/{file_id}", response_model=FileResponse)
def get_file(
        file_id: UUID,
        db: Session = Depends(get_db)
):
    """
    Get file metadata by ID.

    Parameters:
    - file_id: UUID of the file (required)

    Returns:
    - 200: File metadata retrieved successfully

    Errors:
    - 404: File not found
    - 422: Invalid UUID format
    - 500: Unexpected server error
    """
    try:
        file = repository_files.get_file(db, file_id)

        if file is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File with ID '{file_id}' not found"
            )

        return file

    except HTTPException:
        raise
    except Exception as e:
        # Log detailed error for debugging
        logger.error(
            f"Unexpected error retrieving file {file_id}: {str(e)}",
            exc_info=True,
            extra={"file_id": str(file_id)}
        )

        # Return appropriate detail based on environment
        if not IS_PRODUCTION:
            detail = f"An unexpected error occurred while retrieving file: {str(e)}"
        else:
            detail = "An unexpected error occurred while retrieving file"

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )


@router.get("/{file_id}/download")
def download_file(
        file_id: UUID,
        db: Session = Depends(get_db)
):
    """
    Download/view a file.

    Parameters:
    - file_id: UUID of the file (required)

    Returns:
    - 200: File downloaded successfully

    Errors:
    - 404: File not found in database
    - 404: File doesn't exist on disk
    - 422: Invalid UUID format
    - 500: Unexpected server error
    """
    try:
        file = repository_files.get_file(db, file_id)

        if file is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File with ID '{file_id}' not found"
            )

        # Check if file exists on disk
        file_path = Path(file.storage_path)
        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File '{file.original_name}' not found on server. It may have been deleted."
            )

        return FastAPIFileResponse(
            path=file.storage_path,
            media_type="application/pdf",
            filename=file.original_name
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while downloading the file"
        )


@router.put("/{file_id}", response_model=FileResponse)
def update_file_name(
        file_id: UUID,
        body: FileUpdate,
        db: Session = Depends(get_db)
):
    """
    Update a file's name.

    Parameters:
    - file_id: UUID of the file (required)
    - name: New file name without extension (required, max 50 characters)

    Returns:
    - 200: File name updated successfully

    Errors:
    - 400: Empty file name
    - 400: File name exceeds 50 characters
    - 400: Invalid characters in name (/ \\ : * ? " < > |)
    - 400: File with same name already exists in folder
    - 404: File not found
    - 422: Invalid UUID format
    - 500: Database constraint error
    - 500: Unexpected server error
    """
    try:
        name = body.name
        # Validate file name
        if not name or not name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File name cannot be empty"
            )

        # Validate file name doesn't contain invalid characters
        invalid_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
        if any(char in name for char in invalid_chars):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File name cannot contain: {', '.join(invalid_chars)}"
            )

        file = repository_files.update_file_name(db, file_id, name)

        if file is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File with ID '{file_id}' not found"
            )

        return file

    except ValueError as e:
        # Catch validation errors from repository
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except IntegrityError as e:
        db.rollback()
        if "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A file named '{name}' already exists in this folder"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update file due to database constraint"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating the file"
        )


@router.delete("/{file_id}", response_model=FileResponse)
def delete_file(
        file_id: UUID,
        db: Session = Depends(get_db)
):
    """
    Delete a file (removes from database and disk).

    Parameters:
    - file_id: UUID of the file (required)

    Returns:
    - 200: File deleted successfully

    Errors:
    - 404: File not found
    - 422: Invalid UUID format
    - 500: Unexpected server error
    """
    try:
        file = repository_files.delete_file(db, file_id)

        if file is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File with ID '{file_id}' not found"
            )

        return file

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while deleting the file"
        )
