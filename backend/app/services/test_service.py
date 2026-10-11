from sqlalchemy.orm import Session
from app.models.test import TestInstance, TestAttempt, AttemptAnswer, AttemptStatus
from app.models.paper import Paper, PaperQuestion
from app.services.scoring_service import score_attempt
from app.core.ids import as_uuid
from fastapi import HTTPException
import random
from datetime import datetime, timezone


def create_test_instance(paper_id, user_id, db: Session) -> TestInstance:
    paper = db.query(Paper).filter(Paper.id == as_uuid(paper_id)).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    pqs = paper.paper_questions
    if not pqs:
        raise HTTPException(status_code=400, detail="This paper has no questions yet.")

    q_ids = [str(pq.question_id) for pq in pqs]

    option_order_map = {}
    for pq in pqs:
        opts = [o.option_key for o in pq.question.options]
        shuffled = opts.copy()
        random.shuffle(shuffled)
        option_order_map[str(pq.question_id)] = {orig: shuf for orig, shuf in zip(opts, shuffled)}

    instance = TestInstance(
        paper_id=paper.id,
        created_for_user_id=as_uuid(user_id),
        question_order=q_ids,
        option_order_map=option_order_map,
    )
    db.add(instance)
    db.commit()
    db.refresh(instance)
    return instance


def start_test(paper_id, user_id, db: Session) -> TestAttempt:
    instance = create_test_instance(paper_id, user_id, db)
    attempt = TestAttempt(
        test_instance_id=instance.id,
        user_id=as_uuid(user_id),
        status=AttemptStatus.IN_PROGRESS,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    paper_uuid = as_uuid(paper_id)
    for q_id in instance.question_order:
        pq = (
            db.query(PaperQuestion)
            .filter_by(paper_id=paper_uuid, question_id=as_uuid(q_id))
            .first()
        )
        if not pq:
            continue
        q = pq.question
        options = [{"key": o.option_key, "text": o.option_text} for o in q.options]
        if (getattr(q.question_type, "value", str(q.question_type)) == "TRUE_FALSE") and not options:
            options = [{"key": "True", "text": "True"}, {"key": "False", "text": "False"}]
        q_dict = {
            "question_text": q.question_text,
            "question_type": q.question_type.value,
            "options": options,
        }
        ans = AttemptAnswer(
            attempt_id=attempt.id,
            question_id=as_uuid(q_id),
            question_snapshot=q_dict,
        )
        db.add(ans)
    db.commit()
    db.refresh(attempt)
    return attempt


def submit_test(attempt_id, db: Session):
    attempt = db.query(TestAttempt).filter(TestAttempt.id == as_uuid(attempt_id)).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.status == AttemptStatus.SUBMITTED:
        return attempt

    attempt.status = AttemptStatus.SUBMITTED
    attempt.submitted_at = datetime.now(timezone.utc)

    score_attempt(attempt, db)
    db.commit()
    db.refresh(attempt)
    return attempt
