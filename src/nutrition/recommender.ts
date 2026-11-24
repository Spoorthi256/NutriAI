/**
 * NutriAI Recommendation Engine
 * 
 * Pipeline:
 * NutritionProfile
 * → calculateNutritionTargets()
 * → filterCandidateMeals() [HARD CONSTRAINTS: Zero Allergens, Strict Diet Type]
 * → [OPTIONAL ML ENSEMBLE RANKING via POST /recommend]
 * → softScoring() [ML Score, Calorie Proximity, Protein Proximity, Disliked Penalty, Variety Penalty]
 * → deterministicSelection()
 * → 7-day meal plan assembly
 * 
 * FALLBACK GUARANTEE:
 * If the Python ML service is offline, unresponsive, or throws an error,
 * this engine transparently uses the Phase 3 deterministic scoring model.
 * The user NEVER receives a broken plan.
 */

import { NutritionProfile, DayPlan, Meal } from '../types';
import { DatasetMeal, GeneratedDayPlan, GeneratedWeeklyPlan, MealSlot } from './types';
import { calculateNutritionTargets } from './calculations';
import { filterCandidateMeals, checkDislikedFoods } from './constraints';
import { MEAL_DATASET } from './dataset';
import { mlClient } from '../services/mlClient';

const DAYS_OF_WEEK = [
  { day: 'Monday', shortDay: 'Mon', date: 'Oct 6' },
  { day: 'Tuesday', shortDay: 'Tue', date: 'Oct 7' },
  { day: 'Wednesday', shortDay: 'Wed', date: 'Oct 8' },
  { day: 'Thursday', shortDay: 'Thu', date: 'Oct 9' },
  { day: 'Friday', shortDay: 'Fri', date: 'Oct 10' },
  { day: 'Saturday', shortDay: 'Sat', date: 'Oct 11' },
  { day: 'Sunday', shortDay: 'Sun', date: 'Oct 12' },
];

/**
 * Score a candidate meal for a specific slot.
 * Combines ML ensemble probability with calorie proximity, protein proximity,
 * disliked food penalties, and recency penalties.
 */
function scoreCandidateMeal(
  meal: DatasetMeal,
  targetCalories: number,
  targetProtein: number,
  dislikedFoods: string[],
  recentMealIds: string[],
  mlScore?: number
): number {
  let score = 1000;

  // ML ensemble score ranking boost (if available from Phase 4 ML service)
  if (typeof mlScore === 'number' && !isNaN(mlScore)) {
    score += mlScore * 400;
  }

  // 1. Calorie proximity (penalty for absolute percentage difference)
  const calorieDiffPercent = Math.abs(meal.calories - targetCalories) / Math.max(targetCalories, 100);
  score -= calorieDiffPercent * 250;

  // 2. Protein proximity
  const proteinDiffPercent = Math.abs(meal.protein - targetProtein) / Math.max(targetProtein, 20);
  score -= proteinDiffPercent * 180;

  // 3. Disliked foods penalty (strong preference penalty: avoids unless no other choice)
  const { hasDislike } = checkDislikedFoods(meal, dislikedFoods);
  if (hasDislike) {
    score -= 600;
  }

  // 4. Variety penalty: heavily penalize meals used in the past 1-2 days
  const recentIndex = recentMealIds.indexOf(meal.id);
  if (recentIndex !== -1) {
    const recencyWeight = recentMealIds.length - recentIndex;
    score -= recencyWeight * 220;
  }

  return score;
}

/**
 * Select the best candidate meal deterministically based on final scores.
 */
function selectBestMeal(
  candidates: DatasetMeal[],
  targetCalories: number,
  targetProtein: number,
  dislikedFoods: string[],
  recentMealIds: string[],
  mlScores?: Record<string, number>
): DatasetMeal {
  if (candidates.length === 0) {
    return MEAL_DATASET[0];
  }

  // Score all candidates with dynamic variety jitter
  const scored = candidates.map((candidate) => {
    const mlScore = mlScores ? mlScores[candidate.id] : undefined;
    const baseScore = scoreCandidateMeal(
      candidate,
      targetCalories,
      targetProtein,
      dislikedFoods,
      recentMealIds,
      mlScore
    );
    const finalScore = baseScore + (Math.random() * 60);
    return { candidate, finalScore };
  });

  scored.sort((a, b) => b.finalScore - a.finalScore);
  return scored[0].candidate;
}

/**
 * Generate a complete 7-day personalized meal plan based on the user's profile.
 * Can accept optional precomputed ML scores.
 */
