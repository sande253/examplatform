from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, require_admin
from app.models.document import Document
from app.schemas.document import DocumentResponse

router = APIRouter()

@router.get("/", response_model=List[DocumentResponse])
def get_documents(db: Session = Depends(get_db), admin=Depends(require_admin)):
    return db.query(Document).all()
