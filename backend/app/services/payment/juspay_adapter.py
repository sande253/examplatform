import httpx
from app.core.config import settings

class JuspayAdapter:
    def __init__(self):
        self.base_url = settings.JUSPAY_BASE_URL
        self.api_key = settings.JUSPAY_API_KEY
        self.merchant_id = settings.JUSPAY_MERCHANT_ID
        
    def create_order(self, order_id: str, amount: float, currency: str, user_id: str) -> dict:
        # In a real implementation, call Juspay API
        return {
            "order_id": order_id,
            "payment_url": f"{self.base_url}/merchant/pay/{order_id}",
            "status": "CREATED"
        }
        
    def verify_payment(self, order_id: str) -> str:
        # Return SUCCESS, FAILED etc.
        return "SUCCESS"
