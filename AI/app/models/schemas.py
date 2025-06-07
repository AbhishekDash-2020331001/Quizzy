from pydantic import BaseModel
from typing import List, Optional, Union
from enum import Enum

class QuizType(str, Enum):
    PAGE_RANGE = "page_range"
    TOPIC = "topic"
    MULTI_PDF_TOPIC = "multi_pdf_topic"

class PDFUploadRequest(BaseModel):
    uploadthing_url: str
    upload_id: int
    pdf_name: Optional[str] = None

class ChatRequest(BaseModel):
    pdf_ids: List[str]  # Changed from pdf_id to pdf_ids to support multiple PDFs
    message: str
    conversation_history: Optional[List[dict]] = []

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None

class QuizRequest(BaseModel):
    quiz_type: QuizType
    pdf_ids: List[str]
    topic: Optional[str] = None
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    num_questions: int = 5
    difficulty: Optional[str] = "medium"
    exam_id: Optional[int] = None

class QuizResponse(BaseModel):
    quiz_id: str
    questions: List[QuizQuestion]
    metadata: dict

class PDFUploadResponse(BaseModel):
    pdf_id: str
    message: str
    total_pages: int
    pdf_name: Optional[str] = None

class PDFUploadQueuedResponse(BaseModel):
    job_id: str
    pdf_id: str
    message: str
    upload_id: int
    status: str = "queued"

class QuizQueuedResponse(BaseModel):
    job_id: str
    quiz_id: str
    message: str
    exam_id: int
    status: str = "queued"

class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    created_at: Optional[str] = None
    started_at: Optional[str] = None
    ended_at: Optional[str] = None
    result: Optional[dict] = None
    error: Optional[str] = None
    meta: Optional[dict] = None

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = [] 