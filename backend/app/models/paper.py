import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Integer, ForeignKey, Numeric, Uuid
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class PaperType(enum.Enum):
    FIXED = "FIXED"
    GENERATED = "GENERATED"

class AccessType(enum.Enum):
    FREE = "FREE"
    PREMIUM = "PREMIUM"

class PaperStatus(enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"

class Paper(Base):
    __tablename__ = "papers"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(String)
    exam_name = Column(String)
    subject = Column(String)
    year = Column(Integer)
    instructions = Column(String)
    duration_minutes = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    total_marks = Column(Numeric, nullable=False)
    negative_marking_enabled = Column(Boolean, default=False)
    negative_marking_fraction = Column(Numeric, default=0.25)
    paper_type = Column(Enum(PaperType), default=PaperType.FIXED)
    access_type = Column(Enum(AccessType), default=AccessType.FREE)
    status = Column(Enum(PaperStatus), default=PaperStatus.DRAFT)
    created_by = Column(Uuid(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    paper_questions = relationship("PaperQuestion", back_populates="paper", cascade="all, delete-orphan", order_by="PaperQuestion.order_index")

class PaperQuestion(Base):
    __tablename__ = "paper_questions"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    paper_id = Column(Uuid(as_uuid=True), ForeignKey("papers.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Uuid(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    marks_override = Column(Numeric, nullable=True)
    negative_marks_override = Column(Numeric, nullable=True)

    paper = relationship("Paper", back_populates="paper_questions")
    question = relationship("Question")
