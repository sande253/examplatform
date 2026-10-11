from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from app.models.subscription import PaymentStatus, SubscriptionStatus

class PlanBase(BaseModel):
    name: str
    price_inr: Decimal
    currency: str = "INR"
    duration_days: int
    max_tests_per_month: Optional[int] = None
    access_premium_papers: bool = False
    access_analytics: bool = False
    access_explanations: bool = False
    is_active: bool = True

class PlanResponse(PlanBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class PurchaseCreateRequest(BaseModel):
    plan_id: UUID

class PurchaseResponse(BaseModel):
    id: UUID
    internal_order_ref: str
    amount: Decimal
    currency: str
    payment_status: PaymentStatus
    provider_order_ref: Optional[str] = None
    payment_url: Optional[str] = None

    class Config:
        from_attributes = True

class SubscriptionResponse(BaseModel):
    id: UUID
    plan: PlanResponse
    status: SubscriptionStatus
    started_at: datetime
    expires_at: datetime
    cancelled_at: Optional[datetime] = None

    class Config:
        from_attributes = True
