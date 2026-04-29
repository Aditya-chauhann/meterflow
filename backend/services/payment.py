import razorpay
from services.mongo import db
from datetime import datetime

client = razorpay.Client(auth=("rzp_test_SjEZpSLB4ROXHN", "V1Vva7nXhPVMhbW1B6VtTYPa"))

payments_collection = db["payments"]

def create_order(user_id: str, amount_usd: float):
    amount_inr = amount_usd * 83
    amount_paise = int(amount_inr * 100)

    import time
    receipt = f"rcpt_{user_id[:10]}_{int(time.time())}"[:40]

    order = client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": receipt,
        "notes": {"user_id": user_id}
    })
    
    payments_collection.insert_one({
        "user_id": user_id,
        "order_id": order["id"],
        "amount_usd": amount_usd,
        "amount_paise": amount_paise,
        "status": "created",
        "created_at": datetime.utcnow()
    })

    return {
        "order_id": order["id"],
        "amount_paise": amount_paise,
        "amount_inr": round(amount_inr, 2),
        "amount_usd": amount_usd,
        "currency": "INR",
        "key_id": "rzp_test_SjEZpSLB4ROXHN"
    }

def verify_payment(order_id: str, payment_id: str, signature: str):
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        })
        payments_collection.update_one(
            {"order_id": order_id},
            {"$set": {"status": "paid", "payment_id": payment_id}}
        )
        return {"success": True, "message": "Payment verified"}
    except Exception:
        return {"success": False, "message": "Payment verification failed"}

def get_payment_history(user_id: str):
    payments = list(payments_collection.find({"user_id": user_id}))
    for p in payments:
        p.pop("_id", None)
    return payments