from pydantic import BaseModel
import datetime
from typing import Optional,List,Literal 
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    teacher: bool

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime.datetime
    deleted_at: datetime.datetime | None = None # deleted_at can be None if the user has not deleted their account
    teacher: bool
    
    class Config:
        from_attributes = True 

class requestdetails(BaseModel):
    email:str
    password:str
        
class TokenSchema(BaseModel):
    message: str
    access_token: str
    refresh_token: str


class TokenCreate(BaseModel):
    user_id:str
    access_token:str
    refresh_token:str
    status:bool
    created_date:datetime.datetime

class changepassword(BaseModel):
    email:str
    old_password:str
    new_password:str


# ----- Exam Schemas -----
class ExamCreate(BaseModel):
    name: str
    retake: Optional[bool] = False
    start_time: datetime.datetime
    end_time: datetime.datetime
    quiz_type: Literal["topic", "page_range"]
    upload_ids: List[int]
    topic: Optional[str] = None
    start_page: Optional[int] = None
    end_page: Optional[int] = None
    quiz_difficulty: Optional[str] = None
    questions_count: int

class ExamResponse(BaseModel):
    id: int
    user_id: int
    name: str
    retake: bool
    uploads: List['UploadResponse']
    start_time: datetime.datetime
    end_time: datetime.datetime
    quiz_type: Literal["topic", "page_range"]
    topic: Optional[str] = None
    start_page: Optional[int] = None
    end_page: Optional[int] = None
    processing_state: int
    created_at: datetime.datetime
    deleted_at: Optional[datetime.datetime] = None
    questions_count: int
    participants_count: int
    quiz_difficulty: Optional[str] = None

    class Config:
        from_attributes = True

class ExamPublicResponse(BaseModel):
    id: int
    name: str
    retake: bool
    start_time: datetime.datetime
    end_time: datetime.datetime

    class Config:
        from_attributes = True

class ExamDetailResponse(BaseModel):
    id: int
    user_id: int
    name: str
    retake: bool
    uploads: List['UploadResponse']
    questions: List['QuestionResponse']
    start_time: datetime.datetime
    end_time: datetime.datetime
    quiz_type: Literal["topic", "page_range"]
    topic: Optional[str] = None
    start_page: Optional[int] = None
    end_page: Optional[int] = None
    processing_state: int
    created_at: datetime.datetime
    deleted_at: Optional[datetime.datetime] = None
    questions_count: int
    participants_count: int
    quiz_difficulty: Optional[str] = None

    class Config:
        from_attributes = True




# ----- Uploads Schemas -----
class UploadCreate(BaseModel):
    url: str
    pdf_name: str

class UploadUpdate(BaseModel):
    url: Optional[str] = None

class UploadProcessingCallback(BaseModel):
    pdf_id: str
    total_pages: int

class UploadResponse(BaseModel):
    id: int
    user_id: int
    url: str
    processing_state: int
    pdf_id: Optional[str] = None
    pages: Optional[int] = None
    pdf_name: Optional[str] = None
    created_at: datetime.datetime
    deleted_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True


# ----- Question Schemas -----
class QuestionCreate(BaseModel):
    text: str
    option_1: Optional[str]
    option_2: Optional[str]
    option_3: Optional[str]
    option_4: Optional[str]
    correct_answer: Literal['1', '2', '3', '4']
    explanation: Optional[str]

class QuestionsCreateRequest(BaseModel):
    exam_id: int
    questions: List[QuestionCreate]

class QuestionUpdate(BaseModel):
    text: Optional[str] = None
    option_1: Optional[str] = None
    option_2: Optional[str] = None
    option_3: Optional[str] = None
    option_4: Optional[str] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None

class QuestionEditData(BaseModel):
    id: Optional[int] = None  # None for new questions, actual ID for existing questions
    text: str
    option_1: str
    option_2: str
    option_3: str
    option_4: str
    correct_answer: Literal['1', '2', '3', '4']
    explanation: str



# ----- Takes Schemas -----
class TakeCreate(BaseModel):
    device_id: str


class TakeUpdate(BaseModel):
    correct_answers: Optional[int] = None

class TakeResponse(BaseModel):
    id: int
    exam_id: int
    user_id: int
    correct_answers: Optional[int]
    created_at: datetime.datetime
    deleted_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class TakeExamResponse(BaseModel):
    message: str
    takes_id: int
    exam_id: int
    exam: ExamInfoResponse
    questions: List[QuestionPublicResponse]

    class Config:
        from_attributes = True
