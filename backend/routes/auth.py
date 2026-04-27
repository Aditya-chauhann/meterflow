from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from services.auth_service import (
    create_user, get_user_by_email,
    verify_password, create_access_token, decode_token
)

router = APIRouter(prefix="/auth")

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(body: SignupRequest):
    user_id = create_user(body.email, body.password, body.name)
    if not user_id:
        raise HTTPException(status_code=400, detail="Email already exists")
    token = create_access_token({"email": body.email, "name": body.name})
    return {"message": "Account created", "token": token}

@router.post("/login")
def login(body: LoginRequest):
    user = get_user_by_email(body.email)
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"email": user["email"], "name": user["name"]})
    return {"token": token, "name": user["name"], "email": user["email"]}

@router.get("/me")
def get_me(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"email": payload["email"], "name": payload["name"]}