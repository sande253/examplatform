from sqlalchemy.orm import Session
from app.models.document import Document, DocumentStatus
from app.models.question import Question, QuestionOption, QuestionType, Difficulty, ApprovalStatus
from fastapi import UploadFile
from app.core.config import settings
import os
import shutil
import uuid
import logging
from app.services.extraction import get_extractor
from app.services.extraction.pdf_extractor import PDFExtractor

logger = logging.getLogger(__name__)



def _get_upload_dir() -> str:
    """Return a writable upload directory.
    Vercel serverless has a read-only filesystem except for /tmp.
    """
    preferred = settings.LOCAL_STORAGE_PATH
    try:
        os.makedirs(preferred, exist_ok=True)
        probe = os.path.join(preferred, ".write_probe")
        with open(probe, "w") as fh:
            fh.write("ok")
        os.remove(probe)
        return preferred
    except OSError:
        tmp = "/tmp/uploads"
        os.makedirs(tmp, exist_ok=True)
        return tmp


def save_upload_file(upload_file: UploadFile, destination: str) -> None:
    with open(destination, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)


def create_document(
    db: Session,
    file: UploadFile,
    user_id,
    title: str | None = None,
    subject: str | None = None,
    exam_name: str | None = None,
) -> Document:
    """Save the uploaded PDF only. Processing happens separately via process_document endpoint.
    This avoids serverless timeout issues.
    """
    """
    upload_dir = _get_upload_dir()
    original_filename = os.path.basename(file.filename or "upload.pdf")
    extension = os.path.splitext(original_filename)[1].lower()
    if extension != ".pdf":
        raise ValueError("Only PDF files are supported.")

    stored_filename = f"{uuid.uuid4().hex}{extension}"
    file_path = os.path.join(upload_dir, stored_filename)

    save_upload_file(file, file_path)
    file_size = os.path.getsize(file_path)

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        os.remove(file_path)
        raise ValueError(f"File must be under {settings.MAX_UPLOAD_SIZE_MB}MB.")

    # Extract text immediately while the file is still in /tmp.
    # Cache it in extracted_questions so process_document can use it
    # without needing filesystem access across invocations.
    cached_text: str | None = None
    try:
        cached_text = PDFExtractor().extract_text(file_path)
    except Exception as exc:
        logger.warning("Text extraction during upload failed: %s", exc)

    doc = Document(
        title=title or os.path.splitext(original_filename)[0],
        subject=subject or None,
        exam_name=exam_name or None,
        original_filename=original_filename,
        file_path=file_path,
        file_size_bytes=file_size,
        uploaded_by=user_id,
        status=DocumentStatus.UPLOADED,
        # Store raw text under a sentinel key so process_document can find it.
        extracted_questions={"__raw_text__": cached_text} if cached_text else None,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc



def _normalise_question(raw: dict) -> dict:
    question_type = raw.get("question_type", QuestionType.OPEN.value)
    if question_type not in {item.value for item in QuestionType}:
        question_type = QuestionType.OPEN.value

    difficulty = raw.get("difficulty", Difficulty.MEDIUM.value)
    if difficulty not in {item.value for item in Difficulty}:
        difficulty = Difficulty.MEDIUM.value

    options = raw.get("options") if isinstance(raw.get("options"), list) else []
    clean_options = []
    for index, option in enumerate(options, start=1):
        if not isinstance(option, dict) or not option.get("option_text"):
            continue
        clean_options.append({
            "option_key": str(option.get("option_key") or chr(64 + index)),
            "option_text": str(option["option_text"]),
            "order_index": int(option.get("order_index") or index),
        })

    if question_type == QuestionType.TRUE_FALSE.value and not clean_options:
        clean_options = [
            {"option_key": "True", "option_text": "True", "order_index": 1},
            {"option_key": "False", "option_text": "False", "order_index": 2},
        ]

    answer = raw.get("correct_answer")
    # Review UI and test scoring compare MCQ answers using the option key.
    if (question_type.startswith("MCQ") or question_type == QuestionType.TRUE_FALSE.value) and answer is not None:
        normalised_answer = str(answer).strip().lower()
        aliases = {
            "true": "True", "t": "True", "yes": "True", "1": "True",
            "false": "False", "f": "False", "no": "False", "0": "False",
        }
        if question_type == QuestionType.TRUE_FALSE.value and normalised_answer in aliases:
            answer = aliases[normalised_answer]
        for option in clean_options:
            if normalised_answer in {
                option["option_key"].lower(),
                option["option_text"].strip().lower(),
            }:
                answer = option["option_key"]
                break

    return {
        "question_text": str(raw.get("question_text") or "Untitled question"),
        "question_type": question_type,
        "subject": raw.get("subject") or None,
        "difficulty": difficulty,
        "correct_answer": answer,
        "options": clean_options,
    }


def _clear_extracted_questions(db: Session, document_id) -> None:
    """Remove questions from a previous process/retry attempt."""
    existing = db.query(Question).filter(Question.source_document_id == document_id).all()
    for question in existing:
        db.delete(question)
    db.flush()


def process_document(db: Session, document: Document) -> Document:
    """Extract a PDF and persist both the review JSON and question records.

    Text source priority (serverless-safe):
      1. Cached raw text stored in extracted_questions["__raw_text__"] during upload.
      2. Live extraction from file_path (works locally / non-serverless).
    """
    document_id = document.id
    document.status = DocumentStatus.PROCESSING
    document.error_message = None
    db.commit()

    try:
        # ── Obtain text ────────────────────────────────────────────────────
        text: str | None = None

        # Check DB cache first (set during upload on serverless).
        cached = document.extracted_questions
        if isinstance(cached, dict) and "__raw_text__" in cached:
            text = cached["__raw_text__"]
            logger.info("Using cached extracted text for document %s", document_id)

        # Fall back to live extraction from disk.
        if not text:
            if not document.file_path or not os.path.exists(document.file_path):
                raise ValueError(
                    "Uploaded file is missing from storage and no cached text is available. "
                    "Please re-upload the document."
                )
            text = PDFExtractor().extract_text(document.file_path)

        if not text or not text.strip():
            raise ValueError(
                "The PDF did not contain extractable text. "
                "If it is a scanned document, please use a text-based PDF."
            )

        # ── Extract questions via AI ────────────────────────────────────────
        _clear_extracted_questions(db, document_id)

        extracted = get_extractor().extract(text)
        if not extracted:
            raise ValueError("No questions could be extracted from this PDF.")

        normalised = [_normalise_question(item) for item in extracted if isinstance(item, dict)]
        if not normalised:
            raise ValueError("No valid questions could be extracted from this PDF.")

        document.extracted_questions = normalised
        for item in normalised:
            question = Question(
                question_text=item["question_text"],
                question_type=QuestionType(item["question_type"]),
                subject=item["subject"] or document.subject,
                difficulty=Difficulty(item["difficulty"]),
                correct_answer=item["correct_answer"],
                source_document_id=document.id,
                created_by=document.uploaded_by,
                approval_status=ApprovalStatus.DRAFT,
            )
            db.add(question)
            db.flush()
            for option in item["options"]:
                db.add(QuestionOption(question_id=question.id, **option))

        document.status = DocumentStatus.REVIEW_REQUIRED
        db.commit()
        db.refresh(document)
        return document
    except Exception as error:
        db.rollback()
        failed = db.query(Document).filter(Document.id == document_id).first()
        if failed:
            failed.status = DocumentStatus.FAILED
            failed.error_message = str(error)
            db.commit()
            db.refresh(failed)
        raise
