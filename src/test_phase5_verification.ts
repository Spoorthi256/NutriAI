/**
 * Phase 5 Verification & Acceptance Test Suite
 * 
 * Verifies all 8 required acceptance test conversations, intent parsing accuracy,
 * context inheritance, safety guardrails, state synchronization, and regression safety.
 */

import { RuleBasedCoachIntentParser } from './services/coach/intentParser';
import { CoachActionExecutor } from './services/coach/actionExecutor';
import { CoachContextState } from './services/coach/coachTypes';
import { UserProfile, DayPlan } from './types';
import { generateWeeklyPlan, convertToUIDayPlans, calculateNutritionTargets } from './nutrition';
import { INITIAL_NUTRITION_PROFILE } from './hooks/useOnboarding';

async function runPhase5Tests() {
  console.log('======================================================================');
  console.log('NUTRIAI PHASE 5 — CONVERSATIONAL ACTION ENGINE TEST SUITE');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string, details?: string) {
    if (condition) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title} ${details ? `-> ${details}` : ''}`);
      failed++;
    }
  }

  // Base profile & initial 7-day plan
  const initTargets = calculateNutritionTargets(INITIAL_NUTRITION_PROFILE);
  let profile: UserProfile = {
    ...INITIAL_NUTRITION_PROFILE,
    dailyCalories: initTargets.dailyCalories,
    proteinGrams: initTargets.proteinGrams,
    carbsGrams: initTargets.carbsGrams,
    fatGrams: initTargets.fatGrams,
  };
  let rawPlan = generateWeeklyPlan(profile);
  let plan: DayPlan[] = convertToUIDayPlans(rawPlan);

  const parser = new RuleBasedCoachIntentParser();
  let context: CoachContextState = { actionHistory: [] };

  // -------------------------------------------------------------------
  // TEST 1: "Replace Wednesday dinner."
  // -------------------------------------------------------------------
  console.log('--- TEST 1: Replace Wednesday dinner ---');
  let action = await parser.parse('Replace Wednesday dinner.', context, profile, plan);
  assert(action.intent === 'REPLACE_MEAL', 'Test 1 Intent: REPLACE_MEAL');
  assert(action.day === 'Wednesday', 'Test 1 Day: Wednesday');
  assert(action.slot === 'dinner', 'Test 1 Slot: dinner');

  let result = await CoachActionExecutor.execute(action, profile, plan);
  assert(result.success === true, 'Test 1 Execution: success');
  assert(result.affectedDay === 'Wednesday', 'Test 1 Affected Day: Wednesday');
  assert(!!result.updatedMeal, 'Test 1 Updated Meal: returned');
  if (result.updatedPlan) plan = result.updatedPlan;
  context = { ...context, lastDay: 'Wednesday', lastSlot: 'dinner', lastAction: 'REPLACE_MEAL' };
  console.log('Chat output snippet:\n' + result.userResponse + '\n');

  // -------------------------------------------------------------------
  // TEST 2: "Make Wednesday dinner lighter."
  // -------------------------------------------------------------------
  console.log('--- TEST 2: Make Wednesday dinner lighter ---');
  action = await parser.parse('Make Wednesday dinner lighter.', context, profile, plan);
  assert(action.intent === 'MODIFY_MEAL_SLOT', 'Test 2 Intent: MODIFY_MEAL_SLOT');
  assert(action.constraint === 'LOWER_CALORIES', 'Test 2 Constraint: LOWER_CALORIES');
  assert(action.day === 'Wednesday', 'Test 2 Day: Wednesday');

  let wedDinnerBefore = plan.find(d => d.day === 'Wednesday')?.meals.find(m => m.category.toLowerCase() === 'dinner');
  result = await CoachActionExecutor.execute(action, profile, plan);
  assert(result.success === true, 'Test 2 Execution: success');
  let wedDinnerAfter = result.updatedMeal;
  assert(
    !!wedDinnerBefore && !!wedDinnerAfter && wedDinnerAfter.calories <= wedDinnerBefore.calories,
    'Test 2 Caloric Reduction: New dinner calories <= previous dinner calories',
    `Before: ${wedDinnerBefore?.calories}, After: ${wedDinnerAfter?.calories}`
  );
  if (result.updatedPlan) plan = result.updatedPlan;
  console.log('Chat output snippet:\n' + result.userResponse + '\n');

  // -------------------------------------------------------------------
  // TEST 3: "I don't like paneer."
  // -------------------------------------------------------------------
  console.log("--- TEST 3: I don't like paneer ---");
  action = await parser.parse("I don't like paneer.", context, profile, plan);
  assert(action.intent === 'ADD_DISLIKED_FOOD', 'Test 3 Intent: ADD_DISLIKED_FOOD');
  assert(action.ingredient === 'Paneer', 'Test 3 Ingredient: Paneer');

  result = await CoachActionExecutor.execute(action, profile, plan);
  assert(result.success === true, 'Test 3 Execution: success');
  assert(result.updatedProfile?.dislikedFoods?.includes('Paneer') === true, 'Test 3 Profile Updated: Paneer in dislikedFoods');
  if (result.updatedProfile) profile = result.updatedProfile;
  if (result.updatedPlan) plan = result.updatedPlan;
  console.log('Chat output snippet:\n' + result.userResponse + '\n');

  // -------------------------------------------------------------------
  // TEST 4: "Give me 5 meals a day."
  // -------------------------------------------------------------------
  console.log('--- TEST 4: Give me 5 meals a day ---');
  action = await parser.parse('Give me 5 meals a day.', context, profile, plan);
  assert(action.intent === 'CHANGE_MEAL_FREQUENCY', 'Test 4 Intent: CHANGE_MEAL_FREQUENCY');
  assert(action.mealsPerDay === 5, 'Test 4 MealsPerDay: 5');

  result = await CoachActionExecutor.execute(action, profile, plan);
  assert(result.success === true, 'Test 4 Execution: success');
  assert(result.updatedProfile?.mealsPerDay === 5, 'Test 4 Profile Updated: mealsPerDay = 5');
  const totalScheduled5 = result.updatedPlan?.reduce((acc, d) => acc + d.meals.length, 0);
  assert(totalScheduled5 === 35, `Test 4 Weekly Scheduled Count: 35 meals (5x7) -> got ${totalScheduled5}`);
  if (result.updatedProfile) profile = result.updatedProfile;
  if (result.updatedPlan) plan = result.updatedPlan;
  console.log('Chat output snippet:\n' + result.userResponse + '\n');

  // -------------------------------------------------------------------
  // TEST 5: "Make my plan vegan."
  // -------------------------------------------------------------------
  console.log('--- TEST 5: Make my plan vegan ---');
  action = await parser.parse('Make my plan vegan.', context, profile, plan);
  assert(action.intent === 'CHANGE_DIET_TYPE', 'Test 5 Intent: CHANGE_DIET_TYPE');
  assert(action.dietType === 'vegan', 'Test 5 DietType: vegan');

  result = await CoachActionExecutor.execute(action, profile, plan);
  assert(result.success === true, 'Test 5 Execution: success');
  assert(result.updatedProfile?.dietType === 'vegan', 'Test 5 Profile Updated: dietType = vegan');
  if (result.updatedProfile) profile = result.updatedProfile;
  if (result.updatedPlan) plan = result.updatedPlan;
  console.log('Chat output snippet:\n' + result.userResponse + '\n');

  // -------------------------------------------------------------------
  // TEST 6: "Why did you choose this meal?"
  // -------------------------------------------------------------------
  console.log('--- TEST 6: Why did you choose this meal? ---');
  action = await parser.parse('Why did you choose this meal?', context, profile, plan);
  assert(action.intent === 'EXPLAIN_MEAL', 'Test 6 Intent: EXPLAIN_MEAL');

  result = await CoachActionExecutor.execute(action, profile, plan);
  assert(result.success === true, 'Test 6 Execution: success');
  assert(result.userResponse.includes('Calories:'), 'Test 6 Real Data: Response contains Calories');
  assert(result.userResponse.includes('Protein:'), 'Test 6 Real Data: Response contains Protein');
  console.log('Chat output snippet:\n' + result.userResponse + '\n');

  // -------------------------------------------------------------------
  // TEST 7: Safety Guardrail: "Replace Wednesday dinner with something containing peanuts."
  // (when peanuts are an active allergy)
  // -------------------------------------------------------------------
  console.log('--- TEST 7: Safety Guardrail: Peanuts request when allergic ---');
  profile.allergies = ['Peanuts'];
  const planBeforeTest7 = JSON.stringify(plan);
  action = await parser.parse('Replace Wednesday dinner with something containing peanuts.', context, profile, plan);
  
  result = await CoachActionExecutor.execute(action, profile, plan);
  assert(result.success === false, 'Test 7 Safety Result: success === false');
  assert(!!result.safetyViolation, 'Test 7 Safety Guardrail: safetyViolation returned');
  const planAfterTest7 = JSON.stringify(plan);
  assert(planBeforeTest7 === planAfterTest7, 'Test 7 Atomic Invariant: Plan state preserved 100% untouched');
  console.log('Chat output snippet:\n' + result.userResponse + '\n');

  // -------------------------------------------------------------------
  // TEST 8: Context Retention: "Replace Wednesday dinner." -> "Something lighter."
  // -------------------------------------------------------------------
  console.log('--- TEST 8: Context Retention ---');
  // Step A: "Replace Wednesday dinner."
  const contextA: CoachContextState = {
    lastDay: 'Wednesday',
    lastSlot: 'dinner',
    lastAction: 'REPLACE_MEAL',
    actionHistory: [],
  };
  // Step B: Followup: "Something lighter."
  action = await parser.parse('Something lighter.', contextA, profile, plan);
  assert(action.intent === 'MODIFY_MEAL_SLOT', 'Test 8 Followup Intent: MODIFY_MEAL_SLOT');
  assert(action.day === 'Wednesday', 'Test 8 Inherited Day: Wednesday');
  assert(action.slot === 'dinner', 'Test 8 Inherited Slot: dinner');
  assert(action.constraint === 'LOWER_CALORIES', 'Test 8 Semantic Constraint: LOWER_CALORIES');

  result = await CoachActionExecutor.execute(action, profile, plan);
  assert(result.success === true, 'Test 8 Execution: success');
  assert(result.affectedDay === 'Wednesday', 'Test 8 Affected Day: Wednesday');
  console.log('Chat output snippet:\n' + result.userResponse + '\n');

  // -------------------------------------------------------------------
  // TEST 9: Ambiguity Guardrail: "Change dinner." (without day)
  // -------------------------------------------------------------------
  console.log('--- TEST 9: Ambiguity Guardrail ---');
  const emptyContext: CoachContextState = { actionHistory: [] };
  action = await parser.parse('Change dinner.', emptyContext, profile, plan);
  assert(action.needsClarification === true, 'Test 9 Needs Clarification: true');
  result = await CoachActionExecutor.execute(action, profile, plan);
  assert(result.success === false, 'Test 9 Execution: paused for clarification');
  assert(result.userResponse.includes('Which day'), 'Test 9 Clarification Prompt: asks for day');
  console.log('Chat output snippet:\n' + result.userResponse + '\n');

  console.log('======================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5Tests();