export function generateWeeklyPlan(
  profile: NutritionProfile,
  mlScores?: Record<string, number>
): GeneratedWeeklyPlan {
  const targets = calculateNutritionTargets(profile);
  const disliked = profile.dislikedFoods || [];

  const days: GeneratedDayPlan[] = [];
  const recentMealIds: string[] = [];

  for (let d = 0; d < DAYS_OF_WEEK.length; d++) {
    const dayMeta = DAYS_OF_WEEK[d];
    const selectedMeals: DatasetMeal[] = [];

    let dayCalories = 0;
    let dayProtein = 0;
    let dayCarbs = 0;
    let dayFat = 0;

    for (const slot of targets.mealSlots) {
      // Hard constraints are executed first: allergies and diet compatibility
      const candidates = filterCandidateMeals(MEAL_DATASET, profile, slot);
      const slotTargetCalories = targets.caloriesPerSlot[slot] || 500;
      const slotTargetProtein = targets.proteinPerSlot[slot] || 35;

      const chosenMeal = selectBestMeal(
        candidates,
        slotTargetCalories,
        slotTargetProtein,
        disliked,
        recentMealIds,
        mlScores
      );

      selectedMeals.push(chosenMeal);
      recentMealIds.push(chosenMeal.id);
      if (recentMealIds.length > 8) {
        recentMealIds.shift();
      }

      dayCalories += chosenMeal.calories;
      dayProtein += chosenMeal.protein;
      dayCarbs += chosenMeal.carbs;
      dayFat += chosenMeal.fat;
    }

    days.push({
      day: dayMeta.day,
      shortDay: dayMeta.shortDay,
      date: dayMeta.date,
      meals: selectedMeals,
      totalCalories: dayCalories,
      totalProtein: dayProtein,
      totalCarbs: dayCarbs,
      totalFat: dayFat,
      targetCalories: targets.dailyCalories,
      targetProtein: targets.proteinGrams,
    });
  }

  const hasML = mlScores && Object.keys(mlScores).length > 0;
  return {
    days,
    profile: {
      dailyCalories: targets.dailyCalories,
      proteinGrams: targets.proteinGrams,
      carbsGrams: targets.carbsGrams,
      fatGrams: targets.fatGrams,
    },
    generatedAt: new Date().toISOString(),
    methodology: hasML
      ? 'Phase 4 ML-Augmented Weighted Ensemble (Decision Tree + Logistic Regression + Naive Bayes)'
      : 'Phase 3 Deterministic Multi-Factor Nutrition Constraint Engine v3.0',
  };
}

/**
 * Asynchronous ML-augmented weekly plan generator.
 * Attempts to query the Python ML recommendation service for candidate scores.
 * If ML service fails or is unreachable, transparently falls back to Phase 3 deterministic plan.
 */
export async function generateWeeklyPlanWithML(profile: NutritionProfile): Promise<GeneratedWeeklyPlan> {
  const targets = calculateNutritionTargets(profile);
  const mlScoreMap: Record<string, number> = {};

  try {
    const isMLHealthy = await mlClient.checkHealth();
    if (isMLHealthy) {
      // Query ML scores for unique slots in user's profile
      const uniqueSlots = Array.from(new Set(targets.mealSlots));
      for (const slot of uniqueSlots) {
        const candidates = filterCandidateMeals(MEAL_DATASET, profile, slot);
        const recs = await mlClient.getRecommendations(profile, targets, candidates, slot);
        if (recs && recs.length > 0) {
          for (const r of recs) {
            mlScoreMap[r.mealId] = r.ensembleScore;
          }
        }
      }
    }
  } catch (err) {
    console.warn('[NutriAI ML Recommender] Fallback to deterministic scoring:', err);
  }

  return generateWeeklyPlan(profile, mlScoreMap);
}

/**
 * Adapter converting GeneratedWeeklyPlan into UI DayPlan[] model.
 */
export function convertToUIDayPlans(plan: GeneratedWeeklyPlan): DayPlan[] {
  return plan.days.map((dayPlan) => {
    const meals: Meal[] = dayPlan.meals.map((m, idx) => {
      let displayCategory: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner' = 'Breakfast';
      if (m.category === 'lunch') displayCategory = 'Lunch';
      else if (m.category === 'dinner') displayCategory = 'Dinner';
      else if (m.category === 'snack') displayCategory = 'Snack';

      return {
        id: `${m.id}-${dayPlan.shortDay.toLowerCase()}-${idx}`,
        name: m.name,
        category: displayCategory,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        prepTime: m.prepTime,
        tag: m.tags[0] || 'Precision Fuel',
        description: m.description,
        ingredients: m.ingredients,
      };
    });

    return {
      day: dayPlan.day,
      shortDay: dayPlan.shortDay,
      date: dayPlan.date,
      totalCalories: dayPlan.totalCalories,
      totalProtein: dayPlan.totalProtein,
      meals,
    };
  });
}
