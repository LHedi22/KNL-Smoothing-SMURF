from sklearn.linear_model import LogisticRegression
import numpy as np
import joblib
from typing import Optional
from ml.models.models_interface import ModelInterface

class LogisticModel(ModelInterface):
    
    def __init__(self, params: Optional[dict] = None):
        default_params = {
            'max_iter': 1000,
            'random_state': 42,
            'n_jobs': -1,
            'solver': 'lbfgs'
        }
        if params:
            default_params.update(params)
        self.params = default_params
        self.model = None
    
    def fit(self, X: np.ndarray, y: np.ndarray) -> None:
        self.model = LogisticRegression(**self.params)
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
        if hasattr(self.model, 'coef_'):
            return np.abs(self.model.coef_[0])
        return None
