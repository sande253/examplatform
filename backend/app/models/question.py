import uuid
from sqlalchemy import Column, String, DateTime, Enum, Integer, ForeignKey, Numeric, JSON, Uuid
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class QuestionType(enum.Enum):
    MCQ_SINGLE = "MCQ_SINGLE"
    MCQ_MULTIPLE = "MCQ_MULTIPLE"
    TRUE_FALSE = "TRUE_FALSE"
    NUMERICAL = "NUMERICAL"
    OPEN = "OPEN"

class Difficulty(enum.Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"

class ApprovalStatus(enum.Enum):
    DRAFT = "DRAFT"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    ARCHIVED = "ARCHIVED"

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_text = Column(String, nullable=False)
    question_type = Column(Enum(QuestionType), nullable=False)
    subject = Column(String)
    topic = Column(String)
    subtopic = Column(String)
    difficulty = Column(Enum(Difficulty), default=Difficulty.MEDIUM)
    marks = Column(Numeric, default=1.0)
    negative_marks = Column(Numeric, default=0.0)
    correct_answer = Column(JSON, nullable=False)
    explanation = Column(String)
    language = Column(String, default="en")
    approval_status = Column(Enum(ApprovalStatus), default=ApprovalStatus.DRAFT)
    source_document_id = Column(Uuid(as_uuid=True), ForeignKey("documents.id"), nullable=True)
    source_page = Column(Integer)
    source_question_number = Column(String)
    extraction_confidence = Column(Numeric)
    created_by = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")

class QuestionOption(Base):
    __tablename__ = "question_options"
    
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(Uuid(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    option_key = Column(String, nullable=False)
    option_text = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False)

    question = relationship("Question", back_populates="options")
