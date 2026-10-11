from pydantic import BaseModel
from typing import Optional, Any, List, Dict
from uuid import UUID
from datetime import datetime
from app.models.test import AttemptStatus
from decimal import Decimal

class StartTestRequest(BaseModel):
    paper_id: UUID

class AnswerSubmit(BaseModel):
    selected_answer: Any

class AttemptAnswerResponse(BaseModel):
    id: UUID
    question_id: UUID
    question_snapshot: Any
    selected_answer: Optional[Any] = None
    is_marked_for_review: bool
    is_correct: Optional[bool] = None
    marks_awarded: Optional[Decimal] = None
    answered_at: datetime

    class Config:
        from_attributes = True

class TestAttemptResponse(BaseModel):
    id: UUID
    test_instance_id: UUID
    status: AttemptStatus
    started_at: datetime
    submitted_at: Optional[datetime] = None
    time_spent_seconds: int
    score: Optional[Decimal] = None
    max_score: Optional[Decimal] = None
    percentage: Optional[Decimal] = None
    correct_count: int
    incorrect_count: int
    unanswered_count: int
    topic_performance: Optional[Dict[str, Any]] = None
    answers: List[AttemptAnswerResponse] = []

    class Config:
        from_attributes = True

class TestStateResponse(BaseModel):
    attempt_id: UUID
    paper_id: UUID
    status: AttemptStatus
    questions: List[Dict[str, Any]]  # Snapshot without correct answers
    answers: Dict[str, Dict[str, Any]] # question_id -> {selected_answer, is_marked_for_review}
