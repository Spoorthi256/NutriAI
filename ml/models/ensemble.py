"""
Weighted Ensemble Recommendation Model

Combines probability outputs from:
1. Decision Tree (non-linear feature thresholds)
2. Logistic Regression (linear boundary with regularized weights)
3. Naive Bayes (independent conditional probabilities)

Configurable prototype weights:
  DT_WEIGHT = 0.35
  LR_WEIGHT = 0.40
  NB_WEIGHT = 0.25

NOTE:
These weights are engineering choices for the prototype demonstration
and are NOT clinically or scientifically validated optimal weights.
"""

from typing import Dict, Any, Tuple
import numpy as np
from .decision_tree import DecisionTreeRecommender
from .logistic_regression import LogisticRegressionRecommender
from .naive_bayes import NaiveBayesRecommender

DEFAULT_DT_WEIGHT = 0.35
DEFAULT_LR_WEIGHT = 0.40
DEFAULT_NB_WEIGHT = 0.25

class EnsembleRecommender:
    def __init__(
        self,
        dt_model: DecisionTreeRecommender,
        lr_model: LogisticRegressionRecommender,
        nb_model: NaiveBayesRecommender,
        dt_weight: float = DEFAULT_DT_WEIGHT,
        lr_weight: float = DEFAULT_LR_WEIGHT,
        nb_weight: float = DEFAULT_NB_WEIGHT
    ):
        self.dt_model = dt_model
        self.lr_model = lr_model
        self.nb_model = nb_model

        # Normalize weights so sum == 1.0
        total_w = dt_weight + lr_weight + nb_weight
        self.dt_weight = dt_weight / total_w
        self.lr_weight = lr_weight / total_w
        self.nb_weight = nb_weight / total_w

    def predict_detailed(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Computes individual model probabilities and the final weighted ensemble score.
        Returns: (dt_prob, lr_prob, nb_prob, ensemble_score)
        """
        dt_prob = self.dt_model.predict_proba(X)
        lr_prob = self.lr_model.predict_proba(X)
        nb_prob = self.nb_model.predict_proba(X)

        ensemble_score = (
            self.dt_weight * dt_prob +
            self.lr_weight * lr_prob +
            self.nb_weight * nb_prob
        )
        return dt_prob, lr_prob, nb_prob, ensemble_score

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        _, _, _, ensemble_score = self.predict_detailed(X)
        return ensemble_score

    def predict(self, X: np.ndarray, threshold: float = 0.50) -> np.ndarray:
        scores = self.predict_proba(X)
        return (scores >= threshold).astype(int)

    def get_config(self) -> Dict[str, Any]:
        return {
            'model_type': 'WeightedEnsembleRecommender',
            'weights': {
                'decision_tree': round(self.dt_weight, 3),
                'logistic_regression': round(self.lr_weight, 3),
                'naive_bayes': round(self.nb_weight, 3),
            },
            'submodels': {
                'decision_tree': self.dt_model.get_params(),
                'logistic_regression': self.lr_model.get_params(),
                'naive_bayes': self.nb_model.get_params(),
            }
        }
