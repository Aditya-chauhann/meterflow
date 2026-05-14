from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from middleware.auth import api_key_middleware
from middleware.rate_limit import rate_limit_middleware
from routes.keys import router as keys_router
from routes.billing import router as billing_router
from routes.analytics import router as analytics_router
from services.usage_logger import log_request
from routes.auth import router as auth_router
from routes.payment import router as payment_router

import time

app = FastAPI()

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://meterflow-drab.vercel.app"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ORDER IMPORTANT
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    # Let CORS preflight through
    if request.method == "OPTIONS":
        return await call_next(request)
    return await api_key_middleware(request, call_next)

@app.middleware("http")  
async def rate_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    return await rate_limit_middleware(request, call_next)

app.include_router(keys_router)
app.include_router(billing_router)
app.include_router(analytics_router)
app.include_router(auth_router)
app.include_router(payment_router)


@app.middleware("http")
async def usage_logging_middleware(request: Request, call_next):
    if request.url.path == "/":
        return await call_next(request)
    
    # Skip auth and payment routes from logging
    if request.url.path.startswith("/auth") or request.url.path.startswith("/payment"):
        return await call_next(request)
    
    start = time.time()
    try:
        response = await call_next(request)
        duration_ms = (time.time() - start) * 1000
        api_key = request.headers.get("x-api-key", "unknown")
        log_request(api_key, request.url.path, response.status_code, duration_ms)
        return response
    except Exception:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=401, content={"detail": "Invalid API Key"})

@app.get("/")
def home():
    return {"message": "MeterFlow running"}

@app.get("/data")
def get_data():
    return {"data": "protected data"}
