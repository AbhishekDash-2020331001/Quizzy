import os
from passlib.context import CryptContext
from typing import Union, Any
from jose import jwt
from datetime import datetime, timedelta, timezone

# Define UTC+6 timezone (Bangladesh Standard Time)
UTC_PLUS_6 = timezone(timedelta(hours=6))

ACCESS_TOKEN_EXPIRE_MINUTES = 10800  
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  
ALGORITHM = "HS256"
JWT_SECRET_KEY = "narscbjim@$@&^@&%^&RFghgjvbdsha"  
JWT_REFRESH_SECRET_KEY = "13ugfdfgh@#$%^@&jkl45678902"

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_hashed_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed_pass: str) -> bool:
    return password_context.verify(password, hashed_pass)


def create_access_token(subject: Union[str, Any], expires_delta: int = None) -> str:
    if expires_delta is not None:
        expires_delta = datetime.now(UTC_PLUS_6) + expires_delta  
    else:
        expires_delta = datetime.now(UTC_PLUS_6) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expires_delta, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, ALGORITHM)

    return encoded_jwt


def create_refresh_token(subject: Union[str, Any], expires_delta: int = None) -> str:
    if expires_delta is not None:
        expires_delta = datetime.now(UTC_PLUS_6) + expires_delta  
    else:
        expires_delta = datetime.now(UTC_PLUS_6) + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expires_delta, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, ALGORITHM)
    return encoded_jwt
