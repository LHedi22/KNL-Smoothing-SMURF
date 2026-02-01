from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str

class ReadyResponse(BaseModel):
    ready: bool
    model_loaded: bool
    storage_accessible: bool
    message: str
