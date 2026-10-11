from sqlalchemy.orm import Session
from app.models.subscription import Purchase, PaymentStatus, Subscription, SubscriptionStatus, Plan
from datetime import datetime, timezone, timedelta
from app.core.config import settings
from .mock_adapter import MockPaymentAdapter
from .juspay_adapter import JuspayAdapter
import uuid

def get_payment_adapter():
    if settings.USE_MOCK_PAYMENT:
        return MockPaymentAdapter()
    return JuspayAdapter()

def activate_subscription(purchase: Purchase, db: Session):
    purchase.payment_status = PaymentStatus.SUCCESS
    
    plan = purchase.plan
    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=plan.duration_days)
    
    # Check existing
    sub = db.query(Subscription).filter(Subscription.user_id == purchase.user_id).first()
    if sub:
        sub.plan_id = plan.id
        sub.status = SubscriptionStatus.ACTIVE
        sub.started_at = now
        sub.expires_at = expires
        sub.purchase_id = purchase.id
    else:
        sub = Subscription(
            user_id=purchase.user_id,
            plan_id=plan.id,
            status=SubscriptionStatus.ACTIVE,
            started_at=now,
            expires_at=expires,
            purchase_id=purchase.id
        )
        db.add(sub)
    
    db.commit()
