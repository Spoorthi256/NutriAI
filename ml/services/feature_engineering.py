"""
Reusable Feature Engineering Layer for ML Recommendation Engine

Extracts, encodes, and normalizes user profile and meal features.
The EXACT same pipeline is used during both training and real-time inference.
"""

from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

CATEGORICAL_COLUMNS = {
    'user_goal': ['muscle_gain', 'weight_loss', 'weight_gain', 'maintenance'],
    'user_activity_level': ['sedentary', 'light', 'moderate', 'very_active'],
    'user_diet_type': ['vegetarian', 'vegan', 'non_vegetarian', 'keto', 'mediterranean'],
    'slot_category': ['breakfast', 'lunch', 'dinner', 'snack'],
    'user_gender': ['male', 'female', 'unspecified'],
}

NUMERICAL_COLUMNS = [
    'user_age',
    'user_bmi',
    'user_target_calories',
    'user_target_protein',
    'user_target_carbs',
    'user_target_fat',
    'slot_target_calories',
    'slot_target_protein',
    'meal_calories',
    'meal_protein',
    'meal_carbs',
    'meal_fat',
    'meal_fiber',
    'calorie_ratio',
    'protein_ratio',
    'protein_density',
]

class FeatureEngineeringPipeline:
    def __init__(self):
        self.scaler = StandardScaler()
        self.is_fitted = False
        self.feature_names: List[str] = []

    def _extract_raw_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Construct raw feature matrix from input DataFrame."""
        out = pd.DataFrame(index=df.index)

        # 1. Numerical features
        for col in NUMERICAL_COLUMNS:
            if col in df.columns:
                out[col] = df[col].astype(float)
            else:
                out[col] = 0.0

        # 2. One-hot encoded categorical features (fixed categories to guarantee consistent shapes)
        for cat_col, valid_values in CATEGORICAL_COLUMNS.items():
            col_series = df[cat_col].astype(str) if cat_col in df.columns else pd.Series(['unspecified'] * len(df))
            for val in valid_values:
                feature_name = f"{cat_col}_{val}"
                out[feature_name] = (col_series == val).astype(float)

        return out

    def fit_transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, List[str]]:
        """Fit scaler on training data and return scaled feature matrix."""
        raw_df = self._extract_raw_features(df)
        self.feature_names = list(raw_df.columns)

        # Scale only numerical columns, keep one-hot columns binary 0/1
        scaled_numericals = self.scaler.fit_transform(raw_df[NUMERICAL_COLUMNS])
        
        # Combine scaled numericals with one-hot columns
        one_hot_cols = [c for c in self.feature_names if c not in NUMERICAL_COLUMNS]
        one_hot_values = raw_df[one_hot_cols].values

        features = np.hstack([scaled_numericals, one_hot_values])
        self.is_fitted = True
        return features, self.feature_names

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Transform inference data using fitted scaler."""
        if not self.is_fitted:
            raise RuntimeError("FeatureEngineeringPipeline must be fitted before calling transform().")

        raw_df = self._extract_raw_features(df)
        scaled_numericals = self.scaler.transform(raw_df[NUMERICAL_COLUMNS])

        one_hot_cols = [c for c in self.feature_names if c not in NUMERICAL_COLUMNS]
        one_hot_values = raw_df[one_hot_cols].values

        return np.hstack([scaled_numericals, one_hot_values])

    def extract_inference_sample(
        self,
        profile: Dict[str, Any],
        targets: Dict[str, Any],
        candidate_meal: Dict[str, Any],
        slot_category: str
    ) -> pd.DataFrame:
        """
        Build a single-row DataFrame representing user-meal interaction for inference.
        """
        user_weight = float(profile.get('weightKg') or 87)
        user_height = float(profile.get('heightCm') or 178)
        bmi = round(user_weight / ((user_height / 100) ** 2), 1)

        user_age = float(profile.get('age') or 22)
        user_gender = str(profile.get('gender') or 'unspecified')
        user_goal = str(profile.get('goal') or 'muscle_gain')
        user_activity = str(profile.get('activityLevel') or 'moderate')
        user_diet = str(profile.get('dietType') or 'vegetarian')
        user_meals_per_day = float(profile.get('mealsPerDay') or 4)

        user_target_calories = float(targets.get('dailyCalories') or 2450)
        user_target_protein = float(targets.get('proteinGrams') or 130)
        user_target_carbs = float(targets.get('carbsGrams') or 300)
        user_target_fat = float(targets.get('fatGrams') or 75)

        calories_per_slot = targets.get('caloriesPerSlot') or {}
        protein_per_slot = targets.get('proteinPerSlot') or {}
        slot_target_calories = float(calories_per_slot.get(slot_category, user_target_calories * 0.25))
        slot_target_protein = float(protein_per_slot.get(slot_category, user_target_protein * 0.25))

        meal_calories = float(candidate_meal.get('calories') or 500)
        meal_protein = float(candidate_meal.get('protein') or 30)
        meal_carbs = float(candidate_meal.get('carbs') or 50)
        meal_fat = float(candidate_meal.get('fat') or 15)
        meal_fiber = float(candidate_meal.get('fiber') or 6)

        calorie_ratio = round(meal_calories / max(slot_target_calories, 100), 3)
        protein_ratio = round(meal_protein / max(slot_target_protein, 15), 3)
        protein_density = round(meal_protein / max(meal_calories, 50), 4)

        row = {
            'user_age': user_age,
            'user_bmi': bmi,
            'user_gender': user_gender,
            'user_goal': user_goal,
            'user_activity_level': user_activity,
            'user_diet_type': user_diet,
            'user_meals_per_day': user_meals_per_day,
            'user_target_calories': user_target_calories,
            'user_target_protein': user_target_protein,
            'user_target_carbs': user_target_carbs,
            'user_target_fat': user_target_fat,
            'slot_category': slot_category,
            'slot_target_calories': slot_target_calories,
            'slot_target_protein': slot_target_protein,
            'meal_calories': meal_calories,
            'meal_protein': meal_protein,
            'meal_carbs': meal_carbs,
            'meal_fat': meal_fat,
            'meal_fiber': meal_fiber,
            'calorie_ratio': calorie_ratio,
            'protein_ratio': protein_ratio,
            'protein_density': protein_density,
        }
        return pd.DataFrame([row])
