import logging
from typing import Optional, List, Dict, Any
from services.qdrant_service import QdrantService
from ml.models.xgboost_model import XGBoostModel
from ml.models.lightgbm_model import LightGBMModel
from ml.models.logistic_model import LogisticModel
from ml.knn.knn_smoother import KNNSmoother

logger = logging.getLogger(__name__)

class ModelRegistry:
    def __init__(self):
        self.active_version = None
        self.models = {}
        self.smoother = None
        self.metadata = {}
        self.feature_names = []
        self.qdrant = QdrantService()
        self._load_latest_active_version()

    def _load_latest_active_version(self):
        versions = self.qdrant.list_versions()
        if versions:
            latest = sorted(versions, key=lambda v: v['created_at'])[-1]['version']
            try:
                self.activate_version(latest)
            except Exception as e:
                logger.error(f"Failed to activate latest version {latest}: {e}")

    def activate_version(self, version: str) -> str:
        metadata = self.qdrant.get_metadata(version)
        if not metadata:
            raise FileNotFoundError(f"Metadata not found for version {version}")

        xgb_payload = self.qdrant.get_model_artifact(version, 'xgboost')
        lgb_payload = self.qdrant.get_model_artifact(version, 'lightgbm')
        lr_payload = self.qdrant.get_model_artifact(version, 'logistic')
        if not xgb_payload or not lgb_payload or not lr_payload:
            raise FileNotFoundError(f"Model artifacts not found for version {version}")

        xgb_model = XGBoostModel()
        xgb_model.load(xgb_payload['binary'])
        lgb_model = LightGBMModel()
        lgb_model.load(lgb_payload['binary'])
        lr_model = LogisticModel()
        lr_model.load(lr_payload['binary'])

        self.models = {
            'xgboost': xgb_model,
            'lightgbm': lgb_model,
            'logistic': lr_model
        }
        self.metadata = metadata
        self.feature_names = metadata.get('feature_names', [])
        self.active_version = version
        logger.info(f"Activated model version {version}")
        return version

    def get_active_model(self, model_type: str = 'xgboost'):
        if self.active_version is None:
            raise RuntimeError("No active model version")
        return self.models.get(model_type)

    def get_available_versions(self) -> List[Dict[str, Any]]:
        versions = self.qdrant.list_versions()
        for v in versions:
            v['is_active'] = v.get('version') == self.active_version
        return versions

    def rollback_to_previous(self) -> str:
        versions = self.get_available_versions()
        if len(versions) < 2:
            raise ValueError("Not enough versions to rollback")
        previous_version = versions[1]['version']
        return self.activate_version(previous_version)
