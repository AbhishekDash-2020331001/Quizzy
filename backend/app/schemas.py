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