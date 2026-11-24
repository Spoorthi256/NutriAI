"""
Phase 3 Python Constraints Module

Handles zero-tolerance allergen checks, diet type compatibility rules,
and disliked food exclusions.
"""

from typing import List, Dict, Any, Tuple


def has_allergen_violation(meal: Dict[str, Any], declared_allergies: List[str]) -> bool:
    if not declared_allergies:
        return False

    user_allergens = [a.strip().lower() for a in declared_allergies if a and a.lower() not in ['none', 'none / skip']]
    if not user_allergens:
        return False

    meal_allergens = [a.lower() for a in meal.get('allergens', [])]
    for ua in user_allergens:
        if any(ua in ma or ma in ua for ma in meal_allergens):
            return True

    ingredients_text = ' '.join(meal.get('ingredients', [])).lower()
    for ua in user_allergens:
        if 'peanut' in ua and ('peanut' in ingredients_text or 'groundnut' in ingredients_text):
            return True
        if 'dairy' in ua and any(kw in ingredients_text for kw in ['milk', 'cheese', 'yogurt', 'paneer', 'ghee', 'whey']):
            return True
        if 'gluten' in ua and any(kw in ingredients_text for kw in ['wheat', 'sourdough', 'tortilla', 'flour', 'pasta', 'bread']):
            return True
        if 'tree nut' in ua and any(kw in ingredients_text for kw in ['almond', 'cashew', 'walnut', 'hazelnut', 'pecan']):
            return True

    return False


def is_diet_compatible(meal: Dict[str, Any], user_diet: str) -> bool:
    if not user_diet:
        return True

    diet = user_diet.lower()
    meal_diets = [d.lower() for d in meal.get('diet_types', [])]

    if diet == 'vegetarian':
        return 'vegetarian' in meal_diets or 'vegan' in meal_diets
    if diet == 'vegan':
        return 'vegan' in meal_diets
    if diet == 'keto':
        return 'keto' in meal_diets or meal.get('carbs', 0) <= 25
    if diet == 'mediterranean':
        return 'mediterranean' in meal_diets or meal.get('fat', 0) <= 30
    if diet == 'non_vegetarian':
        return True

    return True


def check_disliked_foods(meal: Dict[str, Any], disliked_foods: List[str]) -> Tuple[bool, List[str]]:
    if not disliked_foods:
        return False, []

    dislikes = [d.strip().lower() for d in disliked_foods if d]
    if not dislikes:
        return False, []

    meal_name = meal.get('name', '').lower()
    ingredients = [i.lower() for i in meal.get('ingredients', [])]
    tags = [t.lower() for t in meal.get('tags', [])]

    matches = []
    for d in dislikes:
        if d in meal_name or any(d in ing for ing in ingredients) or any(d in t for t in tags):
            matches.append(d)

    return len(matches) > 0, matches


def filter_candidate_meals(
    meal_dataset: List[Dict[str, Any]],
    profile: Dict[str, Any],
    slot: str
) -> List[Dict[str, Any]]:
    user_diet = profile.get('diet_type', 'vegetarian')
    allergies = profile.get('allergies', [])
    target_slot = slot.lower()

    if target_slot not in ['breakfast', 'lunch', 'dinner', 'snack']:
        target_slot = 'lunch'

    category_candidates = [m for m in meal_dataset if m.get('category', '').lower() == target_slot]

    diet_candidates = [m for m in category_candidates if is_diet_compatible(m, user_diet)]

    safe_candidates = [m for m in diet_candidates if not has_allergen_violation(m, allergies)]

    if len(safe_candidates) == 0 and len(diet_candidates) > 0:
        return diet_candidates

    return safe_candidates if len(safe_candidates) > 0 else meal_dataset
