from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID


# ------------------- DataRoom Schemas -------------------

class DataRoomModel(BaseModel):
    name: str


class DataRoomCreate(DataRoomModel):
    details: str


class DataRoomResponse(DataRoomModel):
    id: UUID
    created_at: datetime
    updated_at: datetime

    folders: Optional[List["FolderResponse"]] = []
    files: Optional[List["FileResponse"]] = []


# ------------------- Folder Schemas -------------------

class FolderModel(BaseModel):
    name: str
    depth: int = 0
    parent_folder_id: Optional[UUID] = None
    data_room_id: UUID


class FolderCreate(BaseModel):
    name: str
    parent_folder_id: Optional[UUID] = None
    data_room_id: UUID

class FolderUpdate(BaseModel):
    name: str


class FolderResponse(FolderModel):
    id: UUID
    created_at: datetime
    updated_at: datetime

    folders: Optional[List["FolderResponse"]] = []
    files: Optional[List["FileResponse"]] = []

    class Config:
        from_attributes = True


# ------------------- File Schemas -------------------

class FileBase(BaseModel):
    name: str
    original_name: str
    storage_path: str
    file_size: int
    content_type: str = "application/pdf"
    data_room_id: UUID
    folder_id: UUID = None


class FileCreate(FileBase):
    pass

class FileUpdate(BaseModel):
    name: str

class FileResponse(FileBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# To handle forward references in nested relationships
FolderResponse.update_forward_refs()
DataRoomResponse.update_forward_refs()
