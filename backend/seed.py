from connect_db import session
from src.database.models import DataRoom, Folder, File


if __name__ == "__main__":
    # Create a DataRoom
    room = DataRoom(name="groceries")

    session.add(room)
    session.flush()  # flush to get room.id

    # Create parent folder
    parent_folder = Folder(
        name="parent",
        data_room_id=room.id,
    )

    session.add(parent_folder)
    session.flush()  # flush to get parent_folder.id

    # Create child folder inside parent
    child_folder = Folder(
        name="child",
        data_room_id=room.id,
        parent_folder_id=parent_folder.id,
    )

    session.add(child_folder)
    session.flush()  # flush to get child_folder.id

    # Create a file in parent folder
    parent_file = File(
        name="Parent File",
        original_name="parent_file.pdf",
        storage_path="/storage/parent_file.pdf",
        file_size=1024,
        content_type="application/pdf",
        data_room_id=room.id,
        folder_id=parent_folder.id
    )

    # Create a file in child folder
    child_file = File(
        name="Child File",
        original_name="child_file.pdf",
        storage_path="/storage/child_file.pdf",
        file_size=2048,
        content_type="application/pdf",
        data_room_id=room.id,
        folder_id=child_folder.id
    )

    # Add all to session
    session.add_all([parent_folder, child_folder, parent_file, child_file])
    session.commit()

    print("Seed data created successfully!")
