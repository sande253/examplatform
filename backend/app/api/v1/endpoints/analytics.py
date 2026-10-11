from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user, require_admin
from app.models.user import User
from app.models.paper import Paper
from app.models.question import Question
from app.models.test import TestAttempt
from app.models.subscription import Subscription, SubscriptionStatus

router = APIRouter()


@router.get("/me")
def get_my_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    attempts = db.query(TestAttempt).filter(TestAttempt.user_id == current_user.id).all()
    total = len(attempts)
    scored = [a for a in attempts if a.percentage is not None]
    average = float(sum(float(a.percentage) for a in scored) / len(scored)) if scored else 0.0
    return {"total_tests_taken": total, "average_score": round(average, 2)}


@router.get("/", dependencies=[Depends(require_admin)])
def get_admin_analytics(db: Session = Depends(get_db)):
    """Legacy path kept for compatibility; prefer /api/v1/admin/analytics."""
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return {
        "total_users": db.query(func.count(User.id)).scalar() or 0,
        "total_papers": db.query(func.count(Paper.id)).scalar() or 0,
        "total_questions": db.query(func.count(Question.id)).scalar() or 0,
        "total_tests_taken": db.query(func.count(TestAttempt.id)).scalar() or 0,
        "premium_subscribers": (
            db.query(func.count(Subscription.id))
            .filter(Subscription.status == SubscriptionStatus.ACTIVE, Subscription.expires_at > now)
            .scalar()
            or 0
        ),
        "registrations_this_month": (
            db.query(func.count(User.id)).filter(User.created_at >= month_start).scalar() or 0
        ),
        "tests_this_month": (
            db.query(func.count(TestAttempt.id)).filter(TestAttempt.started_at >= month_start).scalar() or 0
        ),
        "active_subscriptions": (
            db.query(func.count(Subscription.id))
            .filter(Subscription.status == SubscriptionStatus.ACTIVE, Subscription.expires_at > now)
            .scalar()
            or 0
        ),
    }
