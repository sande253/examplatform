from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.core.dependencies import get_db
from app.models.question import Question, ApprovalStatus
from app.schemas.question import QuestionResponse

router = APIRouter()


@router.get("/", response_model=List[QuestionResponse])
def get_questions(
    db: Session = Depends(get_db),
    subject: Optional[str] = None,
    status: Optional[str] = Query(None, description="Approval status filter, e.g. APPROVED"),
    search: Optional[str] = None,
    limit: int = 100,
    size: int = Query(100, alias="size"),
):
    query = db.query(Question).options(joinedload(Question.options))
    if subject:
        query = query.filter(Question.subject == subject)
    if status:
        try:
            query = query.filter(Question.approval_status == ApprovalStatus(status.upper()))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(Question.question_text.ilike(term))
    return query.order_by(Question.created_at.desc()).limit(size or limit).all()


@router.get("/{id}", response_model=QuestionResponse)
def get_question(id: str, db: Session = Depends(get_db)):
    q = (
        db.query(Question)
        .options(joinedload(Question.options))
        .filter(Question.id == id)
        .first()
    )
    if not q:
        raise HTTPException(status_code=404, detail="Not found")
    return q
