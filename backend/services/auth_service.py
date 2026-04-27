from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from services.mongo import db

# Config
SECRET_KEY = "meterflow-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Collections
users_collection = db["users"]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_user_by_email(email: str):
    return users_collection.find_one({"email": email})

def create_user(email: str, password: str, name: str):
    if get_user_by_email(email):
        return None
    user = {
        "email": email,
        "password": hash_password(password),
        "name": name,
        "created_at": datetime.utcnow(),
        "role": "user"
    }
    result = users_collection.insert_one(user)
    return str(result.inserted_id)