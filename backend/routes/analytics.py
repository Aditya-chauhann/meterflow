from fastapi import APIRouter
from services.analytics import get_analytics

router = APIRouter()

@router.get("/analytics/{api_key}")
def analytics(api_key: str):
    return get_analytics(api_key)