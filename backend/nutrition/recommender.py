"""
Phase 3 / Phase 4 Python Recommendation Engine for Django Backend

Pipeline:
1. calculate_nutrition_targets(profile)
2. filter_candidate_meals() [HARD CONSTRAINTS: Allergens, Diet Type]
3. Optional Query to FastAPI ML Service (http://127.0.0.1:8001/recommend)
4. Fallback: Phase 3 Deterministic Scoring
5. 7-Day Plan Assembly
"""

import json
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional

from django.conf import settings
from .calculations import calculate_nutrition_targets, SLOT_SCHEDULES
from .constraints import filter_candidate_meals, check_disliked_foods

FASTAPI_ML_URL = getattr(settings, 'ML_SERVICE_URL', 'http://127.0.0.1:8001')

DAYS_META = [
    {'day': 'Monday', 'short_day': 'Mon', 'date': 'Oct 6'},
    {'day': 'Tuesday', 'short_day': 'Tue', 'date': 'Oct 7'},
    {'day': 'Wednesday', 'short_day': 'Wed', 'date': 'Oct 8'},
    {'day': 'Thursday', 'short_day': 'Thu', 'date': 'Oct 9'},
    {'day': 'Friday', 'short_day': 'Fri', 'date': 'Oct 10'},
    {'day': 'Saturday', 'short_day': 'Sat', 'date': 'Oct 11'},
    {'day': 'Sunday', 'short_day': 'Sun', 'date': 'Oct 12'},
]

SLOT_DISPLAY_NAMES = {
    'breakfast': 'Breakfast',
    'lunch': 'Lunch',
    'dinner': 'Dinner',
    'snack': 'Snack',
    'snack_1': 'Morning Snack',
    'snack_2': 'Afternoon Snack',
}


def score_candidate_meal(
    meal: Dict[str, Any],
    target_calories: int,
    target_protein: int,
    disliked_foods: List[str],
    recent_meal_ids: List[str],
    ml_score: Optional[float] = None
) -> float:
    score = 1000.0

    if ml_score is not None:
        score += ml_score * 400.0

    cal_diff_pct = abs(meal.get('calories', 0) - target_calories) / max(target_calories, 100)
    score -= cal_diff_pct * 250.0

    prot_diff_pct = abs(meal.get('protein', 0) - target_protein) / max(target_protein, 20)
    score -= prot_diff_pct * 150.0

    has_dislike, matches = check_disliked_foods(meal, disliked_foods)
    if has_dislike:
        score -= len(matches) * 350.0

    if meal.get('id') in recent_meal_ids:
        score -= 400.0

    return score


def query_fastapi_ml_scores(
    profile: Dict[str, Any],
    targets: Dict[str, Any],
    candidates: List[Dict[str, Any]],
    slot: str
) -> Dict[str, float]:
    ml_scores = {}
    try:
        payload = {
            'userProfile': {
                'age': profile.get('age', 22),
                'gender': profile.get('gender') or 'unspecified',
                'weightKg': profile.get('weightKg') or profile.get('weight_kg', 87),
                'heightCm': profile.get('heightCm') or profile.get('height_cm', 178),
                'goal': profile.get('goal', 'muscle_gain'),
                'activityLevel': profile.get('activityLevel') or profile.get('activity_level', 'moderate'),
                'dietType': profile.get('dietType') or profile.get('diet_type', 'vegetarian'),
            },
            'nutritionTargets': {
                'dailyCalories': targets.get('dailyCalories') or targets.get('daily_calories', 2500),
                'proteinGrams': targets.get('proteinGrams') or targets.get('protein_grams', 150),
                'carbsGrams': targets.get('carbsGrams') or targets.get('carbs_grams', 300),
                'fatGrams': targets.get('fatGrams') or targets.get('fat_grams', 70),
            },
            'candidateMeals': [
                {
                    'id': str(m.get('id')),
                    'name': m.get('name'),
                    'category': m.get('category'),
                    'calories': m.get('calories'),
                    'protein': m.get('protein'),
                    'carbs': m.get('carbs'),
                    'fat': m.get('fat'),
                    'fiber': m.get('fiber', 5),
                }
                for m in candidates
            ],
            'mealSlot': slot,
        }

        req_data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            f"{FASTAPI_ML_URL}/recommend",
            data=req_data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )

        with urllib.request.urlopen(req, timeout=1.5) as resp:
            if resp.status == 200:
                res_json = json.loads(resp.read().decode('utf-8'))
                for r in res_json.get('recommendations', []):
                    ml_scores[str(r.get('mealId'))] = float(r.get('ensembleScore', 0.5))
    except Exception:
        # Fallback to Phase 3 deterministic scoring if ML endpoint offline
        pass

    return ml_scores


