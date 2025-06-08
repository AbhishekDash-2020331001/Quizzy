from datetime import datetime
from . import schemas
from . import models
from . import database
from fastapi import FastAPI, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from .database import Base, engine, SessionLocal
from .auth_bearer import JWTBearer
from .utils import create_access_token, create_refresh_token, verify_password, get_hashed_password
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import List
import os
import uvicorn
import httpx
import asyncio

ACCESS_TOKEN_EXPIRE_MINUTES = 10800
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
ALGORITHM = "HS256"
JWT_SECRET_KEY = "narscbjim@$@&^@&%^&RFghgjvbdsha"
JWT_REFRESH_SECRET_KEY = "13ugfdfgh@#$%^@&jkl45678902"

models.Base.metadata.create_all(bind=engine)

def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

app = FastAPI()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_hashed_password(password: str) -> str:
    return pwd_context.hash(password)

def get_current_user_id(token: str = Depends(JWTBearer())):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=401, detail="Invalid token: user_id missing")
        user_id = int(user_id_str)
        return user_id
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")


@app.post("/register")
def register_user(user: schemas.UserCreate, session: Session = Depends(get_session)):
    existing_user = session.query(models.User).filter_by(email=user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    encrypted_password = get_hashed_password(user.password)

    # Create new user with created_at timestamp
    new_user = models.User(username=user.username, email=user.email, password=encrypted_password, teacher=user.teacher)

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {"message": "user created successfully"}

@app.post('/login', response_model=schemas.TokenSchema)
def login(request: schemas.requestdetails, db: Session = Depends(get_session)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email")

    if not verify_password(request.password, user.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect password")

    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id)

    token_db = models.TokenTable(user_id=user.id, access_token=access, refresh_token=refresh, status=True)
    db.add(token_db)
    db.commit()
    db.refresh(token_db)

    return {
        "message": "Login successful",
        "access_token": access,
        "refresh_token": refresh,
    }

@app.get('/getusers/{id}', response_model=list[schemas.UserResponse])
def getusers(id,dependencies=Depends(JWTBearer()), session: Session = Depends(get_session)):
    users = session.query(models.User).filter(models.User.id==id).all()
    return users

@app.delete("/delete-user/{user_id}")
def delete_user(user_id: int, session: Session = Depends(get_session)):
    user = session.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Set the deleted_at field to the current time when user deletes their account
    user.deleted_at = datetime.utcnow()
    session.commit()

    return {"message": "User account deleted successfully"}


@app.post('/change-password')
def change_password(request: schemas.changepassword, db: Session = Depends(get_session)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")
    
    if not verify_password(request.old_password, user.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid old password")
    
    encrypted_password = get_hashed_password(request.new_password)
    user.password = encrypted_password
    db.commit()
    
    return {"message": "Password changed successfully"}



@app.post("/uploads", dependencies=[Depends(JWTBearer())])
async def create_upload(upload: schemas.UploadCreate, session: Session = Depends(get_session), user_id: int = Depends(get_current_user_id)):
    # Create the upload record in database
    new_upload = models.Uploads(user_id=user_id, url=upload.url, pdf_name=upload.pdf_name, processing_state=0)
    session.add(new_upload)
    session.commit()
    session.refresh(new_upload)
    
    
    
    return {"message": "Upload created", "upload_id": new_upload.id}

@app.get("/uploads/myuploads", response_model=List[schemas.UploadResponse], dependencies=[Depends(JWTBearer())])
def get_my_uploads(
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    uploads = session.query(models.Uploads).filter(
        models.Uploads.user_id == user_id,
        models.Uploads.deleted_at == None
    ).order_by(models.Uploads.created_at.desc()).all()
    return uploads

@app.put("/uploads/{upload_id}", dependencies=[Depends(JWTBearer())])
def update_upload(upload_id: int, upload_update: schemas.UploadUpdate, session: Session = Depends(get_session)):
    upload = session.query(models.Uploads).filter(models.Uploads.id == upload_id).first()
    if not upload or upload.deleted_at:
        raise HTTPException(status_code=404, detail="Upload not found")

    upload.url = upload_update.url or upload.url
    session.commit()
    return {"message": "Upload updated"}

@app.delete("/uploads/{upload_id}", dependencies=[Depends(JWTBearer())])
def delete_upload(upload_id: int, session: Session = Depends(get_session)):
    upload = session.query(models.Uploads).filter(models.Uploads.id == upload_id).first()
    if not upload or upload.deleted_at:
        raise HTTPException(status_code=404, detail="Upload not found")
    upload.deleted_at = datetime.utcnow()
    session.commit()
    return {"message": "Upload deleted"}
