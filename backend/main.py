from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from middleware.auth import api_key_middleware
from middleware.rate_limit import rate_limit_middleware
from routes.keys import router as keys_router
from routes.billing import router as billing_router
from routes.analytics import router as analytics_router
from services.usage_logger import log_request
import time

app = FastAPI()

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ORDER IMPORTANT
app.middleware("http")(api_key_middleware)
app.middleware("http")(rate_limit_middleware)

app.include_router(keys_router)
app.include_router(billing_router)
app.include_router(analytics_router)

@app.middleware("http")
async def usage_logging_middleware(request: Request, call_next):
    if request.url.path == "/":
        return await call_next(request)
    start = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start) * 1000
    api_key = request.headers.get("x-api-key", "unknown")
    log_request(api_key, request.url.path, response.status_code, duration_ms)
    return response

@app.get("/")
def home():
    return {"message": "MeterFlow running"}

@app.get("/data")
def get_data():
    return {"data": "protected data"}
