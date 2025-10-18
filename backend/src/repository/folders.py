from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from src.database.models import Folder
from src.schemas import FolderCreate
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status


def create_folder(db: Session, folder_data: FolderCreate) -> Optional[Folder]:
    """
    Create a new folder, optionally nested in a parent folder.
    Only checks for duplicate folder names, not files.
    """
    try:
        depth = 0

        # Get parent folder if provided
        parent_folder = None
        if folder_data.parent_folder_id:
            stmt = select(Folder).where(Folder.id == folder_data.parent_folder_id)
            result = db.execute(stmt)
            parent_folder = result.scalar_one_or_none()
            if not parent_folder:
                return None  # Parent folder not found
            depth = parent_folder.depth + 1

        # Check for duplicate folder name in the same parent
        duplicate_folder = (
            db.query(Folder)
            .filter(
                Folder.parent_folder_id == folder_data.parent_folder_id,
                Folder.name == folder_data.name
            )
            .first()
        )
        if duplicate_folder:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A folder named '{folder_data.name}' already exists in this location."
            )

        # Create new folder
        new_folder = Folder(
            name=folder_data.name,
            depth=depth,
            parent_folder_id=folder_data.parent_folder_id,
            data_room_id=folder_data.data_room_id
        )

        db.add(new_folder)
        db.commit()
        db.refresh(new_folder)
        return new_folder

    except SQLAlchemyError:
        db.rollback()
        raise

def get_folder(db: Session, folder_id: UUID) -> Optional[Folder]:
    """
    Get a single folder by ID with its immediate subfolders and files.
    """
    try:
        stmt = select(Folder).options(
            joinedload(Folder.folders),
            joinedload(Folder.files)
        ).where(
            Folder.id == folder_id  # type: ignore
        )

        result = db.execute(stmt)
        return result.unique().scalar_one_or_none()
    except SQLAlchemyError:
        db.rollback()
        raise


def update_folder_name(db: Session, folder_id: UUID, name: str) -> Optional[Folder]:
    """
    Update a folder's name.
    """
    try:
        # Query the folder by ID
        stmt = select(Folder).where(Folder.id == folder_id)  # type: ignore
        result = db.execute(stmt)
        folder = result.scalar_one_or_none()

        if folder:
            folder.name = name
            db.commit()
            db.refresh(folder)

        return folder
    except SQLAlchemyError:
        db.rollback()
        raise


def delete_folder(folder_id: UUID, db: Session) -> Optional[Folder]:
    """
    Delete a folder and all its nested contents (cascade delete).
    """
    try:
        stmt = select(Folder).where(Folder.id == folder_id)  # type: ignore
        result = db.execute(stmt)
        folder = result.scalar_one_or_none()

        if folder:
            db.delete(folder)
            db.commit()

        return folder
    except SQLAlchemyError:
        db.rollback()
        raise
