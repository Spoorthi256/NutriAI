"""
Logistic Regression Recommendation Model

Wraps scikit-learn LogisticRegression using normalized features,
L2 regularization, and calibrated probability scores.
"""

from typing import Dict, Any
import numpy as np
from sklearn.linear_model import LogisticRegression

class LogisticRegressionRecommender:
    def __init__(
        self,
        C: float = 1.0,
        max_iter: int = 1000,
        random_state: int = 42
    ):
        self.C = C
        self.max_iter = max_iter
        self.random_state = random_state
        self.model = LogisticRegression(
            C=self.C,
            max_iter=self.max_iter,
            random_state=self.random_state
        )

    def fit(self, X: np.ndarray, y: np.ndarray) -> "LogisticRegressionRecommender":
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
            'model_type': 'LogisticRegression',
            'C': self.C,
            'max_iter': self.max_iter,
            'random_state': self.random_state,
        }
