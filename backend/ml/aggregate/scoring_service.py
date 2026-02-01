import numpy as np
import logging
import uuid
from typing import List, Dict, Any, Optional
from ml.models.model_registry import ModelRegistry
from ml.explanation.explainability import SHAPExplainer
from services.groq_service import GroqService
from schemas.scoring import ScoringResponse, SHAPPayload, SHAPContributor, FraudDetectionResult
from core.config import settings

logger = logging.getLogger(__name__)

class ScoringService:
    
    def __init__(self):
        self.registry = ModelRegistry()
        self.groq_service = GroqService()
        self.explainer = None
        self._init_explainer()
    
    def _init_explainer(self):
        try:
            model = self.registry.get_active_model('xgboost')
            if model:
                X_background = np.random.randn(100, len(self.registry.feature_names))
                self.explainer = SHAPExplainer(
                    model, 
                    X_background, 
                    model_type='tree'
                )
        except Exception as e:
            logger.error(f"Failed to initialize explainer: {e}")
            self.explainer = None
    
    def score(self, X: np.ndarray, include_shap: bool = True) -> ScoringResponse:
        request_id = str(uuid.uuid4())
        
        model = self.registry.get_active_model('xgboost')
        raw_proba = model.predict_proba(X)[0, 1]
        
        smoothed_proba = self.registry.smoother.smooth(X, np.array([raw_proba]))
        if smoothed_proba is not None:
            smoothed_proba = smoothed_proba[0, 0]
        else:
            smoothed_proba = raw_proba
        
        decision = "APPROVE" if smoothed_proba <= settings.DEFAULT_THRESHOLD else "DECLINE"
        
        shap_payload = None
        if include_shap and self.explainer:
            try:
                shap_explanation = self.explainer.explain_instance(X, self.registry.feature_names)
                shap_payload = SHAPPayload(
                    base_value=shap_explanation['base_value'],
                    model_output=float(raw_proba),
                    top_positive_contributors=[
                        SHAPContributor(**contrib) 
                        for contrib in shap_explanation['top_positive_contributors']
                    ],
                    top_negative_contributors=[
                        SHAPContributor(**contrib) 
                        for contrib in shap_explanation['top_negative_contributors']
                    ]
                )
            except Exception as e:
                logger.warning(f"SHAP computation failed: {e}")
        
        banker_explanation = self.groq_service.generate_explanation(
            shap_payload.model_dump() if shap_payload else {},
            smoothed_proba,
            fraud_detected=False,
            decision=decision
        )
        
        reason_codes = self._generate_reason_codes(smoothed_proba, shap_payload)
        
        return ScoringResponse(
            request_id=request_id,
            fraud_detection=FraudDetectionResult(
                is_fraud=False,
                fraud_score=0.0,
                fraud_reason=None
            ),
            risk_score_raw=float(raw_proba),
            risk_score_smoothed=float(smoothed_proba),
            decision=decision,
            reason_codes=reason_codes,
            shap_payload=shap_payload,
            banker_explanation=banker_explanation,
            model_version=self.registry.active_version,
            model_active=True,
            threshold=settings.DEFAULT_THRESHOLD
        )
    
    def batch_score(self, X_list: List[np.ndarray], include_shap: bool = True) -> List[ScoringResponse]:
        results = []
        for X in X_list:
            try:
                result = self.score(X.reshape(1, -1), include_shap=include_shap)
                results.append(result)
            except Exception as e:
                logger.error(f"Error scoring instance: {e}")
        
        return results
    
    def _generate_reason_codes(self, score: float, shap_payload: Optional[SHAPPayload]) -> List[str]:
        codes = []
        
        if score > 0.7:
            codes.append("HIGH_RISK_SCORE")
        elif score > 0.5:
            codes.append("MEDIUM_RISK_SCORE")
        else:
            codes.append("LOW_RISK_SCORE")
        
        if shap_payload:
            if shap_payload.top_positive_contributors:
                codes.append("POSITIVE_INDICATORS")
            if shap_payload.top_negative_contributors:
                codes.append("NEGATIVE_INDICATORS")
        
        return codes