def get_recommendation_candidates(
    profile: Dict[str, Any],
    meal_dataset: List[Dict[str, Any]],
    slot: str,
    recent_meal_ids: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    targets = calculate_nutrition_targets(profile)
    disliked = profile.get('dislikedFoods') or profile.get('disliked_foods', [])
    candidates = filter_candidate_meals(meal_dataset, profile, slot)

    slot_cal_target = targets['calories_per_slot'].get(slot, 600)
    slot_prot_target = targets['protein_per_slot'].get(slot, 40)

    ml_scores = query_fastapi_ml_scores(profile, targets, candidates, slot)

    scored = []
    for m in candidates:
        m_id = str(m.get('id'))
        ml_score = ml_scores.get(m_id)
        sc = score_candidate_meal(
            m,
            slot_cal_target,
            slot_prot_target,
            disliked,
            recent_meal_ids or [],
            ml_score
        )
        scored.append({'meal': m, 'score': sc, 'mlScore': ml_score})

    scored.sort(key=lambda x: x['score'], reverse=True)
    return scored


def generate_weekly_plan(
    profile: Dict[str, Any],
    meal_dataset: List[Dict[str, Any]],
    use_ml: bool = True
) -> Dict[str, Any]:
    targets = calculate_nutrition_targets(profile)
    disliked = profile.get('dislikedFoods') or profile.get('disliked_foods', [])
    slots = targets['meal_slots']

    schedule = {}
    recent_meal_ids: List[str] = []

    for day_meta in DAYS_META:
        day_items = []
        for slot in slots:
            slot_cal_target = targets['calories_per_slot'].get(slot, 600)
            slot_prot_target = targets['protein_per_slot'].get(slot, 40)
            candidates = filter_candidate_meals(meal_dataset, profile, slot)

            ml_scores = {}
            if use_ml and len(candidates) > 0:
                ml_scores = query_fastapi_ml_scores(profile, targets, candidates, slot)

            scored = []
            for m in candidates:
                m_id = str(m.get('id'))
                ml_score = ml_scores.get(m_id)
                sc = score_candidate_meal(
                    m,
                    slot_cal_target,
                    slot_prot_target,
                    disliked,
                    recent_meal_ids,
                    ml_score
                )
                scored.append((sc, m))

            scored.sort(key=lambda x: x[0], reverse=True)
            best_score, best_meal = scored[0] if scored else (500.0, meal_dataset[0])

            day_items.append({
                'slot': slot,
                'slotDisplay': SLOT_DISPLAY_NAMES.get(slot, slot.capitalize()),
                'meal': best_meal,
                'score': best_score,
                'isUserLocked': False,
            })

            recent_meal_ids.append(str(best_meal.get('id')))
            if len(recent_meal_ids) > 8:
                recent_meal_ids.pop(0)

        schedule[day_meta['day']] = day_items

    return {
        'schedule': schedule,
        'targets': targets,
        'methodology': 'Phase 4 ML-Augmented Weighted Ensemble' if use_ml else 'Phase 3 Deterministic Engine',
    }
