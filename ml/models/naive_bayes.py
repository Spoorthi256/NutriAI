"""
Naive Bayes Recommendation Model

Implements Gaussian Naive Bayes from scikit-learn.
Chosen because the feature vector combines continuous standardized physiological
metrics with categorical indicators, where Gaussian distribution assumptions
provide fast, robust probabilistic baseline estimates.
"""

from typing import Dict, Any
import numpy as np
from sklearn.naive_bayes import GaussianNB

class NaiveBayesRecommender:
    def __init__(self, var_smoothing: float = 1e-9):
        self.var_smoothing = var_smoothing
        self.model = GaussianNB(var_smoothing=self.var_smoothing)

    def fit(self, X: np.ndarray, y: np.ndarray) -> "NaiveBayesRecommender":
        self.model.fit(X, y)
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Returns positive class probability."""
        probas = self.model.predict_proba(X)
        if 1 in self.model.classes_:
            pos_idx = int(np.where(self.model.classes_ == 1)[0][0])
            return probas[:, pos_idx]
        return np.zeros(X.shape[0])

    def get_params(self) -> Dict[str, Any]:
        return {
            'model_type': 'GaussianNB',
            'var_smoothing': self.var_smoothing,
        }
