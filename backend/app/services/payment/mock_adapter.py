import uuid

class MockPaymentAdapter:
    def create_order(self, order_id: str, amount: float, currency: str, user_id: str) -> dict:
        return {
            "order_id": order_id,
            "payment_url": f"/mock-payment/{order_id}",
            "status": "CREATED"
        }
    
    def verify_payment(self, order_id: str) -> str:
        return "SUCCESS"
