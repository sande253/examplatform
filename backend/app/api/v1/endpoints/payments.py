from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.subscription import Plan, Purchase
from app.schemas.subscription import PurchaseCreateRequest, PurchaseResponse
from app.services.payment.payment_service import get_payment_adapter
import uuid

router = APIRouter()

@router.post("/create-order", response_model=PurchaseResponse)
def create_order(req: PurchaseCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = db.query(Plan).filter(Plan.id == req.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
        
    order_id = str(uuid.uuid4())
    purchase = Purchase(
        user_id=current_user.id,
        plan_id=plan.id,
        internal_order_ref=order_id,
        amount=plan.price_inr,
        currency=plan.currency
    )
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    
    adapter = get_payment_adapter()
    res = adapter.create_order(order_id, float(plan.price_inr), plan.currency, str(current_user.id))
    
    purchase.provider_order_ref = res.get("order_id")
    db.commit()
    
    return {
        "id": purchase.id,
        "internal_order_ref": purchase.internal_order_ref,
        "amount": purchase.amount,
        "currency": purchase.currency,
        "payment_status": purchase.payment_status,
        "provider_order_ref": purchase.provider_order_ref,
        "payment_url": res.get("payment_url")
    }

@router.get("/{order_id}/status")
def payment_status(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    purchase = db.query(Purchase).filter(Purchase.internal_order_ref == order_id, Purchase.user_id == current_user.id).first()
    if not purchase:
        raise HTTPException(status_code=404)
    return {"status": purchase.payment_status}
