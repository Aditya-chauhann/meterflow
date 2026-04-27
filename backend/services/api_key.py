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

def revoke_api_key(key: str):
    result = api_keys_collection.update_one(
        {"key": key},
        {"$set": {"is_active": False}}
    )
    if result.modified_count == 0:
        return {"error": "Key not found or already revoked"}
    return {"message": "Key revoked successfully", "key": key}

def list_user_keys(user_id: str):
    keys = api_keys_collection.find({"user_id": user_id})
    return [
        {
            "key": k["key"],
            "plan": k["plan"],
            "is_active": k["is_active"],
            "created_at": str(k["created_at"])
        }
        for k in keys
    ]