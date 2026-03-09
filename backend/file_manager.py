import os
import shutil
from sqlalchemy.orm import Session
from database import FileMetadata, ActivityLog

STORAGE_PATH = "storage"
NODES = ["node1", "node2", "node3"]

def get_storage_path(node, filename):
    return os.path.join(STORAGE_PATH, node, filename)

def log_activity(db: Session, action: str, filename: str, user: str = "Admin"):
    log = ActivityLog(action=action, filename=filename, user=user)
    db.add(log)
    db.commit()

def distribute_file(db: Session, file_content: bytes, filename: str, size: int, owner: str = "Admin"):
    # For simulation, we replicate the file across all 3 nodes
    node_locations = []
    for node in NODES:
        path = get_storage_path(node, filename)
        with open(path, "wb") as f:
            f.write(file_content)
        node_locations.append(node)
    
    # Save metadata
    db_file = FileMetadata(
        filename=filename,
        size=size,
        owner=owner,
        node_locations=",".join(node_locations)
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    log_activity(db, "UPLOAD", filename)
    return db_file

def delete_file(db: Session, filename: str):
    db_file = db.query(FileMetadata).filter(FileMetadata.filename == filename).first()
    if not db_file:
        return False
    
    if db_file.locked:
        return False
    
    # Remove from nodes
    for node in NODES:
        path = get_storage_path(node, filename)
        if os.path.exists(path):
            os.remove(path)
            
    db.delete(db_file)
    db.commit()
    
    log_activity(db, "DELETE", filename)
    return True

def toggle_lock(db: Session, filename: str, lock_state: bool):
    db_file = db.query(FileMetadata).filter(FileMetadata.filename == filename).first()
    if not db_file:
        return None
    
    db_file.locked = lock_state
    db.commit()
    db.refresh(db_file)
    
    action = "LOCK" if lock_state else "UNLOCK"
    log_activity(db, action, filename)
    return db_file
