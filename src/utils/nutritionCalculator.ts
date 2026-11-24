/**
 * Nutrition Calculator Facade
 * 
 * Re-exports labels and routes target calculations directly through
 * the modular Phase 3 Nutrition Engine in `src/nutrition/`.
 */

import { NutritionProfile, GoalType, ActivityLevel, DietaryType } from '../types';
import { calculateNutritionTargets, NUTRITION_DISCLAIMER } from '../nutrition';

export { NUTRITION_DISCLAIMER };

export interface DerivedTargets {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

/**
 * Route calculation through the modular Phase 3 Nutrition Engine.
 */
export function getDerivedTargets(profile: Partial<NutritionProfile>): DerivedTargets {
  const targets = calculateNutritionTargets(profile);
  return {
    dailyCalories: targets.dailyCalories,
    proteinGrams: targets.proteinGrams,
    carbsGrams: targets.carbsGrams,
    fatGrams: targets.fatGrams,
  };
}

export const GOAL_LABELS: Record<GoalType, { label: string; description: string }> = {
  muscle_gain: {
    label: 'Build Muscle',
    description: 'Optimal protein surplus engineered for lean hypertrophy and recovery.',
  },
  weight_loss: {
    label: 'Lose Weight',
    description: 'Targeted caloric deficit to shed body fat while preserving lean muscle.',
  },
  weight_gain: {
    label: 'Gain Weight',
    description: 'Clean energy surplus engineered for healthy body mass expansion.',
  },
  maintenance: {
    label: 'Maintain Baseline',
    description: 'Precision energy balance for metabolic stabilization and longevity.',
  },
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (Desk Job, minimal exercise)',
  light: 'Lightly Active (1-2 days/wk workout)',
  moderate: 'Moderately Active (3-5 days/wk workout)',
  very_active: 'Very Active (6-7 days/wk intense training)',
};

export const DIET_LABELS: Record<DietaryType, string> = {
  vegetarian: 'Vegetarian (Plant-based + Dairy/Eggs)',
  non_vegetarian: 'Non-Vegetarian (Balanced meat, seafood, plants)',
  vegan: 'Vegan (100% Plant-based)',
  keto: 'Keto (Low carb, high healthy fats)',
  mediterranean: 'Mediterranean (Whole foods, fish, olive oil)',
};
