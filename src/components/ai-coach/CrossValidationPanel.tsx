import React from 'react';
import { ModelMetricsSummary } from '../../types/aiCoach';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface CrossValidationPanelProps {
  metrics: ModelMetricsSummary;
}

export const CrossValidationPanel: React.FC<CrossValidationPanelProps> = ({ metrics }) => {
  const cv = metrics.cross_validation_5fold;

  const models = [
    {
      id: 'ensemble',
      name: 'NutriAI Ensemble',
      tag: 'Blended Core',
      acc: cv.ensemble.mean_accuracy * 100,
      accStd: cv.ensemble.std_accuracy * 100,
      f1: cv.ensemble.mean_f1 * 100,
      f1Std: cv.ensemble.std_f1 * 100,
      isHero: true,
    },
    {
      id: 'dt',
      name: 'Decision Tree',
      tag: '50% Weight',
      acc: cv.decision_tree.mean_accuracy * 100,
      accStd: cv.decision_tree.std_accuracy * 100,
      f1: cv.decision_tree.mean_f1 * 100,
      f1Std: cv.decision_tree.std_f1 * 100,
      isHero: false,
    },
    {
      id: 'lr',
      name: 'Logistic Regression',
      tag: '30% Weight',
      acc: cv.logistic_regression.mean_accuracy * 100,
      accStd: cv.logistic_regression.std_accuracy * 100,
      f1: cv.logistic_regression.mean_f1 * 100,
      f1Std: cv.logistic_regression.std_f1 * 100,
      isHero: false,
    },
    {
      id: 'nb',
      name: 'Gaussian Naive Bayes',
      tag: '20% Weight',
      acc: cv.naive_bayes.mean_accuracy * 100,
      accStd: cv.naive_bayes.std_accuracy * 100,
      f1: cv.naive_bayes.mean_f1 * 100,
      f1Std: cv.naive_bayes.std_f1 * 100,
      isHero: false,
    },
  ];

  return (
    <div className="relative group/card h-full w-full rounded-[28px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between hover:border-[#2F6D4C] hover:shadow-[0_24px_50px_-20px_rgba(100,216,142,0.22)] transition-[border-color,box-shadow] duration-200">
      {/* Header */}
      <div className="border-b border-[#1A3D2C] pb-4 mb-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-mono text-[11px] font-semibold text-[#64D88E] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> STRATIFIED VALIDATION
          </span>
          <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#163826] text-[#A8D5B5] border border-[#23583C]">
            k = 5 Folds
          </span>
        </div>
        <h3 className="font-tight font-bold text-xl sm:text-2xl text-white">
          5-Fold Cross-Validation
        </h3>
        <p className="font-tight text-xs text-[#A3B8AC] mt-0.5">
          Audited across 5 stratified folds (n=240 holdouts per fold) with zero preprocessor leakage.
        </p>
      </div>

      {/* Model Cards Stack (Clean, non-cramped layout) */}
      <div className="space-y-2.5 my-auto py-1">
        {models.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-2xl border transition-all ${
              m.isHero
                ? 'bg-[#163826] border-[#64D88E] shadow-[0_4px_16px_rgba(100,216,142,0.15)]'
                : 'bg-[#10271C] border-[#1A3D2C] hover:border-[#2F6D4C]'
            }`}
          >
            {/* Top Row: Name, Tag & Accuracy */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    m.isHero ? 'bg-[#64D88E] animate-pulse' : 'bg-[#3A6B4F]'
                  }`}
                />
                <span className="font-tight font-bold text-xs sm:text-[13px] text-white truncate">
                  {m.name}
                </span>
                <span className="text-[9.5px] font-mono text-[#8EA89B] shrink-0 hidden sm:inline">
                  ({m.tag})
                </span>
              </div>

              <div className="shrink-0 text-right">
                <span className="font-mono font-bold text-xs sm:text-[13px] text-[#64D88E]">
                  {m.acc.toFixed(1)}%
                </span>
                <span className="font-mono text-[10px] text-[#7A9988] ml-1">
                  ±{m.accStd.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="mt-2 h-1.5 rounded-full bg-[#0A1A12] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  m.isHero
                    ? 'bg-gradient-to-r from-[#2F7D4A] to-[#64D88E]'
                    : 'bg-[#255C3E]'
                }`}
                style={{ width: `${m.acc}%` }}
              />
            </div>

            {/* Bottom Row: F1 Metric */}
            <div className="mt-1.5 flex items-center justify-between text-[10.5px] font-mono text-[#8EA89B]">
              <span>Mean F1 Score</span>
              <span className="text-white font-semibold">
                {(m.f1 / 100).toFixed(4)} <span className="text-[#7A9988]">±{(m.f1Std / 100).toFixed(3)}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#1A3D2C] flex items-center justify-between text-[11px] font-mono text-[#7A9988]">
        <div className="flex items-center gap-1.5 text-[#64D88E]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Folds preserved identical class balance (50/50)</span>
        </div>
      </div>
    </div>
  );
};
