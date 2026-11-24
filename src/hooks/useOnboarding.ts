import { useState, useEffect, useCallback } from 'react';
import {
  NutritionProfile,
  OnboardingStep,
  Message,
  GoalType,
  ActivityLevel,
  DietaryType,
} from '../types';
import { defaultAIService } from '../services/mockAIService';
import { saveOnboardingState, loadOnboardingState, clearOnboardingState } from '../utils/storage';

export const INITIAL_NUTRITION_PROFILE: NutritionProfile = {
  name: 'Yuvraj',
  age: null,
  heightCm: null,
  weightKg: null,
  gender: null,
  goal: null,
  activityLevel: null,
  dietType: null,
  allergies: [],
  dislikedFoods: [],
  mealsPerDay: null,
  trainingDays: null,
};

const STEP_SEQUENCE: OnboardingStep[] = [
  'WELCOME',
  'NAME',
  'GENDER',
  'GOAL',
  'ACTIVITY',
  'AGE',
  'HEIGHT',
  'WEIGHT',
  'DIET',
  'ALLERGIES',
  'FOOD_PREFERENCES',
  'MEALS_PER_DAY',
  'TRAINING_FREQUENCY',
  'REVIEW',
  'PROFILE_COMPLETE',
];

export function useOnboarding() {
  const [profile, setProfile] = useState<NutritionProfile>(() => {
    const saved = loadOnboardingState();
    return saved?.profile || INITIAL_NUTRITION_PROFILE;
  });

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(() => {
    const saved = loadOnboardingState();
    return saved?.currentStep || 'WELCOME';
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = loadOnboardingState();
    if (saved?.messages && saved.messages.length > 0) return saved.messages;
    return [
      {
        id: 'init-msg-1',
        role: 'ai',
        content: "Welcome to NutriAI! I'm your dedicated adaptive nutritionist. To design your precision nutrition blueprint, let's start with your preferred name or how you'd like to be addressed.",
        timestamp: '12:30 PM',
        type: 'question',
        inputConfig: {
          inputType: 'text',
          placeholder: 'Enter your name...',
          field: 'name',
        },
      },
    ];
  });

  const [isComplete, setIsComplete] = useState<boolean>(() => {
    const saved = loadOnboardingState();
    return saved?.isComplete || false;
  });

  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Auto persist to localStorage whenever state updates
  useEffect(() => {
    saveOnboardingState({
      profile,
      messages,
      currentStep,
      isComplete,
    });
  }, [profile, messages, currentStep, isComplete]);

  const setProfileField = useCallback((field: keyof NutritionProfile, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const triggerNextTurn = useCallback(
    async (nextStepName: OnboardingStep, updatedProfile: NutritionProfile, userText?: string) => {
      setIsTyping(true);

      const turn = await defaultAIService.generateResponse(nextStepName, updatedProfile, userText);

      // If AI extracted any fields from free text, merge them into profile
      let finalProfile = updatedProfile;
      if (turn.extractedFields && Object.keys(turn.extractedFields).length > 0) {
        finalProfile = { ...updatedProfile, ...turn.extractedFields };
        setProfile(finalProfile);
      }

      setCurrentStep(turn.nextStep);
      setIsTyping(false);

      setMessages((prev) => [...prev, turn.message]);

      if (turn.nextStep === 'PROFILE_COMPLETE') {
        setIsComplete(true);
      }
    },
    []
  );

  const submitAnswer = useCallback(
    async (answer: string | number, field?: keyof NutritionProfile) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Create user message
      const userMsg: Message = {
        id: `msg-user-${Date.now()}`,
        role: 'user',
        content: String(answer),
        timestamp,
        type: 'text',
      };

      setMessages((prev) => [...prev, userMsg]);

      // Update profile snapshot
      let updated: NutritionProfile = { ...profile };
      if (field) {
        if (field === 'allergies' || field === 'dislikedFoods') {
          const valStr = String(answer);
          if (valStr !== 'None' && valStr !== 'None / Skip') {
            const currentArr = (updated[field] as string[]) || [];
            (updated as any)[field] = Array.from(new Set([...currentArr, valStr]));
          }
        } else {
          (updated as any)[field] = answer;
        }
        setProfile(updated);
      } else if (currentStep === 'WELCOME' || currentStep === 'NAME') {
        updated.name = String(answer).trim();
        setProfile(updated);
      }

      // Calculate next step index
      let nextStepName: OnboardingStep;
      if (field === 'name' || currentStep === 'WELCOME') {
        nextStepName = 'NAME';
      } else {
        const currentIndex = STEP_SEQUENCE.indexOf(currentStep);
        const nextIndex = currentIndex < STEP_SEQUENCE.length - 1 ? currentIndex + 1 : currentIndex;
        nextStepName = STEP_SEQUENCE[nextIndex];
      }

      await triggerNextTurn(nextStepName, updated, String(answer));
    },
    [currentStep, profile, triggerNextTurn]
  );

  const nextStep = useCallback(() => {
    const currentIndex = STEP_SEQUENCE.indexOf(currentStep);
    if (currentIndex < STEP_SEQUENCE.length - 1) {
      const nextStepName = STEP_SEQUENCE[currentIndex + 1];
      triggerNextTurn(nextStepName, profile);
    }
  }, [currentStep, profile, triggerNextTurn]);

  const previousStep = useCallback(() => {
    const currentIndex = STEP_SEQUENCE.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStepName = STEP_SEQUENCE[currentIndex - 1];
      setCurrentStep(prevStepName);
    }
  }, [currentStep]);

  const skipStep = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const confirmProfile = useCallback(() => {
    submitAnswer('Looks Good! Build Plan ✨');
  }, [submitAnswer]);

  const editStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
  }, []);

  const resetOnboarding = useCallback(() => {
    clearOnboardingState();
    setProfile(INITIAL_NUTRITION_PROFILE);
    setCurrentStep('WELCOME');
    setIsComplete(false);
    setIsTyping(false);
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'ai',
        content: "Welcome to NutriAI! I'm your dedicated adaptive nutritionist. To design your precision nutrition blueprint, let's start with your preferred name or how you'd like to be addressed.",
        timestamp: '12:30 PM',
        type: 'question',
        inputConfig: {
          inputType: 'text',
          placeholder: 'Enter your name...',
          field: 'name',
        },
      },
    ]);
  }, []);

  const addDirectMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  return {
    currentStep,
    profile,
    messages,
    isComplete,
    isTyping,
    setIsTyping,
    setProfileField,
    submitAnswer,
    addDirectMessage,
    nextStep,
    previousStep,
    skipStep,
    confirmProfile,
    editStep,
    resetOnboarding,
  };
}
