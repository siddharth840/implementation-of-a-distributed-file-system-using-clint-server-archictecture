import sqlite3
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./nimbusfs.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class FileMetadata(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    size = Column(Integer)
    owner = Column(String, default="Admin")
    locked = Column(Boolean, default=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    node_locations = Column(String) # Serialized list e.g. "node1,node2,node3"

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    action = Column(String) # e.g. "UPLOAD", "DOWNLOAD", "LOCK", "UNLOCK", "DELETE"
    filename = Column(String)
    user = Column(String, default="Admin")

Base.metadata.create_all(bind=engine)
