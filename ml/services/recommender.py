"""
ML Recommender Inference Service

Scores and ranks pre-filtered, compatible candidate meals using the trained
Weighted Ensemble (Decision Tree + Logistic Regression + Naive Bayes).
"""

import os
from typing import Dict, Any, List
import joblib
import pandas as pd

from ml.services.feature_engineering import FeatureEngineeringPipeline
from ml.models.ensemble import EnsembleRecommender
from ml.services.trainer import run_training_pipeline, ARTIFACTS_DIR

class MLRecommenderService:
    def __init__(self):
        self.pipeline: FeatureEngineeringPipeline = None
        self.ensemble: EnsembleRecommender = None
        self._ensure_loaded()

    def _ensure_loaded(self):
        pipeline_path = os.path.join(ARTIFACTS_DIR, 'feature_pipeline.joblib')
        ensemble_path = os.path.join(ARTIFACTS_DIR, 'ensemble.joblib')

        if not (os.path.exists(pipeline_path) and os.path.exists(ensemble_path)):
            print("Model artifacts not found. Training on the fly...")
            run_training_pipeline()

        self.pipeline = joblib.load(pipeline_path)
        self.ensemble = joblib.load(ensemble_path)

    def score_candidates(
        self,
        profile: Dict[str, Any],
        targets: Dict[str, Any],
        candidate_meals: List[Dict[str, Any]],
        slot_category: str = 'lunch'
    ) -> List[Dict[str, Any]]:
        """
        Takes already validated, compatible candidate meals and scores each one.
        Returns recommendations sorted descending by ensembleScore.
        """
        if not candidate_meals:
            return []

        # 1. Build DataFrame rows using shared feature engineering pipeline
        sample_dfs = [
            self.pipeline.extract_inference_sample(profile, targets, meal, slot_category)
            for meal in candidate_meals
        ]
        combined_df = pd.concat(sample_dfs, ignore_index=True)

        # 2. Transform into feature matrix
        X = self.pipeline.transform(combined_df)

        # 3. Predict detailed scores across all models
        dt_probs, lr_probs, nb_probs, ensemble_scores = self.ensemble.predict_detailed(X)

        # 4. Assemble scored recommendations
        results = []
        for i, meal in enumerate(candidate_meals):
            results.append({
                'mealId': meal.get('id', f'meal-{i}'),
                'name': meal.get('name', 'Unknown Meal'),
                'decisionTreeScore': round(float(dt_probs[i]), 4),
                'logisticRegressionScore': round(float(lr_probs[i]), 4),
                'naiveBayesScore': round(float(nb_probs[i]), 4),
                'ensembleScore': round(float(ensemble_scores[i]), 4),
            })

        # Sort descending by ensembleScore
        results.sort(key=lambda r: r['ensembleScore'], reverse=True)
        return results

default_ml_recommender = MLRecommenderService()
