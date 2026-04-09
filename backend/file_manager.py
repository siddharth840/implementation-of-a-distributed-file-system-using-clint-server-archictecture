import os
import httpx
import logging
from sqlalchemy.orm import Session
from database import FileMetadata, ActivityLog, Setting

STORAGE_PATH = "storage"
NODES = {
    "node1": os.getenv("NODE1_URL", "http://localhost:8001"),
    "node2": os.getenv("NODE2_URL", "http://localhost:8002"),
    "node3": os.getenv("NODE3_URL", "http://localhost:8003")
}

def get_node_url(node, endpoint):
    return f"{NODES[node]}/{endpoint.lstrip('/')}"

def log_activity(db: Session, action: str, filename: str, user: str = "Admin"):
    log = ActivityLog(action=action, filename=filename, user=user)
    db.add(log)
    db.commit()

def distribute_file(db: Session, file_content: bytes, filename: str, size: int, owner: str = "Admin"):
    # Distribute the file across all nodes via HTTP
    node_locations = []
    
    # We should use a standard sync client since this isn't an async route
    with httpx.Client(timeout=30.0) as client:
        for node, base_url in NODES.items():
            try:
                # We send the bytes as a file upload using the standard files parameter
                files = {'file': (filename, file_content, 'application/octet-stream')}
                url = f"{base_url}/upload/{filename}"
                response = client.post(url, files=files)
                if response.status_code == 200:
                    node_locations.append(node)
                else:
                    logging.warning(f"Failed to upload to {node}: {response.text}")
            except Exception as e:
                logging.error(f"Error connecting to {node}: {e}")
                
    if not node_locations:
        raise Exception("Failed to upload file to any node")
    
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

def delete_file(db: Session, filename: str, soft: bool = True):
    if soft:
        db_files = db.query(FileMetadata).filter(FileMetadata.filename == filename, FileMetadata.is_deleted == False).all()
    else:
        db_files = db.query(FileMetadata).filter(FileMetadata.filename == filename, FileMetadata.is_deleted == True).all()

    if not db_files:
        return False
    
    # If any version is locked, prevent deletion
    if any(f.locked for f in db_files):
        return False
    
    if soft:
        for f in db_files:
            f.is_deleted = True
        db.commit()
        log_activity(db, "SOFT_DELETE", filename)
        return True

    # Permanent Remove from active nodes via HTTP
    success_count = 0
    with httpx.Client(timeout=10.0) as client:
        for node, base_url in NODES.items():
            try:
                url = f"{base_url}/delete/{filename}"
                response = client.delete(url)
                if response.status_code == 200:
                    success_count += 1
            except Exception as e:
                logging.error(f"Error deleting from {node}: {e}")
                
    # 2FA Enforcement Check
    two_factor_setting = db.query(Setting).filter(Setting.key == "two_factor_auth").first()
    two_factor_enabled = two_factor_setting.value == "true" if two_factor_setting else False
    
    if two_factor_enabled and success_count < 2:
        raise Exception("Multi-node confirmation failed: Not enough node acknowledgments for administrative deletion")
            
    for f in db_files:
        db.delete(f)
    db.commit()
    
    log_activity(db, "PERMANENT_DELETE", filename)
    return True

def restore_file(db: Session, filename: str):
    db_files = db.query(FileMetadata).filter(FileMetadata.filename == filename, FileMetadata.is_deleted == True).all()
    if not db_files:
        return False
    
    for f in db_files:
        f.is_deleted = False
    db.commit()
    
    log_activity(db, "RESTORE", filename)
    return True

def toggle_lock(db: Session, filename: str, lock_state: bool):
    db_files = db.query(FileMetadata).filter(FileMetadata.filename == filename, FileMetadata.is_deleted == False).all()
    if not db_files:
        return None
    
    for db_file in db_files:
        db_file.locked = lock_state
    db.commit()
    for db_file in db_files:
        db.refresh(db_file)
    
    action = "LOCK" if lock_state else "UNLOCK"
    log_activity(db, action, filename)
    return db_files[0]
