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
