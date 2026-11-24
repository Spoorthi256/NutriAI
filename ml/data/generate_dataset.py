"""
Synthetic Prototype Training Dataset Generator

Generates a reproducible prototype dataset of 1,200 user-meal interactions
representing diverse user demographics, dietary preferences, and meal nutritional profiles.

DISCLAIMER:
This is a prototype training dataset intended to demonstrate the ML recommendation
architecture. It is not a clinically validated dataset.
"""

import os
import numpy as np
import pandas as pd

def generate_dataset(n_samples: int = 1200, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)

    goals = ['muscle_gain', 'weight_loss', 'weight_gain', 'maintenance']
    activity_levels = ['sedentary', 'light', 'moderate', 'very_active']
    diet_types = ['vegetarian', 'vegan', 'non_vegetarian', 'keto', 'mediterranean']
    meal_categories = ['breakfast', 'lunch', 'dinner', 'snack']
    genders = ['male', 'female', 'unspecified']

    records = []

    for i in range(n_samples):
        # User characteristics
        age = int(np.random.randint(18, 65))
        bmi = round(float(np.random.uniform(18.5, 33.0)), 1)
        gender = np.random.choice(genders, p=[0.48, 0.48, 0.04])
        goal = np.random.choice(goals, p=[0.35, 0.35, 0.15, 0.15])
        activity = np.random.choice(activity_levels, p=[0.25, 0.35, 0.30, 0.10])
        diet = np.random.choice(diet_types, p=[0.35, 0.15, 0.30, 0.10, 0.10])
        meals_per_day = int(np.random.choice([3, 4, 5], p=[0.25, 0.55, 0.20]))

        # Caloric target calculation baseline
        base_tdee = 1800 + (bmi - 22.0) * 45 + (1.35 if activity == 'moderate' else 1.2) * 200
        if goal == 'muscle_gain':
            target_calories = base_tdee + 300
            target_protein = (target_calories * 0.30) / 4
            target_carbs = (target_calories * 0.45) / 4
            target_fat = (target_calories * 0.25) / 9
        elif goal == 'weight_loss':
            target_calories = max(1300, base_tdee - 500)
            target_protein = (target_calories * 0.35) / 4
            target_carbs = (target_calories * 0.35) / 4
            target_fat = (target_calories * 0.30) / 9
        elif goal == 'weight_gain':
            target_calories = base_tdee + 400
            target_protein = (target_calories * 0.25) / 4
            target_carbs = (target_calories * 0.50) / 4
            target_fat = (target_calories * 0.25) / 9
        else:
            target_calories = base_tdee
            target_protein = (target_calories * 0.25) / 4
            target_carbs = (target_calories * 0.45) / 4
            target_fat = (target_calories * 0.30) / 9

        # Target meal slot
        category = np.random.choice(meal_categories, p=[0.28, 0.32, 0.28, 0.12])
        if category == 'breakfast':
            slot_cal = target_calories * 0.25
            slot_prot = target_protein * 0.25
        elif category == 'lunch':
            slot_cal = target_calories * 0.35
            slot_prot = target_protein * 0.35
        elif category == 'dinner':
            slot_cal = target_calories * 0.28
            slot_prot = target_protein * 0.28
        else:  # snack
            slot_cal = target_calories * 0.12
            slot_prot = target_protein * 0.12

        # Candidate meal characteristics
        cal_noise = np.random.normal(1.0, 0.22)
        meal_cal = max(150, round(slot_cal * cal_noise))
        prot_noise = np.random.normal(1.0, 0.25)
        meal_prot = max(10, round(slot_prot * prot_noise))

        # Macronutrient breakdown
        remaining_cal = max(50, meal_cal - meal_prot * 4)
        carbs_ratio = np.random.uniform(0.40, 0.70)
        meal_carbs = max(5, round((remaining_cal * carbs_ratio) / 4))
        meal_fat = max(3, round((remaining_cal * (1.0 - carbs_ratio)) / 9))
        meal_fiber = round(float(np.random.uniform(3.0, 15.0)), 1)

        # Derived ratios (without target label leakage)
        calorie_ratio = round(meal_cal / max(slot_cal, 100), 3)
        protein_ratio = round(meal_prot / max(slot_prot, 15), 3)
        protein_density = round(meal_prot / max(meal_cal, 50), 4)

        # Target label logic: based on nutritional fit for user profile
        cal_fit = 0.75 <= calorie_ratio <= 1.25
        prot_fit = protein_ratio >= 0.75

        goal_alignment = True
        if goal == 'muscle_gain' and protein_density < 0.045:
            goal_alignment = False
        elif goal == 'weight_loss' and calorie_ratio > 1.15:
            goal_alignment = False

        # Recommendation ground truth binary label
        is_recommended = 1 if (cal_fit and prot_fit and goal_alignment) else 0

        # Inject realistic 5% label noise
        if np.random.rand() < 0.05:
            is_recommended = 1 - is_recommended

        records.append({
            'user_age': age,
            'user_bmi': bmi,
            'user_gender': gender,
            'user_goal': goal,
            'user_activity_level': activity,
            'user_diet_type': diet,
            'user_meals_per_day': meals_per_day,
            'user_target_calories': round(target_calories),
            'user_target_protein': round(target_protein),
            'user_target_carbs': round(target_carbs),
            'user_target_fat': round(target_fat),
            'slot_category': category,
            'slot_target_calories': round(slot_cal),
            'slot_target_protein': round(slot_prot),
            'meal_calories': meal_cal,
            'meal_protein': meal_prot,
            'meal_carbs': meal_carbs,
            'meal_fat': meal_fat,
            'meal_fiber': meal_fiber,
            'calorie_ratio': calorie_ratio,
            'protein_ratio': protein_ratio,
            'protein_density': protein_density,
            'is_recommended': is_recommended
        })

    df = pd.DataFrame(records)
    return df

if __name__ == '__main__':
    os.makedirs('ml/data', exist_ok=True)
    df = generate_dataset()
    output_path = 'ml/data/training_data.csv'
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} records saved to {output_path}")
    print("Class distribution:")
    print(df['is_recommended'].value_counts(normalize=True))
