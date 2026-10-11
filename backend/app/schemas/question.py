from pydantic import BaseModel
from typing import Optional, Any, List
from decimal import Decimal
from app.models.question import QuestionType, Difficulty, ApprovalStatus
from uuid import UUID
from datetime import datetime

class QuestionOptionBase(BaseModel):
    option_key: str
    option_text: str
    order_index: int

class QuestionOptionCreate(QuestionOptionBase):
    pass

class QuestionOptionResponse(QuestionOptionBase):
    id: UUID

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    question_text: str
    question_type: QuestionType
    subject: Optional[str] = None
    topic: Optional[str] = None
    subtopic: Optional[str] = None
    difficulty: Difficulty = Difficulty.MEDIUM
    marks: Decimal = Decimal('1.0')
    negative_marks: Decimal = Decimal('0.0')
    correct_answer: Any
    explanation: Optional[str] = None
    language: str = "en"

class QuestionCreate(QuestionBase):
    options: Optional[List[QuestionOptionCreate]] = []
    source_document_id: Optional[UUID] = None
    source_page: Optional[int] = None
    source_question_number: Optional[str] = None

class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[QuestionType] = None
    difficulty: Optional[Difficulty] = None
    marks: Optional[Decimal] = None
    negative_marks: Optional[Decimal] = None
    correct_answer: Optional[Any] = None
    explanation: Optional[str] = None

class QuestionResponse(QuestionBase):
    id: UUID
    approval_status: ApprovalStatus
    options: List[QuestionOptionResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
