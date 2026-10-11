from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.paper import Paper, AccessType
from app.models.subscription import Subscription, SubscriptionStatus, Plan
from app.models.test import TestAttempt
from datetime import datetime, timezone
import calendar

class EntitlementService:
    @staticmethod
    def get_active_subscription(user: User, db: Session) -> Subscription:
        now = datetime.now(timezone.utc)
        return db.query(Subscription).join(Plan).filter(
            Subscription.user_id == user.id,
            Subscription.status == SubscriptionStatus.ACTIVE,
            Subscription.expires_at > now
        ).first()

    @staticmethod
    def can_access_paper(user: User, paper: Paper, db: Session) -> bool:
        if user.role == UserRole.admin:
            return True
        if paper.access_type == AccessType.FREE:
            return True
        sub = EntitlementService.get_active_subscription(user, db)
        if sub and sub.plan.access_premium_papers:
            return True
        return False

    @staticmethod
    def can_start_test(user: User, db: Session) -> bool:
        if user.role == UserRole.admin:
            return True
            
        now = datetime.now(timezone.utc)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        attempts_this_month = db.query(TestAttempt).filter(
            TestAttempt.user_id == user.id,
            TestAttempt.started_at >= start_of_month
        ).count()

        sub = EntitlementService.get_active_subscription(user, db)
        if sub:
            if sub.plan.max_tests_per_month is None:
                return True
            return attempts_this_month < sub.plan.max_tests_per_month
            
        # Fallback to free limit logic if no sub (e.g. 5)
        # Check free plan if exists, or hardcode 5
        free_plan = db.query(Plan).filter(Plan.price_inr == 0).first()
        limit = free_plan.max_tests_per_month if free_plan else 5
        return attempts_this_month < limit
