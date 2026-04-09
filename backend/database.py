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
    is_deleted = Column(Boolean, default=False)
    unlock_at = Column(DateTime, nullable=True)

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    action = Column(String) # e.g. "UPLOAD", "DOWNLOAD", "LOCK", "UNLOCK", "DELETE"
    filename = Column(String)
    user = Column(String, default="Admin")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="standard_user")

class SharedLink(Base):
    __tablename__ = "shared_links"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    token = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=True)
    expires_at = Column(DateTime)
    max_downloads = Column(Integer, default=100)
    current_downloads = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Setting(Base):
    __tablename__ = "settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(String)

Base.metadata.create_all(bind=engine)
