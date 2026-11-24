import React, { useState } from 'react';
import { useNutri } from '../../context/NutriContext';
import { Meal } from '../../types';
import {
  RotateCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  BarChart2,
  Edit2,
  FileText,
  Check,
  CreditCard,
  X,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { generateGroqMealPlanBriefing } from '../../services/groqService';

export const WeeklyPlannerView: React.FC = () => {
  const {
    weeklyPlan,
    replaceMeal,
    userProfile,
    updateProfile,
    sendMessage,
    hasSubscription,
    subscriptionPlan,
    openSubscriptionModal,
    setActiveTab,
    isComplete,
    generateUserMealPlan,
    addNotification,
    startPlanGeneration,
  } = useNutri();

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [activeMealDetail, setActiveMealDetail] = useState<Meal | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showEditTargetsModal, setShowEditTargetsModal] = useState<boolean>(false);
  const [showNutritionModal, setShowNutritionModal] = useState<boolean>(false);
  const [activeMenuMealId, setActiveMenuMealId] = useState<string | null>(null);

  // Targets state for editing
  const [editCalories, setEditCalories] = useState<number>(userProfile.dailyCalories || 2440);
  const [editProtein, setEditProtein] = useState<number>(userProfile.proteinGrams || 146);
  const [editCarbs, setEditCarbs] = useState<number>(userProfile.carbsGrams || 263);
  const [editFat, setEditFat] = useState<number>(userProfile.fatGrams || 72);

  // IF USER HAS NOT COMPLETED ONBOARDING OR PLAN IS NOT GENERATED -> SHOW SETUP PROMPT
  if (!isComplete || weeklyPlan.length === 0) {
    return (
      <div className="h-full overflow-y-auto bg-[#EEF2EE] text-[#1F3A30] font-tight select-none p-4 sm:p-7 flex items-center justify-center">
        <div className="max-w-xl w-full bg-[#F9FAF9] rounded-[32px] border border-[#CAD7CF] p-8 sm:p-10 shadow-xl space-y-6 text-center animate-scale-in">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#E2ECE5] border border-[#CAD7CF] flex items-center justify-center text-[#203D32] shadow-sm">
            <Sparkles className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#587263] uppercase tracking-wider bg-[#E5ECE7] px-3 py-1 rounded-full border border-[#D5E1D8]">
              Awaiting Onboarding Setup
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F3A30] tracking-tight">
              No Meal Plan Generated Yet
            </h1>
            <p className="text-xs sm:text-sm text-[#587263] max-w-md mx-auto leading-relaxed">
              Your personalized 7-day meal plan is crafted by AI only after assessing your goals, dietary preferences, and allergen profile during onboarding.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D5E1D8] text-left text-xs space-y-2.5 text-[#3E574B]">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#203D32] text-white flex items-center justify-center font-bold text-[10px]">1</span>
              <span>Complete your interactive setup in the Home Chat</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#203D32] text-white flex items-center justify-center font-bold text-[10px]">2</span>
              <span>Review your tailored BMR & macronutrient targets</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#203D32] text-white flex items-center justify-center font-bold text-[10px]">3</span>
              <span>Generate your adaptive 7-day schedule with chef deliveries</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('home')}
            className="w-full py-3.5 rounded-xl bg-[#203D32] hover:bg-[#183127] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span>Start Onboarding Setup in Chat →</span>
          </button>
        </div>
      </div>
    );
  }

  const activeDay = weeklyPlan[selectedDayIndex] || weeklyPlan[0] || {
    day: 'Monday',
    shortDay: 'Mon',
    date: 'Oct 6',
    totalCalories: 2440,
    totalProtein: 146,
    totalCarbs: 263,
    totalFat: 72,
    meals: [],
  };

  // Calculate day sums dynamically if meals exist
  const dayCalories = activeDay.meals.reduce((sum, m) => sum + (m.calories || 0), 0) || activeDay.totalCalories || 2440;
  const dayProtein = activeDay.meals.reduce((sum, m) => sum + (m.protein || 0), 0) || activeDay.totalProtein || 146;
  const dayCarbs = activeDay.meals.reduce((sum, m) => sum + (m.carbs || 0), 0) || activeDay.totalCarbs || 263;
  const dayFat = activeDay.meals.reduce((sum, m) => sum + (m.fat || 0), 0) || activeDay.totalFat || 72;

  // Macro percentages for Donut chart
  const totalMacroGrams = (dayProtein * 4) + (dayCarbs * 4) + (dayFat * 9) || 1;
  const proteinPct = Math.round(((dayProtein * 4) / totalMacroGrams) * 100) || 24;
  const carbsPct = Math.round(((dayCarbs * 4) / totalMacroGrams) * 100) || 43;
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct) || 27;

  // SVG Donut calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ~263.89
  const proteinStroke = (proteinPct / 100) * circumference;
  const carbsStroke = (carbsPct / 100) * circumference;
  const fatStroke = (fatPct / 100) * circumference;


  const handleSwap = (meal: Meal) => {
    replaceMeal(activeDay.day, meal.id);
    addNotification('Meal Swapped', `Replaced ${activeDay.day} ${meal.category} with a fresh recipe alternative.`, 'info');
    setActiveMenuMealId(null);
  };

  const handleGenerateNewPlan = () => {
    startPlanGeneration('Regenerate my entire weekly meal plan with fresh recipes');
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      dailyCalories: editCalories,
      proteinGrams: editProtein,
      carbsGrams: editCarbs,
      fatGrams: editFat,
    });
    setShowEditTargetsModal(false);
    addNotification('Targets Updated', 'Custom daily caloric and macronutrient targets calibrated.', 'info');
  };

  const defaultMealTimes: Record<string, string> = {
    Breakfast: '8:00 AM',
    Lunch: '1:00 PM',
    Snack: '4:00 PM',
    Dinner: '8:00 PM',
  };

  const defaultMealTags: Record<string, string[]> = {
    Breakfast: ['High Protein', 'Vegetarian'],
    Lunch: ['High Protein', 'Indian Classic'],
    Snack: ['High Protein', 'Quick'],
    Dinner: ['High Protein', 'Vegan'],
  };

  return (
    <div className="h-full overflow-y-auto bg-[#EEF2EE] text-[#1F3A30] font-tight select-none p-4 sm:p-7 space-y-6">

      {/* Top Header matching Screenshot */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F3A30] tracking-tight">
            Meal Plan
          </h1>
          <h2 className="text-sm sm:text-base font-semibold text-[#2F4B3E] mt-0.5">
            Your personalised 7-day meal plan
          </h2>
          <p className="text-xs text-[#587263] mt-0.5">
            Tailored to your goals, preferences and nutrition targets.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Navigator */}
          <div className="flex items-center gap-2 bg-white/90 border border-[#D5E1D8] rounded-xl px-3 py-1.5 shadow-2xs text-xs font-semibold text-[#1F3A30]">
            <button
              onClick={() => setSelectedDayIndex((prev) => (prev > 0 ? prev - 1 : 6))}
              className="p-1 hover:bg-[#E5ECE7] rounded-lg transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4 text-[#587263]" />
            </button>
            <span className="px-1 text-[#1F3A30] font-bold">Oct 6 – Oct 12, 2026</span>
            <button
              onClick={() => setSelectedDayIndex((prev) => (prev < 6 ? prev + 1 : 0))}
              className="p-1 hover:bg-[#E5ECE7] rounded-lg transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4 text-[#587263]" />
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={() => setSelectedDayIndex(0)}
            className="px-4 py-2 rounded-xl bg-[#E2ECE5] hover:bg-[#D4E2D8] border border-[#CAD7CF] text-[#1F3A30] font-semibold text-xs transition-colors cursor-pointer"
          >
            Today
          </button>

          {/* Generate New Plan Button */}
          <button
            disabled={isGenerating}
            onClick={handleGenerateNewPlan}
            className="px-4 py-2 rounded-xl bg-[#1C3B2E] hover:bg-[#152e24] text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-70"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>{isGenerating ? 'Generating...' : 'Generate New Plan'}</span>
          </button>

          {/* Subscription Plans Modal Trigger */}
          {hasSubscription ? (
            <button
              onClick={openSubscriptionModal}
              className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Manage Doorstep Delivery Subscription"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span className="capitalize">★ {subscriptionPlan || 'Pro'} Active</span>
            </button>
          ) : (
            <button
              onClick={openSubscriptionModal}
              className="px-4 py-2 rounded-xl bg-[#203D32] hover:bg-[#2B4E3F] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Subscribe Plan →</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Squircle Day Selector Row matching Screenshot */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 overflow-x-auto pb-1">
        {weeklyPlan.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          return (
            <button
              key={day.day}
              onClick={() => setSelectedDayIndex(idx)}
              className={`relative p-3.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between min-h-[76px] ${
                isSelected
                  ? 'bg-[#203D32] text-white shadow-md'
                  : 'bg-[#E5ECE7] hover:bg-[#DCE5DF] text-[#1F3A30] border border-[#D3DED6]'
              }`}
            >
              <div>
                <div
                  className={`text-xs font-bold leading-tight ${
                    isSelected ? 'text-white' : 'text-[#1F3A30]'
                  }`}
                >
                  {day.shortDay}
                </div>
                <div
                  className={`text-[11px] mt-0.5 ${
                    isSelected ? 'text-[#B8CCC0]' : 'text-[#587263]'
                  }`}
                >
                  {day.date || `Oct ${6 + idx}`}
                </div>
              </div>

              {/* Indicator Dot in Bottom Right */}
              <div className="flex justify-end">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-[#4ADE80]' : 'bg-[#529471]'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================== */}
        {/* LEFT COLUMN: DAY TIMELINE & MEAL CARDS (68% width)             */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 bg-[#F9FAF9] rounded-[26px] border border-[#D9E3DC] p-5 sm:p-6 shadow-xs space-y-6">
          {/* Day Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E1EAE3]">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F3A30]">
                {activeDay.day}, {activeDay.date || 'Oct 6'}
              </h2>
              <span className="bg-[#E1E9E3] text-[#203D32] px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                {dayCalories} kcal • {dayProtein}g Protein
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNutritionModal(true)}
                className="bg-[#E3EAE4] hover:bg-[#D5E0D7] text-[#1F3A30] text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-[#CAD7CF] transition-colors cursor-pointer"
              >
                <BarChart2 className="w-3.5 h-3.5 text-[#203D32]" />
                <span>View Nutrition Summary</span>
              </button>

              <button
                onClick={() => setShowEditTargetsModal(true)}
                className="w-8 h-8 rounded-xl bg-[#E3EAE4] hover:bg-[#D5E0D7] text-[#1F3A30] flex items-center justify-center border border-[#CAD7CF] transition-colors cursor-pointer"
                title="Options"
              >
                <MoreVertical className="w-4 h-4 text-[#587263]" />
              </button>
            </div>
          </div>

          {/* Vertical Timeline & Meal Cards */}
          <div className="space-y-6 relative pl-1 sm:pl-2">
            {activeDay.meals.map((meal, index) => {
              const timeString = meal.time || defaultMealTimes[meal.category] || '12:00 PM';
              const tagsList = meal.tags || defaultMealTags[meal.category] || [meal.tag || 'High Protein', 'Balanced'];
              const isMenuOpen = activeMenuMealId === meal.id;

              return (
                <div key={meal.id} className="relative flex items-start gap-4 sm:gap-6 group">
                  {/* Vertical Timeline Node */}
                  <div className="flex flex-col items-center w-16 sm:w-20 shrink-0 pt-1">
                    <div className="flex items-center gap-1.5 w-full">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#203D32] shrink-0" />
                      <span className="text-xs font-bold text-[#1F3A30] leading-none whitespace-nowrap">
                        {timeString}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-[#587263] mt-1 pl-4 self-start">
                      {meal.category}
                    </span>

                    {/* Connecting Vertical Line */}
                    {index < activeDay.meals.length - 1 && (
                      <div className="w-[1.5px] bg-[#CAD7CF] h-24 sm:h-20 self-start ml-[4px] mt-2" />
                    )}
                  </div>

                  {/* Meal Card Container */}
                  <div className="flex-1 bg-white rounded-2xl border border-[#E1E9E3] hover:border-[#CAD7CF] p-4 sm:p-4.5 shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Meal Info & Tags */}
                    <div className="space-y-1.5 flex-1 pr-2">
                      <h3 className="font-extrabold text-[15px] text-[#1F3A30] leading-snug">
                        {meal.name}
                      </h3>
                      <p className="text-xs text-[#587263] leading-relaxed line-clamp-2">
                        {meal.description}
                      </p>

                      {/* Tags Row */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {tagsList.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-[#E2ECE5] text-[#203D32] text-[11px] font-semibold px-2.5 py-0.5 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Macros & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E5EFE8]">
                      {/* Macro Pill Box */}
                      <div className="bg-[#EEF3EF] rounded-xl px-4 py-2 text-center min-w-[130px] shrink-0">
                        <div className="font-extrabold text-sm text-[#1F3A30]">
                          {meal.calories} kcal
                        </div>
                        <div className="font-mono text-[11px] font-semibold text-[#587263] mt-0.5">
                          P: {meal.protein}g &nbsp;C: {meal.carbs}g &nbsp;F: {meal.fat}g
                        </div>
                      </div>

                      {/* Swap Button */}
                      <button
                        onClick={() => handleSwap(meal)}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-[#F2F6F3] border border-[#D5E1D8] text-[#1F3A30] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        title="Swap with high-protein alternative"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-[#587263]" />
                        <span>Swap</span>
                      </button>

                      {/* More Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuMealId(isMenuOpen ? null : meal.id)}
                          className="w-8 h-8 rounded-xl text-[#587263] hover:text-[#1F3A30] hover:bg-[#E5ECE7] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-9 z-30 w-48 bg-white rounded-2xl shadow-xl border border-[#D5E1D8] p-1.5 animate-scale-in text-xs">
                            <button
                              onClick={() => {
                                setActiveMealDetail(meal);
                                setActiveMenuMealId(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#EEF3EF] text-[#1F3A30] font-semibold flex items-center gap-2"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#587263]" />
                              <span>View Recipe Details</span>
                            </button>
                            <button
                              onClick={() => {
                                sendMessage(`How can I prepare "${meal.name}" at home? Can you give me step-by-step instructions and cooking tips?`);
                                setActiveMenuMealId(null);
                                setActiveTab('home');
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#EEF3EF] text-[#1F3A30] font-semibold flex items-center gap-2 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-[#587263]" />
                              <span>Ask AI Instructions</span>
                            </button>
                            <button
                              onClick={() => handleSwap(meal)}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#EEF3EF] text-[#1F3A30] font-semibold flex items-center gap-2"
                            >
                              <RotateCw className="w-3.5 h-3.5 text-[#587263]" />
                              <span>Generate Variation</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: SUMMARY, GOALS & NOTES (32% width)              */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 space-y-5">
          {/* CARD 1: Daily Summary with SVG Donut Chart */}
          <div className="bg-[#F9FAF9] rounded-[26px] border border-[#D9E3DC] p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-[#1F3A30]">
              Daily Summary
            </h3>

            <div className="flex items-center gap-5">
              {/* SVG Circular Donut Chart */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#E5ECE7"
                    strokeWidth="12"
                  />
                  {/* Protein Slice (Dark Forest Green) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#203D32"
                    strokeWidth="12"
                    strokeDasharray={`${proteinStroke} ${circumference}`}
                    strokeDashoffset="0"
                    strokeLinecap="butt"
                  />
                  {/* Carbs Slice (Medium Sage) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#5E8E75"
                    strokeWidth="12"
                    strokeDasharray={`${carbsStroke} ${circumference}`}
                    strokeDashoffset={-proteinStroke}
                    strokeLinecap="butt"
                  />
                  {/* Fats Slice (Light Mint/Grey) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#CAD7CF"
                    strokeWidth="12"
                    strokeDasharray={`${fatStroke} ${circumference}`}
                    strokeDashoffset={-(proteinStroke + carbsStroke)}
                    strokeLinecap="butt"
                  />
                </svg>

                {/* Center Calories Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-extrabold text-lg sm:text-xl text-[#1F3A30] leading-none">
                    {dayCalories}
                  </span>
                  <span className="text-[10px] font-bold text-[#587263] mt-0.5">
                    kcal
                  </span>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="space-y-2 text-xs font-semibold flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#203D32]" />
                    <span className="text-[#1F3A30]">Protein</span>
                  </div>
                  <span className="font-mono text-[#587263]">
                    {dayProtein}g ({proteinPct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#5E8E75]" />
                    <span className="text-[#1F3A30]">Carbs</span>
                  </div>
                  <span className="font-mono text-[#587263]">
                    {dayCarbs}g ({carbsPct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#CAD7CF]" />
                    <span className="text-[#1F3A30]">Fats</span>
                  </div>
                  <span className="font-mono text-[#587263]">
                    {dayFat}g ({fatPct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Goals & Targets */}
          <div className="bg-[#F9FAF9] rounded-[26px] border border-[#D9E3DC] p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1F3A30]">
                Goals & Targets
              </h3>
              <button
                onClick={() => setShowEditTargetsModal(true)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#EEF3EF] border border-[#CAD7CF] text-[#1F3A30] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3 text-[#587263]" />
                <span>Edit</span>
              </button>
            </div>

            {/* 4 Stat Boxes Row */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-[#EEF3EF] rounded-xl p-2.5 text-center">
                <div className="font-extrabold text-[13px] sm:text-sm text-[#1F3A30]">
                  {userProfile.dailyCalories || 2440}
                </div>
                <div className="text-[10px] text-[#587263] font-medium mt-0.5">
                  Calories
                </div>
              </div>

              <div className="bg-[#EEF3EF] rounded-xl p-2.5 text-center">
                <div className="font-extrabold text-[13px] sm:text-sm text-[#1F3A30]">
                  {userProfile.proteinGrams || 146}g
                </div>
                <div className="text-[10px] text-[#587263] font-medium mt-0.5">
                  Protein
                </div>
              </div>

              <div className="bg-[#EEF3EF] rounded-xl p-2.5 text-center">
                <div className="font-extrabold text-[13px] sm:text-sm text-[#1F3A30]">
                  {userProfile.carbsGrams || 263}g
                </div>
                <div className="text-[10px] text-[#587263] font-medium mt-0.5">
                  Carbs
                </div>
              </div>

              <div className="bg-[#EEF3EF] rounded-xl p-2.5 text-center">
                <div className="font-extrabold text-[13px] sm:text-sm text-[#1F3A30]">
                  {userProfile.fatGrams || 72}g
                </div>
                <div className="text-[10px] text-[#587263] font-medium mt-0.5">
                  Fats
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: Notes matching Screenshot */}
          <div className="bg-[#F9FAF9] rounded-[26px] border border-[#D9E3DC] p-5 sm:p-6 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-[#1F3A30] font-extrabold text-base">
              <FileText className="w-4 h-4 text-[#203D32]" />
              <span>Notes</span>
            </div>
            <p className="text-xs text-[#587263] leading-relaxed">
              This plan is tailored to your goals and preferences. Meals are balanced across
              macros and include whole foods, high-protein options and easy-to-follow recipes.
            </p>
          </div>

          {/* Doorstep Delivery Quick Card */}
          <div className="bg-[#E5EFE8] rounded-[26px] border border-[#C5D8CC] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#3B5B4C]">
                Daily Doorstep Delivery
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  hasSubscription
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-[#D3E0D7] text-[#1F3A30]'
                }`}
              >
                {hasSubscription ? 'Active' : 'Locked'}
              </span>
            </div>
            <p className="text-xs text-[#2F4B3E]">
              {hasSubscription
                ? 'Your freshly prepped meals arrive daily in synchronized insulated containers.'
                : 'Unlock chef preparation and temperature-controlled daily doorstep deliveries.'}
            </p>
            <button
              onClick={() => {
                if (hasSubscription) {
                  setActiveTab('deliveries');
                } else {
                  openSubscriptionModal();
                }
              }}
              className="w-full py-2.5 rounded-xl bg-[#203D32] hover:bg-[#183127] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {hasSubscription ? 'View Deliveries Schedule →' : 'Unlock Doorstep Deliveries →'}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Targets Modal */}
      {showEditTargetsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F4F7F4] border border-[#CAD7CF] rounded-[28px] max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E1D8]">
              <h3 className="font-extrabold text-base text-[#1F3A30]">
                Calibrate Daily Macro Targets
              </h3>
              <button
                onClick={() => setShowEditTargetsModal(false)}
                className="w-8 h-8 rounded-full bg-[#CAD7CF] text-[#1F3A30] flex items-center justify-center hover:bg-[#BAC8BF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTargets} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#1F3A30] font-semibold mb-1">
                  Daily Calories (kcal)
                </label>
                <input
                  type="number"
                  value={editCalories}
                  onChange={(e) => setEditCalories(Number(e.target.value))}
                  className="w-full bg-white border border-[#CAD7CF] rounded-xl px-3.5 py-2.5 text-[#1F3A30] font-bold focus:outline-none focus:border-[#203D32]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#1F3A30] font-semibold mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={editProtein}
                    onChange={(e) => setEditProtein(Number(e.target.value))}
                    className="w-full bg-white border border-[#CAD7CF] rounded-xl px-3 py-2 text-[#1F3A30] font-bold focus:outline-none focus:border-[#203D32]"
                  />
                </div>
                <div>
                  <label className="block text-[#1F3A30] font-semibold mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={editCarbs}
                    onChange={(e) => setEditCarbs(Number(e.target.value))}
                    className="w-full bg-white border border-[#CAD7CF] rounded-xl px-3 py-2 text-[#1F3A30] font-bold focus:outline-none focus:border-[#203D32]"
                  />
                </div>
                <div>
                  <label className="block text-[#1F3A30] font-semibold mb-1">
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    value={editFat}
                    onChange={(e) => setEditFat(Number(e.target.value))}
                    className="w-full bg-white border border-[#CAD7CF] rounded-xl px-3 py-2 text-[#1F3A30] font-bold focus:outline-none focus:border-[#203D32]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D5E1D8]">
                <button
                  type="button"
                  onClick={() => setShowEditTargetsModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#CAD7CF] text-[#1F3A30] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#203D32] hover:bg-[#183127] text-white font-semibold shadow-xs"
                >
                  Save Targets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nutrition Summary Modal */}
      {showNutritionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F4F7F4] border border-[#CAD7CF] rounded-[28px] max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E1D8]">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#203D32]" />
                <h3 className="font-extrabold text-base text-[#1F3A30]">
                  {activeDay.day} Detailed Nutrition Breakdown
                </h3>
              </div>
              <button
                onClick={() => setShowNutritionModal(false)}
                className="w-8 h-8 rounded-full bg-[#CAD7CF] text-[#1F3A30] flex items-center justify-center hover:bg-[#BAC8BF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-white p-4 rounded-2xl border border-[#D5E1D8] flex items-center justify-between">
                <span className="font-bold text-[#1F3A30]">Total Caloric Intake</span>
                <span className="font-mono text-base font-extrabold text-[#203D32]">
                  {dayCalories} kcal
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-[#D5E1D8] text-center">
                  <span className="text-[11px] text-[#587263] block">Protein</span>
                  <span className="text-base font-extrabold text-[#1F3A30]">
                    {dayProtein}g
                  </span>
                  <span className="text-[10px] text-[#587263] block mt-0.5">
                    {proteinPct}% of total
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-[#D5E1D8] text-center">
                  <span className="text-[11px] text-[#587263] block">Carbohydrates</span>
                  <span className="text-base font-extrabold text-[#1F3A30]">
                    {dayCarbs}g
                  </span>
                  <span className="text-[10px] text-[#587263] block mt-0.5">
                    {carbsPct}% of total
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-[#D5E1D8] text-center">
                  <span className="text-[11px] text-[#587263] block">Healthy Fats</span>
                  <span className="text-base font-extrabold text-[#1F3A30]">
                    {dayFat}g
                  </span>
                  <span className="text-[10px] text-[#587263] block mt-0.5">
                    {fatPct}% of total
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#D5E1D8] space-y-2">
                <h4 className="font-bold text-[#1F3A30]">Nutritional Quality Index</h4>
                <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Zero refined sugars, low glycemic index whole grains, optimal essential amino acid profile.
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowNutritionModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#203D32] text-white font-semibold text-xs shadow-xs"
            >
              Close Summary
            </button>
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {activeMealDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F4F7F4] border border-[#CAD7CF] rounded-[28px] max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-start justify-between pb-3 border-b border-[#D5E1D8]">
              <div>
                <span className="bg-[#E1E9E3] text-[#203D32] px-2.5 py-0.5 rounded-md text-[11px] font-bold">
                  {activeMealDetail.category}
                </span>
                <h3 className="text-lg font-extrabold text-[#1F3A30] mt-1.5">
                  {activeMealDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveMealDetail(null)}
                className="w-8 h-8 rounded-full bg-[#CAD7CF] text-[#1F3A30] flex items-center justify-center hover:bg-[#BAC8BF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#587263] leading-relaxed">
              {activeMealDetail.description}
            </p>

            <div className="p-4 rounded-2xl bg-white border border-[#D5E1D8] space-y-2">
              <span className="text-xs font-bold text-[#1F3A30] block">Ingredients:</span>
              <div className="flex flex-wrap gap-1.5">
                {activeMealDetail.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-[#EEF3EF] text-[#1F3A30] text-[11px] font-semibold border border-[#D5E1D8]"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs bg-white p-3.5 rounded-2xl border border-[#D5E1D8]">
              <span className="font-bold text-[#1F3A30]">Macronutrient Content:</span>
              <span className="font-mono text-[#587263] font-bold">
                {activeMealDetail.calories} kcal | P: {activeMealDetail.protein}g C:{' '}
                {activeMealDetail.carbs}g F: {activeMealDetail.fat}g
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveMealDetail(null)}
                className="px-4 py-2 rounded-xl border border-[#CAD7CF] hover:bg-[#EEF3EF] text-[#1F3A30] font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  sendMessage(
                    `Can you give me the step-by-step cooking recipe and preparation instructions for "${activeMealDetail.name}"?`
                  );
                  setActiveMealDetail(null);
                  setActiveTab('home');
                }}
                className="px-4 py-2 rounded-xl bg-[#203D32] hover:bg-[#183127] text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask AI Instructions & Recipe</span>
              </button>
              <button
                onClick={() => {
                  sendMessage(
                    `I love ${activeMealDetail.name}! Keep similar recipes in my upcoming meal plans.`
                  );
                  setActiveMealDetail(null);
                  addNotification('Favorite Saved', 'Preference noted for future meal recommendations.', 'info');
                }}
                className="px-4 py-2 rounded-xl bg-[#E2ECE5] hover:bg-[#D4E2D8] border border-[#CAD7CF] text-[#1F3A30] font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                Save as Favorite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
