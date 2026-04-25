# ⚡ MeterFlow — Usage-Based API Billing Platform

<div align="center">

![MeterFlow Banner](https://img.shields.io/badge/MeterFlow-API%20Billing%20Platform-00ff87?style=for-the-badge&logo=lightning&logoColor=black)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-5.0-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)

**A production-grade SaaS platform that meters API usage, enforces rate limits, and calculates billing — built like real API companies do it.**

</div>

---

## 📌 What is MeterFlow?

MeterFlow is a full-stack API gateway and billing system. Developers can:

- Generate API keys tied to pricing plans
- Make requests that are authenticated and rate-limited in real time
- Have every request automatically logged with latency and status
- View per-key analytics (requests, error rate, avg response time)
- Get a usage-based bill calculated from actual request counts

This mirrors how companies like **Stripe, OpenAI, and Twilio** handle API monetization.

---

## 🧱 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Backend | FastAPI (Python) | REST API server, middleware |
| Database | MongoDB Atlas | API key storage, usage logs |
| Cache / Rate Limit | Redis | Per-key request counting, TTL windows |
| Frontend | React + Recharts | Dashboard UI, charts |
| Auth | Custom middleware | API key validation on every request |

---

## 🏗️ Architecture

```
React Dashboard (localhost:3000)
        │
        ▼
FastAPI Server (localhost:8000)
        │
   ┌────┴────┐
   │         │
Redis      MongoDB Atlas
(rate      (api_keys +
 limit)     usage_logs)
```

**Request Flow:**
```
Incoming Request
    → Auth Middleware (validate x-api-key from MongoDB)
    → Rate Limit Middleware (check Redis counter, increment)
    → Route Handler (business logic)
    → Usage Logger (async log to MongoDB)
    → Response
```

---

## 📁 Project Structure

```
meterflow/
├── backend/
│   ├── middleware/
│   │   ├── auth.py              # API key validation
│   │   └── rate_limit.py        # Redis-based rate limiting
│   ├── models/
│   ├── routes/
│   │   ├── keys.py              # POST /keys/generate
│   │   ├── analytics.py         # GET /analytics/{api_key}
│   │   └── billing.py           # GET /billing/{user_id}
│   ├── services/
│   │   ├── mongo.py             # MongoDB connection
│   │   ├── api_key.py           # Key generation + validation
│   │   ├── usage_logger.py      # Request logging
│   │   ├── analytics.py         # Analytics aggregation
│   │   └── billing.py           # Cost calculation
│   └── main.py                  # App entry point + middleware wiring
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.jsx              # Full dashboard (Overview, Keys, Analytics, Billing)
    │   └── index.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Redis ([Windows download](https://github.com/microsoftarchive/redis/releases))
- MongoDB Atlas account (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/meterflow.git
cd meterflow
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install fastapi uvicorn pymongo redis python-dotenv
```

### 3. Configure MongoDB

Update `services/mongo.py` with your Atlas connection string:

```python
MONGO_URI = "mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/"
```

### 4. Start Redis

```bash
# Windows
cd Redis-x64-5.0.14.1
.\redis-server
```

### 5. Start the backend

```bash
cd backend
python -m uvicorn main:app --reload
# Running at http://127.0.0.1:8000
```

### 6. Start the frontend

```bash
cd frontend
npm install
npm start
# Running at http://localhost:3000
```

---

## 🔌 API Reference

### Generate API Key
```http
POST /keys/generate?user_id={user_id}&plan={plan}
```
No auth required. Plans: `free`, `pro`, `enterprise`

**Response:**
```json
{ "api_key": "dc67e193c57e703680aaf15c6a920139" }
```

---

### Protected Route (example)
```http
GET /data
x-api-key: YOUR_API_KEY
```

**Response:**
```json
{ "data": "protected data" }
```

---

### Analytics
```http
GET /analytics/{api_key}
x-api-key: YOUR_API_KEY
```

**Response:**
```json
{
  "api_key": "dc67e193...",
  "total_requests": 42,
  "avg_response_time_ms": 312.5,
  "error_rate_percent": 0.0,
  "requests_per_endpoint": {
    "/data": 30,
    "/billing/aditya": 12
  }
}
```

---

### Billing
```http
GET /billing/{user_id}
x-api-key: YOUR_API_KEY
```

**Response:**
```json
{
  "user_id": "aditya",
  "keys": [
    {
      "api_key": "dc67e193...",
      "plan": "free",
      "total_requests": 42,
      "cost_usd": 0.042
    }
  ],
  "total_cost_usd": 0.042
}
```

---

## 💰 Pricing Model

| Plan | Price per Request |
|------|------------------|
| Free | $0.0010 |
| Pro | $0.0005 |
| Enterprise | $0.0001 |

Billing is calculated by aggregating request counts from MongoDB usage logs and multiplying by the plan's per-request rate.

---

## 🛡️ Rate Limiting

- **Limit:** 5 requests per 60 seconds per API key
- **Storage:** Redis (in-memory, TTL-based window)
- **Response when exceeded:**

```json
{ "detail": "Rate limit exceeded" }
```
Status: `429 Too Many Requests`

---

## 🖥️ Dashboard Features

| Page | Features |
|------|----------|
| Overview | Live stat cards, request volume chart, endpoint distribution pie chart |
| API Keys | Generate keys by plan, copy to clipboard, session key list |
| Analytics | Per-key request breakdown, avg latency, error rate, bar chart |
| Billing | Usage-based invoice, pricing tier display, cost per key |

---

## 📊 Database Schema

### `api_keys` collection
```json
{
  "key": "dc67e193c57e703680aaf15c6a920139",
  "user_id": "aditya",
  "plan": "free",
  "created_at": "2026-04-25T12:31:13Z",
  "is_active": true
}
```

### `usage_logs` collection
```json
{
  "api_key": "dc67e193...",
  "endpoint": "/data",
  "status_code": 200,
  "response_time_ms": 312.5,
  "timestamp": "2026-04-25T12:31:13Z"
}
```

---

## 🔮 Future Improvements

- [ ] Stripe integration for real payments
- [ ] Webhook alerts when billing threshold exceeded
- [ ] Multi-tenant support (organizations)
- [ ] API playground in dashboard
- [ ] Audit logs
- [ ] JWT-based user authentication
- [ ] Hourly/daily usage charts with real data

---

## 👨‍💻 Author

**Aditya** — Built as a full-stack hiring assignment demonstrating real-world API gateway architecture.

---

<div align="center">
  <sub>Built with FastAPI · MongoDB · Redis · React</sub>
</div>
