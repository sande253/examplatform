from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.core.dependencies import get_db, get_current_user
from app.models.paper import Paper, PaperStatus, AccessType
from app.models.user import User
from app.schemas.paper import PaperResponse
from app.core.ids import as_uuid

router = APIRouter()


@router.get("/", response_model=List[PaperResponse])
def list_papers(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    access_type: Optional[str] = Query(None),
):
    query = db.query(Paper).filter(Paper.status == PaperStatus.PUBLISHED)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(Paper.title.ilike(term))
    if subject:
        query = query.filter(Paper.subject == subject)
    if access_type:
        try:
            query = query.filter(Paper.access_type == AccessType(access_type.upper()))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid access_type: {access_type}")
    return query.order_by(Paper.created_at.desc()).all()


@router.get("/{paper_id}", response_model=PaperResponse)
def get_paper(paper_id: UUID, db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == as_uuid(paper_id)).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Not found")
    return paper
