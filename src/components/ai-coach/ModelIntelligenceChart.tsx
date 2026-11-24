import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { ModelMetricsSummary } from '../../types/aiCoach';
import { BarChart3, HelpCircle } from 'lucide-react';

interface ModelIntelligenceChartProps {
  metrics: ModelMetricsSummary;
}

export const ModelIntelligenceChart: React.FC<ModelIntelligenceChartProps> = ({ metrics }) => {
  const [metricTab, setMetricTab] = useState<'accuracy' | 'precision' | 'recall' | 'f1_score'>('f1_score');
  const [viewMode, setViewMode] = useState<'holdout' | 'cross_validation'>('holdout');

  const models = [
    { key: 'decision_tree' as const, name: 'Decision Tree', desc: 'Non-linear step thresholds' },
    { key: 'logistic_regression' as const, name: 'Logistic Regression', desc: 'Calibrated linear boundary' },
    { key: 'naive_bayes' as const, name: 'Naive Bayes (Gaussian)', desc: 'Probabilistic density estimates' },
    { key: 'ensemble' as const, name: 'Weighted Ensemble', desc: '35% DT + 40% LR + 25% NB' },
  ];

  const getMetricValue = (modelKey: 'decision_tree' | 'logistic_regression' | 'naive_bayes' | 'ensemble') => {
    if (viewMode === 'holdout') {
      const val = metrics.holdout_test[modelKey][metricTab];
      return {
        value: val * 100,
        label: `${(val * 100).toFixed(2)}%`,
        std: null,
      };
    } else {
      const cv = metrics.cross_validation_5fold[modelKey];
      const meanKey = `mean_${metricTab === 'f1_score' ? 'f1' : metricTab}` as keyof typeof cv;
      const stdKey = `std_${metricTab === 'f1_score' ? 'f1' : metricTab}` as keyof typeof cv;
      const meanVal = (cv[meanKey] as number) * 100;
      const stdVal = (cv[stdKey] as number) * 100;
      return {
        value: meanVal,
        label: `${meanVal.toFixed(2)}%`,
        std: `±${stdVal.toFixed(2)}%`,
      };
    }
  };

  return (
    <Card className="p-6 bg-white border-surface-border space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-brand-600" /> MODEL INTELLIGENCE
            </span>
          </div>
          <h2 className="text-xl font-bold text-brand-800 tracking-tight">Recommendation Model Evaluation</h2>
          <p className="text-xs text-surface-muted mt-0.5">
            Three complementary mathematical models contribute to NutriAI's candidate ranking layer.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-xl border border-surface-border self-start sm:self-center">
          <button
            onClick={() => setViewMode('holdout')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              viewMode === 'holdout'
                ? 'bg-brand-600 text-white font-bold shadow-sm'
                : 'text-surface-muted hover:text-brand-800'
            }`}
          >
            80/20 Holdout
          </button>
          <button
            onClick={() => setViewMode('cross_validation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              viewMode === 'cross_validation'
                ? 'bg-brand-600 text-white font-bold shadow-sm'
                : 'text-surface-muted hover:text-brand-800'
            }`}
          >
            5-Fold CV
          </button>
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: 'f1_score' as const, label: 'F1 Score (Balanced)' },
          { key: 'accuracy' as const, label: 'Accuracy' },
          { key: 'precision' as const, label: 'Precision' },
          { key: 'recall' as const, label: 'Recall' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMetricTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              metricTab === tab.key
                ? 'bg-brand-100 text-brand-700 font-semibold border border-brand-300 shadow-sm'
                : 'text-surface-muted hover:text-brand-800 hover:bg-surface-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Comparative Horizontal Bar Chart */}
      <div className="space-y-4 pt-2">
        {models.map((m) => {
          const { value, label, std } = getMetricValue(m.key);
          const isEnsemble = m.key === 'ensemble';

          return (
            <div key={m.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className={`font-semibold ${isEnsemble ? 'text-brand-700 font-bold' : 'text-brand-800'}`}>
                    {m.name}
                  </span>
                  <span className="text-[11px] text-surface-muted ml-2 hidden sm:inline">
                    {m.desc}
                  </span>
                </div>
                <div className="font-mono flex items-center gap-2">
                  <span className={`font-bold ${isEnsemble ? 'text-brand-700' : 'text-brand-800'}`}>
                    {label}
                  </span>
                  {std && (
                    <span className="text-[10px] text-surface-muted font-normal">
                      {std}
                    </span>
                  )}
                </div>
              </div>

              {/* Bar track */}
              <div className="h-3.5 rounded-full bg-surface-subtle border border-surface-border overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isEnsemble
                      ? 'bg-brand-600'
                      : m.key === 'decision_tree'
                      ? 'bg-brand-500'
                      : m.key === 'logistic_regression'
                      ? 'bg-sky-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.max(5, value)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtle Methodology Disclaimer */}
      <div className="pt-2 border-t border-surface-border flex items-start gap-2 text-[11px] text-surface-muted leading-relaxed italic">
        <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-surface-muted" />
        <span>
          Evaluation uses an audited prototype dataset (1,200 samples) and does not represent real-world clinical or human recommendation effectiveness.
        </span>
      </div>
    </Card>
  );
};
