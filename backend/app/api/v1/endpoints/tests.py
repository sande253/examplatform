from datetime import datetime, timezone
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_db, get_current_user
from app.core.ids import as_uuid
from app.models.user import User
from app.models.paper import Paper
from app.models.test import TestAttempt, AttemptAnswer, AttemptStatus
from app.schemas.test import StartTestRequest, TestAttemptResponse, AnswerSubmit
from app.services.test_service import start_test, submit_test
from app.services.entitlement_service import EntitlementService

router = APIRouter()


class FrontendAnswerBody(BaseModel):
    question_id: UUID | None = None
    answer: object | None = None
    selected_answer: object | None = None


def _duration_seconds(paper: Paper | None) -> int:
    minutes = paper.duration_minutes if paper and paper.duration_minutes else 60
    return int(minutes) * 60


def _question_type(raw: str | None) -> str:
    value = (raw or "MCQ_SINGLE").upper()
    if value.startswith("MCQ") or value == "TRUE_FALSE":
        return "MCQ"
    return "TEXT"


def _frontend_state(attempt: TestAttempt, db: Session) -> dict:
    instance = attempt.test_instance
    paper = db.query(Paper).filter(Paper.id == instance.paper_id).first()
    elapsed = 0
    if attempt.started_at:
        start = attempt.started_at
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        elapsed = int((datetime.now(timezone.utc) - start).total_seconds())
    remaining = max(0, _duration_seconds(paper) - elapsed)

    questions = []
    for ans in attempt.answers:
        snap = ans.question_snapshot or {}
        options = []
        for opt in snap.get("options") or []:
            key = str(opt.get("key") or opt.get("option_key") or opt.get("id") or "")
            text = opt.get("text") or opt.get("option_text") or ""
            if key:
                options.append({"id": key, "text": text})
        q_type = (snap.get("question_type") or "").upper()
        if (q_type == "TRUE_FALSE" or "true or false" in (snap.get("question_text") or "").lower()) and len(options) < 2:
            options = [{"id": "True", "text": "True"}, {"id": "False", "text": "False"}]
        selected = ans.selected_answer
        if isinstance(selected, (list, dict)):
            selected = str(selected)
        status = "UNANSWERED"
        if ans.is_marked_for_review:
            status = "MARKED"
        elif selected not in (None, "", []):
            status = "ANSWERED"
        qid = str(ans.question_id)
        questions.append({
            "id": str(ans.id),
            "question_id": qid,
            "selected_answer": selected,
            "status": status,
            "question": {
                "id": qid,
                "text": snap.get("question_text") or snap.get("text") or "",
                "type": _question_type(snap.get("question_type")),
                "options": options,
            },
        })

    return {
        "id": str(attempt.id),
        "attempt_id": str(attempt.id),
        "paper_id": str(instance.paper_id),
        "status": "COMPLETED" if attempt.status != AttemptStatus.IN_PROGRESS else "IN_PROGRESS",
        "start_time": attempt.started_at.isoformat() if attempt.started_at else None,
        "questions": questions,
        "time_remaining": remaining,
        "answers": {
            str(ans.question_id): {
                "selected_answer": ans.selected_answer,
                "is_marked_for_review": ans.is_marked_for_review,
            }
            for ans in attempt.answers
        },
    }


def _history_item(attempt: TestAttempt) -> dict:
    paper_id = None
    if attempt.test_instance:
        paper_id = str(attempt.test_instance.paper_id)
    pct = attempt.percentage
    return {
        "id": str(attempt.id),
        "paper_id": paper_id,
        "score_percentage": float(pct) if pct is not None else 0,
        "correct_count": attempt.correct_count or 0,
        "incorrect_count": attempt.incorrect_count or 0,
        "unanswered_count": attempt.unanswered_count or 0,
        "time_taken": attempt.time_spent_seconds or 0,
        "topic_performance": attempt.topic_performance or [],
        "questions_review": [],
        "status": attempt.status.value if hasattr(attempt.status, "value") else str(attempt.status),
    }


def _load_attempt(db: Session, attempt_id: UUID, user_id) -> TestAttempt:
    attempt = (
        db.query(TestAttempt)
        .options(
            joinedload(TestAttempt.answers).joinedload(AttemptAnswer.question),
            joinedload(TestAttempt.test_instance),
        )
        .filter(TestAttempt.id == as_uuid(attempt_id), TestAttempt.user_id == user_id)
        .first()
    )
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return attempt


