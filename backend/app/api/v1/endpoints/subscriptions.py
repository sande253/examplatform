from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.subscription import Plan
from app.schemas.subscription import PlanResponse, SubscriptionResponse
from app.services.entitlement_service import EntitlementService
from typing import List

router = APIRouter()

@router.get("/plans", response_model=List[PlanResponse])
def get_plans(db: Session = Depends(get_db)):
    return db.query(Plan).filter(Plan.is_active == True).all()

@router.get("/me", response_model=SubscriptionResponse)
def get_my_subscription(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sub = EntitlementService.get_active_subscription(current_user, db)
    if not sub:
        return None
    return sub
