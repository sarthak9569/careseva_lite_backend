from fastapi import APIRouter, HTTPException, status
from app.database import get_database
from app.models.user import UserCreate, UserProfileUpdate, UserBase, UserRole
import random
from datetime import datetime, timezone

router = APIRouter(prefix="/api/auth", tags=["Authentication & Users"])

@router.post("/login")
async def login_or_register(payload: UserCreate):
    db = get_database()
    users_col = db["users"]

    user = await users_col.find_one({"phone": payload.phone})

    if not user:
        user_id = f"USR-{random.randint(100000, 999999)}"
        new_user = {
            "userId": user_id,
            "phone": payload.phone,
            "name": payload.name or f"User {payload.phone[-4:]}",
            "age": payload.age or 25,
            "gender": payload.gender or "Other",
            "role": payload.role or UserRole.PATIENT,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
        await users_col.insert_one(new_user)
        user = new_user

    user.pop("_id", None)
    return {"success": True, "user": user}

@router.post("/profile")
async def update_profile(payload: UserProfileUpdate):
    db = get_database()
    users_col = db["users"]

    user_dict = payload.model_dump()
    updated = await users_col.find_one_and_update(
        {"userId": payload.userId},
        {"$set": user_dict},
        upsert=True,
        return_document=True
    )
    updated.pop("_id", None)
    return {"success": True, "user": updated}

@router.get("/user/{user_id}")
async def get_user(user_id: str):
    db = get_database()
    user = await db["users"].find_one({"userId": user_id})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.pop("_id", None)
    return {"success": True, "user": user}
