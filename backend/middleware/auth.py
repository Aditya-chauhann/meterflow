from fastapi import Request, HTTPException
from services.api_key import validate_api_key

async def api_key_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    
    if request.url.path == "/":
        return await call_next(request)
    if request.url.path.startswith("/auth"):
        return await call_next(request)
    if request.url.path.startswith("/keys"):
        return await call_next(request)
    if request.url.path.startswith("/payment"):
        return await call_next(request)
    
    api_key = request.headers.get("x-api-key")
    if not api_key or not validate_api_key(api_key):
        raise HTTPException(status_code=401, detail="Invalid API Key")
    
    response = await call_next(request)
    return response