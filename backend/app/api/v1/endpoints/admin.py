from datetime import datetime, timedelta, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from pydantic import BaseModel
from sqlalchemy import or_, func
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_db, require_admin
from app.models.question import Question, ApprovalStatus
from app.models.paper import Paper, PaperStatus, PaperQuestion
from app.models.document import Document
from app.models.user import User
from app.models.subscription import Subscription, SubscriptionStatus, Plan
from app.models.test import TestAttempt
from app.schemas.question import QuestionCreate, QuestionResponse, QuestionUpdate
from app.schemas.paper import PaperCreate, PaperResponse, PaperUpdate
from app.schemas.document import DocumentResponse
from app.services.question_service import create_question
from app.services.document_service import create_document, process_document

router = APIRouter()


class BulkApproveRequest(BaseModel):
    ids: List[UUID]


class AddPaperQuestionsRequest(BaseModel):
    question_ids: List[UUID]


class EntitlementUpdateRequest(BaseModel):
    grant_premium: bool = False
    revoke_premium: bool = False
    duration_days: int = 30


# ── Questions ──────────────────────────────────────────────────────────────

@router.post("/questions", response_model=QuestionResponse)
def admin_create_question(q_in: QuestionCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    return create_question(db, q_in, str(admin.id))


@router.patch("/questions/{id}", response_model=QuestionResponse)
def admin_update_question(id: UUID, q_in: QuestionUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    q = db.query(Question).filter(Question.id == id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    for field, value in q_in.model_dump(exclude_unset=True).items():
        setattr(q, field, value)
    db.commit()
    db.refresh(q)
    return q


@router.post("/questions/{id}/approve")
def admin_approve_question(id: UUID, db: Session = Depends(get_db), admin=Depends(require_admin)):
    q = db.query(Question).filter(Question.id == id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.approval_status = ApprovalStatus.APPROVED
    db.commit()
    return {"status": "approved"}


@router.post("/questions/{id}/reject")
def admin_reject_question(id: UUID, db: Session = Depends(get_db), admin=Depends(require_admin)):
    q = db.query(Question).filter(Question.id == id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.approval_status = ApprovalStatus.REJECTED
    db.commit()
    return {"status": "rejected"}


@router.post("/questions/bulk-approve")
def admin_bulk_approve(body: BulkApproveRequest, db: Session = Depends(get_db), admin=Depends(require_admin)):
    if not body.ids:
        return {"status": "approved", "count": 0}
    updated = (
        db.query(Question)
        .filter(Question.id.in_(body.ids))
        .update({Question.approval_status: ApprovalStatus.APPROVED}, synchronize_session=False)
    )
    db.commit()
    return {"status": "approved", "count": updated}


# ── Papers ─────────────────────────────────────────────────────────────────

@router.get("/papers", response_model=List[PaperResponse])
def admin_list_papers(db: Session = Depends(get_db), admin=Depends(require_admin)):
    return db.query(Paper).order_by(Paper.created_at.desc()).all()


@router.post("/papers", response_model=PaperResponse)
def admin_create_paper(p_in: PaperCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    p_data = p_in.model_dump()
    paper = Paper(**p_data, created_by=admin.id)
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return paper


@router.patch("/papers/{id}", response_model=PaperResponse)
def admin_update_paper(id: UUID, p_in: PaperUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    paper = db.query(Paper).filter(Paper.id == id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    for field, value in p_in.model_dump(exclude_unset=True).items():
        setattr(paper, field, value)
    db.commit()
    db.refresh(paper)
    return paper


@router.post("/papers/{id}/publish")
def admin_publish_paper(id: UUID, db: Session = Depends(get_db), admin=Depends(require_admin)):
    p = db.query(Paper).filter(Paper.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Paper not found")
    p.status = PaperStatus.PUBLISHED
    db.commit()
    return {"status": "published"}


@router.post("/papers/{paper_id}/questions")
def admin_add_paper_questions(
    paper_id: UUID,
    body: AddPaperQuestionsRequest,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    if not body.question_ids:
        raise HTTPException(status_code=400, detail="At least one question is required")

    # Replace existing links so re-saves stay consistent.
    db.query(PaperQuestion).filter(PaperQuestion.paper_id == paper_id).delete(synchronize_session=False)

    for index, question_id in enumerate(body.question_ids, start=1):
        question = db.query(Question).filter(Question.id == question_id).first()
        if not question:
            raise HTTPException(status_code=404, detail=f"Question {question_id} not found")
        db.add(PaperQuestion(paper_id=paper_id, question_id=question_id, order_index=index))

    paper.total_questions = len(body.question_ids)
    db.commit()
    return {"status": "ok", "count": len(body.question_ids)}


# ── Documents ──────────────────────────────────────────────────────────────

@router.get("/documents", response_model=List[DocumentResponse])
def admin_list_documents(db: Session = Depends(get_db), admin=Depends(require_admin)):
    return db.query(Document).order_by(Document.created_at.desc()).all()


@router.get("/documents/{document_id}", response_model=DocumentResponse)
def admin_get_document(document_id: UUID, db: Session = Depends(get_db), admin=Depends(require_admin)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.post("/documents", response_model=DocumentResponse)
def admin_upload_doc(
    file: UploadFile = File(...),
    title: str | None = Form(None),
    subject: str | None = Form(None),
    exam_name: str | None = Form(None),
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    try:
        return create_document(db, file, admin.id, title, subject, exam_name)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.post("/documents/{document_id}/process", response_model=DocumentResponse)
def admin_process_document(document_id: UUID, db: Session = Depends(get_db), admin=Depends(require_admin)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    try:
        return process_document(db, document)
    except Exception as error:
        raise HTTPException(status_code=422, detail=f"Document processing failed: {error}")


@router.post("/documents/{document_id}/retry", response_model=DocumentResponse)
def admin_retry_document(document_id: UUID, db: Session = Depends(get_db), admin=Depends(require_admin)):
    return admin_process_document(document_id, db, admin)


@router.get("/documents/{document_id}/questions", response_model=List[QuestionResponse])
def admin_document_questions(document_id: UUID, db: Session = Depends(get_db), admin=Depends(require_admin)):
    return (
        db.query(Question)
        .options(joinedload(Question.options))
        .filter(Question.source_document_id == document_id)
        .order_by(Question.created_at.asc())
        .all()
    )


# ── Users ──────────────────────────────────────────────────────────────────

@router.get("/users")
def admin_list_users(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    query = db.query(User)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(or_(User.name.ilike(term), User.email.ilike(term)))
    users = query.order_by(User.created_at.desc()).all()

    now = datetime.now(timezone.utc)
    result = []
    for user in users:
        sub = (
            db.query(Subscription)
            .options(joinedload(Subscription.plan))
            .filter(Subscription.user_id == user.id)
            .first()
        )
        subscription = None
        if sub:
            is_active = sub.status == SubscriptionStatus.ACTIVE and sub.expires_at > now
            subscription = {
                "status": "ACTIVE" if is_active else sub.status.value,
                "plan_name": sub.plan.name if sub.plan else "PREMIUM",
                "expires_at": sub.expires_at.isoformat() if sub.expires_at else None,
            }
        result.append({
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role.value if hasattr(user.role, "value") else user.role,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "subscription": subscription,
        })
    return result


@router.patch("/users/{user_id}/entitlements")
def admin_update_entitlements(
    user_id: UUID,
    body: EntitlementUpdateRequest,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if body.revoke_premium:
        sub = db.query(Subscription).filter(Subscription.user_id == user_id).first()
        if sub:
            sub.status = SubscriptionStatus.CANCELLED
            sub.cancelled_at = datetime.now(timezone.utc)
            db.commit()
        return {"status": "revoked"}

    if body.grant_premium:
        plan = (
            db.query(Plan)
            .filter(Plan.access_premium_papers == True, Plan.is_active == True)
            .order_by(Plan.price_inr.desc())
            .first()
        )
        if not plan:
            # Fall back to any active paid plan, or create a simple premium plan.
            plan = db.query(Plan).filter(Plan.is_active == True, Plan.price_inr > 0).first()
        if not plan:
            plan = Plan(
                name="Premium",
                price_inr=499,
                duration_days=body.duration_days or 30,
                max_tests_per_month=None,
                access_premium_papers=True,
                access_analytics=True,
                access_explanations=True,
                is_active=True,
            )
            db.add(plan)
            db.flush()

        now = datetime.now(timezone.utc)
        expires = now + timedelta(days=body.duration_days or plan.duration_days or 30)
        sub = db.query(Subscription).filter(Subscription.user_id == user_id).first()
        if sub:
            sub.plan_id = plan.id
            sub.status = SubscriptionStatus.ACTIVE
            sub.started_at = now
            sub.expires_at = expires
            sub.cancelled_at = None
        else:
            db.add(Subscription(
                user_id=user_id,
                plan_id=plan.id,
                status=SubscriptionStatus.ACTIVE,
                started_at=now,
                expires_at=expires,
            ))
        db.commit()
        return {"status": "granted", "expires_at": expires.isoformat()}

    raise HTTPException(status_code=400, detail="Specify grant_premium or revoke_premium")


# ── Analytics ──────────────────────────────────────────────────────────────

@router.get("/analytics")
def admin_analytics(db: Session = Depends(get_db), admin=Depends(require_admin)):
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_papers = db.query(func.count(Paper.id)).scalar() or 0
    total_questions = db.query(func.count(Question.id)).scalar() or 0
    total_tests_taken = db.query(func.count(TestAttempt.id)).scalar() or 0
    premium_subscribers = (
        db.query(func.count(Subscription.id))
        .filter(Subscription.status == SubscriptionStatus.ACTIVE, Subscription.expires_at > now)
        .scalar()
        or 0
    )
    registrations_this_month = (
        db.query(func.count(User.id)).filter(User.created_at >= month_start).scalar() or 0
    )
    tests_this_month = (
        db.query(func.count(TestAttempt.id)).filter(TestAttempt.started_at >= month_start).scalar() or 0
    )

    return {
        "total_users": total_users,
        "total_papers": total_papers,
        "total_questions": total_questions,
        "total_tests_taken": total_tests_taken,
        "premium_subscribers": premium_subscribers,
        "registrations_this_month": registrations_this_month,
        "tests_this_month": tests_this_month,
    }
