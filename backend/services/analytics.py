from services.mongo import usage_collection
from datetime import datetime

def get_analytics(api_key: str):
    logs = list(usage_collection.find({"api_key": api_key}))
    
    if not logs:
        return {"error": "No data found for this API key"}

    total_requests = len(logs)
    avg_response_time = sum(l["response_time_ms"] for l in logs) / total_requests
    error_count = sum(1 for l in logs if l["status_code"] >= 400)
    error_rate = round((error_count / total_requests) * 100, 2)

    # requests per endpoint
    endpoints = {}
    for l in logs:
        ep = l["endpoint"]
        endpoints[ep] = endpoints.get(ep, 0) + 1

    return {
        "api_key": api_key,
        "total_requests": total_requests,
        "avg_response_time_ms": round(avg_response_time, 2),
        "error_rate_percent": error_rate,
        "requests_per_endpoint": endpoints
    }