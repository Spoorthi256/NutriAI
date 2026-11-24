"""
NutriAI Phase 4 — FastAPI ML Recommendation Service

Exposes:
- GET /health
- POST /recommend
"""

from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ml.services.recommender import default_ml_recommender

app = FastAPI(
    title="NutriAI ML Recommendation Service",
    description="Probabilistic meal recommendation engine using Decision Trees, Logistic Regression, Naive Bayes, and Weighted Ensembling.",
    version="1.0-prototype"
)

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendRequest(BaseModel):
    profile: Dict[str, Any] = Field(..., description="Structured user nutrition profile")
    targets: Dict[str, Any] = Field(..., description="Calculated nutrition targets")
    candidateMeals: List[Dict[str, Any]] = Field(..., description="Pre-filtered compatible candidate meals")
    slotCategory: Optional[str] = Field("lunch", description="Target meal slot (breakfast, lunch, dinner, snack)")

class ScoredMealRecommendation(BaseModel):
    mealId: str
    name: str
    decisionTreeScore: float
    logisticRegressionScore: float
    naiveBayesScore: float
    ensembleScore: float

class RecommendResponse(BaseModel):
    recommendations: List[ScoredMealRecommendation]
    totalEvaluated: int
    modelVersion: str
    methodology: str
    ensembleWeights: Dict[str, float]
    modelMetrics: Optional[Dict[str, Any]] = None
    fallbackUsed: bool = False
    generatedAt: str

@app.get("/health")
def health_check():
    models_ready = (
        default_ml_recommender.pipeline is not None and
        default_ml_recommender.ensemble is not None
    )
    return {
        "status": "ok",
        "service": "NutriAI ML Recommendation Service",
        "modelsLoaded": models_ready,
        "modelVersion": "1.0-prototype",
        "ensembleWeights": {
            "decisionTree": round(default_ml_recommender.ensemble.dt_weight, 3),
            "logisticRegression": round(default_ml_recommender.ensemble.lr_weight, 3),
            "naiveBayes": round(default_ml_recommender.ensemble.nb_weight, 3),
        },
        "disclaimer": "Prototype recommendation engine for demonstration. Not clinically validated."
    }

@app.post("/recommend", response_model=RecommendResponse)
def get_recommendations(req: RecommendRequest):
    if not isinstance(req.candidateMeals, list):
        raise HTTPException(status_code=400, detail="candidateMeals must be a list")

    try:
        from datetime import datetime
        import json
        import os
        from ml.services.trainer import ARTIFACTS_DIR

        recommendations = default_ml_recommender.score_candidates(
            profile=req.profile,
            targets=req.targets,
            candidate_meals=req.candidateMeals,
            slot_category=req.slotCategory or 'lunch'
        )

        metrics_data = None
        metrics_file = os.path.join(ARTIFACTS_DIR, 'metrics.json')
        if os.path.exists(metrics_file):
            try:
                with open(metrics_file, 'r') as f:
                    metrics_data = json.load(f)
            except Exception:
                pass

        return RecommendResponse(
            recommendations=recommendations,
            totalEvaluated=len(req.candidateMeals),
            modelVersion="1.0-prototype",
            methodology="Weighted Ensemble (Decision Tree + Logistic Regression + Naive Bayes)",
            ensembleWeights={
                "decisionTree": round(default_ml_recommender.ensemble.dt_weight, 3),
                "logisticRegression": round(default_ml_recommender.ensemble.lr_weight, 3),
                "naiveBayes": round(default_ml_recommender.ensemble.nb_weight, 3),
            },
            modelMetrics=metrics_data,
            fallbackUsed=False,
            generatedAt=datetime.utcnow().isoformat() + "Z"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML Recommendation Error: {str(e)}")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("ml.api.app:app", host="127.0.0.1", port=8001, reload=True)
