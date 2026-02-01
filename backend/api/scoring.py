import logging
import asyncio
from fastapi import APIRouter, HTTPException, status
from schemas.scoring import (
    ScoringRequest, BatchScoringRequest, ScoringResponse, 
    BatchScoringResponse, TrainingConfig, TrainingResponse
)
from ml.aggregate.scoring_service import ScoringService
from ml.models.training import TrainingPipeline
from core.config import settings
import numpy as np
import pandas as pd
import uuid

logger = logging.getLogger(__name__)
router = APIRouter()

scoring_service = None

def get_scoring_service():
    global scoring_service
    if scoring_service is None:
        scoring_service = ScoringService()
    return scoring_service

@router.post("/score", response_model=ScoringResponse)
async def score(request: ScoringRequest):
    try:
        service = get_scoring_service()
        
        X = np.array([[
            request.application.loan_amnt,
            request.application.annual_inc,
            request.application.open_acc,
            request.application.total_acc,
            request.application.mort_acc,
            request.application.delinq_2yrs,
            request.application.revol_bal,
            request.application.tot_cur_bal,
            request.application.avg_cur_bal,
            request.application.acc_open_past_24mths,
            request.application.term_int,
            request.application.emp_length_int,
            request.application.open_account_ratio,
            request.application.severe_credit_event,
            request.application.inquiry_density,
            float(hash(request.application.purpose) % 100) / 100,
            float(hash(request.application.verification_status) % 100) / 100,
            float(hash(request.application.home_ownership) % 100) / 100,
        ]])
        
        result = service.score(X, include_shap=request.include_shap)
        return result
    
    except Exception as e:
        logger.error(f"Scoring failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Scoring service error"
        )

@router.post("/score/batch", response_model=BatchScoringResponse)
async def score_batch(request: BatchScoringRequest):
    try:
        if len(request.applications) > settings.BATCH_SIZE_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Batch size exceeds limit of {settings.BATCH_SIZE_LIMIT}"
            )
        
        service = get_scoring_service()
        
        X_list = []
        for app in request.applications:
            X = np.array([[
                app.loan_amnt,
                app.annual_inc,
                app.open_acc,
                app.total_acc,
                app.mort_acc,
                app.delinq_2yrs,
                app.revol_bal,
                app.tot_cur_bal,
                app.avg_cur_bal,
                app.acc_open_past_24mths,
                app.term_int,
                app.emp_length_int,
                app.open_account_ratio,
                app.severe_credit_event,
                app.inquiry_density,
                float(hash(app.purpose) % 100) / 100,
                float(hash(app.verification_status) % 100) / 100,
                float(hash(app.home_ownership) % 100) / 100,
            ]])
            X_list.append(X)
        
        results = service.batch_score(X_list, include_shap=request.include_shap)
        
        request_id = str(uuid.uuid4())
        return BatchScoringResponse(
            request_id=request_id,
            results=results,
            processed_count=len(results),
            failed_count=len(request.applications) - len(results)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch scoring failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Batch scoring service error"
        )

@router.post("/train", response_model=TrainingResponse)
async def train(config: TrainingConfig):
    try:
        df = pd.read_csv(config.data_path)
        
        feature_cols = [
            'loan_amnt', 'annual_inc', 'open_acc', 'total_acc', 'mort_acc',
            'delinq_2yrs', 'revol_bal', 'tot_cur_bal', 'avg_cur_bal',
            'acc_open_past_24mths', 'term_int', 'emp_length_int',
            'open_account_ratio', 'severe_credit_event', 'inquiry_density',
            'purpose', 'verification_status', 'home_ownership'
        ]
        
        X = df[feature_cols].values
        y = df['loan_status'].values
        
        pipeline = TrainingPipeline()
        result = pipeline.train(X, y, feature_cols, config.model_dump())
        
        return TrainingResponse(
            model_version=result['model_version'],
            training_time_seconds=result['training_time_seconds'],
            metrics=result['metrics'],
            artifact_path=result['artifact_path']
        )
    
    except FileNotFoundError as e:
        logger.error(f"Data file not found: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data file not found"
        )
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Training service error"
        )
