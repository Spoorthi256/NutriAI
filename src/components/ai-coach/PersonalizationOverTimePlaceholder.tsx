import React from 'react';
import { History, RefreshCw, Smile, HeartPulse, Sparkles } from 'lucide-react';

export const PersonalizationOverTimePlaceholder: React.FC = () => {
  const upcomingVectors = [
    {
      title: 'Meal Swaps & Substitutions',
      desc: 'Tracks fine-grained recipe replacements to adjust category preference weights dynamically.',
      icon: RefreshCw,
      tag: 'Adaptive Memory',
    },
    {
      title: 'Post-Meal Satiety & Digestion',
      desc: 'Records hunger cues and digestion comfort to calibrate individual macro density thresholds.',
      icon: Smile,
      tag: 'Feedback Loop',
    },
    {
      title: 'Biometric & Health Sync',
      desc: 'Connects resting metabolic rate, HRV, and daily expenditure for real-time calorie adaptations.',
      icon: HeartPulse,
      tag: 'Wearable Sync',
    },
    {
      title: 'Reinforcement Tuning',
      desc: 'Online contextual bandits updating user-specific logistic regression weights over 30+ day horizons.',
      icon: Sparkles,
      tag: 'Phase 5 Pipeline',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-surface-border p-6 shadow-card-subtle transition-colors relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-2">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand-600" />
            <h3 className="text-base font-semibold text-brand-800 tracking-tight">
              Adaptive Learning & Trajectory
            </h3>
          </div>
          <p className="text-xs text-surface-muted mt-0.5">
            Dynamic profile evolution over active usage cycles
          </p>
        </div>

        <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-brand-100 text-brand-700 border border-brand-300 font-semibold self-start sm:self-auto">
          Baseline Profile Active
        </span>
      </div>

      {/* Main empty/ready state callout */}
      <div className="mt-5 p-5 rounded-xl bg-surface-subtle border border-surface-border text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-100 border border-brand-300 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-brand-600 animate-pulse" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-brand-800">
            Personalization history builds with real meal interactions
          </h4>
          <p className="text-xs text-surface-muted mt-1 leading-relaxed">
            NutriAI strictly avoids synthetic history graphs. Your recommendation vectors are currently anchored to your verified onboarding baseline and will evolve as daily meal feedback is logged.
          </p>
        </div>
      </div>

      {/* Planned learning telemetry vectors */}
      <div className="mt-5">
        <div className="text-[11px] uppercase font-mono tracking-wider text-surface-muted font-bold mb-3">
          Telemetry Vectors in Pipeline
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {upcomingVectors.map((vec) => {
            const Icon = vec.icon;
            return (
              <div
                key={vec.title}
                className="p-3.5 rounded-xl bg-white border border-surface-border hover:border-brand-300 transition-all flex items-start gap-3 shadow-card-subtle"
              >
                <div className="p-2 rounded-lg bg-brand-100 border border-brand-200 text-brand-700 shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-brand-800 truncate">
                      {vec.title}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-subtle text-surface-muted shrink-0 font-medium">
                      {vec.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-surface-muted mt-1 leading-snug">
                    {vec.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
