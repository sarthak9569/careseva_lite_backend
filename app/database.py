import sys
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    try:
        db_instance.client = AsyncIOMotorClient(settings.mongo_uri)
        db_instance.db = db_instance.client[settings.db_name]
        print(f"✅ MongoDB Async Motor Connected to database: {settings.db_name}")
    except Exception as e:
        print(f"❌ Database Connection Error: {e}")

async def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
        print("🔌 MongoDB Connection Closed.")

def get_database():
    return db_instance.db
