import React, { useState } from 'react';
import { useNutri } from '../../context/NutriContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Meal } from '../../types';
import {
  Calendar,
  RotateCw,
  Sparkles,
  Clock,
  Flame,
  ChevronRight,
} from 'lucide-react';

export const WeeklyMealPlanArtifact: React.FC = () => {
  const { weeklyPlan, replaceMeal, sendMessage, userProfile, setActiveTab } = useNutri();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeDay = weeklyPlan[selectedDayIndex] || weeklyPlan[0];

  const handleSwapClick = (meal: Meal) => {
    replaceMeal(activeDay.day, meal.id);
    setToastMessage(`✨ ${activeDay.day} ${meal.category} updated with candidate replacement.`);
    setTimeout(() => setToastMessage(null), 3500);
    sendMessage(`Swap my ${activeDay.day} ${meal.category} (${meal.name}) with another high protein option.`);
  };

  return (
    <div className="space-y-4 animate-fade-in relative">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-brand-600 text-white px-4 py-3 rounded-xl font-bold text-xs shadow-glow-emerald animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> {toastMessage}
        </div>
      )}
      {/* Header */}
      <Card className="bg-white border-surface-border">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="cyan">STRUCTURED ARTIFACT</Badge>
              <span className="text-[11px] font-mono text-surface-muted">ID: #MP-7DAY</span>
            </div>
            <h2 className="text-xl font-extrabold text-brand-800 tracking-tight">7-DAY MEAL PLAN</h2>
            <p className="text-xs text-surface-muted mt-0.5">
              Target: {userProfile.dailyCalories} kcal | {userProfile.proteinGrams}g Protein per day
            </p>
          </div>

          <button
            onClick={() => {
              sendMessage('Regenerate my entire weekly meal plan with fresh recipes');
              setActiveTab('home');
            }}
            className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors cursor-pointer"
            title="Regenerate Meal Plan"
          >
            <RotateCw className="w-4 h-4 text-sky-600" />
          </button>
        </div>
      </Card>

      {/* Day Selector Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {weeklyPlan.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          return (
            <button
              key={day.day}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex-1 min-w-[65px] px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-center ${
                isSelected
                  ? 'bg-brand-600 text-white font-bold shadow-glow-emerald'
                  : 'bg-white hover:bg-surface-hover text-brand-800 border border-surface-border'
              }`}
            >
              <div className="text-[10px] uppercase opacity-80">{day.shortDay}</div>
              <div className="text-sm">{day.date.split(' ')[1]}</div>
            </button>
          );
        })}
      </div>

      {/* Active Day Summary Banner */}
      <div className="p-3.5 rounded-xl bg-surface-subtle border border-brand-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-brand-800 font-bold">
          <Calendar className="w-4 h-4 text-brand-600" />
          <span>{activeDay.day}, {activeDay.date} Overview</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-brand-700 font-semibold">{activeDay.totalCalories} kcal</span>
          <span className="text-surface-muted">•</span>
          <span className="text-sky-700 font-semibold">{activeDay.totalProtein}g Protein</span>
        </div>
      </div>

      {/* Meals List */}
      <div className="space-y-3">
        {activeDay.meals.map((meal) => (
          <Card key={meal.id} hoverEffect className="p-4 space-y-3 bg-white border-surface-border">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={meal.category === 'Breakfast' ? 'amber' : meal.category === 'Lunch' ? 'emerald' : meal.category === 'Snack' ? 'cyan' : 'neutral'} size="sm">
                    {meal.category}
                  </Badge>
                  <span className="text-[11px] font-mono text-surface-muted flex items-center gap-1">
                    <Clock className="w-3 h-3 text-surface-muted" /> {meal.prepTime}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-brand-800 leading-snug">{meal.name}</h4>
              </div>

              <button
                onClick={() => handleSwapClick(meal)}
                className="text-[11px] font-medium text-brand-700 bg-brand-100 hover:bg-brand-200 border border-brand-300 px-2.5 py-1.5 rounded-lg flex items-center gap-1 flex-shrink-0 transition-colors"
              >
                <RotateCw className="w-3 h-3" /> Swap
              </button>
            </div>

            <p className="text-xs text-surface-muted leading-relaxed">{meal.description}</p>

            {/* Macros and Action Bar */}
            <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-brand-800 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-600" /> {meal.calories} kcal
                </span>
                <span className="text-brand-700 font-semibold">P: {meal.protein}g</span>
                <span className="text-sky-700">C: {meal.carbs}g</span>
                <span className="text-amber-700">F: {meal.fat}g</span>
              </div>

              <button
                onClick={() => {
                  sendMessage(`Tell me the recipe and preparation steps for ${meal.name}`);
                  setActiveTab('home');
                }}
                className="text-surface-muted hover:text-brand-800 text-[11px] flex items-center gap-1 font-medium cursor-pointer"
              >
                Ask AI <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Subtle Nutrition Disclaimer */}
      <div className="px-2 pt-2 text-center">
        <p className="text-[11px] text-surface-muted italic">
          Nutrition estimates are for planning purposes and are not medical advice.
        </p>
      </div>
    </div>
  );
};
