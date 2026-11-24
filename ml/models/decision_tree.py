"""
Decision Tree Recommendation Model

Wraps scikit-learn DecisionTreeClassifier with configurable hyperparameters
and probability scoring for ranking candidate meals.
"""

from typing import Dict, Any, Optional
import numpy as np
from sklearn.tree import DecisionTreeClassifier

class DecisionTreeRecommender:
    def __init__(
        self,
        max_depth: Optional[int] = 5,
        min_samples_split: int = 10,
        random_state: int = 42
    ):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.random_state = random_state
        self.model = DecisionTreeClassifier(
            max_depth=self.max_depth,
            min_samples_split=self.min_samples_split,
            random_state=self.random_state
        )

    def fit(self, X: np.ndarray, y: np.ndarray) -> "DecisionTreeRecommender":
        self.model.fit(X, y)
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Returns positive class probability (recommendation confidence score)."""
        probas = self.model.predict_proba(X)
        if 1 in self.model.classes_:
            pos_idx = int(np.where(self.model.classes_ == 1)[0][0])
            return probas[:, pos_idx]
        return np.zeros(X.shape[0])

    def get_params(self) -> Dict[str, Any]:
        return {
            'model_type': 'DecisionTreeClassifier',
            'max_depth': self.max_depth,
            'min_samples_split': self.min_samples_split,
            'random_state': self.random_state,
        }
