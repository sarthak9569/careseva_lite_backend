import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    app_name: str = "CareSeva FastAPI Backend"
    port: int = int(os.getenv("PORT", "8000"))
    mongo_uri: str = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/careseva")
    db_name: str = os.getenv("DB_NAME", "careseva")
    cors_origin: str = os.getenv("CORS_ORIGIN", "*")
    env: str = os.getenv("ENV", "development")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
