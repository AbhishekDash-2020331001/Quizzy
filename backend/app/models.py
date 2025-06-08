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
    
    exams = relationship("Exam", back_populates="creator", cascade="all, delete")
    uploads = relationship("Uploads", back_populates="uploader", cascade="all, delete")
    takes = relationship("Takes", back_populates="user", cascade="all, delete") 




class TokenTable(Base):
    __tablename__ = "token"
    user_id = Column(Integer)
    access_token = Column(String(450), primary_key=True)
    refresh_token = Column(String(450),nullable=False)
    status = Column(Boolean)
    created_date = Column(DateTime, default=datetime.datetime.now)

exam_upload_association = Table(
    'exam_upload_association',
    Base.metadata,
    Column('exam_id', Integer, ForeignKey('exam.id', ondelete='CASCADE'), primary_key=True),
    Column('upload_id', Integer, ForeignKey('uploads.id', ondelete='CASCADE'), primary_key=True)
)

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
    exams = relationship("Exam", secondary=exam_upload_association, back_populates="uploads")



class Exam(Base):
    __tablename__ = 'exam'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    retake = Column(Boolean, default=False)
    name = Column(String(450), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    quiz_type = Column(Enum("topic", "page_range"), nullable=False)
    topic = Column(String(450), nullable=True)
    start_page = Column(Integer, nullable=True)
    end_page = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    processing_state = Column(Integer, default=0)
    quiz_difficulty = Column(Enum("easy", "medium", "hard"), nullable=True, default="medium")
    questions_count = Column(Integer,nullable=False)

    creator = relationship("User", back_populates="exams")
    uploads = relationship("Uploads", secondary=exam_upload_association, back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete")
    takers = relationship("Takes", back_populates="exam", cascade="all, delete")


class Question(Base):
    __tablename__ = 'question'
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exam.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    option_1 = Column(Text)
    option_2 = Column(Text)
    option_3 = Column(Text)
    option_4 = Column(Text)
    correct_answer = Column(Enum('1', '2', '3', '4'), nullable=False)
    explanation = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    exam = relationship("Exam", back_populates="questions")



class Takes(Base):
    __tablename__ = 'takes'
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exam.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    correct_answers = Column(Integer)
    device_id = Column(String(450))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    exam = relationship("Exam", back_populates="takers")
    user = relationship("User", back_populates="takes")