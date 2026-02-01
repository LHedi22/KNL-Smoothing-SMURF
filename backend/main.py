import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api import scoring, models as model_routes
from utils.logging_config import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application startup")
    yield
    logger.info("Application shutdown")

app = FastAPI(
    title="Credit Risk Scoring Service",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(scoring.router, prefix="/api/v1", tags=["scoring"])
app.include_router(model_routes.router, prefix="/api/v1", tags=["models"])

@app.get("/")
async def root():
    return {"status": "ok", "service": "credit-risk-scorer", "version": "0.1.0"}
