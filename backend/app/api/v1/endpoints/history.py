from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.test import TestAttempt
from app.schemas.test import TestAttemptResponse

router = APIRouter()

@router.get("/", response_model=List[TestAttemptResponse])
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(TestAttempt).filter(TestAttempt.user_id == current_user.id).all()

@router.get("/{attempt_id}", response_model=TestAttemptResponse)
def get_attempt_detail(attempt_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    attempt = db.query(TestAttempt).filter(TestAttempt.id == attempt_id, TestAttempt.user_id == current_user.id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Not found")
    return attempt
