from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class LoanApplication(BaseModel):
    loan_amnt: float
    annual_inc: float
    open_acc: int
    total_acc: int
    mort_acc: int
    delinq_2yrs: int
    revol_bal: float
    tot_cur_bal: float
    avg_cur_bal: float
    acc_open_past_24mths: int
    term_int: float
    emp_length_int: float
    open_account_ratio: float
    severe_credit_event: int
    inquiry_density: float
    purpose: str
    verification_status: str
    home_ownership: str

class ScoringRequest(BaseModel):
    application: LoanApplication
    include_shap: bool = True

class BatchScoringRequest(BaseModel):
    applications: List[LoanApplication] = Field(..., max_items=1000)
    include_shap: bool = True

class FraudDetectionResult(BaseModel):
    is_fraud: bool
    fraud_score: float
    fraud_reason: Optional[str] = None

class SHAPContributor(BaseModel):
    feature: str
    shap_value: float
    feature_value: Any

class SHAPPayload(BaseModel):
    base_value: float
    model_output: float
    top_positive_contributors: List[SHAPContributor]
    top_negative_contributors: List[SHAPContributor]

class ScoringResponse(BaseModel):
    request_id: str
    application_id: Optional[str] = None
    fraud_detection: FraudDetectionResult
    risk_score_raw: float
    risk_score_smoothed: float
    decision: str
    reason_codes: List[str]
    shap_payload: Optional[SHAPPayload] = None
    banker_explanation: str
    model_version: str
    model_active: bool
    threshold: float

class BatchScoringResponse(BaseModel):
    request_id: str
    results: List[ScoringResponse]
    processed_count: int
    failed_count: int

class TrainingConfig(BaseModel):
    data_path: str
    test_size: float = 0.2
    random_state: int = 42
    xgboost_params: Optional[Dict[str, Any]] = None
    lightgbm_params: Optional[Dict[str, Any]] = None
    logistic_params: Optional[Dict[str, Any]] = None

class TrainingResponse(BaseModel):
    model_version: str
    training_time_seconds: float
    metrics: Dict[str, float]
    artifact_path: str

class ModelVersion(BaseModel):
    version: str
    created_at: str
    metrics: Dict[str, float]
    is_active: bool

class ModelsResponse(BaseModel):
    available_versions: List[ModelVersion]
    active_version: str

class ActivateModelRequest(BaseModel):
    version: str

class ActivateModelResponse(BaseModel):
    active_version: str
    message: str
