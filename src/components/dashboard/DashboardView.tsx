import React, { useState, useMemo, useEffect } from 'react';
import { useNutri } from '../../context/NutriContext';
import {
  Flame,
  Leaf,
  Droplet,
  Footprints,
  Check,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Target,
  Pencil,
  Plus,
  Minus,
  UtensilsCrossed,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    userProfile,
    weeklyPlan,
    chatThreads,
    setActiveTab,
    setActiveArtifact,
    setActiveThreadId,
    isComplete,
  } = useNutri();

  // ---------------- STATE & CONTROLS ----------------
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [macroFilter, setMacroFilter] = useState<'Calories' | 'Protein' | 'Carbs' | 'Fats'>('Calories');
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M' | 'All'>('1W');

  // Track checked / eaten meals in localStorage
  const [eatenMealIds, setEatenMealIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nutriai_eaten_meals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track water intake (liters)
  const [waterLiters, setWaterLiters] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nutriai_water_liters');
      return saved !== null ? parseFloat(saved) : 2.1;
    } catch {
      return 2.1;
    }
  });

  // Track steps count
  const [stepsCount, setStepsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nutriai_steps_count');
      return saved !== null ? parseInt(saved, 10) : 8420;
    } catch {
      return 8420;
    }
  });

  // Track streak days
  const streakDays = 12;

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('nutriai_eaten_meals', JSON.stringify(eatenMealIds));
  }, [eatenMealIds]);

  useEffect(() => {
    localStorage.setItem('nutriai_water_liters', waterLiters.toString());
  }, [waterLiters]);

  useEffect(() => {
    localStorage.setItem('nutriai_steps_count', stepsCount.toString());
  }, [stepsCount]);

  // ---------------- PRE-ONBOARDING EMPTY STATE ----------------
  // If user has not finished onboarding or plan is empty, show transparent empty state
  if (!isComplete || weeklyPlan.length === 0) {
    return (
      <div className="h-full overflow-y-auto bg-[#E9EFEA] text-[#183428] font-tight select-none p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-[32px] border border-[#DEE6E0] p-8 sm:p-10 shadow-[0_12px_40px_-10px_rgba(25,50,38,0.08)] space-y-6 text-center animate-scale-in">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#EAF5EE] border border-[#CAD7CF] flex items-center justify-center text-[#2F7D4A] shadow-xs">
            <Sparkles className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#5E776B] uppercase tracking-wider bg-[#EDF4F0] px-3.5 py-1 rounded-full border border-[#DCE4DE]">
              Awaiting Onboarding Setup
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#183428] tracking-tight">
              Dashboard Awaiting Calibration
            </h1>
            <p className="text-xs sm:text-sm text-[#5E776B] max-w-md mx-auto leading-relaxed">
              Start your onboarding in the Home Chat to calibrate your real metabolic targets, BMR, and macronutrient schedules. Your live telemetry and meal logs will activate here.
            </p>
          </div>

          <div className="p-4.5 rounded-2xl bg-[#F8FAF8] border border-[#E2E8E3] text-left text-xs space-y-2.5 text-[#3E574B]">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#183428] text-white flex items-center justify-center font-bold text-[10px]">1</span>
              <span>Answer onboarding questions in the Home Chat</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#183428] text-white flex items-center justify-center font-bold text-[10px]">2</span>
              <span>Review your tailored Mifflin-St Jeor daily calories & macros</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#183428] text-white flex items-center justify-center font-bold text-[10px]">3</span>
              <span>Unlock live telemetry, meal logging, and daily streak tracking</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('home')}
            className="w-full h-12 rounded-2xl bg-[#183428] hover:bg-[#234B3A] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Start Onboarding Plan in Chat →</span>
          </button>
        </div>
      </div>
    );
  }

  // ---------------- ACTIVE DAY DATA ----------------
  const currentDayPlan = weeklyPlan[selectedDayIndex] || weeklyPlan[0];
  const dayMeals = currentDayPlan?.meals || [];

  // Default meal slot mappings
  const breakfast = dayMeals.find((m) => m.category === 'Breakfast') || {
    id: `bf-${selectedDayIndex}`,
    name: 'Greek Yogurt Parfait',
    category: 'Breakfast' as const,
    calories: 450,
    protein: 38,
    carbs: 52,
    fat: 14,
    prepTime: '10 min',
    tag: 'High Protein',
    description: '',
    ingredients: [],
  };

  const lunch = dayMeals.find((m) => m.category === 'Lunch') || {
    id: `lu-${selectedDayIndex}`,
    name: 'Tempeh Teriyaki Stir-Fry',
    category: 'Lunch' as const,
    calories: 690,
    protein: 40,
    carbs: 78,
    fat: 18,
    prepTime: '20 min',
    tag: 'Balanced',
    description: '',
    ingredients: [],
  };

  const snack = dayMeals.find((m) => m.category === 'Snack') || {
    id: `sn-${selectedDayIndex}`,
    name: 'Cottage Cheese & Peaches',
    category: 'Snack' as const,
    calories: 340,
    protein: 28,
    carbs: 36,
    fat: 8,
    prepTime: '5 min',
    tag: 'Protein Rich',
    description: '',
    ingredients: [],
  };

  const dinner = dayMeals.find((m) => m.category === 'Dinner') || {
    id: `di-${selectedDayIndex}`,
    name: 'Paneer Tikka Rice Bowl',
    category: 'Dinner' as const,
    calories: 720,
    protein: 41,
    carbs: 76,
    fat: 24,
    prepTime: '25 min',
    tag: 'Chef Prepared',
    description: '',
    ingredients: [],
  };

  const scheduledSlots = [
    { time: '8:00 AM', slot: 'Breakfast', meal: breakfast },
    { time: '1:00 PM', slot: 'Lunch', meal: lunch },
    { time: '4:00 PM', slot: 'Snack', meal: snack },
    { time: '7:45 PM', slot: 'Dinner', meal: dinner },
  ];

  // Auto-seed initial 3 eaten meals on first view if list is empty
  const activeEatenIds = useMemo(() => {
    if (eatenMealIds.length === 0) {
      return [breakfast.id, lunch.id, snack.id];
    }
    return eatenMealIds;
  }, [eatenMealIds, breakfast.id, lunch.id, snack.id]);

  const toggleMealEaten = (mealId: string) => {
    setEatenMealIds((prev) => {
      const current = prev.length === 0 ? [breakfast.id, lunch.id, snack.id] : prev;
      if (current.includes(mealId)) {
        return current.filter((id) => id !== mealId);
      } else {
        return [...current, mealId];
      }
    });
  };

  // ---------------- CALORIES & MACROS CONSUMED COMPUTATION ----------------
  const consumedMeals = scheduledSlots
    .filter((item) => activeEatenIds.includes(item.meal.id))
    .map((item) => item.meal);

  const consumedCalories = consumedMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const consumedProtein = consumedMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const consumedCarbs = consumedMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const consumedFats = consumedMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

  // Targets from userProfile
  const targetCalories = userProfile.dailyCalories || 2440;
  const targetProtein = userProfile.proteinGrams || 146;
  const targetCarbs = userProfile.carbsGrams || 260;
  const targetFats = userProfile.fatGrams || 70;
  const targetWater = 3.0;
  const targetSteps = 10000;

  // Percentage calculations
  const caloriePct = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));
  const proteinPct = Math.min(100, Math.round((consumedProtein / targetProtein) * 100));
  const waterPct = Math.min(100, Math.round((waterLiters / targetWater) * 100));
  const stepsPct = Math.min(100, Math.round((stepsCount / targetSteps) * 100));

  // Macronutrient percentage of total consumed grams
  const totalMacroGrams = Math.max(consumedProtein + consumedCarbs + consumedFats, 1);
  const proteinShare = Math.round((consumedProtein / totalMacroGrams) * 100);
  const carbsShare = Math.round((consumedCarbs / totalMacroGrams) * 100);
  const fatsShare = Math.round((consumedFats / totalMacroGrams) * 100);

  // ---------------- HOURLY BAR CHART DATA (6AM to 9PM) ----------------
  const hourlyBars = [
    { label: '6AM', kcal: 0 },
    { label: '9AM', kcal: activeEatenIds.includes(breakfast.id) ? breakfast.calories : 0, maxKcal: breakfast.calories },
    { label: '12PM', kcal: activeEatenIds.includes(lunch.id) ? lunch.calories : 0, maxKcal: lunch.calories },
    { label: '3PM', kcal: activeEatenIds.includes(snack.id) ? snack.calories : 0, maxKcal: snack.calories },
    { label: '6PM', kcal: 0 },
    { label: '9PM', kcal: activeEatenIds.includes(dinner.id) ? dinner.calories : 0, maxKcal: dinner.calories },
  ];

  // ---------------- RECENT CHATS ----------------
  const recentThreads = chatThreads.filter((t) => !t.isPinned).slice(0, 3);

  return (
    <div className="h-full overflow-y-auto bg-[#E9EFEA] text-[#183428] font-tight select-none p-3.5 sm:p-6 lg:p-7 space-y-5">
      {/* ============================================================== */}
      {/* 1. TOP ROW: 4 METRIC CARDS + CURRENT STREAK CARD               */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4">
        {/* Metric 1: Calories */}
        <div className="md:col-span-3 sm:col-span-6 bg-white rounded-[24px] border border-[#DEE6E0] p-4.5 sm:p-5 shadow-[0_4px_20px_-4px_rgba(25,50,38,0.03)] flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-full bg-[#FDEEE9] flex items-center justify-center text-[#E06738]">
              <Flame className="w-4 h-4 fill-[#E06738]" />
            </div>
            <span className="text-xs font-semibold text-[#5E776B]">Calories</span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-2xl sm:text-[26px] font-black text-[#183428] tracking-tight">
                {consumedCalories}
              </span>
              <span className="text-xs font-semibold text-[#6E8578] ml-1">/ {targetCalories}</span>
            </div>
            <span className="text-xs font-bold text-[#6E8578]">{caloriePct}%</span>
          </div>

          <div className="h-2 rounded-full bg-[#F5E6DF] overflow-hidden">
            <div
              className="h-full bg-[#E06738] rounded-full transition-all duration-500"
              style={{ width: `${caloriePct}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Protein */}
        <div className="md:col-span-3 sm:col-span-6 bg-white rounded-[24px] border border-[#DEE6E0] p-4.5 sm:p-5 shadow-[0_4px_20px_-4px_rgba(25,50,38,0.03)] flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-full bg-[#EAF5EE] flex items-center justify-center text-[#2F7D4A]">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#5E776B]">Protein</span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-2xl sm:text-[26px] font-black text-[#183428] tracking-tight">
                {consumedProtein}
              </span>
              <span className="text-xs font-semibold text-[#6E8578] ml-1">/ {targetProtein} g</span>
            </div>
            <span className="text-xs font-bold text-[#6E8578]">{proteinPct}%</span>
          </div>

          <div className="h-2 rounded-full bg-[#E0ECE5] overflow-hidden">
            <div
              className="h-full bg-[#1F4E3A] rounded-full transition-all duration-500"
              style={{ width: `${proteinPct}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Water */}
        <div className="md:col-span-2 sm:col-span-6 bg-white rounded-[24px] border border-[#DEE6E0] p-4.5 sm:p-5 shadow-[0_4px_20px_-4px_rgba(25,50,38,0.03)] flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#EBF3FC] flex items-center justify-center text-[#2F74C0]">
                <Droplet className="w-4 h-4 fill-[#2F74C0]" />
              </div>
              <span className="text-xs font-semibold text-[#5E776B]">Water</span>
            </div>

            {/* Quick add water button */}
            <button
              onClick={() => setWaterLiters((prev) => Math.min(5, parseFloat((prev + 0.25).toFixed(2))))}
              title="Add 250ml"
              className="w-5 h-5 rounded-full bg-[#EBF3FC] hover:bg-[#D8E9F8] text-[#2F74C0] flex items-center justify-center text-[11px] font-bold transition-colors cursor-pointer"
            >
              +
            </button>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-2xl sm:text-[26px] font-black text-[#2662A6] tracking-tight">
                {waterLiters.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-[#6E8578] ml-1">/ {targetWater} L</span>
            </div>
            <span className="text-xs font-bold text-[#6E8578]">{waterPct}%</span>
          </div>

          <div className="h-2 rounded-full bg-[#DEEBF7] overflow-hidden">
            <div
              className="h-full bg-[#2B6CB0] rounded-full transition-all duration-500"
              style={{ width: `${waterPct}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Steps */}
        <div className="md:col-span-2 sm:col-span-6 bg-white rounded-[24px] border border-[#DEE6E0] p-4.5 sm:p-5 shadow-[0_4px_20px_-4px_rgba(25,50,38,0.03)] flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#EDF4F0] flex items-center justify-center text-[#346E52]">
                <Footprints className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#5E776B]">Steps</span>
            </div>

            {/* Quick add steps button */}
            <button
              onClick={() => setStepsCount((prev) => prev + 500)}
              title="Add 500 steps"
              className="w-5 h-5 rounded-full bg-[#EDF4F0] hover:bg-[#DEEBE4] text-[#346E52] flex items-center justify-center text-[11px] font-bold transition-colors cursor-pointer"
            >
              +
            </button>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-2xl sm:text-[26px] font-black text-[#183428] tracking-tight">
                {stepsCount.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-[#6E8578] ml-0.5">/ 10,000</span>
            </div>
            <span className="text-xs font-bold text-[#6E8578]">{stepsPct}%</span>
          </div>

          <div className="h-2 rounded-full bg-[#DFEBE4] overflow-hidden">
            <div
              className="h-full bg-[#2A6648] rounded-full transition-all duration-500"
              style={{ width: `${stepsPct}%` }}
            />
          </div>
        </div>

        {/* Metric 5: Current Streak Card (Right) */}
        <div className="md:col-span-2 sm:col-span-12 bg-[#133225] rounded-[24px] border border-[#1C4232] p-4.5 sm:p-5 text-white shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1B4232] flex items-center justify-center text-emerald-400">
                <Flame className="w-4 h-4 fill-emerald-400" />
              </div>
              <span className="text-[11px] font-semibold text-[#A8C7B5]">Current Streak</span>
            </div>
            <button
              onClick={() => setActiveTab('meals')}
              className="w-6 h-6 rounded-full bg-[#1F4635] hover:bg-[#285A44] flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="my-1.5">
            <div className="text-2xl sm:text-[26px] font-black text-white tracking-tight">
              {streakDays} days
            </div>
          </div>

          {/* Days Weekdays Ring */}
          <div className="flex items-center justify-between pt-1 font-mono text-[9.5px] text-[#A8C7B5]">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayLetter, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span>{dayLetter}</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full flex items-center justify-center ${
                    idx < 6
                      ? 'bg-emerald-400/90 ring-2 ring-emerald-500/30'
                      : 'border border-[#A8C7B5]/60'
                  }`}
                >
                  {idx < 6 && <span className="w-1 h-1 rounded-full bg-[#133225]" />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MIDDLE ROW: TODAY'S PLAN | TODAY'S NUTRITION | AI & CHATS    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ---------------- 2A. TODAY'S PLAN (LEFT 5 COLS) ---------------- */}
        <div className="lg:col-span-5 bg-white rounded-[26px] border border-[#DEE6E0] p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(25,50,38,0.04)] flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-black text-[#183428]">Today's Plan</h2>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#F0F5F1] text-xs font-semibold text-[#183428]">
                <button
                  onClick={() => setSelectedDayIndex((prev) => (prev > 0 ? prev - 1 : weeklyPlan.length - 1))}
                  className="p-0.5 hover:text-emerald-700 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11.5px] font-bold">
                  {currentDayPlan?.shortDay || 'Wed'}, Oct {8 + selectedDayIndex}, 2026
                </span>
                <button
                  onClick={() => setSelectedDayIndex((prev) => (prev < weeklyPlan.length - 1 ? prev + 1 : 0))}
                  className="p-0.5 hover:text-emerald-700 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setSelectedDayIndex(0)}
                className="px-2.5 py-1 rounded-xl bg-[#F0F5F1] hover:bg-[#E3EBE5] text-[11px] font-bold text-[#183428] transition-colors cursor-pointer"
              >
                Today
              </button>
            </div>
          </div>

          {/* Connected Vertical Timeline */}
          <div className="relative pl-6 space-y-5 my-auto">
            {/* Vertical spine line */}
            <div className="absolute left-[9px] top-2 bottom-3 w-[2px] bg-[#E3EBE5]" />

            {scheduledSlots.map((item, idx) => {
              const isChecked = activeEatenIds.includes(item.meal.id);

              return (
                <div key={item.slot} className="relative flex items-start justify-between group">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-[20px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white transition-colors ${
                      isChecked ? 'bg-[#183428]' : 'bg-[#CAD7CF]'
                    }`}
                  />

                  {/* Meal Content */}
                  <div className="pr-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-[#6E8578] font-bold">
                      <span className="font-mono text-[#183428]">{item.time}</span>
                      <span>{item.slot}</span>
                    </div>

                    <h4 className="text-[13.5px] sm:text-[14.5px] font-black text-[#183428] truncate mt-0.5">
                      {item.meal.name}
                    </h4>

                    <div className="text-[11px] text-[#6E8578] font-mono mt-0.5 flex flex-wrap gap-x-1.5">
                      <span className="font-bold text-[#183428]">{item.meal.calories} kcal</span>
                      <span>•</span>
                      <span>{item.meal.protein}g Protein</span>
                      <span>•</span>
                      <span>{item.meal.carbs}g Carbs</span>
                      <span>•</span>
                      <span>{item.meal.fat}g Fats</span>
                    </div>
                  </div>

                  {/* Checkbox and Chevron Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleMealEaten(item.meal.id)}
                      title={isChecked ? 'Mark as not eaten' : 'Mark as eaten'}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#183428] text-white shadow-2xs'
                          : 'border border-[#CAD7CF] text-transparent hover:border-[#183428]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('meals');
                        setActiveArtifact('weekly_meal_plan');
                      }}
                      className="text-[#9DB3A6] hover:text-[#183428] p-1 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Full-Width CTA */}
          <button
            onClick={() => {
              setActiveTab('meals');
              setActiveArtifact('weekly_meal_plan');
            }}
            className="w-full mt-5 py-3 rounded-2xl bg-[#1A382A] hover:bg-[#244C3A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>View Full 7-Day Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ---------------- 2B. TODAY'S NUTRITION (CENTER 4 COLS) ---------------- */}
        <div className="lg:col-span-4 bg-white rounded-[26px] border border-[#DEE6E0] p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(25,50,38,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-black text-[#183428]">Today's Nutrition</h2>
          </div>

          {/* Radial Gauge / Donut Diagram */}
          <div className="flex items-center justify-center gap-6 py-2 my-auto">
            {/* SVG Donut */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
                {/* Background Ring */}
                <circle cx="64" cy="64" r="50" fill="none" stroke="#EDF2EE" strokeWidth="14" />
                {/* Protein Arc (Green) */}
                <circle
                  cx="64"
                  cy="64"
                  r="50"
                  fill="none"
                  stroke="#2F7D4A"
                  strokeWidth="14"
                  strokeDasharray={`${(proteinShare / 100) * 314} 314`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                {/* Carbs Arc (Gold/Amber) */}
                <circle
                  cx="64"
                  cy="64"
                  r="50"
                  fill="none"
                  stroke="#E08528"
                  strokeWidth="14"
                  strokeDasharray={`${(carbsShare / 100) * 314} 314`}
                  strokeDashoffset={`-${(proteinShare / 100) * 314}`}
                />
                {/* Fats Arc (Rust) */}
                <circle
                  cx="64"
                  cy="64"
                  r="50"
                  fill="none"
                  stroke="#964B1D"
                  strokeWidth="14"
                  strokeDasharray={`${(fatsShare / 100) * 314} 314`}
                  strokeDashoffset={`-${((proteinShare + carbsShare) / 100) * 314}`}
                />
              </svg>

              {/* Center Callout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-[#183428] tracking-tight">{consumedCalories}</span>
                <span className="text-[10.5px] font-semibold text-[#6E8578]">kcal</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2F7D4A]" />
                <span className="text-[#5E776B]">Protein</span>
                <span className="font-bold text-[#183428] ml-auto">{consumedProtein}g ({proteinShare}%)</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E08528]" />
                <span className="text-[#5E776B]">Carbs</span>
                <span className="font-bold text-[#183428] ml-auto">{consumedCarbs}g ({carbsShare}%)</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#964B1D]" />
                <span className="text-[#5E776B]">Fats</span>
                <span className="font-bold text-[#183428] ml-auto">{consumedFats}g ({fatsShare}%)</span>
              </div>
            </div>
          </div>

          {/* Macro Toggle Filter Pills */}
          <div className="flex items-center justify-between p-1 rounded-xl bg-[#F0F5F1] my-2 text-xs font-bold text-[#5E776B]">
            {(['Calories', 'Protein', 'Carbs', 'Fats'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setMacroFilter(filter)}
                className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                  macroFilter === filter
                    ? 'bg-[#183428] text-white shadow-xs'
                    : 'hover:text-[#183428]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Hourly Calorie Distribution Bar Chart (6AM - 9PM) */}
          <div className="pt-2">
            <div className="h-28 flex items-end justify-between gap-2 px-2 border-b border-[#E3EBE5] pb-1">
              {hourlyBars.map((bar) => {
                const maxVal = 900;
                const fillHeight = Math.max(8, Math.round((bar.kcal / maxVal) * 100));

                return (
                  <div key={bar.label} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[9.5px] font-mono text-[#6E8578] opacity-0 group-hover:opacity-100 transition-opacity">
                      {bar.kcal}
                    </span>
                    <div className="w-full max-w-[24px] h-20 bg-[#EDF3EF] rounded-t-lg flex items-end overflow-hidden">
                      <div
                        className="w-full bg-[#183428] rounded-t-lg transition-all duration-500 group-hover:bg-[#2F7D4A]"
                        style={{ height: `${fillHeight}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X Axis Time Labels */}
            <div className="flex justify-between px-2 pt-1.5 font-mono text-[9.5px] text-[#6E8578]">
              {hourlyBars.map((bar) => (
                <span key={bar.label}>{bar.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- 2C. RIGHT COLUMN: AI COACH + RECENT CHATS (3 COLS) ---------------- */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Card 1: AI Coach Recommendation */}
          <div className="bg-white rounded-[26px] border border-[#DEE6E0] p-5 shadow-[0_4px_24px_-4px_rgba(25,50,38,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-bold text-sm text-[#183428]">
                <Sparkles className="w-4 h-4 text-[#E08528]" />
                <span>AI Coach</span>
              </div>
              <button
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-1 text-[11px] font-bold text-[#183428] px-2.5 py-1 rounded-xl bg-[#F0F5F1] hover:bg-[#E3EBE5] transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Chat</span>
              </button>
            </div>

            <button
              onClick={() => setActiveTab('home')}
              className="p-3.5 rounded-2xl bg-[#F9FAF9] border border-[#E8EEE9] hover:border-[#CAD7CF] text-left transition-all flex items-start gap-3 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-xl bg-[#EAF5EE] text-[#2F7D4A] flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#2A4638] leading-relaxed">
                  You're <strong>{caloriePct}%</strong> to your calorie goal! Try to add a high-protein dinner to complete your target.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#9DB3A6] group-hover:text-[#183428] shrink-0 mt-0.5 transition-colors" />
            </button>
          </div>

          {/* Card 2: Recent Chats */}
          <div className="bg-white rounded-[26px] border border-[#DEE6E0] p-5 shadow-[0_4px_24px_-4px_rgba(25,50,38,0.04)] flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#183428]">Recent Chats</h3>
              <button
                onClick={() => setActiveTab('home')}
                className="text-[11px] font-bold text-[#183428] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentThreads.length > 0 ? (
                recentThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      setActiveTab('home');
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-[#F4F8F5] text-left transition-colors flex items-start gap-2.5 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#F0F5F1] group-hover:bg-[#E2ECE5] flex items-center justify-center text-[#183428] shrink-0 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-[#183428] truncate group-hover:text-emerald-900">
                        {thread.title}
                      </h5>
                      <span className="text-[10px] text-[#7A9988] font-mono">{thread.time}</span>
                    </div>
                  </button>
                ))
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="w-full p-2.5 rounded-xl hover:bg-[#F4F8F5] text-left transition-colors flex items-start gap-2.5 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#F0F5F1] flex items-center justify-center text-[#183428] shrink-0 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-[#183428] truncate">High protein breakfast ideas</h5>
                      <span className="text-[10px] text-[#7A9988] font-mono">Today, 4:12 PM</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="w-full p-2.5 rounded-xl hover:bg-[#F4F8F5] text-left transition-colors flex items-start gap-2.5 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#F0F5F1] flex items-center justify-center text-[#183428] shrink-0 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-[#183428] truncate">Can I swap dinner with lunch?</h5>
                      <span className="text-[10px] text-[#7A9988] font-mono">Today, 11:03 AM</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="w-full p-2.5 rounded-xl hover:bg-[#F4F8F5] text-left transition-colors flex items-start gap-2.5 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#F0F5F1] flex items-center justify-center text-[#183428] shrink-0 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-[#183428] truncate">Best snacks for muscle gain</h5>
                      <span className="text-[10px] text-[#7A9988] font-mono">Yesterday, 8:45 PM</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. BOTTOM ROW: BODY PROGRESS | GOALS                            */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ---------------- 3A. BODY PROGRESS (LEFT 8 COLS) ---------------- */}
        <div className="lg:col-span-8 bg-white rounded-[26px] border border-[#DEE6E0] p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(25,50,38,0.04)] flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#183428]" />
              <h2 className="text-lg sm:text-xl font-black text-[#183428]">Body Progress</h2>
            </div>

            {/* Time Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F0F5F1] text-xs font-bold text-[#5E776B]">
              {(['1W', '1M', '3M', 'All'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    timeRange === range
                      ? 'bg-[#183428] text-white shadow-xs'
                      : 'hover:text-[#183428]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Sparkline Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            {/* 1. Weight */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#5E776B]">Weight</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-[26px] font-black text-[#183428]">
                  {(userProfile.weightKg || 87.0).toFixed(1)} <span className="text-sm font-semibold">kg</span>
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center">
                  ↓ 0.8 kg
                </span>
              </div>

              {/* Sparkline curve */}
              <div className="h-12 w-full pt-1">
                <svg viewBox="0 0 100 36" className="w-full h-full overflow-visible">
                  <path
                    d="M 0,26 Q 20,24 40,28 T 70,18 T 100,24"
                    fill="none"
                    stroke="#183428"
                    strokeWidth="2.2"
                  />
                  <circle cx="0" cy="26" r="2.5" fill="#183428" />
                  <circle cx="40" cy="28" r="2.5" fill="#183428" />
                  <circle cx="70" cy="18" r="2.5" fill="#183428" />
                  <circle cx="100" cy="24" r="2.5" fill="#183428" />
                </svg>
              </div>
            </div>

            {/* 2. Body Fat (Est.) */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#5E776B]">Body Fat (Est.)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-[26px] font-black text-[#183428]">
                  18.2 <span className="text-sm font-semibold">%</span>
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center">
                  ↓ 1.4%
                </span>
              </div>

              {/* Sparkline curve */}
              <div className="h-12 w-full pt-1">
                <svg viewBox="0 0 100 36" className="w-full h-full overflow-visible">
                  <path
                    d="M 0,28 Q 25,29 50,22 T 80,26 T 100,28"
                    fill="none"
                    stroke="#183428"
                    strokeWidth="2.2"
                  />
                  <circle cx="0" cy="28" r="2.5" fill="#183428" />
                  <circle cx="50" cy="22" r="2.5" fill="#183428" />
                  <circle cx="80" cy="26" r="2.5" fill="#183428" />
                  <circle cx="100" cy="28" r="2.5" fill="#183428" />
                </svg>
              </div>
            </div>

            {/* 3. Muscle Mass (Est.) */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#5E776B]">Muscle Mass (Est.)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-[26px] font-black text-[#183428]">
                  67.1 <span className="text-sm font-semibold">kg</span>
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center">
                  ↑ 1.2 kg
                </span>
              </div>

              {/* Sparkline curve */}
              <div className="h-12 w-full pt-1">
                <svg viewBox="0 0 100 36" className="w-full h-full overflow-visible">
                  <path
                    d="M 0,28 Q 30,26 60,18 T 100,10"
                    fill="none"
                    stroke="#183428"
                    strokeWidth="2.2"
                  />
                  <circle cx="0" cy="28" r="2.5" fill="#183428" />
                  <circle cx="60" cy="18" r="2.5" fill="#183428" />
                  <circle cx="100" cy="10" r="2.5" fill="#183428" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- 3B. GOALS (RIGHT 4 COLS) ---------------- */}
        <div className="lg:col-span-4 bg-white rounded-[26px] border border-[#DEE6E0] p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(25,50,38,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#183428]" />
              <h2 className="text-lg sm:text-xl font-black text-[#183428]">Goals</h2>
            </div>
            <button
              onClick={() => setActiveTab('home')}
              className="px-2.5 py-1 rounded-xl bg-[#F0F5F1] hover:bg-[#E3EBE5] text-[11px] font-bold text-[#183428] transition-colors cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="space-y-4 my-auto">
            {/* Goal 1: Calories */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#183428] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="font-bold text-[#183428]">Hit {targetCalories} kcal daily</span>
                </div>
                <span className="font-bold text-[#6E8578]">{caloriePct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#E0ECE5] overflow-hidden">
                <div
                  className="h-full bg-[#183428] rounded-full transition-all duration-500"
                  style={{ width: `${caloriePct}%` }}
                />
              </div>
            </div>

            {/* Goal 2: Protein */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#183428] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="font-bold text-[#183428]">Consume {targetProtein}g protein</span>
                </div>
                <span className="font-bold text-[#6E8578]">{proteinPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#E0ECE5] overflow-hidden">
                <div
                  className="h-full bg-[#183428] rounded-full transition-all duration-500"
                  style={{ width: `${proteinPct}%` }}
                />
              </div>
            </div>

            {/* Goal 3: Consistency Streak */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#183428] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="font-bold text-[#183428]">Stay consistent for 30 days</span>
                </div>
                <span className="font-bold text-[#6E8578]">40%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#E0ECE5] overflow-hidden">
                <div className="h-full bg-[#183428] rounded-full" style={{ width: '40%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
