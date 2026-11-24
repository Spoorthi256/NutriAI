/**
 * Nutrition Calculations Module
 * 
 * Provides deterministic mathematical calculations for BMI, BMR (Mifflin-St Jeor),
 * TDEE, goal-based caloric adjustments, and macronutrient distributions.
 * 
 * IMPORTANT DISCLAIMER:
 * Nutrition estimates are for planning purposes and are not medical advice.
 */

import { NutritionProfile, GoalType, ActivityLevel } from '../types';
import { BodyMetrics, NutritionTargets, MealSlot } from './types';

export const NUTRITION_DISCLAIMER =
  'Nutrition estimates are for planning purposes and are not medical advice.';

/**
 * Configurable caloric adjustments per goal (surplus / deficit).
 * Centralized for easy tuning or ML override in Phase 4.
 */
export const GOAL_ADJUSTMENTS: Record<GoalType, number> = {
  muscle_gain: 300,
  weight_gain: 300,
  weight_loss: -500,
  maintenance: 0,
};

/**
 * Configurable activity level multipliers (standard Katch-McArdle / Harris-Benedict multipliers).
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
};

/**
 * Configurable macronutrient caloric distribution ratios.
 */
export const MACRO_RATIOS: Record<
  GoalType,
  { proteinRatio: number; carbsRatio: number; fatRatio: number }
> = {
  muscle_gain: { proteinRatio: 0.30, carbsRatio: 0.45, fatRatio: 0.25 },
  weight_loss: { proteinRatio: 0.35, carbsRatio: 0.35, fatRatio: 0.30 },
  weight_gain: { proteinRatio: 0.25, carbsRatio: 0.50, fatRatio: 0.25 },
  maintenance: { proteinRatio: 0.25, carbsRatio: 0.45, fatRatio: 0.30 },
};

/**
 * Calculate Body Mass Index (BMI).
 */
export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string } {
  if (weightKg <= 0 || heightCm <= 0) {
    return { bmi: 22.0, category: 'Normal weight' };
  }
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  let category = 'Normal weight';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25.0) category = 'Normal weight';
  else if (bmi < 30.0) category = 'Overweight';
  else category = 'Obese';

  return { bmi, category };
}

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation.
 * If gender is unspecified, uses a midpoint fallback: 10*W + 6.25*H - 5*A - 78.
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string | null
): number {
  const safeWeight = weightKg > 0 ? weightKg : 75;
  const safeHeight = heightCm > 0 ? heightCm : 175;
  const safeAge = age > 0 ? age : 25;

  const base = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge;

  if (gender === 'male') {
    return Math.round(base + 5);
  }
  if (gender === 'female') {
    return Math.round(base - 161);
  }
  // Neutral demographic midpoint fallback when gender is unspecified
  return Math.round(base - 78);
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE).
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel | null): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel || 'moderate'] || 1.55;
  return Math.round(bmr * multiplier);
}

/**
 * Determine meal slots according to mealsPerDay.
 */
export function getMealSlots(mealsPerDay: number | null): MealSlot[] {
  const count = mealsPerDay || 4;
  if (count <= 3) {
    return ['breakfast', 'lunch', 'dinner'];
  }
  if (count === 4) {
    return ['breakfast', 'lunch', 'snack', 'dinner'];
  }
  // 5 or more meals
  return ['breakfast', 'lunch', 'snack', 'snack', 'dinner'];
}

/**
 * Slot calorie & protein distribution ratios based on slot count.
 */
function getSlotDistributions(slots: MealSlot[]): {
  calories: Record<MealSlot, number>;
  protein: Record<MealSlot, number>;
} {
  if (slots.length === 3) {
    return {
      calories: { breakfast: 0.30, lunch: 0.40, dinner: 0.30, snack: 0 },
      protein: { breakfast: 0.30, lunch: 0.40, dinner: 0.30, snack: 0 },
    };
  }
  if (slots.length === 4) {
    return {
      calories: { breakfast: 0.25, lunch: 0.35, snack: 0.15, dinner: 0.25 },
      protein: { breakfast: 0.25, lunch: 0.35, snack: 0.15, dinner: 0.25 },
    };
  }
  // 5 slots (2 snacks)
  return {
    calories: { breakfast: 0.25, lunch: 0.30, snack: 0.10, dinner: 0.25 },
    protein: { breakfast: 0.25, lunch: 0.30, snack: 0.10, dinner: 0.25 },
  };
}

/**
 * Full calculation engine producing typed NutritionTargets from NutritionProfile.
 */
export function calculateNutritionTargets(profile: Partial<NutritionProfile>): NutritionTargets {
  const weightKg = profile.weightKg || 87;
  const heightCm = profile.heightCm || 178;
  const age = profile.age || 22;
  const gender = profile.gender || null;
  const goal: GoalType = profile.goal || 'muscle_gain';
  const activityLevel: ActivityLevel = profile.activityLevel || 'moderate';
  const mealsPerDay = profile.mealsPerDay || 4;

  const { bmi, category: bmiCategory } = calculateBMI(weightKg, heightCm);
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  const goalAdjustment = GOAL_ADJUSTMENTS[goal] ?? 0;
  const adjustedCalories = Math.max(1200, Math.round(tdee + goalAdjustment));

  const ratios = MACRO_RATIOS[goal] || MACRO_RATIOS.maintenance;

  const proteinGrams = Math.round((adjustedCalories * ratios.proteinRatio) / 4);
  const carbsGrams = Math.round((adjustedCalories * ratios.carbsRatio) / 4);
  const fatGrams = Math.round((adjustedCalories * ratios.fatRatio) / 9);

  const mealSlots = getMealSlots(mealsPerDay);
  const distributions = getSlotDistributions(mealSlots);

  const caloriesPerSlot: Record<MealSlot, number> = {
    breakfast: Math.round(adjustedCalories * distributions.calories.breakfast),
    lunch: Math.round(adjustedCalories * distributions.calories.lunch),
    dinner: Math.round(adjustedCalories * distributions.calories.dinner),
    snack: Math.round(adjustedCalories * distributions.calories.snack),
  };

  const proteinPerSlot: Record<MealSlot, number> = {
    breakfast: Math.round(proteinGrams * distributions.protein.breakfast),
    lunch: Math.round(proteinGrams * distributions.protein.lunch),
    dinner: Math.round(proteinGrams * distributions.protein.dinner),
    snack: Math.round(proteinGrams * distributions.protein.snack),
  };

  const bodyMetrics: BodyMetrics = {
    bmi,
    bmiCategory,
    bmr,
    tdee,
    adjustedCalories,
  };

  return {
    dailyCalories: adjustedCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    bodyMetrics,
    mealSlots,
    caloriesPerSlot,
    proteinPerSlot,
  };
}
