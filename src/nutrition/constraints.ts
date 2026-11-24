/**
 * Nutrition Constraints Module
 * 
 * Centralizes hard safety constraints (allergens), diet type compatibility rules,
 * and preference filters (disliked foods).
 */

import { NutritionProfile, DietaryType } from '../types';
import { DatasetMeal, MealSlot } from './types';

/**
 * Check if a meal contains any declared allergen (HARD CONSTRAINT).
 * Strict zero-tolerance check matching declared allergens against meal allergens and ingredients.
 * 
 * Note: Prototype dataset covers allergens explicitly tagged in the dataset.
 */
export function hasAllergenViolation(meal: DatasetMeal, declaredAllergies: string[]): boolean {
  if (!declaredAllergies || declaredAllergies.length === 0) return false;

  const userAllergens = declaredAllergies
    .map((a) => a.trim().toLowerCase())
    .filter((a) => a && a !== 'none' && a !== 'none / skip');

  if (userAllergens.length === 0) return false;

  // 1. Check tagged allergens on meal
  const mealAllergens = meal.allergens.map((a) => a.toLowerCase());
  for (const userAllergen of userAllergens) {
    if (mealAllergens.some((ma) => ma.includes(userAllergen) || userAllergen.includes(ma))) {
      return true;
    }
  }

  // 2. Secondary ingredient text scan for common variants
  const ingredientsText = meal.ingredients.join(' ').toLowerCase();
  for (const userAllergen of userAllergens) {
    if (userAllergen.includes('peanut') && (ingredientsText.includes('peanut') || ingredientsText.includes('groundnut'))) {
      return true;
    }
    if (userAllergen.includes('dairy') && (ingredientsText.includes('milk') || ingredientsText.includes('cheese') || ingredientsText.includes('yogurt') || ingredientsText.includes('paneer') || ingredientsText.includes('ghee') || ingredientsText.includes('whey'))) {
      return true;
    }
    if (userAllergen.includes('gluten') && (ingredientsText.includes('wheat') || ingredientsText.includes('sourdough') || ingredientsText.includes('tortilla') || ingredientsText.includes('flour') || ingredientsText.includes('pasta') || ingredientsText.includes('bread'))) {
      return true;
    }
    if (userAllergen.includes('tree nut') && (ingredientsText.includes('almond') || ingredientsText.includes('cashew') || ingredientsText.includes('walnut') || ingredientsText.includes('hazelnut') || ingredientsText.includes('pecan'))) {
      return true;
    }
  }

  return false;
}

/**
 * Centralized Diet Compatibility Check.
 */
export function isDietCompatible(meal: DatasetMeal, userDiet: DietaryType | null): boolean {
  if (!userDiet) return true;

  const diet = userDiet.toLowerCase();
  const mealDiets = meal.dietTypes.map((d) => d.toLowerCase());

  switch (diet) {
    case 'vegetarian':
      // Vegetarian can eat vegetarian or vegan meals
      return mealDiets.includes('vegetarian') || mealDiets.includes('vegan');

    case 'vegan':
      // Vegan strictly eats vegan
      return mealDiets.includes('vegan');

    case 'keto':
      return mealDiets.includes('keto') || meal.carbs <= 25;

    case 'mediterranean':
      return (
        mealDiets.includes('mediterranean') ||
        mealDiets.includes('vegetarian') ||
        mealDiets.includes('vegan')
      );

    case 'non_vegetarian':
    default:
      // Omnivore can eat anything
      return true;
  }
}

/**
 * Check if a meal contains any user-disliked food.
 */
export function checkDislikedFoods(meal: DatasetMeal, dislikedFoods: string[]): {
  hasDislike: boolean;
  matchedItems: string[];
} {
  if (!dislikedFoods || dislikedFoods.length === 0) {
    return { hasDislike: false, matchedItems: [] };
  }

  const cleanDislikes = dislikedFoods
    .map((d) => d.trim().toLowerCase())
    .filter((d) => d && d !== 'none' && d !== 'none 😋');

  if (cleanDislikes.length === 0) {
    return { hasDislike: false, matchedItems: [] };
  }

  const mealText = `${meal.name} ${meal.ingredients.join(' ')} ${meal.tags.join(' ')}`.toLowerCase();
  const matchedItems: string[] = [];

  for (const dislike of cleanDislikes) {
    if (mealText.includes(dislike)) {
      matchedItems.push(dislike);
    }
  }

  return {
    hasDislike: matchedItems.length > 0,
    matchedItems,
  };
}

/**
 * Filter all candidate meals by hard constraints (Allergens & Diet Type)
 * and optionally by target meal slot (Breakfast, Lunch, Dinner, Snack).
 */
export function filterCandidateMeals(
  dataset: DatasetMeal[],
  profile: NutritionProfile,
  slot?: MealSlot
): DatasetMeal[] {
  return dataset.filter((meal) => {
    // Slot match if specified
    if (slot && meal.category !== slot) {
      return false;
    }

    // Hard Constraint 1: Declared Allergens
    if (hasAllergenViolation(meal, profile.allergies || [])) {
      return false;
    }

    // Hard Constraint 2: Diet Type Compatibility
    if (!isDietCompatible(meal, profile.dietType)) {
      return false;
    }

    return true;
  });
}
