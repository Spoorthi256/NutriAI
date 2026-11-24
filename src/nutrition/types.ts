/**
 * Nutrition Engine Type Definitions
 * 
 * These types define the internal data structures of the nutrition calculation
 * and recommendation engine. They are separate from UI/display types.
 */

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MacroTargets {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface BodyMetrics {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  adjustedCalories: number;
}

export interface NutritionTargets extends MacroTargets {
  bodyMetrics: BodyMetrics;
  mealSlots: MealSlot[];
  caloriesPerSlot: Record<MealSlot, number>;
  proteinPerSlot: Record<MealSlot, number>;
}

export interface DatasetMeal {
  id: string;
  name: string;
  category: MealSlot;
  mealType: string;
  dietTypes: string[];
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  allergens: string[];
  tags: string[];
  prepTime: string;
  description: string;
}

export interface ScoredMeal {
  meal: DatasetMeal;
  score: number;
  breakdown: {
    calorieScore: number;
    proteinScore: number;
    macroBalanceScore: number;
    preferenceScore: number;
    varietyScore: number;
  };
}

export interface GeneratedDayPlan {
  day: string;
  shortDay: string;
  date: string;
  meals: DatasetMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  targetCalories: number;
  targetProtein: number;
}

export interface GeneratedWeeklyPlan {
  days: GeneratedDayPlan[];
  profile: {
    dailyCalories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
  generatedAt: string;
  methodology: string;
}
