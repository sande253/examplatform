from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.schemas.auth import UserCreate
from app.core.security import hash_password
from fastapi import HTTPException
from datetime import datetime, timezone

def create_user(db: Session, user_in: UserCreate) -> User:
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = hash_password(user_in.password)
    user = User(
        email=user_in.email,
        name=user_in.name,
        hashed_password=hashed_pwd,
        role=UserRole.student
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
