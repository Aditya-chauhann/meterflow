from fastapi import Request
from fastapi.responses import JSONResponse
import os

LIMIT = 100
WINDOW = 60

async def rate_limit_middleware(request: Request, call_next):
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
    if request.url.path.startswith("/analytics"):
        return await call_next(request)
    if request.url.path.startswith("/billing"):
        return await call_next(request)

    response = await call_next(request)
    return response