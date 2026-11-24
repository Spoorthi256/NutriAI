import React, { useState } from 'react';
import { PipelineFunnelCounts } from '../../types/aiCoach';
import { Filter, ShieldAlert, Layers, Sparkles, Database } from 'lucide-react';

interface RecommendationFunnelProps {
  counts: PipelineFunnelCounts;
}

export const RecommendationFunnel: React.FC<RecommendationFunnelProps> = ({ counts }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const steps = [
    {
      id: 'dataset',
      label: 'Recipe Pool',
      count: counts.totalMeals,
      pct: 100,
      icon: Database,
      badge: 'Catalog Base',
      desc: 'Total typed meals in local dataset',
    },
    {
      id: 'diet',
      label: 'Diet Compliant',
      count: counts.dietCompatible,
      pct: Math.round((counts.dietCompatible / counts.totalMeals) * 100),
      icon: Filter,
      badge: 'Hard Rule',
      desc: 'Matches active dietary philosophy',
    },
    {
      id: 'allergy',
      label: 'Allergen Safe',
      count: counts.allergyCompatible,
      pct: Math.round((counts.allergyCompatible / counts.totalMeals) * 100),
      icon: ShieldAlert,
      badge: 'Zero-Tolerance',
      desc: 'Prunes any user-declared allergens',
    },
    {
      id: 'slots',
      label: 'Slot Compatible',
      count: counts.slotCandidates,
      pct: Math.round((counts.slotCandidates / counts.totalMeals) * 100),
      icon: Layers,
      badge: 'Routine Fit',
      desc: 'Fitting active daily meal slots',
    },
    {
      id: 'schedule',
      label: 'Weekly Schedule',
      count: counts.weeklyPlanMeals,
      pct: Math.round((counts.weeklyPlanMeals / counts.totalMeals) * 100),
      icon: Sparkles,
      badge: 'ML Selected',
      desc: 'Final ensemble-scored 7-day schedule',
    },
  ];

  return (
    <div className="relative group/card h-full w-full rounded-[28px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between hover:border-[#2F6D4C] hover:shadow-[0_24px_50px_-20px_rgba(100,216,142,0.22)] transition-[border-color,box-shadow] duration-200">
      {/* Header */}
      <div className="border-b border-[#1A3D2C] pb-4 mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] font-semibold text-[#64D88E] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> CANDIDATE PRUNING
            </span>
          </div>
          <h3 className="font-tight font-bold text-xl sm:text-2xl text-white">
            Reduction Funnel
          </h3>
          <p className="font-tight text-xs text-[#A3B8AC] mt-0.5">
            Progressive candidate narrowing from raw catalogue to personalized plan.
          </p>
        </div>

        <span className="shrink-0 font-mono text-[10.5px] px-2.5 py-1 rounded-full bg-[#163826] text-[#64D88E] border border-[#23583C] font-semibold">
          {counts.totalMeals} → {counts.weeklyPlanMeals}
        </span>
      </div>

      {/* Funnel Steps */}
      <div className="space-y-2 my-auto py-1">
        {steps.map((step) => {
          const Icon = step.icon;
          const isHovered = hoveredId === step.id;

          return (
            <div
              key={step.id}
              onMouseEnter={() => setHoveredId(step.id)}
              onMouseLeave={() => setHoveredId(null)}
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
                    {step.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-xs text-[#64D88E]">{step.count}</span>
                  <span className="font-mono text-[10px] text-[#7A9988] w-8 text-right">
                    {step.pct}%
                  </span>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="mt-1.5 h-1 rounded-full bg-[#091A11] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2F7D4A] to-[#64D88E] rounded-full transition-all duration-500"
                  style={{ width: `${step.pct}%` }}
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
          <span>Zero-leakage Boolean pruning guarantees medical safety</span>
        </div>
      </div>
    </div>
  );
};
