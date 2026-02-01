import logging
from fastapi import APIRouter, HTTPException, status, Depends
from schemas.scoring import ActivateModelRequest, ActivateModelResponse, ModelsResponse
from ml.models.model_registry import ModelRegistry
from core.security import verify_admin_api_key

logger = logging.getLogger(__name__)
router = APIRouter()

model_registry = None

def get_model_registry():
    global model_registry
    if model_registry is None:
        model_registry = ModelRegistry()
    return model_registry

@router.get("/models", response_model=ModelsResponse)
async def get_models():
    try:
        registry = get_model_registry()
        versions = registry.get_available_versions()
        
        return ModelsResponse(
            available_versions=versions,
            active_version=registry.active_version or "none"
        )
    except Exception as e:
        logger.error(f"Failed to get models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve models"
        )

@router.post("/models/activate", response_model=ActivateModelResponse)
async def activate_model(
    request: ActivateModelRequest,
    _: str = Depends(verify_admin_api_key)
):
    try:
        registry = get_model_registry()
        active_version = registry.activate_version(request.version)
        
        return ActivateModelResponse(
            active_version=active_version,
            message=f"Successfully activated model version {active_version}"
        )
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model version not found"
        )
    except Exception as e:
        logger.error(f"Failed to activate model: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to activate model"
        )

@router.post("/models/rollback", response_model=ActivateModelResponse)
async def rollback_model(
    _: str = Depends(verify_admin_api_key)
):
    try:
        registry = get_model_registry()
        previous_version = registry.rollback_to_previous()
        
        return ActivateModelResponse(
            active_version=previous_version,
            message=f"Successfully rolled back to model version {previous_version}"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough versions to rollback"
        )
    except Exception as e:
        logger.error(f"Failed to rollback model: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to rollback model"
        )
