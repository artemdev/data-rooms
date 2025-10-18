from sqlalchemy import (
    Column,
    String,
    Integer,
    BigInteger,
    ForeignKey,
    DateTime,
    func,
    CheckConstraint,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional, List
import uuid

Base = declarative_base()


class DataRoom(Base):
    __tablename__ = "data_room"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("name"),
    )

    # Relationships
    folders = relationship("Folder", back_populates="data_room", cascade="all, delete-orphan")
    files = relationship("File", back_populates="data_room", cascade="all, delete-orphan")


class Folder(Base):
    __tablename__ = "folders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    data_room_id = Column(UUID(as_uuid=True), ForeignKey("data_room.id", ondelete="CASCADE"), nullable=False)
    parent_folder_id = Column(UUID(as_uuid=True), ForeignKey("folders.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(50),  nullable=False)
    depth = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("parent_folder_id", "name"),
        CheckConstraint("parent_folder_id IS NULL OR parent_folder_id != id"),
        CheckConstraint("length(name) <= 50", name="folder_name_length_check"),
    )

    # Relationships
    data_room = relationship("DataRoom", back_populates="folders")
    parent_folder = relationship("Folder", remote_side=[id], back_populates="folders")
    folders = relationship("Folder", back_populates="parent_folder", cascade="all, delete-orphan")
    files = relationship("File", back_populates="folder", cascade="all, delete-orphan")


class File(Base):
    __tablename__ = "files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    data_room_id = Column(UUID(as_uuid=True), ForeignKey("data_room.id", ondelete="CASCADE"), nullable=False)
    folder_id = Column(UUID(as_uuid=True), ForeignKey("folders.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(50), nullable=False)
    original_name = Column(String(50), nullable=False)
    storage_path = Column(String(50), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    content_type = Column(String(100), default="application/pdf")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("folder_id", "name"),
        CheckConstraint("length(name) <= 50", name="file_name_length_check"),
        CheckConstraint("length(original_name) <= 100", name="original_name_length_check"),
        CheckConstraint("length(storage_path) <= 100", name="storage_path_length_check"),
    )

    # Relationships
    data_room = relationship("DataRoom", back_populates="files")
    folder = relationship("Folder", back_populates="files")
