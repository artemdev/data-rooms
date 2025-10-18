from typing import List, Optional
from uuid import UUID, uuid4
from pathlib import Path
import shutil
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from fastapi import UploadFile
from src.database.models import File
from src.schemas import FileCreate
from src.logger import get_logger

logger = get_logger(__name__)

# Storage configuration
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def upload_file(
        db: Session,
        file: UploadFile,
        folder_id: UUID,
        custom_name: str
) -> Optional[File]:
    """
    Upload a PDF file and save it to disk.
    """
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        return None

    # Truncate original_name to 100 characters if needed
    original_name = file.filename[:100]

    # Generate unique filename to avoid conflicts
    file_extension = Path(original_name).suffix
    unique_filename = f"{uuid4()}{file_extension}"

    # Create storage path
    storage_path = UPLOAD_DIR / unique_filename

    # Save file to disk
    try:
        with storage_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except OSError as e:
        logger.error(f"Failed to save file to disk: {e}", exc_info=True)
        return None
    except Exception as e:
        logger.error(f"Unexpected error during file save: {e}", exc_info=True)
        return None

    # Get file size
    file_size = storage_path.stat().st_size

    # Use the provided custom name
    file_name = custom_name

    # Get data_room_id from folder (required)
    from src.database.models import Folder
    stmt = select(Folder).where(Folder.id == folder_id)  # type: ignore
    result = db.execute(stmt)
    folder = result.scalar_one_or_none()

    if not folder:
        # Clean up uploaded file if folder doesn't exist
        try:
            storage_path.unlink()
        except OSError as e:
            logger.warning(f"Failed to delete file {storage_path} after folder not found: {e}")
        return None  # Folder not found

    data_room_id = folder.data_room_id

    # Check if file with same name already exists in this folder
    existing_file_stmt = select(File).where(
        File.folder_id == folder_id,  # type: ignore
        File.name == file_name  # type: ignore
    )
    existing_result = db.execute(existing_file_stmt)
    existing_file = existing_result.scalar_one_or_none()

    if existing_file:
        # Clean up uploaded file if duplicate found
        try:
            storage_path.unlink()
        except OSError as e:
            logger.warning(f"Failed to delete duplicate file {storage_path}: {e}")
        # Return a special marker to indicate duplicate
        # We'll use a File object with id=None as a marker
        duplicate_marker = File(
            id=None,
            name=file_name,
            original_name=original_name,
            storage_path="",
            file_size=0,
            content_type="duplicate",
            data_room_id=data_room_id,
            folder_id=folder_id
        )
        return duplicate_marker

    # Create database record
    new_file = File(
        name=file_name,
        original_name=original_name,
        storage_path=str(storage_path),
        file_size=file_size,
        content_type="application/pdf",
        data_room_id=data_room_id,
        folder_id=folder_id
    )

    try:
        db.add(new_file)
        db.commit()
        db.refresh(new_file)
        return new_file
    except Exception:
        db.rollback()
        # Clean up uploaded file if database insert fails
        try:
            storage_path.unlink()
        except OSError as e:
            logger.warning(f"Failed to delete file {storage_path} after database error: {e}")
        raise


def update_file_name(db: Session, file_id: UUID, name: str) -> Optional[File]:
    """
    Update a file's name.
    Returns None if file not found.
    """
    try:
        # Validate name length
        if len(name) > 50:
            raise ValueError("File name cannot exceed 50 characters")

        stmt = select(File).where(File.id == file_id)  # type: ignore
        result = db.execute(stmt)
        file = result.scalar_one_or_none()

        if file:
            file.name = name
            db.commit()
            db.refresh(file)

        return file
    except SQLAlchemyError:
        raise


def delete_file(db: Session, file_id: UUID) -> Optional[File]:
    """
    Delete a file from database and disk.
    """
    stmt = select(File).where(File.id == file_id)  # type: ignore
    result = db.execute(stmt)
    file = result.scalar_one_or_none()

    if file:
        # Delete physical file from disk
        try:
            file_path = Path(file.storage_path)
            if file_path.exists():
                file_path.unlink()
        except OSError as e:
            logger.error(f"Failed to delete physical file {file.storage_path}: {e}")
            # Continue even if file deletion fails - we still want to remove DB record

        # Delete from database
        db.delete(file)
        db.commit()

    return file


def get_file(db: Session, file_id: UUID) -> Optional[File]:
    """
    Get a file by ID.
    Returns None if file not found.
    """
    stmt = select(File).where(File.id == file_id)  # type: ignore
    result = db.execute(stmt)
    return result.scalar_one_or_none()
