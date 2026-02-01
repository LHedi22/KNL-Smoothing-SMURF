import numpy as np
import shap
import logging
from typing import List, Tuple, Dict, Any

logger = logging.getLogger(__name__)

class SHAPExplainer:
    
    def __init__(self, model, X_background: np.ndarray, model_type: str = 'tree'):
        self.model = model
        self.X_background = X_background
        self.model_type = model_type
        self._init_explainer()
    
    def _init_explainer(self):
        try:
            if self.model_type == 'tree':
                self.explainer = shap.TreeExplainer(self.model.model)
            elif self.model_type == 'linear':
                self.explainer = shap.LinearExplainer(self.model.model, self.X_background)
            else:
                self.explainer = shap.KernelExplainer(
                    lambda x: self.model.predict_proba(x)[:, 1],
                    self.X_background
                )
        except Exception as e:
            logger.error(f"Failed to initialize SHAP explainer: {e}")
            self.explainer = None
    
    def explain_instance(self, x: np.ndarray, feature_names: List[str], top_k: int = 5) -> Dict[str, Any]:
        if self.explainer is None:
            return self._fallback_explanation(x, feature_names, top_k)
        
        try:
            shap_values = self.explainer.shap_values(x)
            
            if isinstance(shap_values, list):
                shap_values = shap_values[1]
            
            if len(shap_values.shape) == 1:
                shap_values = shap_values.reshape(1, -1)
            
            shap_vals = shap_values[0]
            base_value = self.explainer.expected_value
            if isinstance(base_value, list):
                base_value = base_value[1]
            
            positive_indices = np.argsort(shap_vals)[-top_k:][::-1]
            negative_indices = np.argsort(shap_vals)[:top_k]
            
            positive_contributors = [
                {
                    'feature': feature_names[i],
                    'shap_value': float(shap_vals[i]),
                    'feature_value': float(x[0, i]) if x.ndim > 1 else float(x[i])
                }
                for i in positive_indices
                if shap_vals[i] > 0
            ]
            
            negative_contributors = [
                {
                    'feature': feature_names[i],
                    'shap_value': float(shap_vals[i]),
                    'feature_value': float(x[0, i]) if x.ndim > 1 else float(x[i])
                }
                for i in negative_indices
                if shap_vals[i] < 0
            ]
            
            return {
                'base_value': float(base_value),
                'top_positive_contributors': positive_contributors,
                'top_negative_contributors': negative_contributors
            }
        except Exception as e:
            logger.error(f"SHAP explanation failed: {e}")
            return self._fallback_explanation(x, feature_names, top_k)
    
    def _fallback_explanation(self, x: np.ndarray, feature_names: List[str], top_k: int) -> Dict[str, Any]:
        x_flat = x[0] if x.ndim > 1 else x
        
        indices = np.argsort(np.abs(x_flat))[-top_k:][::-1]
        
        positive_contributors = [
            {
                'feature': feature_names[i],
                'shap_value': 0.0,
                'feature_value': float(x_flat[i])
            }
            for i in indices[:top_k//2]
        ]
        
        negative_contributors = [
            {
                'feature': feature_names[i],
                'shap_value': 0.0,
                'feature_value': float(x_flat[i])
            }
            for i in indices[top_k//2:]
        ]
        
        return {
            'base_value': 0.5,
            'top_positive_contributors': positive_contributors,
            'top_negative_contributors': negative_contributors
        }
