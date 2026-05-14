from fastapi import Request
from fastapi.responses import JSONResponse
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
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid API Key"},
            headers={"Access-Control-Allow-Origin": "https://meterflow-drab.vercel.app"}
        )
    
    response = await call_next(request)
    return response