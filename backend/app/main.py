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

ACCESS_TOKEN_EXPIRE_MINUTES = 30
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
