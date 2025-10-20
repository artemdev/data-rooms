from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi_limiter.depends import RateLimiter
from src.database.db import get_db
from src.schemas import DataRoomResponse, DataRoomCreate, List
from src.repository import data_rooms as repository_data_rooms

router = APIRouter(prefix='/data-rooms', tags=["data-rooms"])


@router.get('', response_model=List[DataRoomResponse], dependencies=[Depends(RateLimiter(times=5, seconds=10))], )
def get_all_data_rooms(db: Session = Depends(get_db)):
    try:
        new_data_room = repository_data_rooms.get_all_data_rooms(db)

        return new_data_room

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the data room"
        )


@router.post(
    "",
    response_model=DataRoomResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Data room created successfully"},
        400: {"description": "Bad request - data room name already exists"},
        422: {"description": "Invalid request body"},
        500: {"description": "Internal server error"}
    }
)
def create_data_room(
        data_room: DataRoomCreate,
        db: Session = Depends(get_db)
):
    """
    Create a new data room.
    """
    try:
        new_data_room = repository_data_rooms.create_data_room(db, data_room)
        return new_data_room

    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A data room with the name '{data_room.name}' already exists"
        )
    except SQLAlchemyError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        raise


@router.get("/{data_room_id}", response_model=DataRoomResponse)
def get_data_room(
        data_room_id: UUID,
        db: Session = Depends(get_db)
):
    """
    Get a data room by ID with its root-level folders and files.
    """
    try:
        data_room = repository_data_rooms.get_data_room(db, data_room_id)

        if data_room is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data room with ID '{data_room_id}' not found"
            )

        return data_room

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving the data room"
        )


@router.delete("/{data_room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_data_room(
        data_room_id: UUID,
        db: Session = Depends(get_db)
):
    """
    Delete a data room by ID.

    This will cascade delete all folders and files associated with the data room.
    """
    try:
        deleted = repository_data_rooms.delete_data_room(db, data_room_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data room with ID '{data_room_id}' not found"
            )

        return None

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while deleting the data room"
        )
