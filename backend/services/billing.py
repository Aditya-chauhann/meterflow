from services.mongo import usage_collection, api_keys_collection

PRICING = {
    "free": 0.001,
    "pro": 0.0005,
    "enterprise": 0.0001
}

def get_billing(user_id: str):
    # get all keys for this user
    keys = api_keys_collection.find({"user_id": user_id})
    key_list = [k["key"] for k in keys]

    if not key_list:
        return {"error": "No API keys found for this user"}

    # count total requests per key
    result = []
    total_cost = 0

    for key in key_list:
        count = usage_collection.count_documents({"api_key": key})
        
        # get plan for this key
        key_doc = api_keys_collection.find_one({"key": key})
        plan = key_doc.get("plan", "free")
        price = PRICING.get(plan, 0.001)
        cost = count * price

        total_cost += cost
        result.append({
            "api_key": key,
            "plan": plan,
            "total_requests": count,
            "cost_usd": round(cost, 6)
        })

    return {
        "user_id": user_id,
        "keys": result,
        "total_cost_usd": round(total_cost, 6)
    }