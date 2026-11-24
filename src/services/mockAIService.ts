import { AIService, AIResponseTurn } from './aiService';
import {
  NutritionProfile,
  OnboardingStep,
  Message,
  GoalType,
  ActivityLevel,
  DietaryType,
} from '../types';
import { GOAL_LABELS } from '../utils/nutritionCalculator';

export class MockAIService implements AIService {
  public extractProfileData(
    userText: string,
    currentProfile: NutritionProfile
  ): Partial<NutritionProfile> {
    const text = userText.toLowerCase();
    const extracted: Partial<NutritionProfile> = {};

    // Gender extraction
    if (text.includes('female') || text.includes('woman')) {
      extracted.gender = 'female';
    } else if (text.includes('male') || text.includes('man')) {
      extracted.gender = 'male';
    }

    // Goal extraction
    if (text.includes('build muscle') || text.includes('hypertrophy') || text.includes('gain muscle') || text.includes('increase protein')) {
      extracted.goal = 'muscle_gain';
    } else if (text.includes('lose weight') || text.includes('fat loss') || text.includes('deficit')) {
      extracted.goal = 'weight_loss';
    } else if (text.includes('gain weight') || text.includes('bulk')) {
      extracted.goal = 'weight_gain';
    } else if (text.includes('maintain') || text.includes('baseline')) {
      extracted.goal = 'maintenance';
    }

    // Number extractions for age, height, weight, training days
    const ageMatch = text.match(/(\d{2})\s*(years|yr|old)?/);
    if (ageMatch && parseInt(ageMatch[1], 10) >= 14 && parseInt(ageMatch[1], 10) <= 99) {
      extracted.age = parseInt(ageMatch[1], 10);
    }

    const heightMatch = text.match(/(\d{3})\s*(cm|centimeters)?/);
    if (heightMatch && parseInt(heightMatch[1], 10) >= 120 && parseInt(heightMatch[1], 10) <= 230) {
      extracted.heightCm = parseInt(heightMatch[1], 10);
    }

    const weightMatch = text.match(/(\d{2,3})\s*(kg|kilos|pounds)?/);
    if (weightMatch && parseInt(weightMatch[1], 10) >= 35 && parseInt(weightMatch[1], 10) <= 250) {
      extracted.weightKg = parseInt(weightMatch[1], 10);
    }

    const trainingMatch = text.match(/(\d)\s*(days|day|x)?\s*(a|per)?\s*week/);
    if (trainingMatch) {
      extracted.trainingDays = parseInt(trainingMatch[1], 10);
    }

    // Meals per day extraction
    if (text.includes('3 meal') || text.includes('three meal')) {
      extracted.mealsPerDay = 3;
    } else if (text.includes('4 meal') || text.includes('four meal')) {
      extracted.mealsPerDay = 4;
    } else if (text.includes('5 meal') || text.includes('five meal')) {
      extracted.mealsPerDay = 5;
    }

    // Diet extraction
    if (text.includes('vegetarian') && !text.includes('non-vegetarian')) {
      extracted.dietType = 'vegetarian';
    } else if (text.includes('vegan')) {
      extracted.dietType = 'vegan';
    } else if (text.includes('non-vegetarian') || text.includes('omnivore') || text.includes('chicken') || text.includes('meat')) {
      extracted.dietType = 'non_vegetarian';
    } else if (text.includes('keto')) {
      extracted.dietType = 'keto';
    } else if (text.includes('mediterranean')) {
      extracted.dietType = 'mediterranean';
    }

    // Allergies extraction
    const currentAllergies = [...(currentProfile.allergies || [])];
    if (text.includes('peanut')) {
      if (!currentAllergies.includes('Peanuts')) currentAllergies.push('Peanuts');
    }
    if (text.includes('dairy') || text.includes('lactose')) {
      if (!currentAllergies.includes('Dairy')) currentAllergies.push('Dairy');
    }
    if (text.includes('gluten')) {
      if (!currentAllergies.includes('Gluten')) currentAllergies.push('Gluten');
    }
    if (text.includes('tree nut') || text.includes('almond') || text.includes('walnut')) {
      if (!currentAllergies.includes('Tree Nuts')) currentAllergies.push('Tree Nuts');
    }
    if (currentAllergies.length !== (currentProfile.allergies || []).length) {
      extracted.allergies = currentAllergies;
    }

    // Disliked foods extraction
    const currentDislikes = [...(currentProfile.dislikedFoods || [])];
    if (text.includes('oat') || text.includes('oats')) {
      if (!currentDislikes.includes('Oats')) currentDislikes.push('Oats');
    }
    if (text.includes('mushroom') || text.includes('mushrooms')) {
      if (!currentDislikes.includes('Mushrooms')) currentDislikes.push('Mushrooms');
    }
    if (text.includes('eggplant')) {
      if (!currentDislikes.includes('Eggplant')) currentDislikes.push('Eggplant');
    }
    if (text.includes('spicy')) {
      if (!currentDislikes.includes('Spicy')) currentDislikes.push('Spicy');
    }
    if (currentDislikes.length !== (currentProfile.dislikedFoods || []).length) {
      extracted.dislikedFoods = currentDislikes;
    }

    return extracted;
  }

