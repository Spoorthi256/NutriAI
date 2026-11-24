"""
Phase 3 Python Nutrition Calculation Engine

Provides deterministic BMR, TDEE, goal-adjusted calorie targets,
and macronutrient breakdowns matching the TypeScript engine with 100% precision.
"""

from typing import Dict, Any, List, Optional, Tuple

GOAL_ADJUSTMENTS = {
    'muscle_gain': 300,
    'weight_gain': 300,
    'weight_loss': -500,
    'maintenance': 0,
}

MACRO_RATIOS = {
    'muscle_gain': {'protein': 0.30, 'carbs': 0.45, 'fat': 0.25},
    'weight_gain': {'protein': 0.25, 'carbs': 0.50, 'fat': 0.25},
    'weight_loss': {'protein': 0.35, 'carbs': 0.35, 'fat': 0.30},
    'maintenance': {'protein': 0.25, 'carbs': 0.50, 'fat': 0.25},
}

ACTIVITY_MULTIPLIERS = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'very_active': 1.725,
    'extra_active': 1.9,
}

SLOT_SCHEDULES = {
    3: ['breakfast', 'lunch', 'dinner'],
    4: ['breakfast', 'lunch', 'snack', 'dinner'],
    5: ['breakfast', 'lunch', 'snack', 'dinner', 'snack'],
}


def calculate_bmi(weight_kg: float, height_cm: float) -> Tuple[float, str]:
    if height_cm <= 0:
        return 0.0, 'Unknown'
    height_m = height_cm / 100.0
    bmi = round(weight_kg / (height_m * height_m), 1)

    if bmi < 18.5:
        category = 'Underweight'
    elif bmi < 25.0:
        category = 'Normal'
    elif bmi < 30.0:
        category = 'Overweight'
    else:
        category = 'Obese'

    return bmi, category


def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: Optional[str]) -> int:
    if gender == 'female':
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    elif gender == 'male':
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 78

    return max(800, round(bmr))


def calculate_tdee(bmr: int, activity_level: str) -> int:
    multiplier = ACTIVITY_MULTIPLIERS.get(activity_level, 1.55)
    return round(bmr * multiplier)


def get_slot_distributions(slots: List[str]) -> Dict[str, Dict[str, float]]:
    if len(slots) == 3:
        return {
            'calories': {'breakfast': 0.30, 'lunch': 0.40, 'dinner': 0.30, 'snack': 0.0},
            'protein': {'breakfast': 0.30, 'lunch': 0.40, 'dinner': 0.30, 'snack': 0.0},
        }
    if len(slots) == 4:
        return {
            'calories': {'breakfast': 0.25, 'lunch': 0.35, 'snack': 0.15, 'dinner': 0.25},
            'protein': {'breakfast': 0.25, 'lunch': 0.35, 'snack': 0.15, 'dinner': 0.25},
        }
    return {
        'calories': {'breakfast': 0.25, 'lunch': 0.30, 'snack': 0.10, 'dinner': 0.25},
        'protein': {'breakfast': 0.25, 'lunch': 0.30, 'snack': 0.10, 'dinner': 0.25},
    }


def calculate_nutrition_targets(profile: Dict[str, Any]) -> Dict[str, Any]:
    weight_kg = float(profile.get('weight_kg', 87))
    height_cm = float(profile.get('height_cm', 178))
    age = int(profile.get('age', 22))
    gender = profile.get('gender')
    goal = profile.get('goal', 'muscle_gain')
    activity_level = profile.get('activity_level', 'moderate')
    meals_per_day = int(profile.get('meals_per_day', 4))
    if meals_per_day not in [3, 4, 5]:
        meals_per_day = 4

    bmi, bmi_category = calculate_bmi(weight_kg, height_cm)
    bmr = calculate_bmr(weight_kg, height_cm, age, gender)
    tdee = calculate_tdee(bmr, activity_level)

    goal_adj = GOAL_ADJUSTMENTS.get(goal, 0)
    daily_calories = max(1200, round(tdee + goal_adj))

    ratios = MACRO_RATIOS.get(goal, MACRO_RATIOS['maintenance'])
    protein_grams = round((daily_calories * ratios['protein']) / 4.0)
    carbs_grams = round((daily_calories * ratios['carbs']) / 4.0)
    fat_grams = round((daily_calories * ratios['fat']) / 9.0)

    slots = SLOT_SCHEDULES.get(meals_per_day, SLOT_SCHEDULES[4])
    dists = get_slot_distributions(slots)

    calories_per_slot = {
        s: round(daily_calories * dists['calories'].get(s, 0.25)) for s in ['breakfast', 'lunch', 'dinner', 'snack']
    }
    protein_per_slot = {
        s: round(protein_grams * dists['protein'].get(s, 0.25)) for s in ['breakfast', 'lunch', 'dinner', 'snack']
    }

    return {
        'daily_calories': daily_calories,
        'protein_grams': protein_grams,
        'carbs_grams': carbs_grams,
        'fat_grams': fat_grams,
        'body_metrics': {
            'bmi': bmi,
            'bmi_category': bmi_category,
            'bmr': bmr,
            'tdee': tdee,
            'adjusted_calories': daily_calories,
        },
        'meal_slots': slots,
        'calories_per_slot': calories_per_slot,
        'protein_per_slot': protein_per_slot,
    }
