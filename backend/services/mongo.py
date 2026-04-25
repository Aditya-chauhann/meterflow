from pymongo import MongoClient

MONGO_URI = "mongodb+srv://aditya:Aditya%401@cluster0.qwhr1bn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(MONGO_URI)
db = client["meterflow"]

api_keys_collection = db["api_keys"]
usage_collection = db["usage_logs"]