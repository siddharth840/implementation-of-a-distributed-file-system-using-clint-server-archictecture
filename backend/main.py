from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Query, BackgroundTasks, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
import os
import secrets
import uuid
import asyncio
import httpx
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

import database, file_manager

# Security Configuration
SECRET_KEY = "nimbusfs_ultra_secret_key_change_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI(title="NimbusFS API")

# Models
class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: Optional[str] = "standard_user"

class UserOut(BaseModel):
    username: str
    role: str

class ShareRequest(BaseModel):
    expiry_hours: int = 24
    password: str = None

class SettingRequest(BaseModel):
    key: str
    value: str

class UpdateNameRequest(BaseModel):
    name: str

# Helpers
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(database.User).filter(database.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Background Tasks
async def auto_unlock_worker():
    while True:
        db = database.SessionLocal()
        try:
            now = datetime.utcnow()
            expired_locks = db.query(database.FileMetadata).filter(
                database.FileMetadata.locked == True,
                database.FileMetadata.unlock_at != None,
                database.FileMetadata.unlock_at <= now
            ).all()
            for file in expired_locks:
                file.locked = False
                file.unlock_at = None
                file_manager.log_activity(db, "AUTO_UNLOCK", file.filename)
            if expired_locks:
                db.commit()
        except Exception as e:
            print(f"Auto-unlock worker error: {e}")
        finally:
            db.close()
        await asyncio.sleep(60)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(auto_unlock_worker())

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Endpoints
@app.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    db_user = db.query(database.User).filter(database.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    new_user = database.User(username=user.username, password_hash=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    return new_user

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(database.User).filter(database.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": {"name": user.username, "role": user.role}}

@app.put("/user/name")
def update_username(request: UpdateNameRequest, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    new_username = request.name
    if not new_username or new_username.strip() == "":
        raise HTTPException(status_code=400, detail="Username cannot be empty")
        
    if new_username == current_user.username:
        return {"success": True, "message": "Username unchanged"}
        
    if db.query(database.User).filter(database.User.username == new_username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    old_username = current_user.username
    current_user.username = new_username
    
    db.query(database.FileMetadata).filter(database.FileMetadata.owner == old_username).update({database.FileMetadata.owner: new_username}, synchronize_session=False)
    db.query(database.ActivityLog).filter(database.ActivityLog.user == old_username).update({database.ActivityLog.user: new_username}, synchronize_session=False)
    
    db.commit()
    
    access_token = create_access_token(data={"sub": new_username})
    return {"access_token": access_token, "token_type": "bearer", "user": {"name": new_username, "role": current_user.role}}

# File Management Endpoints
@app.get("/files")
def list_files(search: str = None, deleted: bool = False, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    query = db.query(database.FileMetadata).filter(database.FileMetadata.is_deleted == deleted)
    if current_user.role != "administrator":
        query = query.filter(database.FileMetadata.owner == current_user.username)
    if search:
        query = query.filter(database.FileMetadata.filename.contains(search))
    return query.order_by(database.FileMetadata.upload_date.desc()).all()

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    content = await file.read()
    owner = current_user.username
    size = len(content)
    return file_manager.distribute_file(db, content, file.filename, size, owner=owner)

@app.get("/download/{filename}")
def download_file(filename: str, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_file = db.query(database.FileMetadata).filter(database.FileMetadata.filename == filename).first()
    if not db_file: raise HTTPException(status_code=404, detail="File not found")
    if current_user.role != "administrator" and db_file.owner != current_user.username:
        raise HTTPException(status_code=403, detail="Access denied")
    
    node_locations = db_file.node_locations.split(',') if db_file.node_locations else ["node1"]
    for node in node_locations:
        try:
            url = file_manager.get_node_url(node, f"download/{filename}")
            client = httpx.Client()
            req = client.build_request("GET", url)
            r = client.send(req, stream=True)
            if r.status_code == 200:
                file_manager.log_activity(db, "DOWNLOAD", filename, user=current_user.username)
                return StreamingResponse(r.iter_bytes(), media_type="application/octet-stream", headers={"Content-Disposition": f"attachment; filename={filename}"})
        except Exception: continue
    raise HTTPException(status_code=404, detail="Data missing on nodes")

@app.delete("/file/{filename}")
def delete_file(filename: str, permanent: bool = False, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_file = db.query(database.FileMetadata).filter(database.FileMetadata.filename == filename).first()
    if not db_file: raise HTTPException(status_code=404, detail="File not found")
    if current_user.role != "administrator" and db_file.owner != current_user.username:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        success = file_manager.delete_file(db, filename, soft=(not permanent))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    if not success: raise HTTPException(status_code=400, detail="Delete failed")
    file_manager.log_activity(db, "DELETE", filename, user=current_user.username)
    return {"message": "Success"}

@app.post("/restore/{filename}")
def restore_file(filename: str, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_file = db.query(database.FileMetadata).filter(database.FileMetadata.filename == filename).first()
    if not db_file: raise HTTPException(status_code=404, detail="File not found")
    if current_user.role != "administrator" and db_file.owner != current_user.username:
        raise HTTPException(status_code=403, detail="Access denied")
    success = file_manager.restore_file(db, filename)
    if not success: raise HTTPException(status_code=404, detail="Restore failed")
    file_manager.log_activity(db, "RESTORE", filename, user=current_user.username)
    return {"message": "Restored"}

@app.post("/lock/{filename}")
def lock_file(filename: str, duration_hours: int = Query(None), db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_file = db.query(database.FileMetadata).filter(database.FileMetadata.filename == filename).first()
    if not db_file: raise HTTPException(status_code=404, detail="File not found")
    if current_user.role != "administrator" and db_file.owner != current_user.username:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db_file.locked = True
    if duration_hours:
        db_file.unlock_at = datetime.utcnow() + timedelta(hours=duration_hours)
    else:
        db_file.unlock_at = None
    db.commit()
    file_manager.log_activity(db, "LOCK", filename, user=current_user.username)
    return {"message": "Locked"}

@app.post("/unlock/{filename}")
def unlock_file(filename: str, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_file = db.query(database.FileMetadata).filter(database.FileMetadata.filename == filename).first()
    if not db_file: raise HTTPException(status_code=404, detail="File not found")
    if current_user.role != "administrator" and db_file.owner != current_user.username:
        raise HTTPException(status_code=403, detail="Access denied")
    db_file.locked = False
    db_file.unlock_at = None
    db.commit()
    file_manager.log_activity(db, "UNLOCK", filename, user=current_user.username)
    return {"message": "Unlocked"}

@app.get("/preview/{filename}")
def preview_file(filename: str, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_file = db.query(database.FileMetadata).filter(database.FileMetadata.filename == filename, database.FileMetadata.is_deleted == False).first()
    if not db_file: raise HTTPException(status_code=404, detail="File not found")
    if current_user.role != "administrator" and db_file.owner != current_user.username:
        raise HTTPException(status_code=403, detail="Access denied")
    
    node_locations = db_file.node_locations.split(',') if db_file.node_locations else ["node1"]
    import mimetypes
    mime_type, _ = mimetypes.guess_type(filename)
    if filename.lower().endswith(".docx"):
        mime_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    mime_type = mime_type or "application/octet-stream"
    for node in node_locations:
        try:
            url = file_manager.get_node_url(node, f"download/{filename}")
            client = httpx.Client()
            req = client.build_request("GET", url)
            r = client.send(req, stream=True)
            if r.status_code == 200:
                return StreamingResponse(r.iter_bytes(), media_type=mime_type)
        except Exception: continue
    raise HTTPException(status_code=404, detail="Data missing")

# Sharing Endpoints
@app.post("/share/{filename}")
def create_share_link(filename: str, request: ShareRequest, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_file = db.query(database.FileMetadata).filter(database.FileMetadata.filename == filename, database.FileMetadata.is_deleted == False).first()
    if not db_file: raise HTTPException(status_code=404, detail="File not found")
    if current_user.role != "administrator" and db_file.owner != current_user.username:
        raise HTTPException(status_code=403, detail="Access denied")
    token = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(hours=request.expiry_hours)
    shared_link = database.SharedLink(filename=filename, token=token, password_hash=request.password, expires_at=expires_at)
    db.add(shared_link)
    db.commit()
    file_manager.log_activity(db, "SHARE", filename, user=current_user.username)
    return {"token": token, "expires_at": expires_at}

@app.get("/shared/{token}")
def get_shared_file_info(token: str, password: str = None, db: Session = Depends(get_db)):
    link = db.query(database.SharedLink).filter(database.SharedLink.token == token).first()
    if not link or link.expires_at < datetime.utcnow(): raise HTTPException(status_code=404, detail="Invalid/Expired link")
    if link.password_hash and link.password_hash != password: raise HTTPException(status_code=401, detail="Incorrect password")
    db_file = db.query(database.FileMetadata).filter(database.FileMetadata.filename == link.filename).first()
    return {"filename": db_file.filename, "size": db_file.size, "owner": db_file.owner, "upload_date": db_file.upload_date}

@app.get("/download/shared/{token}")
def download_shared_file(token: str, password: str = None, db: Session = Depends(get_db)):
    link = db.query(database.SharedLink).filter(database.SharedLink.token == token).first()
    if not link or link.expires_at < datetime.utcnow(): raise HTTPException(status_code=404, detail="Invalid/Expired link")
    if link.password_hash and link.password_hash != password: raise HTTPException(status_code=401, detail="Incorrect password")
    if link.current_downloads >= link.max_downloads: raise HTTPException(status_code=403, detail="Download limit reached")
    db_file = db.query(database.FileMetadata).filter(database.FileMetadata.filename == link.filename).first()
    node_locations = db_file.node_locations.split(',') if db_file.node_locations else ["node1"]
    for node in node_locations:
        try:
            url = file_manager.get_node_url(node, f"download/{link.filename}")
            client = httpx.Client()
            req = client.build_request("GET", url)
            r = client.send(req, stream=True)
            if r.status_code == 200:
                link.current_downloads += 1
                db.commit()
                file_manager.log_activity(db, "SHARED_DOWNLOAD", link.filename)
                return StreamingResponse(r.iter_bytes(), media_type="application/octet-stream", headers={"Content-Disposition": f"attachment; filename={link.filename}"})
        except Exception: continue
    raise HTTPException(status_code=404, detail="Data missing")

# System Endpoints
@app.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    query = db.query(database.FileMetadata).filter(database.FileMetadata.is_deleted == False)
    if current_user.role != "administrator":
        query = query.filter(database.FileMetadata.owner == current_user.username)
    files = query.all()
    return {
        "total_files": len(files),
        "storage_used": sum(f.size for f in files),
        "active_clients": len(manager.active_connections),
        "locked_files": len([f for f in files if f.locked])
    }

@app.get("/settings")
def get_settings(db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    settings = db.query(database.Setting).all()
    return {s.key: s.value for s in settings}

@app.post("/settings")
def update_setting(request: SettingRequest, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    if current_user.role != "administrator": raise HTTPException(status_code=403, detail="Forbidden")
    
    two_factor = db.query(database.Setting).filter(database.Setting.key == "two_factor_auth").first()
    if two_factor and two_factor.value == "true" and request.key != "two_factor_auth":
        active_nodes = 0
        with httpx.Client(timeout=2.0) as client:
            for node, url in file_manager.NODES.items():
                try:
                    r = client.get(f"{url}/health")
                    if r.status_code == 200:
                        active_nodes += 1
                except: pass
        if active_nodes < 2:
            raise HTTPException(status_code=400, detail="Multi-node confirmation failed: Not enough active nodes")

    setting = db.query(database.Setting).filter(database.Setting.key == request.key).first()
    if setting: setting.value = request.value
    else:
        setting = database.Setting(key=request.key, value=request.value)
        db.add(setting)
    db.commit()
    return {"message": "Updated"}

@app.get("/activity")
def get_activity(db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    query = db.query(database.ActivityLog)
    if current_user.role != "administrator":
        query = query.filter(database.ActivityLog.user == current_user.username)
    return query.order_by(database.ActivityLog.timestamp.desc()).limit(20).all()

@app.get("/nodes/health")
async def get_nodes_health(current_user: database.User = Depends(get_current_user)):
    if current_user.role != "administrator": raise HTTPException(status_code=403, detail="Forbidden")
    status_map = {}
    async with httpx.AsyncClient(timeout=2.0) as client:
        for node, url in file_manager.NODES.items():
            try:
                res = await client.get(f"{url}/health")
                status_map[node] = "ACTIVE" if res.status_code == 200 else "OFFLINE"
            except: status_map[node] = "OFFLINE"
    return status_map

@app.websocket("/ws/clients")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect: manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
