from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional
from app.database import get_database
from app.models.queue import ToggleActiveRequest, CallNextRequest
from app.models.token import TokenCreateRequest, TokenStatusUpdateRequest, TokenStatus
from app.sockets.manager import ws_manager
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/api/queues", tags=["Queues & Tokens"])

@router.get("/{clinic_id}/{date_str}")
async def get_queue_data(clinic_id: str, date_str: str, doctorId: Optional[str] = "default"):
    db = get_database()
    doc_id = doctorId or "default"
    queue_id = f"Q-{clinic_id}-{doc_id}-{date_str}"

    queue = await db["queues"].find_one({"clinicId": clinic_id, "date": date_str, "doctorId": doc_id})

    if not queue:
        queue = {
            "queueId": queue_id,
            "clinicId": clinic_id,
            "doctorId": doc_id,
            "date": date_str,
            "currentToken": 0,
            "lastToken": 0,
            "isActive": True,
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }
        await db["queues"].insert_one(queue)

    queue.pop("_id", None)

    tokens_cursor = db["tokens"].find({"clinicId": clinic_id, "date": date_str}).sort("tokenNumber", 1)
    tokens = []
    async for t in tokens_cursor:
        t.pop("_id", None)
        tokens.append(t)

    return {"success": True, "queue": queue, "tokens": tokens}

@router.post("/token", status_code=status.HTTP_201_CREATED)
async def create_token(payload: TokenCreateRequest):
    db = get_database()
    doc_id = payload.doctorId or "default"

    # Find or initialize Queue
    queue = await db["queues"].find_one({"clinicId": payload.clinicId, "date": payload.date, "doctorId": doc_id})
    if not queue:
        queue_id = f"Q-{payload.clinicId}-{doc_id}-{payload.date}"
        queue = {
            "queueId": queue_id,
            "clinicId": payload.clinicId,
            "doctorId": doc_id,
            "date": payload.date,
            "currentToken": 0,
            "lastToken": 0,
            "isActive": True,
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }
        await db["queues"].insert_one(queue)

    new_last = queue.get("lastToken", 0) + 1
    current_tok = queue.get("currentToken", 0)
    if current_tok == 0:
        current_tok = 1

    now_str = datetime.now(timezone.utc).isoformat()
    await db["queues"].update_one(
        {"queueId": queue["queueId"]},
        {"$set": {"lastToken": new_last, "currentToken": current_tok, "updatedAt": now_str}}
    )
    queue["lastToken"] = new_last
    queue["currentToken"] = current_tok
    queue["updatedAt"] = now_str
    queue.pop("_id", None)

    token_id = f"TOK-{payload.clinicId}-{payload.date}-{new_last}"
    token_doc = {
        "tokenId": token_id,
        "clinicId": payload.clinicId,
        "doctorId": doc_id,
        "userId": payload.userId,
        "patientName": payload.patientName or "Patient",
        "patientPhone": payload.patientPhone or "",
        "date": payload.date,
        "tokenNumber": new_last,
        "status": TokenStatus.WAITING,
        "createdAt": now_str
    }
    await db["tokens"].insert_one(token_doc)
    token_doc.pop("_id", None)

    # Broadcast real-time update
    room = f"queue_{payload.clinicId}_{payload.date}"
    await ws_manager.broadcast_to_room(room, {"type": "token_created", "queue": queue, "token": token_doc})

    return {"success": True, "token": token_doc, "queue": queue}

@router.post("/toggle-active")
async def toggle_queue_active(payload: ToggleActiveRequest):
    db = get_database()
    doc_id = payload.doctorId or "default"
    now_str = datetime.now(timezone.utc).isoformat()

    queue = await db["queues"].find_one_and_update(
        {"clinicId": payload.clinicId, "date": payload.date, "doctorId": doc_id},
        {"$set": {"isActive": payload.isActive, "updatedAt": now_str}},
        upsert=True,
        return_document=True
    )
    queue.pop("_id", None)

    room = f"queue_{payload.clinicId}_{payload.date}"
    await ws_manager.broadcast_to_room(room, {"type": "queue_toggled", "queue": queue})

    return {"success": True, "queue": queue}

@router.post("/call-next")
async def call_next_token(payload: CallNextRequest):
    db = get_database()
    doc_id = payload.doctorId or "default"

    queue = await db["queues"].find_one({"clinicId": payload.clinicId, "date": payload.date, "doctorId": doc_id})
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")

    next_token = await db["tokens"].find_one({
        "clinicId": payload.clinicId,
        "date": payload.date,
        "status": TokenStatus.WAITING
    }, sort=[("tokenNumber", 1)])

    if not next_token:
        queue.pop("_id", None)
        return {"success": False, "message": "No waiting tokens in queue", "queue": queue}

    now_str = datetime.now(timezone.utc).isoformat()
    await db["tokens"].update_one(
        {"tokenId": next_token["tokenId"]},
        {"$set": {"status": TokenStatus.CALLED, "calledAt": now_str}}
    )
    next_token["status"] = TokenStatus.CALLED
    next_token["calledAt"] = now_str
    next_token.pop("_id", None)

    await db["queues"].update_one(
        {"queueId": queue["queueId"]},
        {"$set": {"currentToken": next_token["tokenNumber"], "updatedAt": now_str}}
    )
    queue["currentToken"] = next_token["tokenNumber"]
    queue["updatedAt"] = now_str
    queue.pop("_id", None)

    room = f"queue_{payload.clinicId}_{payload.date}"
    await ws_manager.broadcast_to_room(room, {"type": "token_called", "queue": queue, "calledToken": next_token})

    return {"success": True, "queue": queue, "calledToken": next_token}

@router.patch("/token/{token_id}/status")
async def update_token_status(token_id: str, payload: TokenStatusUpdateRequest):
    db = get_database()
    token = await db["tokens"].find_one({"tokenId": token_id})
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")

    now_str = datetime.now(timezone.utc).isoformat()
    update_fields = {"status": payload.status}
    if payload.status == TokenStatus.COMPLETED:
        update_fields["completedAt"] = now_str
    elif payload.status == TokenStatus.SKIPPED:
        update_fields["skippedAt"] = now_str

    updated_token = await db["tokens"].find_one_and_update(
        {"tokenId": token_id},
        {"$set": update_fields},
        return_document=True
    )
    updated_token.pop("_id", None)

    room = f"queue_{token['clinicId']}_{token['date']}"
    await ws_manager.broadcast_to_room(room, {"type": "token_status_changed", "token": updated_token})

    return {"success": True, "token": updated_token}

@router.get("/user/{user_id}")
async def get_user_tokens(user_id: str):
    db = get_database()
    cursor = db["tokens"].find({"userId": user_id}).sort("createdAt", -1)
    tokens = []
    async for t in cursor:
        t.pop("_id", None)
        tokens.append(t)

    return {"success": True, "tokens": tokens}
