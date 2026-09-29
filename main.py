from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routers import auth, clinics, applications, queues
from app.sockets.manager import ws_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title=settings.app_name,
    description="CareSeva Async FastAPI MongoDB Backend with Real-Time WebSockets for Railway",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
origins = [origin.strip() for origin in settings.cors_origin.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check route
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "OK",
        "service": settings.app_name,
        "environment": settings.env,
        "database": "MongoDB Motor Async Driver"
    }

# Register API Routers
app.include_router(auth.router)
app.include_router(clinics.router)
app.include_router(applications.router)
app.include_router(queues.router)

# Native Real-Time WebSocket Endpoint
@app.websocket("/ws/queue/{clinic_id}/{date_str}")
async def websocket_queue_endpoint(websocket: WebSocket, clinic_id: str, date_str: str):
    room = f"queue_{clinic_id}_{date_str}"
    await ws_manager.connect(room, websocket)
    try:
        while True:
            # Keep connection alive & listen for client ping/messages
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(room, websocket)

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", settings.port))
    print(f"🚀 Starting CareSeva Backend on 0.0.0.0:{port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
