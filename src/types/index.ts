export * from './onboarding';

import {
  NutritionProfile,
  GoalType,
  ActivityLevel,
  DietaryType,
  Message,
  OnboardingStep,
} from './onboarding';

export type ArtifactType = 'nutrition_profile' | 'weekly_meal_plan' | 'delivery_schedule' | 'macro_breakdown';

export type UserProfile = NutritionProfile & {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  targetWeightKg?: number;
  hasSubscription?: boolean;
  subscriptionTier?: 'weekly' | 'monthly' | 'yearly' | null;
  credits?: number;
};

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: 'success' | 'info' | 'warning' | 'delivery';
}

// Aliases for compatibility
export type ChatMessage = Message & {
  sender?: 'ai' | 'user';
};

export interface ChatThread {
  id: string;
  title: string;
  time: string;
  isPinned?: boolean;
  isOnboarding?: boolean;
  messages: ChatMessage[];
}

export interface Meal {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  tag: string;
  tags?: string[];
  time?: string;
  description: string;
  ingredients: string[];
}

export interface DayPlan {
  day: string;
  shortDay: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs?: number;
  totalFat?: number;
  meals: Meal[];
}

export interface DeliveryScheduleItem {
  id: string;
  orderId: string;
  day: string;
  mealName: string;
  mealCategory: 'Lunch' | 'Dinner';
  status: 'Preparing' | 'Scheduled' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  timeSlot: string;
  address: string;
  qrCodeId: string;
}

export type ActiveView = 'landing' | 'app' | 'ai_coach_page' | 'auth' | 'delivery_partner';
export type AppNavigationTab = 'home' | 'meals' | 'dashboard' | 'deliveries' | 'meal_plans' | 'nutrition' | 'progress' | 'settings' | 'ai_coach';

export * from './aiCoach';
