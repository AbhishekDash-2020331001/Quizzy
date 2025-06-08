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
