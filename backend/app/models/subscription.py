import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Integer, ForeignKey, Numeric, JSON, Uuid
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class PaymentStatus(enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"

class SubscriptionStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    price_inr = Column(Numeric, nullable=False)
    currency = Column(String, default="INR")
    duration_days = Column(Integer, nullable=False)
    max_tests_per_month = Column(Integer, nullable=True)
    access_premium_papers = Column(Boolean, default=False)
    access_analytics = Column(Boolean, default=False)
    access_explanations = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    plan_id = Column(Uuid(as_uuid=True), ForeignKey("plans.id"), nullable=False)
    internal_order_ref = Column(String, unique=True, nullable=False)
    provider_order_ref = Column(String, nullable=True)
    amount = Column(Numeric, nullable=False)
    currency = Column(String, default="INR")
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    provider_response = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")
    plan = relationship("Plan")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    plan_id = Column(Uuid(as_uuid=True), ForeignKey("plans.id"), nullable=False)
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE)
    started_at = Column(DateTime(timezone=True), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    purchase_id = Column(Uuid(as_uuid=True), ForeignKey("purchases.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")
    plan = relationship("Plan")
    purchase = relationship("Purchase")
