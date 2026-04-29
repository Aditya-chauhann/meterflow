import razorpay
from services.mongo import db
from datetime import datetime
import os

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
payments_collection = db["payments"]

# ... rest of your code stays the same, just change the return in create_order:
# "key_id": RAZORPAY_KEY_ID