import { NutritionProfile, OnboardingStep, Message } from '../types';

export interface AIResponseTurn {
  message: Message;
  nextStep: OnboardingStep;
  extractedFields?: Partial<NutritionProfile>;
}

export interface AIService {
  generateResponse(
    step: OnboardingStep,
    profile: NutritionProfile,
    userMessage?: string
  ): Promise<AIResponseTurn>;

  extractProfileData(userText: string, currentProfile: NutritionProfile): Partial<NutritionProfile>;
}
