from pydantic import BaseModel
from typing import Optional, Any, List
from uuid import UUID
from datetime import datetime
from app.models.document import DocumentStatus

class DocumentBase(BaseModel):
    title: str
    subject: Optional[str] = None
    exam_name: Optional[str] = None
    year: Optional[int] = None
    publisher: Optional[str] = None
    language: str = "en"

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: UUID
    original_filename: str
    file_size_bytes: int
    status: DocumentStatus
    error_message: Optional[str] = None
    extracted_questions: Optional[List[dict[str, Any]]] = None
    uploaded_by: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
