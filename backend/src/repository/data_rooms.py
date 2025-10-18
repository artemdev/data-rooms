from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from src.database.models import DataRoom
from src.schemas import DataRoomCreate


def get_all_data_rooms(db: Session):
    try:
        stmt = select(DataRoom)
        result = db.execute(stmt)

        return result.scalars().all()
    except SQLAlchemyError:
        raise


def get_data_room(db: Session, data_room_id: UUID) -> Optional[DataRoom]:
    """
    Get a data room by ID with its root-level folders and root-level files.

    Root-level means:
    - Folders where parent_folder_id is NULL
    - Files where folder_id is NULL
    """
    try:
        stmt = select(DataRoom).options(
            joinedload(DataRoom.folders),
            joinedload(DataRoom.files)
        ).where(
            DataRoom.id == data_room_id  # type: ignore
        )

        result = db.execute(stmt)
        data_room = result.unique().scalar_one_or_none()

        if data_room:
            # Filter to only root-level folders (parent_folder_id is NULL)
            data_room.folders = [f for f in data_room.folders if f.parent_folder_id is None]
            # Filter to only root-level files (folder_id is NULL)
            data_room.files = [f for f in data_room.files if f.folder_id is None]

        return data_room
    except SQLAlchemyError:
        db.rollback()  # rollback is safe even for SELECTs; ensures session is clean
        raise


def create_data_room(db: Session, data_room: DataRoomCreate) -> DataRoom:
    """
    Create a new data room.
    """
    try:
        db_data_room = DataRoom(name=data_room.name)
        db.add(db_data_room)
        db.commit()
        db.refresh(db_data_room)
        return db_data_room
    except SQLAlchemyError:
        db.rollback()
        raise


def delete_data_room(db: Session, data_room_id: UUID) -> str:
    """
    Delete a data room by ID.
    Returns True if deleted, False if not found.
    """
    try:
        stmt = select(DataRoom).where(DataRoom.id == data_room_id)  # type: ignore
        result = db.execute(stmt)
        data_room = result.scalar_one_or_none()

        if data_room is None:
            return 'Data Room not found'

        db.delete(data_room)
        db.commit()
        return 'Data Room deleted'
    except SQLAlchemyError:
        db.rollback()
        raise
