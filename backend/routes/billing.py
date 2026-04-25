from fastapi import APIRouter
from services.billing import get_billing

router = APIRouter()

@router.get("/billing/{user_id}")
def billing(user_id: str):
    return get_billing(user_id)