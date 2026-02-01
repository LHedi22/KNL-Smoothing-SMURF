from pydantic_settings import BaseSettings

from functools import lru_cache
from typing import Optional

class QdrantSettings(BaseSettings):
    QDRANT_URL: str
    QDRANT_API_KEY: Optional[str] = None

class Settings(BaseSettings):
    PROJECT_NAME: str = "knl-smoothing-backend"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    
    ADMIN_API_KEY: str
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    
    GROQ_API_KEY: str
    GROQ_MODEL: str = "mixtral-8x7b-32768"
    
    REDIS_ENABLED: bool = False
    REDIS_URL: str = "redis://localhost:6379"
    
    QDRANT_URL: str
    QDRANT_API_KEY: Optional[str] = None

    STORAGE_PATH: str = "./storage"
    MODEL_PATH: str = "./storage/models"
    
    BATCH_SIZE_LIMIT: int = 1000
    REQUEST_TIMEOUT_SECONDS: int = 30
    RATE_LIMIT_PER_MINUTE: int = 100
    
    KNN_K: int = 5
    KNN_METRIC: str = "euclidean"
    
    DEFAULT_THRESHOLD: float = 0.5
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
