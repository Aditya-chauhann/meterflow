import secrets
from services.mongo import api_keys_collection
from datetime import datetime

def generate_api_key(user_id: str, plan: str = "free"):
    key = secrets.token_hex(16)
    api_keys_collection.insert_one({
        "key": key,
        "user_id": user_id,
        "plan": plan,
        "created_at": datetime.utcnow(),
        "is_active": True
    })
    return key

def validate_api_key(key: str):
    return api_keys_collection.find_one({"key": key, "is_active": True})