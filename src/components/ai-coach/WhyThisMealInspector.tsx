import React, { useState } from 'react';
import { Meal } from '../../types';
import { MealExplanationScore } from '../../types/aiCoach';
import { Sparkles, Dumbbell, Flame, CheckCircle2, ThumbsUp, Shuffle, ChevronDown } from 'lucide-react';

interface WhyThisMealInspectorProps {
  meals: Meal[];
  activeMeal: Meal | null;
  explanation: MealExplanationScore | null;
  onSelectMeal: (mealId: string) => void;
  isMLOnline: boolean;
}

export const WhyThisMealInspector: React.FC<WhyThisMealInspectorProps> = ({
  meals,
  activeMeal,
  explanation,
  onSelectMeal,
  isMLOnline,
}) => {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  if (!activeMeal || !explanation) {
    return (
      <div className="relative group/card h-full w-full rounded-[28px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 text-center text-[#7A9988] font-mono text-xs flex flex-col justify-center items-center">
        <Sparkles className="w-6 h-6 text-[#64D88E] mb-2 animate-pulse" />
        No scheduled meals available to inspect. Complete onboarding to generate a plan.
      </div>
    );
  }

  // Deduplicate meals for dropdown selection
  const uniqueMeals = Array.from(new Map(meals.map((m) => [m.id, m])).values());

  const dimensionMetrics = [
    {
      id: 'goal',
      label: 'Goal Alignment',
      value: explanation.goalAlignment,
      desc: 'Matches targeted macro balance & fitness trajectory',
      icon: Dumbbell,
    },
    {
      id: 'cal',
      label: 'Caloric Slot Fit',
      value: explanation.calorieMatch,
      desc: `Calibrated to ${activeMeal.category} energy allowance`,
      icon: Flame,
    },
    {
      id: 'protein',
      label: 'Protein Density Match',
      value: explanation.proteinMatch,
      desc: 'Optimal amino acid density per 100 kcal',
      icon: CheckCircle2,
    },
    {
      id: 'pref',
      label: 'Preference Fit',
      value: explanation.preferenceFit,
      desc: 'Excludes disliked ingredients completely',
      icon: ThumbsUp,
    },
    {
      id: 'variety',
      label: 'Variety Contribution',
      value: explanation.varietyScore,
      desc: 'Non-repetitive nutrient diversification across 7 days',
      icon: Shuffle,
    },
  ];

  const compositeScore = Math.round(
    (explanation.goalAlignment +
      explanation.calorieMatch +
      explanation.proteinMatch +
      explanation.preferenceFit +
      explanation.varietyScore) /
      5
  );

  return (
    <div className="relative group/card h-full w-full rounded-[28px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between hover:border-[#2F6D4C] hover:shadow-[0_24px_50px_-20px_rgba(100,216,142,0.22)] transition-[border-color,box-shadow] duration-200">
      {/* Header & Meal Selector */}
      <div className="border-b border-[#1A3D2C] pb-4 mb-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-mono text-[11px] font-semibold text-[#64D88E] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> SUITABILITY EXPLAINABILITY
          </span>
          <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-full bg-[#163826] text-[#64D88E] border border-[#23583C] font-bold">
            Score: {compositeScore}%
          </span>
        </div>
        <h3 className="font-tight font-bold text-xl sm:text-2xl text-white">
          Why This Meal?
        </h3>

        {/* Meal Selector Dropdown */}
        <div className="relative mt-2.5">
          <select
            value={activeMeal.id}
            onChange={(e) => onSelectMeal(e.target.value)}
            className="w-full bg-[#10271C] border border-[#1A3D2C] text-white text-xs rounded-xl px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-[#64D88E] cursor-pointer font-medium shadow-sm transition-colors hover:border-[#2F6D4C]"
          >
            {uniqueMeals.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#0D2218] text-white">
                {m.name} ({m.category} • {m.calories} kcal)
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#7A9988] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Dimension Metrics */}
      <div className="space-y-2 my-auto py-1">
        {dimensionMetrics.map((dim) => {
          const Icon = dim.icon;
          const isHovered = hoveredMetric === dim.id;

          return (
            <div
              key={dim.id}
              onMouseEnter={() => setHoveredMetric(dim.id)}
              onMouseLeave={() => setHoveredMetric(null)}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isHovered
                  ? 'bg-[#163826] border-[#64D88E]'
                  : 'bg-[#10271C] border-[#1A3D2C] hover:border-[#2F6D4C]'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-[#183E2A] flex items-center justify-center text-[#64D88E] shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-tight font-semibold text-white truncate text-xs">
                    {dim.label}
                  </span>
                </div>
                <span className="font-mono font-bold text-xs text-[#64D88E] shrink-0">
                  {dim.value}%
                </span>
              </div>

              {/* Mini progress bar */}
              <div className="mt-1.5 h-1 rounded-full bg-[#091A11] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2F7D4A] to-[#64D88E] rounded-full transition-all duration-500"
                  style={{ width: `${dim.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Invariant Footer */}
      <div className="pt-3 border-t border-[#1A3D2C] flex items-center justify-between text-[11px] font-mono text-[#7A9988]">
        <div className="flex items-center gap-1.5 text-[#64D88E]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transparent deterministic scoring weights</span>
        </div>
      </div>
    </div>
  );
};
