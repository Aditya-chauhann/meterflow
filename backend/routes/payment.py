from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from services.payment import create_order, verify_payment, get_payment_history
from services.auth_service import decode_token

router = APIRouter(prefix="/payment")

class OrderRequest(BaseModel):
    user_id: str
    amount_usd: float

class VerifyRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str

@router.post("/create-order")
def create_payment_order(body: OrderRequest):
    return create_order(body.user_id, body.amount_usd)

@router.post("/verify")
def verify(body: VerifyRequest):
    result = verify_payment(body.order_id, body.payment_id, body.signature)
    if not result["success"]:
        raise HTTPException(status_code=400, detail="Payment verification failed")
    return result

@router.get("/history/{user_id}")
def history(user_id: str):
    return get_payment_history(user_id)