  public async generateResponse(
    step: OnboardingStep,
    profile: NutritionProfile,
    userMessage?: string
  ): Promise<AIResponseTurn> {
    // Artificial latency for conversational AI feeling
    await new Promise((resolve) => setTimeout(resolve, 500));

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const extracted = userMessage ? this.extractProfileData(userMessage, profile) : {};

    let content = '';
    let nextStep: OnboardingStep = step;
    let messageType: Message['type'] = 'text';
    let quickActions: Message['quickActions'] = undefined;
    let inputConfig: Message['inputConfig'] = undefined;

    switch (step) {
      case 'WELCOME':
        content = "Hey! I'm NutriAI. 👋\n\nI'll build a precision nutrition plan around you — not the other way around.\n\nWhat should I call you?";
        nextStep = 'NAME';
        messageType = 'question';
        inputConfig = {
          inputType: 'text',
          placeholder: 'Enter your name...',
          field: 'name',
        };
        break;

      case 'NAME': {
        const userName = profile.name || 'friend';
        content = `Nice to meet you, **${userName}**! 👋\n\nTo calibrate your baseline energy expenditure (BMR) accurately, what is your biological sex?`;
        nextStep = 'GENDER';
        messageType = 'quick_actions';
        quickActions = [
          { label: 'Male 👨', value: 'male', category: 'gender' },
          { label: 'Female 👩', value: 'female', category: 'gender' },
          { label: 'Prefer Not to Say ✨', value: 'neutral', category: 'gender' },
        ];
        break;
      }

      case 'GENDER': {
        content = `Got it. What is your primary health & fitness goal right now?`;
        nextStep = 'GOAL';
        messageType = 'quick_actions';
        quickActions = [
          { label: 'Build Muscle 💪', value: 'muscle_gain', category: 'goal' },
          { label: 'Lose Weight ⚡', value: 'weight_loss', category: 'goal' },
          { label: 'Gain Weight 📈', value: 'weight_gain', category: 'goal' },
          { label: 'Maintain Baseline 🧘', value: 'maintenance', category: 'goal' },
        ];
        break;
      }

      case 'GOAL': {
        const goalInfo = profile.goal ? GOAL_LABELS[profile.goal]?.label : 'Build Muscle';
        content = `Awesome, targeting **${goalInfo}**!\n\nNotice your Nutrition Profile artifact on the right workspace just updated.\n\nHow active are you during a typical week?`;
        nextStep = 'ACTIVITY';
        messageType = 'quick_actions';
        quickActions = [
          { label: 'Sedentary (Desk Job)', value: 'sedentary', category: 'activity' },
          { label: 'Lightly Active (1-2 days/wk)', value: 'light', category: 'activity' },
          { label: 'Moderately Active (3-5 days/wk)', value: 'moderate', category: 'activity' },
          { label: 'Very Active (6-7 days/wk)', value: 'very_active', category: 'activity' },
        ];
        break;
      }

      case 'ACTIVITY':
        content = `Got it. Now, how old are you?`;
        nextStep = 'AGE';
        messageType = 'number_input';
        inputConfig = {
          inputType: 'number',
          min: 15,
          max: 99,
          unit: 'years',
          placeholder: 'e.g. 24',
          field: 'age',
        };
        break;

      case 'AGE': {
        const ageVal = profile.age ? ` (${profile.age} years old)` : '';
        content = `Got it${ageVal}. What is your height in centimeters?`;
        nextStep = 'HEIGHT';
        messageType = 'number_input';
        inputConfig = {
          inputType: 'number',
          min: 120,
          max: 230,
          unit: 'cm',
          placeholder: 'e.g. 178',
          field: 'heightCm',
        };
        break;
      }

      case 'HEIGHT':
        content = `And what is your current body weight in kilograms?`;
        nextStep = 'WEIGHT';
        messageType = 'number_input';
        inputConfig = {
          inputType: 'number',
          min: 35,
          max: 250,
          unit: 'kg',
          placeholder: 'e.g. 87',
          field: 'weightKg',
        };
        break;

      case 'WEIGHT':
        content = `Great. What dietary style do you prefer?`;
        nextStep = 'DIET';
        messageType = 'quick_actions';
        quickActions = [
          { label: 'Vegetarian 🥗', value: 'vegetarian', category: 'diet' },
          { label: 'Non-Vegetarian 🍗', value: 'non_vegetarian', category: 'diet' },
          { label: 'Vegan 🌿', value: 'vegan', category: 'diet' },
          { label: 'Keto 🥑', value: 'keto', category: 'diet' },
          { label: 'Mediterranean 🐟', value: 'mediterranean', category: 'diet' },
        ];
        break;

      case 'DIET':
        content = `Do you have any food allergies or intolerances?`;
        nextStep = 'ALLERGIES';
        messageType = 'quick_actions';
        quickActions = [
          { label: 'Peanuts 🥜', value: 'Peanuts', category: 'allergy' },
          { label: 'Dairy / Lactose 🥛', value: 'Dairy', category: 'allergy' },
          { label: 'Gluten 🌾', value: 'Gluten', category: 'allergy' },
          { label: 'Tree Nuts 🌰', value: 'Tree Nuts', category: 'allergy' },
          { label: 'None / Skip ✨', value: 'None', category: 'allergy' },
        ];
        break;

      case 'ALLERGIES':
        content = `Are there any specific ingredients or foods you dislike and want to exclude?`;
        nextStep = 'FOOD_PREFERENCES';
        messageType = 'quick_actions';
        quickActions = [
          { label: 'Oats 🌾', value: 'Oats', category: 'dislike' },
          { label: 'Mushrooms 🍄', value: 'Mushrooms', category: 'dislike' },
          { label: 'Eggplant 🍆', value: 'Eggplant', category: 'dislike' },
          { label: 'Spicy Foods 🌶️', value: 'Spicy', category: 'dislike' },
          { label: 'None 😋', value: 'None', category: 'dislike' },
        ];
        break;

      case 'FOOD_PREFERENCES':
        content = `How many meals per day fits your daily routine best?`;
        nextStep = 'MEALS_PER_DAY';
        messageType = 'quick_actions';
        quickActions = [
          { label: '3 Main Meals 🍽️', value: '3', category: 'meals' },
          { label: '4 Meals (Snack included) 🥗', value: '4', category: 'meals' },
          { label: '5 Small Meals 🥑', value: '5', category: 'meals' },
        ];
        break;

      case 'MEALS_PER_DAY':
        if (profile.goal === 'muscle_gain' || profile.goal === 'weight_gain') {
          content = `How many days a week do you do weightlifting or strength training?`;
        } else {
          content = `How many days a week do you engage in deliberate workouts or cardio?`;
        }
        nextStep = 'TRAINING_FREQUENCY';
        messageType = 'quick_actions';
        quickActions = [
          { label: '3 Days / week 🏋️', value: '3', category: 'training' },
          { label: '4 Days / week 🏋️‍♂️', value: '4', category: 'training' },
          { label: '5 Days / week ⚡', value: '5', category: 'training' },
          { label: '6 Days / week 🔥', value: '6', category: 'training' },
        ];
        break;

      case 'TRAINING_FREQUENCY':
        content = `Here's what I've understood about you:`;
        nextStep = 'REVIEW';
        messageType = 'review_summary';
        quickActions = [
          { label: 'Looks Good! Build Plan ✨', value: 'confirm_profile', category: 'action' },
          { label: 'Edit Something ✏️', value: 'edit_profile', category: 'action' },
        ];
        break;

      case 'REVIEW':
        content = `Perfect. Your nutrition profile is calculated and ready.\n\nI'm ready to build your first personalized 7-Day Meal Plan based on our nutrition intelligence engine.`;
        nextStep = 'PROFILE_COMPLETE';
        messageType = 'quick_actions';
        quickActions = [
          { label: 'Build My Meal Plan 📅', value: 'build_meal_plan', category: 'action' },
        ];
        break;

      case 'PROFILE_COMPLETE':
      default:
        content = `Your personalized plan has been recalculated based on your profile.\n\nAsk me anytime to switch diet types, swap meals, or adjust targets!`;
        nextStep = 'PROFILE_COMPLETE';
        messageType = 'text';
        break;
    }

    const message: Message = {
      id: `msg-ai-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      role: 'ai',
      content,
      timestamp,
      type: messageType,
      quickActions,
      inputConfig,
      metadata: {
        step: nextStep,
        profileSnapshot: { ...profile },
      },
    };

    return {
      message,
      nextStep,
      extractedFields: extracted,
    };
  }
}

export const defaultAIService = new MockAIService();
