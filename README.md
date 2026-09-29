# CareSeva Backend (FastAPI Python + MongoDB Motor + WebSockets)

This is the production-ready **FastAPI** backend for **CareSeva** designed for high-performance async processing, interactive OpenAPI documentation, and seamless deployment on **Railway** with **MongoDB**.

---

## 🌟 Key FastAPI Advantages

- **Interactive API Documentation**: Live Swagger UI at `/docs` and ReDoc at `/redoc`.
- **Native Async & Speed**: Powered by `uvicorn`, `pydantic` v2, and `motor` (official MongoDB async driver).
- **Built-in WebSockets**: Native Python WebSockets for instant queue & token updates.
- **Railway Zero-Config Deployment**: Auto-detects `requirements.txt` or `Dockerfile`.

---

## 💻 Local Setup & Development

### 1. Create Virtual Environment & Install Dependencies
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/careseva
DB_NAME=careseva
CORS_ORIGIN=*
ENV=development
```

### 3. Seed Sample Initial Data
```bash
python app/seed.py
```

### 4. Run FastAPI Dev Server
```bash
uvicorn main:app --reload --port 8000
```
- API Healthcheck: [http://localhost:8000/health](http://localhost:8000/health)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🚂 Railway Deployment Guide

1. Log in to [Railway](https://railway.app).
2. Click **+ New Project** -> Select **Provision MongoDB** (or link MongoDB Atlas).
3. Click **+ New** -> Select **GitHub Repo** and connect your repository (`backend` folder).
4. In **Settings -> Variables**, set:
   - `MONGO_URI`: `${{MongoDB.MONGO_URL}}`
   - `DB_NAME`: `careseva`
   - `CORS_ORIGIN`: `*`
5. Railway will automatically build and publish your server.
