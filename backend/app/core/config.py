from pydantic_settings import BaseSettings
from typing import List, Union
import json

class Settings(BaseSettings):
    # SQLite makes the application usable out of the box for local development.
    # Production deployments can continue to provide a PostgreSQL DATABASE_URL.
    DATABASE_URL: str = "sqlite:///./examplatform.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    USE_MOCK_EXTRACTOR: bool = True
    
    USE_MOCK_PAYMENT: bool = True
    JUSPAY_MERCHANT_ID: str = ""
    JUSPAY_API_KEY: str = ""
    JUSPAY_BASE_URL: str = "https://sandbox.juspay.in"
    
    STORAGE_BACKEND: str = "local"
    LOCAL_STORAGE_PATH: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 50
    TESSERACT_CMD: str = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str):
            if field_name == 'CORS_ORIGINS':
                if isinstance(raw_val, str) and raw_val.startswith('['):
                    return json.loads(raw_val)
                return [raw_val]
            return raw_val

settings = Settings()
