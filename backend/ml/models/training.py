import numpy as np
import pandas as pd
import logging
import json
import time
from datetime import datetime
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    roc_auc_score, precision_recall_curve, auc, confusion_matrix,
    roc_curve, accuracy_score, precision_score, recall_score, f1_score
)
from ml.models.xgboost_model import XGBoostModel
from ml.models.lightgbm_model import LightGBMModel
from ml.models.logistic_model import LogisticModel
from ml.knn.knn_smoother import KNNSmoother
from core.config import settings

logger = logging.getLogger(__name__)

class TrainingPipeline:
    
    def __init__(self):
        self.models = {}
        self.smoother = None
        self.feature_names = None
        self.preprocessor = None
        self.metrics = {}
    
    def train(self, X: np.ndarray, y: np.ndarray, feature_names: list, 
              training_config: dict = None) -> dict:
        
        start_time = time.time()
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, 
            test_size=training_config.get('test_size', 0.2) if training_config else 0.2,
            random_state=training_config.get('random_state', 42) if training_config else 42,
            stratify=y
        )
        
        self.feature_names = feature_names
        
        xgb_params = training_config.get('xgboost_params') if training_config else None
        lgb_params = training_config.get('lightgbm_params') if training_config else None
        lr_params = training_config.get('logistic_params') if training_config else None
        
        self.models['xgboost'] = XGBoostModel(params=xgb_params)
        self.models['xgboost'].fit(X_train, y_train)
        
        self.models['lightgbm'] = LightGBMModel(params=lgb_params)
        self.models['lightgbm'].fit(X_train, y_train)
        
        self.models['logistic'] = LogisticModel(params=lr_params)
        self.models['logistic'].fit(X_train, y_train)
        
        xgb_proba_train = self.models['xgboost'].predict_proba(X_train)[:, 1]
        self.smoother = KNNSmoother(k=settings.KNN_K, metric=settings.KNN_METRIC)
        self.smoother.fit(X_train, xgb_proba_train.reshape(-1, 1))
        
        self.metrics = self._compute_metrics(
            self.models['xgboost'], X_test, y_test
        )
        
        training_time = time.time() - start_time
        
        version = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        artifact_path = self._save_artifacts(version)
        
        return {
            'model_version': version,
            'training_time_seconds': training_time,
            'metrics': self.metrics,
            'artifact_path': artifact_path
        }
    
    def _compute_metrics(self, model, X_test, y_test) -> dict:
        y_pred_proba = model.predict_proba(X_test)[:, 1]
        y_pred = (y_pred_proba >= settings.DEFAULT_THRESHOLD).astype(int)
        
        auc_score = roc_auc_score(y_test, y_pred_proba)
        
        precision, recall, _ = precision_recall_curve(y_test, y_pred_proba)
        pr_auc = auc(recall, precision)
        
        fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)
        ks = np.max(tpr - fpr)
        
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
        
        return {
            'auc': float(auc_score),
            'pr_auc': float(pr_auc),
            'ks_statistic': float(ks),
            'accuracy': float(accuracy_score(y_test, y_pred)),
            'precision': float(precision_score(y_test, y_pred)),
            'recall': float(recall_score(y_test, y_pred)),
            'f1': float(f1_score(y_test, y_pred)),
            'true_negatives': int(tn),
            'false_positives': int(fp),
            'false_negatives': int(fn),
            'true_positives': int(tp),
            'threshold': settings.DEFAULT_THRESHOLD
        }
    
    def _save_artifacts(self, version: str) -> str:
        model_dir = Path(settings.MODEL_PATH) / version
        model_dir.mkdir(parents=True, exist_ok=True)
        
        self.models['xgboost'].save(str(model_dir / 'xgboost.joblib'))
        self.models['lightgbm'].save(str(model_dir / 'lightgbm.joblib'))
        self.models['logistic'].save(str(model_dir / 'logistic.joblib'))
        
        metadata = {
            'version': version,
            'created_at': datetime.utcnow().isoformat(),
            'feature_names': self.feature_names,
            'metrics': self.metrics,
            'threshold': settings.DEFAULT_THRESHOLD,
            'knn_k': settings.KNN_K,
            'knn_metric': settings.KNN_METRIC
        }
        
        with open(model_dir / 'metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Artifacts saved to {model_dir}")
        return str(model_dir)
