import React from 'react';
import { Badge } from '../ui/Badge';
import { Cpu, Layers, Database, Calendar } from 'lucide-react';

interface AICoachHeroProps {
  isMLOnline: boolean;
  totalMeals: number;
}

export const AICoachHeroPropsDefault: AICoachHeroProps = {
  isMLOnline: false,
  totalMeals: 42,
};

export const AICoachHero: React.FC<AICoachHeroProps> = ({ isMLOnline, totalMeals }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-surface-border p-6 sm:p-8 shadow-card-subtle">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-100/60 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Top Tag & Real Status Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="md">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Cpu className="w-3.5 h-3.5 text-sky-600" />
                AI COACH INTELLIGENCE
              </span>
            </Badge>
          </div>

          {/* Actual ML Engine Status */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-subtle border border-surface-border text-xs font-mono">
            {isMLOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                <span className="text-brand-700 font-semibold tracking-wide">AI ENGINE ACTIVE</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-amber-700 font-semibold tracking-wide">AI ENGINE OFFLINE • DETERMINISTIC FALLBACK</span>
              </>
            )}
          </div>
        </div>

        {/* Hero Title & Description */}
        <div className="max-w-3xl space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-800 tracking-tight">
            Your nutrition, powered by intelligence.
          </h1>
          <p className="text-sm sm:text-base text-surface-muted leading-relaxed">
            NutriAI combines scientific metabolic calculations, strict dietary safety constraints,
            and machine-learning recommendation models to synthesize your personalized weekly nutrition plan.
          </p>
        </div>

        {/* Compact Real Data System Statistics */}
        <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border space-y-1">
            <div className="text-surface-muted text-[10px] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Cpu className="w-3 h-3 text-sky-600" /> ML Models
            </div>
            <div className="text-lg font-bold text-brand-800">3 Models</div>
            <div className="text-[10px] text-surface-muted">DT • LR • Naive Bayes</div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border space-y-1">
            <div className="text-surface-muted text-[10px] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Layers className="w-3 h-3 text-brand-600" /> Ensemble
            </div>
            <div className="text-lg font-bold text-brand-700">1 Weighted</div>
            <div className="text-[10px] text-surface-muted">35% / 40% / 25%</div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border space-y-1">
            <div className="text-surface-muted text-[10px] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Database className="w-3 h-3 text-amber-600" /> Meal Dataset
            </div>
            <div className="text-lg font-bold text-brand-800">{totalMeals} Curated</div>
            <div className="text-[10px] text-surface-muted">Typed Candidates</div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border space-y-1">
            <div className="text-surface-muted text-[10px] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Calendar className="w-3 h-3 text-brand-600" /> Plan Horizon
            </div>
            <div className="text-lg font-bold text-brand-800">7-Day Plan</div>
            <div className="text-[10px] text-surface-muted">Adaptive Schedule</div>
          </div>
        </div>
      </div>
    </div>
  );
};
