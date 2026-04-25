from services.mongo import usage_collection
from datetime import datetime

def log_request(api_key: str, endpoint: str, status_code: int, response_time_ms: float):
    usage_collection.insert_one({
        "api_key": api_key,
        "endpoint": endpoint,
        "status_code": status_code,
        "response_time_ms": response_time_ms,
        "timestamp": datetime.utcnow()
    })