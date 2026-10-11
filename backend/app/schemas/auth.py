from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from enum import Enum

class UserRole(str, Enum):
    student = "student"
    admin = "admin"

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenData(BaseModel):
    id: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True
