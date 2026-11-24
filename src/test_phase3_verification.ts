import { calculateNutritionTargets } from './nutrition/calculations';
import { generateWeeklyPlan } from './nutrition/recommender';
import { NutritionProfile } from './types';
import { defaultAIService } from './services/mockAIService';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${msg}`);
  }
  console.log(`✓ PASS: ${msg}`);
}

const baseProfile: NutritionProfile = {
  name: 'Yuvraj',
  age: 19,
  heightCm: 178,
  weightKg: 87,
  gender: 'male',
  goal: 'muscle_gain',
  activityLevel: 'moderate',
  dietType: 'vegetarian',
  allergies: ['Peanuts'],
  dislikedFoods: [],
  mealsPerDay: 4,
  trainingDays: 5,
};

console.log('\n--- STARTING PHASE 3 VERIFICATION TESTS ---\n');

// Test A: Vegetarian Profile -> zero non-vegetarian meals
{
  const vegProfile: NutritionProfile = { ...baseProfile, dietType: 'vegetarian' };
  const plan = generateWeeklyPlan(vegProfile);
  for (const day of plan.days) {
    for (const meal of day.meals) {
      assert(
        meal.dietTypes.includes('vegetarian') || meal.dietTypes.includes('vegan'),
        `Vegetarian test: "${meal.name}" must be vegetarian or vegan. Found: ${meal.dietTypes.join(', ')}`
      );
    }
  }
}

// Test B: Peanut Allergy -> zero meals containing peanuts
{
  const allergyProfile: NutritionProfile = { ...baseProfile, allergies: ['Peanuts'] };
  const plan = generateWeeklyPlan(allergyProfile);
  for (const day of plan.days) {
    for (const meal of day.meals) {
      const hasPeanuts =
        meal.allergens.some((a) => a.toLowerCase().includes('peanut')) ||
        meal.ingredients.some((i) => i.toLowerCase().includes('peanut'));
      assert(!hasPeanuts, `Peanut allergy test: "${meal.name}" must not contain peanuts.`);
    }
  }
}

// Test C: Disliked Oats -> oat meals avoided when alternatives exist
{
  const dislikeProfile: NutritionProfile = { ...baseProfile, dislikedFoods: ['Oats'] };
  const plan = generateWeeklyPlan(dislikeProfile);
  for (const day of plan.days) {
    for (const meal of day.meals) {
      const hasOats =
        meal.name.toLowerCase().includes('oat') ||
        meal.ingredients.some((i) => i.toLowerCase().includes('oat'));
      assert(!hasOats, `Disliked food test: "${meal.name}" avoided oats.`);
    }
  }
}

// Test D: 3 meals/day -> exactly 3 meal slots per day
{
  const profile3: NutritionProfile = { ...baseProfile, mealsPerDay: 3 };
  const plan3 = generateWeeklyPlan(profile3);
  for (const day of plan3.days) {
    assert(day.meals.length === 3, `3 meals/day: ${day.day} has ${day.meals.length} meals.`);
  }
}

// Test E: 4 meals/day -> exactly 4 meal slots per day
{
  const profile4: NutritionProfile = { ...baseProfile, mealsPerDay: 4 };
  const plan4 = generateWeeklyPlan(profile4);
  for (const day of plan4.days) {
    assert(day.meals.length === 4, `4 meals/day: ${day.day} has ${day.meals.length} meals.`);
  }
}

// Test F: 5 meals/day -> exactly 5 meal slots per day
{
  const profile5: NutritionProfile = { ...baseProfile, mealsPerDay: 5 };
  const plan5 = generateWeeklyPlan(profile5);
  for (const day of plan5.days) {
    assert(day.meals.length === 5, `5 meals/day: ${day.day} has ${day.meals.length} meals.`);
  }
}

// Test G: Goal change -> nutrition targets recalculate
{
  const cutTargets = calculateNutritionTargets({ ...baseProfile, goal: 'weight_loss' });
  const bulkTargets = calculateNutritionTargets({ ...baseProfile, goal: 'muscle_gain' });
  assert(
    cutTargets.dailyCalories < bulkTargets.dailyCalories,
    `Goal change: Weight loss (${cutTargets.dailyCalories} kcal) < Muscle gain (${bulkTargets.dailyCalories} kcal)`
  );
  assert(
    cutTargets.proteinGrams > 0 && bulkTargets.proteinGrams > 0,
    `Protein targets computed: cut=${cutTargets.proteinGrams}g, bulk=${bulkTargets.proteinGrams}g`
  );
}

// Test H: Weight/height change -> calculated metrics update
{
  const t1 = calculateNutritionTargets({ ...baseProfile, weightKg: 70, heightCm: 170 });
  const t2 = calculateNutritionTargets({ ...baseProfile, weightKg: 90, heightCm: 185 });
  assert(
    t1.bodyMetrics.bmr < t2.bodyMetrics.bmr,
    `Weight/height change: 70kg BMR (${t1.bodyMetrics.bmr}) < 90kg BMR (${t2.bodyMetrics.bmr})`
  );
  assert(
    t1.bodyMetrics.bmi !== t2.bodyMetrics.bmi,
    `BMI updates: 70kg=${t1.bodyMetrics.bmi}, 90kg=${t2.bodyMetrics.bmi}`
  );
}

// Test I: NLP Chat extraction -> updates profile fields
{
  const ext1 = defaultAIService.extractProfileData('Please make me vegetarian and no oats', baseProfile);
  assert(ext1.dietType === 'vegetarian', 'Chat NLP extracted dietType: vegetarian');
  assert(ext1.dislikedFoods?.includes('Oats') === true, 'Chat NLP extracted dislikedFoods: Oats');

  const ext2 = defaultAIService.extractProfileData('Make it 3 meals a day and I have an allergy to dairy', baseProfile);
  assert(ext2.mealsPerDay === 3, 'Chat NLP extracted mealsPerDay: 3');
  assert(ext2.allergies?.includes('Dairy') === true, 'Chat NLP extracted allergy: Dairy');
}

console.log('\n--- ALL PHASE 3 VERIFICATION TESTS PASSED SUCCESSFULLY! ---\n');
