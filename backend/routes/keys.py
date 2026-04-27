from fastapi import APIRouter
from services.api_key import generate_api_key, revoke_api_key, list_user_keys
from fastapi import HTTPException

router = APIRouter()

@router.post("/keys/generate")
def create_key(user_id: str, plan: str = "free"):
    key = generate_api_key(user_id, plan)
    return {"api_key": key}

@router.patch("/keys/revoke/{key}")
def revoke_key(key: str):
    result = revoke_api_key(key)
    if not result:
        raise HTTPException(status_code=404, detail="Key not found")
    return {"message": "Key revoked successfully"}

@router.get("/keys/{user_id}")
def get_user_keys(user_id: str):
    keys = list_user_keys(user_id)
    return {"user_id": user_id, "keys": keys}