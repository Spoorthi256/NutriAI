"""
Backend Nutrition Engine Unit & Regression Tests

Verifies 100% numerical identity between Python calculations/constraints
and TypeScript Phase 3 requirements.
"""

import unittest
from .calculations import (
    calculate_bmi,
    calculate_bmr,
    calculate_tdee,
    calculate_nutrition_targets,
)
from .constraints import (
    has_allergen_violation,
    is_diet_compatible,
    check_disliked_foods,
    filter_candidate_meals,
)


class TestNutritionCalculations(unittest.TestCase):

    def test_bmi_calculation(self):
        bmi, cat = calculate_bmi(87, 178)
        self.assertEqual(bmi, 27.5)
        self.assertEqual(cat, 'Overweight')

    def test_bmr_calculation_male(self):
        # male: 10*87 + 6.25*178 - 5*22 + 5 = 870 + 1112.5 - 110 + 5 = 1877.5 -> 1878
        bmr = calculate_bmr(87, 178, 22, 'male')
        self.assertEqual(bmr, 1878)

    def test_bmr_calculation_female(self):
        # female: 10*87 + 6.25*178 - 5*22 - 161 = 870 + 1112.5 - 110 - 161 = 1711.5 -> 1712
        bmr = calculate_bmr(87, 178, 22, 'female')
        self.assertEqual(bmr, 1712)

    def test_tdee_calculation(self):
        # 1878 * 1.55 = 2910.9 -> 2911
        tdee = calculate_tdee(1878, 'moderate')
        self.assertEqual(tdee, 2911)

    def test_nutrition_targets_muscle_gain(self):
        profile = {
            'weight_kg': 87,
            'height_cm': 178,
            'age': 22,
            'gender': 'male',
            'goal': 'muscle_gain',
            'activity_level': 'moderate',
            'meals_per_day': 4,
        }
        targets = calculate_nutrition_targets(profile)
        # TDEE 2911 + 300 surplus = 3211
        self.assertEqual(targets['daily_calories'], 3211)
        self.assertEqual(targets['protein_grams'], 241) # (3211*0.30)/4 = 240.825 -> 241
        self.assertEqual(targets['carbs_grams'], 361)   # (3211*0.45)/4 = 361.2375 -> 361
        self.assertEqual(targets['fat_grams'], 89)      # (3211*0.25)/9 = 89.19 -> 89

    def test_allergen_constraints(self):
        meal = {
            'name': 'Peanut Butter Toast',
            'allergens': ['Peanuts', 'Gluten'],
            'ingredients': ['Whole Wheat Bread', 'Peanut Butter'],
        }
        self.assertTrue(has_allergen_violation(meal, ['Peanuts']))
        self.assertFalse(has_allergen_violation(meal, ['Dairy']))

    def test_diet_compatibility(self):
        veg_meal = {'diet_types': ['vegetarian']}
        vegan_meal = {'diet_types': ['vegan']}

        self.assertTrue(is_diet_compatible(veg_meal, 'vegetarian'))
        self.assertFalse(is_diet_compatible(veg_meal, 'vegan'))
        self.assertTrue(is_diet_compatible(vegan_meal, 'vegan'))


if __name__ == '__main__':
    unittest.main()
