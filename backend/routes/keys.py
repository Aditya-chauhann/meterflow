# routes/keys.py
from fastapi import APIRouter
from services.api_key import generate_api_key

router = APIRouter()

@router.post("/keys/generate")
def create_key(user_id: str, plan: str = "free"):
    key = generate_api_key(user_id, plan)
    return {"api_key": key}