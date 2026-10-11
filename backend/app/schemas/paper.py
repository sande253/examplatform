from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
from uuid import UUID
from datetime import datetime
from app.models.paper import PaperType, AccessType, PaperStatus
from app.schemas.question import QuestionResponse

class PaperQuestionCreate(BaseModel):
    question_id: UUID
    order_index: int
    marks_override: Optional[Decimal] = None
    negative_marks_override: Optional[Decimal] = None

class PaperQuestionResponse(BaseModel):
    id: UUID
    question_id: UUID
    order_index: int
    marks_override: Optional[Decimal] = None
    negative_marks_override: Optional[Decimal] = None
    question: QuestionResponse

    class Config:
        from_attributes = True

class PaperBase(BaseModel):
    title: str
    description: Optional[str] = None
    exam_name: Optional[str] = None
    subject: Optional[str] = None
    year: Optional[int] = None
    instructions: Optional[str] = None
    duration_minutes: int
    total_questions: int
    total_marks: Decimal
    negative_marking_enabled: bool = False
    negative_marking_fraction: Decimal = Decimal('0.25')
    paper_type: PaperType = PaperType.FIXED
    access_type: AccessType = AccessType.FREE

class PaperCreate(PaperBase):
    pass

class PaperUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    exam_name: Optional[str] = None
    subject: Optional[str] = None
    year: Optional[int] = None
    instructions: Optional[str] = None
    duration_minutes: Optional[int] = None
    total_questions: Optional[int] = None
    total_marks: Optional[Decimal] = None
    negative_marking_enabled: Optional[bool] = None
    negative_marking_fraction: Optional[Decimal] = None
    paper_type: Optional[PaperType] = None
    access_type: Optional[AccessType] = None
    status: Optional[PaperStatus] = None

class PaperResponse(PaperBase):
    id: UUID
    status: PaperStatus
    created_at: datetime
    paper_questions: Optional[List[PaperQuestionResponse]] = []

    class Config:
        from_attributes = True
