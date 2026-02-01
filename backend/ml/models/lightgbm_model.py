import lightgbm as lgb
import numpy as np
import joblib
from typing import Optional
from ml.models.models_interface import ModelInterface

class LightGBMModel(ModelInterface):
    
    def __init__(self, params: Optional[dict] = None):
        default_params = {
            'objective': 'binary',
            'metric': 'auc',
            'max_depth': 6,
            'learning_rate': 0.1,
            'n_estimators': 100,
            'num_leaves': 31,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'random_state': 42,
            'n_jobs': -1,
            'verbosity': -1
        }
        if params:
            default_params.update(params)
        self.params = default_params
        self.model = None
    
    def fit(self, X: np.ndarray, y: np.ndarray) -> None:
        self.model = lgb.LGBMClassifier(**self.params)
        self.model.fit(X, y)
    
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        if self.model is None:
            raise RuntimeError("Model not fitted")
        return self.model.predict_proba(X)
    
    def save(self, path: str) -> None:
        if self.model is None:
            raise RuntimeError("Model not fitted")
        joblib.dump(self.model, path)
    
    def load(self, path: str) -> None:
        self.model = joblib.load(path)
    
    def get_feature_importance(self):
        if self.model is None:
            raise RuntimeError("Model not fitted")
        return self.model.feature_importances_

