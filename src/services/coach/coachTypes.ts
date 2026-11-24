/**
 * Phase 5 AI Coach Structured Action & Intent Types
 */

import { UserProfile, DayPlan, Meal, DietaryType } from '../../types';
import { MealSlot } from '../../nutrition/types';

export type CoachIntent =
  | 'REPLACE_MEAL'
  | 'MODIFY_MEAL_SLOT'
  | 'CHANGE_MEAL_FREQUENCY'
  | 'ADD_DISLIKED_FOOD'
  | 'REMOVE_DISLIKED_FOOD'
  | 'CHANGE_DIET_TYPE'
  | 'EXPLAIN_MEAL'
  | 'EXPLAIN_PLAN'
  | 'REGENERATE_PLAN'
  | 'SHOW_NUTRITION_TARGETS'
  | 'UNKNOWN';

export type SemanticConstraint =
  | 'LOWER_CALORIES'
  | 'HIGHER_PROTEIN'
  | 'LOWER_CARBS'
  | 'LOWER_FAT'
  | 'EXCLUDE_INGREDIENT'
  | 'LIGHTER'
  | 'MORE_FILLING';

export interface CoachAction {
  intent: CoachIntent;
  day?: string; // 'Monday' | 'Tuesday' | ... | 'Sunday'
  slot?: MealSlot; // 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ingredient?: string; // e.g., 'Paneer', 'Oats'
  mealId?: string;
  mealsPerDay?: 3 | 4 | 5;
  dietType?: DietaryType;
  constraint?: SemanticConstraint;
  requestedAllergenConflict?: string;
  needsClarification?: boolean;
  clarificationPrompt?: string;
  confidence?: number;
}

export interface CoachContextState {
  lastDay?: string;
  lastSlot?: MealSlot;
  lastAction?: CoachIntent;
  lastMealId?: string;
  actionHistory: CoachActionHistory[];
}

export interface CoachActionHistory {
  id: string;
  timestamp: string;
  userMessage: string;
  intent: CoachIntent;
  affectedDay?: string;
  affectedSlot?: MealSlot;
  previousMealId?: string;
  newMealId?: string;
  success: boolean;
  details: string;
}

export interface CoachActionResult {
  success: boolean;
  intent: CoachIntent;
  action: CoachAction;
  previousMeal?: Meal;
  updatedMeal?: Meal;
  affectedDay?: string;
  affectedSlot?: MealSlot;
  reasoning?: string[];
  userResponse: string;
  safetyViolation?: string;
  updatedProfile?: UserProfile;
  updatedPlan?: DayPlan[];
}

export interface CoachIntentParser {
  parse(
    message: string,
    context: CoachContextState,
    profile: UserProfile,
    plan: DayPlan[]
  ): Promise<CoachAction>;
}
