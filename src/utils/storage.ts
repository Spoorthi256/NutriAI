import { NutritionProfile, OnboardingStep, Message, DayPlan, DeliveryScheduleItem, ChatThread, UserProfile } from '../types';

const STORAGE_KEY_ONBOARDING = 'nutriai_onboarding_state_v3';
const STORAGE_KEY_WEEKLY_PLAN = 'nutriai_weekly_plan_v3';
const STORAGE_KEY_DELIVERIES = 'nutriai_deliveries_v3';
const STORAGE_KEY_CHAT_THREADS = 'nutriai_chat_threads_v3';
const STORAGE_KEY_USER_PROFILE = 'nutriai_user_profile_v3';

export interface SavedOnboardingState {
  profile: NutritionProfile;
  messages: Message[];
  currentStep: OnboardingStep;
  isComplete: boolean;
}

export function saveOnboardingState(state: SavedOnboardingState): void {
  try {
    localStorage.setItem(STORAGE_KEY_ONBOARDING, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save NutriAI onboarding state to localStorage:', err);
  }
}

export function loadOnboardingState(): SavedOnboardingState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ONBOARDING);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load NutriAI onboarding state from localStorage:', err);
    return null;
  }
}

export function clearOnboardingState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ONBOARDING);
  } catch (err) {
    console.warn('Failed to clear NutriAI onboarding state:', err);
  }
}

export function saveWeeklyPlan(plan: DayPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_WEEKLY_PLAN, JSON.stringify(plan));
  } catch (err) {
    console.warn('Failed to save weekly plan:', err);
  }
}

export function loadWeeklyPlan(): DayPlan[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WEEKLY_PLAN);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

export function saveDeliveries(deliveries: DeliveryScheduleItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DELIVERIES, JSON.stringify(deliveries));
  } catch (err) {
    console.warn('Failed to save deliveries:', err);
  }
}

export function loadDeliveries(): DeliveryScheduleItem[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELIVERIES);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

export function saveChatThreads(threads: ChatThread[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CHAT_THREADS, JSON.stringify(threads));
  } catch (err) {
    console.warn('Failed to save chat threads:', err);
  }
}

export function loadChatThreads(): ChatThread[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHAT_THREADS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

const STORAGE_KEY_SUBSCRIPTION = 'nutriai_subscription_v3';

export function saveSubscriptionState(data: { hasSubscription: boolean; tier: string | null }): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUBSCRIPTION, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save subscription state:', err);
  }
}

export function loadSubscriptionState(): { hasSubscription: boolean; tier: string | null } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBSCRIPTION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

