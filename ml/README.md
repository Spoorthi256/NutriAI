# NutriAI — Machine Learning Recommendation Service (Phase 4)

This module implements the **Machine Learning Recommendation Engine** for NutriAI, leveraging Python and scikit-learn to rank compatible candidate meals using a Weighted Multi-Model Ensemble.

---

> [!IMPORTANT]
> **PROTOTYPE DATASET & METRIC DISCLAIMER**
> 
> The training dataset used in this prototype (`ml/data/training_data.csv`) is a synthetic/curated dataset generated from the project's defined nutrition and meal-selection criteria.
> 
> - **It is NOT a clinically validated dataset.**
> - The evaluation metrics (Accuracy, Precision, Recall, F1) demonstrate that the ML pipeline can learn and reproduce patterns represented in the prototype dataset.
> - **They do NOT represent evidence of real-world recommendation effectiveness or proof that the models learned genuine human food preferences.**
> - "Nutrition estimates are for planning purposes and are not medical advice."

---

## 🏗️ Architecture & Core Principles

```
React / TypeScript Frontend
        ↓
Phase 3 Nutrition Engine (BMI / BMR / TDEE)
        ↓
HARD CONSTRAINT FILTER (Allergies, Diet Compatibility)
*RULES decide what is ALLOWED. ML decides what is PREFERRED.*
        ↓
Compatible Candidate Meals
        ↓
FastAPI Recommendation Endpoint (POST /recommend)
        ↓
┌────────────────────────────────────────────────────────┐
│              Weighted Ensemble Recommender             │
│                                                        │
│  Decision Tree (0.35) ───┐                             │
│  Logistic Regression (0.40) ─┼── Weighted Probabilities │
│  Naive Bayes (0.25) ─────┘                             │
└────────────────────────────────────────────────────────┘
        ↓
Ranked ML Recommendation Scores
        ↓
Variety & Slot Schedule Optimization
        ↓
Personalized 7-Day Meal Plan
```

### Safety Boundary: Rules vs. ML
- **Phase 3 Hard Constraints**: Allergy exclusion, diet type compatibility, and valid meal counts are strictly enforced in TypeScript before candidate meals are sent to the ML service.
- **ML is never allowed to override safety constraints**: The ML model only ranks meals that have already been validated as compatible.

---

## 📊 Models & Prototype Evaluation Results

The models were evaluated on an 80/20 train/test split (960 train / 240 test samples, `random_state=42`, stratified by target label):

| Model | Accuracy | Precision | Recall | F1 Score | Purpose / Characteristics |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Decision Tree** | **0.9500** | 0.9562 | 0.9562 | 0.9562 | Captures non-linear thresholds in macro and caloric ratios (`max_depth=5`) |
| **Logistic Regression** | **0.7375** | 0.7284 | 0.8613 | 0.7893 | Calibrated linear probability estimator on standardized numerical features |
| **Naive Bayes (Gaussian)** | **0.6958** | 0.7222 | 0.7591 | 0.7402 | Independent conditional probabilistic baseline for continuous variables |
| **Weighted Ensemble** | **0.8708** | 0.8681 | 0.9124 | 0.8897 | Smooth, generalized ranking combining non-linear and linear boundaries |

### Ensemble Weights Configuration
```python
DT_WEIGHT = 0.35
LR_WEIGHT = 0.40
NB_WEIGHT = 0.25
```
*Note: These weights are prototype engineering choices designed to balance Decision Tree precision with Logistic Regression calibration and Naive Bayes variance smoothing. They are not scientifically validated optimal weights.*

---

## ⚙️ Feature Engineering Pipeline

The feature transformation pipeline is unified and shared across both training and inference (`ml/services/feature_engineering.py`):
1. **Demographic & Physiological**: `user_age`, `user_bmi`, `user_gender`
2. **Nutritional Targets**: `user_target_calories`, `user_target_protein`, `user_target_carbs`, `user_target_fat`, `slot_target_calories`, `slot_target_protein`
3. **Meal Attributes**: `meal_calories`, `meal_protein`, `meal_carbs`, `meal_fat`, `meal_fiber`
4. **Physiological Alignment**: `calorie_ratio`, `protein_ratio`, `protein_density`
5. **Categoricals**: One-Hot encoded vectors for `user_goal`, `user_activity_level`, `user_diet_type`, and `slot_category`.
6. **Scaling**: Continuous features are standardized using `StandardScaler` fitted on training data.

---

## 🚀 How to Run the ML Service

### 1. Requirements Installation
```bash
pip install -r ml/requirements.txt
```

### 2. Regenerate Dataset & Train Models (Optional)
```bash
python ml/data/generate_dataset.py
python -m ml.services.trainer
```

### 3. Run Automated Tests
```bash
python ml/test_ml_service.py
```

### 4. Start the FastAPI Service
```bash
python -m uvicorn ml.api.app:app --host 127.0.0.1 --port 8001 --reload
```

---

## 📡 API Reference

### `GET /health`
Returns service status, loaded model readiness, and ensemble weights.

### `POST /recommend`
Scores and ranks pre-filtered candidate meals for a specific user and meal slot.

**Request Body**:
```json
{
  "profile": {
    "name": "Yuvraj",
    "age": 19,
    "heightCm": 178,
    "weightKg": 87,
    "gender": "male",
    "goal": "muscle_gain",
    "activityLevel": "moderate",
    "dietType": "vegetarian",
    "allergies": ["Peanuts"]
  },
  "targets": {
    "dailyCalories": 2450,
    "proteinGrams": 130,
    "carbsGrams": 300,
    "fatGrams": 75,
    "caloriesPerSlot": { "lunch": 857 },
    "proteinPerSlot": { "lunch": 45 }
  },
  "candidateMeals": [
    {
      "id": "l-01",
      "name": "Tandoori Paneer Power Bowl with Tri-Color Quinoa",
      "category": "lunch",
      "calories": 710,
      "protein": 42,
      "carbs": 76,
      "fat": 23,
      "fiber": 10
    }
  ],
  "slotCategory": "lunch"
}
```

**Response**:
```json
{
  "recommendations": [
    {
      "mealId": "l-01",
      "name": "Tandoori Paneer Power Bowl with Tri-Color Quinoa",
      "decisionTreeScore": 0.952,
      "logisticRegressionScore": 0.884,
      "naiveBayesScore": 0.791,
      "ensembleScore": 0.8845
    }
  ],
  "totalEvaluated": 1,
  "modelVersion": "1.0-prototype",
  "methodology": "Weighted Ensemble (Decision Tree + Logistic Regression + Naive Bayes)"
}
```
