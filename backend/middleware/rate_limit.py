from fastapi import Request
from fastapi.responses import JSONResponse
import redis

r = redis.Redis(host='localhost', port=6379, db=0)

LIMIT = 5
WINDOW = 60

async def rate_limit_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    
    if request.url.path == "/":
        return await call_next(request)

    # Skip auth routes
    if request.url.path.startswith("/auth"):
        return await call_next(request)

    # Skip revoke + generate
    if request.url.path.startswith("/keys/revoke"):
        return await call_next(request)

    if request.url.path.startswith("/keys/generate"):
        return await call_next(request)
    
    if request.url.path.startswith("/payment"):
        return await call_next(request)
    
    api_key = request.headers.get("x-api-key")
    if not api_key:
        return JSONResponse(status_code=401, content={"detail": "API key missing"})
    
    key = f"rate_limit:{api_key}"
    current = r.get(key)
    current = int(current) if current else 0
    
    if current >= LIMIT:
        return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})
    
    pipe = r.pipeline()
    pipe.incr(key, 1)
    pipe.expire(key, WINDOW)
    pipe.execute()
    
    response = await call_next(request)
    return response