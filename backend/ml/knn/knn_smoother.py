import numpy as np
from sklearn.neighbors import NearestNeighbors
import logging

logger = logging.getLogger(__name__)

class KNNSmoother:
    
    def __init__(self, k: int = 5, metric: str = 'euclidean'):
        self.k = k
        self.metric = metric
        self.nbrs = None
        self.training_proba = None
    
    def fit(self, X_train: np.ndarray, y_proba_train: np.ndarray) -> None:
        self.nbrs = NearestNeighbors(n_neighbors=self.k, metric=self.metric, n_jobs=-1)
        self.nbrs.fit(X_train)
        self.training_proba = y_proba_train
    
    def smooth(self, X_test: np.ndarray, y_proba_test: np.ndarray) -> np.ndarray:
        if self.nbrs is None or self.training_proba is None:
            logger.warning("KNNSmoother not fitted, returning original probabilities")
            return y_proba_test
        
        distances, indices = self.nbrs.kneighbors(X_test)
        
        smoothed_proba = np.zeros_like(y_proba_test)
        for i in range(len(X_test)):
            neighbor_indices = indices[i]
            neighbor_proba = self.training_proba[neighbor_indices]
            smoothed_proba[i] = np.mean(neighbor_proba, axis=0)
        
        return smoothed_proba

