from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.models.subscription import Purchase
from app.services.payment.payment_service import activate_subscription

router = APIRouter()

@router.post("/juspay")
async def juspay_webhook(request: Request, db: Session = Depends(get_db)):
    # Very simplified mock webhook handler
    data = await request.json()
    order_id = data.get("order_id")
    status = data.get("status")
    
    if status == "SUCCESS":
        purchase = db.query(Purchase).filter(Purchase.provider_order_ref == order_id).first()
        if purchase:
            activate_subscription(purchase, db)
    return {"received": True}
