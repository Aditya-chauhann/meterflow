from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["meterflow"]

api_keys_collection = db["api_keys"]
usage_collection = db["usage_logs"]