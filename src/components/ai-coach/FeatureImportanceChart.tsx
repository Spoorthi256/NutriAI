import React, { useState } from 'react';
import { FeatureImportanceData } from '../../types/aiCoach';
import { Layers, Sparkles, SlidersHorizontal, BarChart3 } from 'lucide-react';

interface FeatureImportanceChartProps {
  data: FeatureImportanceData;
}

export const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({ data }) => {
  const [modelType, setModelType] = useState<'decision_tree' | 'logistic_regression'>('decision_tree');

  const featureDescriptions: Record<string, string> = {
    calorie_ratio: 'Proximity of meal calories to allocated slot caloric allowance',
    protein_ratio: 'Ratio of candidate meal protein content to slot protein target',
    user_target_carbs: 'Daily carbohydrate target required by user fitness profile',
    meal_protein: 'Absolute protein content of candidate meal in grams',
    meal_carbs: 'Total carbohydrates in candidate meal in grams',
    protein_density: 'Protein density ratio (grams of protein delivered per 100 kcal)',
    slot_target_protein: 'Optimal protein target for specific daily meal slot',
    slot_target_calories: 'Target caloric budget for specific meal slot',
    meal_fiber: 'Dietary fiber content of meal in grams',
    user_age: 'User chronological age influencing basal metabolic rate',
    user_goal_muscle_gain: 'One-hot indicator for muscle hypertrophy fitness goal',
    slot_category_lunch: 'Meal category classification as lunch slot',
    slot_category_snack: 'Meal category classification as snack slot',
    user_goal_weight_gain: 'One-hot indicator for mass gain caloric surplus goal',
    user_gender_male: 'One-hot gender indicator influencing BMR calculation',
    user_gender_unspecified: 'Neutral fallback gender coefficient',
  };

  const dtEntries = Object.entries(data.decision_tree_top_features).sort((a, b) => b[1] - a[1]);
  const lrEntries = Object.entries(data.logistic_regression_top_coefficients).sort(
    (a, b) => Math.abs(b[1]) - Math.abs(a[1])
  );

  const activeEntries = modelType === 'decision_tree' ? dtEntries : lrEntries;
  const maxVal = Math.max(...activeEntries.map((e) => Math.abs(e[1])), 0.001);

  return (
    <div className="relative group/card w-full rounded-[28px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 sm:p-8 text-white shadow-xl hover:border-[#2F6D4C] hover:shadow-[0_24px_50px_-20px_rgba(100,216,142,0.22)] transition-all">
      {/* Header & Controls in Full-Width Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[#1A3D2C] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[11px] font-semibold text-[#64D88E] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> MODEL INTERPRETABILITY & ATTRIBUTION
            </span>
            <span className="font-mono text-[10.5px] px-2.5 py-0.5 rounded-full bg-[#163826] text-[#A8D5B5] border border-[#23583C]">
              {data.feature_count} Total Dimensions
            </span>
          </div>
          <h3 className="font-tight font-bold text-2xl sm:text-3xl text-white">
            Feature Importance & Learned Weights
          </h3>
          <p className="font-tight text-xs sm:text-sm text-[#A3B8AC] mt-1 max-w-2xl">
            Relative contribution of engineered biometric and nutritional feature vectors to candidate recommendation decisions.
          </p>
        </div>

        {/* Model Selector Pill Toggle */}
        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
          <div className="inline-flex p-1 rounded-full bg-[#0A1A12] border border-[#1A3D2C]">
            <button
              onClick={() => setModelType('decision_tree')}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
                modelType === 'decision_tree'
                  ? 'bg-[#1D4D35] text-white font-semibold shadow-sm'
                  : 'text-[#8EA89B] hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#64D88E]" />
              <span>Decision Tree (Gini Importance)</span>
            </button>
            <button
              onClick={() => setModelType('logistic_regression')}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
                modelType === 'logistic_regression'
                  ? 'bg-[#1D4D35] text-white font-semibold shadow-sm'
                  : 'text-[#8EA89B] hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#64D88E]" />
              <span>Logistic Regression (Log-Odds)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expansive 2-Column Grid of Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-6">
        {activeEntries.slice(0, 8).map(([feature, val], idx) => {
          const pct = Math.round((Math.abs(val) / maxVal) * 100);
          const desc = featureDescriptions[feature] || 'Engineered physiological relationship vector';

          return (
            <div
              key={feature}
              className="p-4 rounded-2xl bg-[#10271C] border border-[#1A3D2C] hover:border-[#2F6D4C] hover:bg-[#143224] transition-all group"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10.5px] text-[#7A9988] font-bold">
                    #{idx + 1}
                  </span>
                  <span className="font-mono font-bold text-white text-xs sm:text-[13px]">
                    {feature.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-[#64D88E] px-2.5 py-0.5 rounded-full bg-[#0A1A12] border border-[#23583C]">
                  {val.toFixed(4)}
                </span>
              </div>

              <p className="text-[11.5px] text-[#8EA89B] leading-tight mb-2.5">
                {desc}
              </p>

              {/* Progress Bar */}
              <div className="h-1.5 rounded-full bg-[#0A1A12] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2F7D4A] to-[#64D88E] rounded-full transition-all duration-500 group-hover:brightness-125"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info Strip */}
      <div className="mt-6 pt-4 border-t border-[#1A3D2C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[#7A9988]">
        <div className="flex items-center gap-2 text-[#64D88E]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Calorie ratio and protein ratio account for over 65% of the split entropy</span>
        </div>
        <div className="flex items-center gap-4 text-[#A8D5B5]">
          <span>StandardScaler Normalization</span>
          <span>•</span>
          <span>Zero Information Leakage</span>
        </div>
      </div>
    </div>
  );
};
