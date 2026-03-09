from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import database, file_manager

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/files")
def list_files(owner: str = None, db: Session = Depends(get_db)):
    query = db.query(database.FileMetadata)
    if owner:
        query = query.filter(database.FileMetadata.owner == owner)
    return query.order_by(database.FileMetadata.upload_date.desc()).all()

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), owner: str = "Admin", db: Session = Depends(get_db)):
    content = await file.read()
    size = len(content)
    return file_manager.distribute_file(db, content, file.filename, size, owner=owner)

@app.get("/download/{filename}")
def download_file(filename: str, db: Session = Depends(get_db)):
    db_file = db.query(database.FileMetadata).filter(database.FileMetadata.filename == filename).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # In distributed system, pick any available node (node1 for simplicity here)
    path = file_manager.get_storage_path("node1", filename)
    if not os.path.exists(path):
         raise HTTPException(status_code=404, detail="File physical data missing")
         
    file_manager.log_activity(db, "DOWNLOAD", filename)
    return FileResponse(path, filename=filename)

@app.delete("/file/{filename}")
def delete_file(filename: str, db: Session = Depends(get_db)):
    success = file_manager.delete_file(db, filename)
    if not success:
        raise HTTPException(status_code=400, detail="Could not delete file (might be locked or missing)")
    return {"message": "File deleted"}

@app.post("/lock/{filename}")
def lock_file(filename: str, db: Session = Depends(get_db)):
    file = file_manager.toggle_lock(db, filename, True)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return file

@app.post("/unlock/{filename}")
def unlock_file(filename: str, db: Session = Depends(get_db)):
    file = file_manager.toggle_lock(db, filename, False)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return file

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    files = db.query(database.FileMetadata).all()
    total_files = len(files)
    storage_used = sum(f.size for f in files)
    active_clients = 12 # Mocked as per requirements
    locked_files = len([f for f in files if f.locked])
    
    return {
        "total_files": total_files,
        "storage_used": storage_used,
        "active_clients": active_clients,
        "locked_files": locked_files
    }

@app.get("/activity")
def get_activity(db: Session = Depends(get_db)):
    return db.query(database.ActivityLog).order_by(database.ActivityLog.timestamp.desc()).limit(20).all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
