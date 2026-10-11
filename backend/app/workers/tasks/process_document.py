from app.workers.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.document import Document, DocumentStatus
from app.services.extraction import get_extractor
import json

@celery_app.task
def process_document_task(document_id: str):
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return
        
        doc.status = DocumentStatus.PROCESSING
        db.commit()

        extractor = get_extractor()
        # Mocking file read with a dummy text block since real files depend on user upload
        extracted_data = extractor.extract("Dummy text block of PDF content...")
        
        doc.status = DocumentStatus.REVIEW_REQUIRED
        db.commit()
    except Exception as e:
        db.rollback()
        if doc:
            doc.status = DocumentStatus.FAILED
            doc.error_message = str(e)
            db.commit()
    finally:
        db.close()
