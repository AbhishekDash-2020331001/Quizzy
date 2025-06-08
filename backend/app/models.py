from sqlalchemy import Column, Integer, String, DateTime,Boolean, ForeignKey, Text, Enum, Table
from .database import Base
from sqlalchemy.orm import relationship
import datetime
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(50),  nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    teacher = Column(Boolean, default=False)

    uploads = relationship("Uploads", back_populates="uploader", cascade="all, delete")






class TokenTable(Base):
    __tablename__ = "token"
    user_id = Column(Integer)
    access_token = Column(String(450), primary_key=True)
    refresh_token = Column(String(450),nullable=False)
    status = Column(Boolean)
    created_date = Column(DateTime, default=datetime.datetime.now)


class Uploads(Base):
    __tablename__ = 'uploads'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    url = Column(Text, nullable=False)
    processing_state = Column(Integer, default=0)
    pdf_id = Column(String(450), nullable=True)
    pages = Column(Integer, nullable=True)
    pdf_name = Column(String(450), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    uploader = relationship("User", back_populates="uploads")