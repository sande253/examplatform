import uuid
from sqlalchemy import Column, String, DateTime, Enum, Integer, ForeignKey, JSON, Uuid
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class DocumentStatus(enum.Enum):
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    APPROVED = "APPROVED"
    PUBLISHED = "PUBLISHED"
    FAILED = "FAILED"

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    subject = Column(String)
    exam_name = Column(String)
    year = Column(Integer)
    publisher = Column(String)
    language = Column(String, default="en")
    file_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.UPLOADED)
    error_message = Column(String)
    # The original extraction payload is retained for audit/review and includes
    # each question, its answer, and any options as JSON.
    extracted_questions = Column(JSON, nullable=True)
    uploaded_by = Column(Uuid(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    uploader = relationship("User")
