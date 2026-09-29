import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    app_name: str = "CareSeva FastAPI Backend"
    port: int = int(os.getenv("PORT", "8000"))
    mongo_uri: str = os.getenv("MONGO_URI", "mongodb+srv://softkrestinfotech_db_user:babu23june@cluster0.sajvjlg.mongodb.net/careseva_lite?appName=Cluster0&retryWrites=true&w=majority")
    db_name: str = os.getenv("DB_NAME", "careseva_lite")
    cors_origin: str = os.getenv("CORS_ORIGIN", "*")
    env: str = os.getenv("ENV", "production")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
