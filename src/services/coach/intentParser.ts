/**
 * Phase 5 AI Coach Intent Parser
 * 
 * Provider-independent natural language parser converting user chat inputs into
 * strongly typed, validated CoachAction payloads.
 * 
 * Includes conversational context tracking, entity normalization (days/slots),
 * and ambiguity detection without numeric nutrition hallucination.
 */

import { UserProfile, DayPlan, DietaryType } from '../../types';
import { MealSlot } from '../../nutrition/types';
import {
  CoachAction,
  CoachContextState,
  CoachIntentParser,
  SemanticConstraint,
} from './coachTypes';

export class RuleBasedCoachIntentParser implements CoachIntentParser {
  async parse(
    message: string,
    context: CoachContextState,
    profile: UserProfile,
    plan: DayPlan[]
  ): Promise<CoachAction> {
    const text = message.trim();
    const lower = text.toLowerCase();

    // 1. Extract Days
    const extractedDay = this.extractDay(lower);
    const day = extractedDay || context.lastDay;

    // 2. Extract Slots
    const extractedSlot = this.extractSlot(lower);
    const slot = extractedSlot || context.lastSlot;

    // 3. Allergen Safety Check
    const allergenConflict = this.detectAllergenConflict(lower, profile.allergies || []);

    // 4. Intent: Change Meal Frequency
    const mealsPerDayMatch = lower.match(/(?:give me|change to|want|make it|set to)?\s*(3|4|5|three|four|five)\s*meals?(?:\s*a\s*day|\s*per\s*day)?/);
    if (mealsPerDayMatch || lower.includes('3 meals') || lower.includes('4 meals') || lower.includes('5 meals')) {
      let count: 3 | 4 | 5 = 4;
      if (lower.includes('3') || lower.includes('three')) count = 3;
      else if (lower.includes('5') || lower.includes('five')) count = 5;
      else if (lower.includes('4') || lower.includes('four')) count = 4;

      return {
        intent: 'CHANGE_MEAL_FREQUENCY',
        mealsPerDay: count,
        confidence: 0.95,
      };
    }

    // 5. Intent: Change Diet Type
    if (
      lower.includes('vegetarian') ||
      lower.includes('vegan') ||
      lower.includes('non-veg') ||
      lower.includes('non vegetarian') ||
      lower.includes('keto') ||
      lower.includes('mediterranean')
    ) {
      let dietType: DietaryType = 'vegetarian';
      if (lower.includes('vegan')) dietType = 'vegan';
      else if (lower.includes('non-veg') || lower.includes('non vegetarian')) dietType = 'non_vegetarian';
      else if (lower.includes('keto')) dietType = 'keto';
      else if (lower.includes('mediterranean')) dietType = 'mediterranean';

      return {
        intent: 'CHANGE_DIET_TYPE',
        dietType,
        confidence: 0.95,
      };
    }

    // 6. Intent: Add Disliked Food (Exclude Ingredient)
    if (
      lower.includes("don't like") ||
      lower.includes("don't want") ||
      lower.includes('hate ') ||
      lower.includes('no more ') ||
      lower.includes('remove ') ||
      lower.includes('exclude ') ||
      lower.includes('avoid ')
    ) {
      const ingredient = this.extractIngredient(lower);
      
      // If it's a specific day replacement like "don't want paneer on Wednesday"
      if (extractedDay || (lower.includes('on ') && extractedDay)) {
        return {
          intent: 'REPLACE_MEAL',
          day: extractedDay || day,
          slot: extractedSlot || slot || 'dinner',
          ingredient,
          requestedAllergenConflict: allergenConflict,
          confidence: 0.9,
        };
      }

      if (ingredient) {
        return {
          intent: 'ADD_DISLIKED_FOOD',
          ingredient,
          requestedAllergenConflict: allergenConflict,
          confidence: 0.9,
        };
      }
    }

    // 7. Intent: Explain Meal / Plan / Replacement
    if (
      lower.includes('why did you choose') ||
      lower.includes('why is this') ||
      lower.includes('why did you replace') ||
      lower.includes('explain') ||
      lower.includes('why this meal')
    ) {
      return {
        intent: 'EXPLAIN_MEAL',
        day: extractedDay || day || 'Wednesday',
        slot: extractedSlot || slot || 'dinner',
        confidence: 0.9,
      };
    }

    // 8. Intent: Show Nutrition Targets
    if (
      lower.includes('calorie target') ||
      lower.includes('protein goal') ||
      lower.includes('how much protein') ||
      lower.includes('what are my targets') ||
      lower.includes('daily calorie goal')
    ) {
      return {
        intent: 'SHOW_NUTRITION_TARGETS',
        confidence: 0.95,
      };
    }

    // 9. Intent: Regenerate Plan
    if (
      lower.includes('regenerate my plan') ||
      lower.includes('give me a new plan') ||
      lower.includes('start over') ||
      lower === 'regenerate'
    ) {
      return {
        intent: 'REGENERATE_PLAN',
        confidence: 0.95,
      };
    }

    // 10. Intent: Modify Meal Slot (Semantic Constraint: Lighter, Higher Protein, etc.)
    const semanticConstraint = this.extractSemanticConstraint(lower);
    if (semanticConstraint) {
      // If no day specified and no inherited day
      if (!day) {
        return {
          intent: 'MODIFY_MEAL_SLOT',
          slot: slot || 'dinner',
          constraint: semanticConstraint,
          needsClarification: true,
          clarificationPrompt: 'Which day would you like to modify? (e.g. Monday, Wednesday, Friday)',
          confidence: 0.7,
        };
      }

      return {
        intent: 'MODIFY_MEAL_SLOT',
        day,
        slot: slot || 'dinner',
        constraint: semanticConstraint,
        requestedAllergenConflict: allergenConflict,
        confidence: 0.9,
      };
    }

    // 11. Intent: Replace Meal / Swap
    if (
      lower.includes('replace') ||
      lower.includes('swap') ||
      lower.includes('change') ||
      lower.includes('something instead') ||
      lower.includes('give me another')
    ) {
      const ingredient = this.extractIngredient(lower);

      // Check for ambiguity (e.g. "Replace my lunch")
      if (!day && (extractedSlot || lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast'))) {
        return {
          intent: 'REPLACE_MEAL',
          slot: extractedSlot || 'lunch',
          needsClarification: true,
          clarificationPrompt: `Which day's ${extractedSlot || 'meal'} would you like me to replace? (e.g. Monday, Wednesday)`,
          confidence: 0.7,
        };
      }

      if (!day) {
        return {
          intent: 'REPLACE_MEAL',
          needsClarification: true,
          clarificationPrompt: 'Which day and meal slot would you like to replace? (e.g. Wednesday dinner)',
          confidence: 0.6,
        };
      }

      return {
        intent: 'REPLACE_MEAL',
        day,
        slot: slot || 'dinner',
        ingredient,
        requestedAllergenConflict: allergenConflict,
        confidence: 0.9,
      };
    }

    // 12. Fallback to Context-based Followup (e.g. User said "Something lighter" after "Replace Wednesday dinner")
    if (context.lastAction === 'REPLACE_MEAL' || context.lastAction === 'MODIFY_MEAL_SLOT') {
      if (day && slot) {
        return {
          intent: 'MODIFY_MEAL_SLOT',
          day,
          slot,
          constraint: 'LOWER_CALORIES',
          requestedAllergenConflict: allergenConflict,
          confidence: 0.8,
        };
      }
    }

    // 13. Unknown Intent
    return {
      intent: 'UNKNOWN',
      confidence: 0.2,
    };
  }

  private extractDay(lower: string): string | undefined {
    const days = [
      { key: 'Monday', matches: ['monday', 'mon'] },
      { key: 'Tuesday', matches: ['tuesday', 'tue'] },
      { key: 'Wednesday', matches: ['wednesday', 'wed'] },
      { key: 'Thursday', matches: ['thursday', 'thu'] },
      { key: 'Friday', matches: ['friday', 'fri'] },
      { key: 'Saturday', matches: ['saturday', 'sat'] },
      { key: 'Sunday', matches: ['sunday', 'sun'] },
    ];

    for (const d of days) {
      if (d.matches.some((m) => lower.includes(m))) {
        return d.key;
      }
    }

    return undefined;
  }

  private extractSlot(lower: string): MealSlot | undefined {
    if (lower.includes('breakfast')) return 'breakfast';
    if (lower.includes('lunch')) return 'lunch';
    if (lower.includes('dinner')) return 'dinner';
    if (lower.includes('snack')) return 'snack';
    return undefined;
  }

  private extractIngredient(lower: string): string | undefined {
    const ingredients = [
      'paneer',
      'oats',
      'oatmeal',
      'peanuts',
      'peanut',
      'mushrooms',
      'mushroom',
      'tofu',
      'eggs',
      'egg',
      'chicken',
      'salmon',
      'fish',
      'shrimp',
      'dairy',
      'milk',
      'cheese',
      'walnuts',
      'almonds',
    ];

    for (const ing of ingredients) {
      if (lower.includes(ing)) {
        // Capitalize nicely
        if (ing === 'paneer') return 'Paneer';
        if (ing === 'oats' || ing === 'oatmeal') return 'Oats';
        if (ing === 'peanuts' || ing === 'peanut') return 'Peanuts';
        if (ing === 'mushrooms' || ing === 'mushroom') return 'Mushrooms';
        if (ing === 'tofu') return 'Tofu';
        if (ing === 'eggs' || ing === 'egg') return 'Eggs';
        if (ing === 'chicken') return 'Chicken';
        if (ing === 'salmon') return 'Salmon';
        return ing.charAt(0).toUpperCase() + ing.slice(1);
      }
    }
    return undefined;
  }

  private extractSemanticConstraint(lower: string): SemanticConstraint | undefined {
    if (lower.includes('lighter') || lower.includes('lower calorie') || lower.includes('less calories') || lower.includes('low calorie')) {
      return 'LOWER_CALORIES';
    }
    if (lower.includes('more protein') || lower.includes('higher protein') || lower.includes('high protein')) {
      return 'HIGHER_PROTEIN';
    }
    if (lower.includes('lower carb') || lower.includes('less carbs') || lower.includes('low carb')) {
      return 'LOWER_CARBS';
    }
    if (lower.includes('lower fat') || lower.includes('less fat') || lower.includes('low fat')) {
      return 'LOWER_FAT';
    }
    if (lower.includes('filling') || lower.includes('hearty') || lower.includes('more calories')) {
      return 'MORE_FILLING';
    }
    return undefined;
  }

  private detectAllergenConflict(lower: string, declaredAllergies: string[]): string | undefined {
    if (!declaredAllergies || declaredAllergies.length === 0) return undefined;

    const userAllergens = declaredAllergies.map((a) => a.toLowerCase());

    const allergenKeywords: Record<string, string[]> = {
      peanuts: ['peanut', 'peanuts', 'groundnut'],
      dairy: ['dairy', 'milk', 'cheese', 'yogurt', 'paneer', 'whey', 'ghee'],
      gluten: ['gluten', 'wheat', 'bread', 'sourdough', 'pasta'],
      'tree nuts': ['nut', 'nuts', 'almond', 'walnut', 'cashew'],
    };

    for (const declared of userAllergens) {
      for (const [key, keywords] of Object.entries(allergenKeywords)) {
        if (declared.includes(key) || key.includes(declared)) {
          if (keywords.some((kw) => lower.includes(kw) && (lower.includes('with') || lower.includes('contain') || lower.includes('add')))) {
            return declared.charAt(0).toUpperCase() + declared.slice(1);
          }
        }
      }
    }

    return undefined;
  }
}
