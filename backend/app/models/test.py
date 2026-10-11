import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Integer, ForeignKey, Numeric, JSON, Uuid
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class AttemptStatus(enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"
    EXPIRED = "EXPIRED"

class TestInstance(Base):
    __tablename__ = "test_instances"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    paper_id = Column(Uuid(as_uuid=True), ForeignKey("papers.id"), nullable=False)
    created_for_user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    question_order = Column(JSON, nullable=False)
    option_order_map = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    paper = relationship("Paper")
    user = relationship("User")

class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_instance_id = Column(Uuid(as_uuid=True), ForeignKey("test_instances.id"), nullable=False)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(AttemptStatus), default=AttemptStatus.IN_PROGRESS)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    time_spent_seconds = Column(Integer, default=0)
    score = Column(Numeric, nullable=True)
    max_score = Column(Numeric, nullable=True)
    percentage = Column(Numeric, nullable=True)
    correct_count = Column(Integer, default=0)
    incorrect_count = Column(Integer, default=0)
    unanswered_count = Column(Integer, default=0)
    topic_performance = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    test_instance = relationship("TestInstance")
    user = relationship("User")
    answers = relationship("AttemptAnswer", back_populates="attempt", cascade="all, delete-orphan")

class AttemptAnswer(Base):
    __tablename__ = "attempt_answers"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(Uuid(as_uuid=True), ForeignKey("test_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Uuid(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    question_snapshot = Column(JSON, nullable=False)
    selected_answer = Column(JSON, nullable=True)
    is_marked_for_review = Column(Boolean, default=False)
    is_correct = Column(Boolean, nullable=True)
    marks_awarded = Column(Numeric, nullable=True)
    answered_at = Column(DateTime(timezone=True), server_default=func.now())

    attempt = relationship("TestAttempt", back_populates="answers")
    question = relationship("Question")
