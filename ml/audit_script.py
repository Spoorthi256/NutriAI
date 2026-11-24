import os
import sys
import numpy as np
import pandas as pd

DATA_PATH = 'ml/data/training_data.csv'

def run_audit():
    print("=" * 60)
    print("PHASE 4 DATASET & LABEL GENERATION AUDIT")
    print("=" * 60)

    if not os.path.exists(DATA_PATH):
        print(f"Error: {DATA_PATH} not found.")
        sys.exit(1)

    df = pd.read_csv(DATA_PATH)
    total_samples = len(df)
    features = list(df.columns)
    
    print(f"Total samples: {total_samples}")
    print(f"Total columns: {len(features)}")
    print(f"Columns: {features}\n")

    # 1. Null / NaN / Inf Check
    nan_counts = df.isna().sum().to_dict()
    total_nans = sum(nan_counts.values())
    print(f"Total NaN values: {total_nans}")

    inf_counts = np.isinf(df.select_dtypes(include=[np.number])).sum().to_dict()
    total_infs = sum(inf_counts.values())
    print(f"Total Inf values: {total_infs}")

    # 2. Duplicate Check
    exact_duplicates = df.duplicated().sum()
    print(f"Exact duplicate rows: {exact_duplicates}")
    feature_duplicates = df.drop(columns=['is_recommended']).duplicated().sum()
    print(f"Feature-only duplicate rows: {feature_duplicates}")

    # 3. Class Distribution
    val_counts = df['is_recommended'].value_counts()
    pos_samples = int(val_counts.get(1, 0))
    neg_samples = int(val_counts.get(0, 0))
    pos_pct = round((pos_samples / total_samples) * 100, 2)
    neg_pct = round((neg_samples / total_samples) * 100, 2)
    print(f"\nClass Distribution:")
    print(f"  Positive (Recommended = 1): {pos_samples} ({pos_pct}%)")
    print(f"  Negative (Not Recommended = 0): {neg_samples} ({neg_pct}%)")

    # 4. Nutrition Value Sanity Check
    impossible_nutrition = (
        (df['meal_calories'] <= 0) |
        (df['meal_protein'] < 0) |
        (df['meal_carbs'] < 0) |
        (df['meal_fat'] < 0) |
        (df['user_bmi'] <= 0) |
        (df['user_age'] <= 0)
    ).sum()
    print(f"\nImpossible nutrition values count: {impossible_nutrition}")

    # Macro sanity check: calories vs 4*P + 4*C + 9*F
    calc_cals = df['meal_protein'] * 4 + df['meal_carbs'] * 4 + df['meal_fat'] * 9
    cal_diff = (df['meal_calories'] - calc_cals).abs()
    print(f"Max difference between meal_calories and 4P+4C+9F: {cal_diff.max():.2f} kcal")

    # 5. Categorical Value Sanity Check
    valid_goals = {'muscle_gain', 'weight_loss', 'weight_gain', 'maintenance'}
    valid_activities = {'sedentary', 'light', 'moderate', 'very_active'}
    valid_diets = {'vegetarian', 'vegan', 'non_vegetarian', 'keto', 'mediterranean'}
    valid_categories = {'breakfast', 'lunch', 'dinner', 'snack'}
    valid_genders = {'male', 'female', 'unspecified'}

    invalid_goals = (~df['user_goal'].isin(valid_goals)).sum()
    invalid_activities = (~df['user_activity_level'].isin(valid_activities)).sum()
    invalid_diets = (~df['user_diet_type'].isin(valid_diets)).sum()
    invalid_categories = (~df['slot_category'].isin(valid_categories)).sum()
    invalid_genders = (~df['user_gender'].isin(valid_genders)).sum()

    print(f"Invalid categorical counts:")
    print(f"  goal: {invalid_goals}, activity: {invalid_activities}, diet: {invalid_diets}, category: {invalid_categories}, gender: {invalid_genders}")

    # 6. Feature Correlation with Label
    print("\nFeature correlation with is_recommended (Top 10):")
    numeric_df = df.select_dtypes(include=[np.number])
    corrs = numeric_df.corr()['is_recommended'].drop('is_recommended').abs().sort_values(ascending=False)
    print(corrs.head(10))

if __name__ == '__main__':
    run_audit()