@router.post("/", response_model=TestAttemptResponse)
def create_test(req: StartTestRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not EntitlementService.can_start_test(current_user, db):
        raise HTTPException(status_code=403, detail="Test limit reached")
    return start_test(req.paper_id, current_user.id, db)


@router.post("/start", response_model=TestAttemptResponse)
def start_test_alias(req: StartTestRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_test(req, db, current_user)


@router.get("/history")
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    attempts = (
        db.query(TestAttempt)
        .options(joinedload(TestAttempt.test_instance))
        .filter(TestAttempt.user_id == current_user.id)
        .order_by(TestAttempt.started_at.desc())
        .all()
    )
    return [_history_item(a) for a in attempts]


@router.get("/{attempt_id}")
@router.get("/{attempt_id}/state")
def get_test_state(attempt_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    attempt = _load_attempt(db, attempt_id, current_user.id)
    return _frontend_state(attempt, db)


def _save_answer(db: Session, attempt_id, question_id, value):
    ans = (
        db.query(AttemptAnswer)
        .filter(AttemptAnswer.attempt_id == as_uuid(attempt_id), AttemptAnswer.question_id == as_uuid(question_id))
        .first()
    )
    if not ans:
        raise HTTPException(status_code=404, detail="Not found")
    if ans.attempt.status != AttemptStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Test not in progress")
    ans.selected_answer = value
    db.commit()
    return {"status": "saved"}


@router.put("/{attempt_id}/answers/{question_id}")
def autosave_answer(
    attempt_id: UUID,
    question_id: UUID,
    req: AnswerSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _load_attempt(db, attempt_id, current_user.id)
    return _save_answer(db, attempt_id, question_id, req.selected_answer)


@router.post("/{attempt_id}/answer")
def autosave_answer_alias(
    attempt_id: UUID,
    req: FrontendAnswerBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _load_attempt(db, attempt_id, current_user.id)
    qid = req.question_id
    if not qid:
        raise HTTPException(status_code=400, detail="question_id is required")
    value = req.selected_answer if req.selected_answer is not None else req.answer
    return _save_answer(db, attempt_id, qid, value)


def _toggle_review(db: Session, attempt_id, question_id):
    ans = (
        db.query(AttemptAnswer)
        .filter(AttemptAnswer.attempt_id == as_uuid(attempt_id), AttemptAnswer.question_id == as_uuid(question_id))
        .first()
    )
    if not ans:
        raise HTTPException(status_code=404, detail="Not found")
    ans.is_marked_for_review = not ans.is_marked_for_review
    db.commit()
    return {"status": "toggled"}


@router.put("/{attempt_id}/review/{question_id}")
def toggle_review(
    attempt_id: UUID,
    question_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _load_attempt(db, attempt_id, current_user.id)
    return _toggle_review(db, attempt_id, question_id)


@router.post("/{attempt_id}/review")
def toggle_review_alias(
    attempt_id: UUID,
    req: FrontendAnswerBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _load_attempt(db, attempt_id, current_user.id)
    if not req.question_id:
        raise HTTPException(status_code=400, detail="question_id is required")
    return _toggle_review(db, attempt_id, req.question_id)


@router.post("/{attempt_id}/submit", response_model=TestAttemptResponse)
def submit(attempt_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return submit_test(as_uuid(attempt_id), db)


@router.get("/{attempt_id}/results")
def get_results(attempt_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    attempt = _load_attempt(db, attempt_id, current_user.id)
    if attempt.status != AttemptStatus.SUBMITTED:
        raise HTTPException(status_code=404, detail="Results not available")
    item = _history_item(attempt)
    review = []
    for ans in attempt.answers:
        snap = ans.question_snapshot or {}
        q = ans.question
        options = snap.get("options") or []
        if q and getattr(q, "options", None):
            options = [{"key": o.option_key, "text": o.option_text} for o in q.options]
        qtype = snap.get("question_type") or (q.question_type.value if q and q.question_type else "")
        if str(qtype).upper() == "TRUE_FALSE" and len(options) < 2:
            options = [{"key": "True", "text": "True"}, {"key": "False", "text": "False"}]
        review.append({
            "question_id": str(ans.question_id),
            "question_text": snap.get("question_text") or (q.question_text if q else ""),
            "question_type": qtype,
            "options": options,
            "user_answer": ans.selected_answer,
            "selected_answer": ans.selected_answer,
            "correct_answer": q.correct_answer if q else None,
            "is_correct": ans.is_correct,
            "explanation": q.explanation if q else None,
            "skipped": ans.selected_answer in (None, "", []),
        })
    item["questions_review"] = review
    return item
