export type OnboardingStep =
  | 'WELCOME'
  | 'NAME'
  | 'GENDER'
  | 'GOAL'
  | 'ACTIVITY'
  | 'AGE'
  | 'HEIGHT'
  | 'WEIGHT'
  | 'DIET'
  | 'ALLERGIES'
  | 'FOOD_PREFERENCES'
  | 'MEALS_PER_DAY'
  | 'TRAINING_FREQUENCY'
  | 'REVIEW'
  | 'PROFILE_COMPLETE';

export type GoalType = 'weight_loss' | 'muscle_gain' | 'weight_gain' | 'maintenance';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';

export type DietaryType = 'vegetarian' | 'vegan' | 'non_vegetarian' | 'keto' | 'mediterranean';

export interface NutritionProfile {
  name: string;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  gender: string | null;
  goal: GoalType | null;
  activityLevel: ActivityLevel | null;
  dietType: DietaryType | null;
  allergies: string[];
  dislikedFoods: string[];
  mealsPerDay: number | null;
  trainingDays: number | null;
}

export type MessageRole = 'ai' | 'user' | 'system';

export type MessageType =
  | 'text'
  | 'question'
  | 'quick_actions'
  | 'number_input'
  | 'profile_update'
  | 'review_summary'
  | 'system';

export interface QuickActionOption {
  label: string;
  value: string;
  category?: string;
}

export interface InputConfig {
  inputType: 'number' | 'text' | 'chip_select';
  min?: number;
  max?: number;
  unit?: string;
  placeholder?: string;
  field: keyof NutritionProfile;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  type: MessageType;
  quickActions?: QuickActionOption[];
  inputConfig?: InputConfig;
  metadata?: {
    step?: OnboardingStep;
    profileSnapshot?: Partial<NutritionProfile>;
    isEditable?: boolean;
  };
}
