import React from 'react';

interface BenchmarkRow {
  domain: string;
  benchmark: string;
  subMetric?: string;
  nutriAiScore: string;
  decisionTreeScore: string;
  logisticRegressionScore: string;
  naiveBayesScore: string;
  isBest?: boolean;
}

const benchmarkData: BenchmarkRow[] = [
  // Knowledge & Nutrition Science
  {
    domain: 'Physiological calibration',
    benchmark: 'Mifflin-St Jeor TDEE Fit',
    subMetric: 'Variance (kcal)',
    nutriAiScore: '95.6%',
    decisionTreeScore: '94.2%',
    logisticRegressionScore: '88.5%',
    naiveBayesScore: '84.1%',
  },
  {
    domain: '',
    benchmark: 'Macro Allocation Index',
    subMetric: 'Adherence',
    nutriAiScore: '95.2%',
    decisionTreeScore: '94.1%',
    logisticRegressionScore: '82.3%',
    naiveBayesScore: '78.9%',
  },
  {
    domain: '',
    benchmark: 'Protein Density Optimization',
    subMetric: 'Score',
    nutriAiScore: '94.5%',
    decisionTreeScore: '91.0%',
    logisticRegressionScore: '76.4%',
    naiveBayesScore: '72.1%',
  },

  // Hard Constraint Safety
  {
    domain: 'Constraint safety',
    benchmark: 'Zero Allergen Leakage (Hard)',
    subMetric: 'Safety Rate',
    nutriAiScore: '100.0%',
    decisionTreeScore: '98.5%',
    logisticRegressionScore: '91.2%',
    naiveBayesScore: '89.4%',
  },
  {
    domain: '',
    benchmark: 'Dietary Taxonomy Compliance',
    subMetric: 'Precision',
    nutriAiScore: '95.8%',
    decisionTreeScore: '95.0%',
    logisticRegressionScore: '85.6%',
    naiveBayesScore: '81.0%',
  },
  {
    domain: '',
    benchmark: 'Hallucination Resistance',
    subMetric: 'Integrity',
    nutriAiScore: '95.4%',
    decisionTreeScore: '92.3%',
    logisticRegressionScore: '79.1%',
    naiveBayesScore: '74.5%',
  },

  // Machine Learning Robustness
  {
    domain: 'ML robustness',
    benchmark: 'Holdout 80/20 Test Accuracy',
    nutriAiScore: '95.0%',
    decisionTreeScore: '95.0%',
    logisticRegressionScore: '73.8%',
    naiveBayesScore: '69.6%',
  },
  {
    domain: '',
    benchmark: '5-Fold Stratified CV Mean F1',
    subMetric: 'Mean ± Std',
    nutriAiScore: '92.4%',
    decisionTreeScore: '95.6%',
    logisticRegressionScore: '79.7%',
    naiveBayesScore: '78.5%',
  },
  {
    domain: '',
    benchmark: 'Weighted Ensemble Calibration',
    subMetric: 'Brier Score',
    nutriAiScore: '91.0%',
    decisionTreeScore: '85.4%',
    logisticRegressionScore: '74.0%',
    naiveBayesScore: '71.2%',
  },

  // Production Efficiency
  {
    domain: 'Inference efficiency',
    benchmark: 'Latency (p99 In-Memory)',
    subMetric: '< 15ms target',
    nutriAiScore: '< 12ms',
    decisionTreeScore: '< 5ms',
    logisticRegressionScore: '< 2ms',
    naiveBayesScore: '< 3ms',
  },
  {
    domain: '',
    benchmark: 'Candidate Pool Filter Efficiency',
    subMetric: 'Recall',
    nutriAiScore: '95.2%',
    decisionTreeScore: '93.5%',
    logisticRegressionScore: '81.4%',
    naiveBayesScore: '77.8%',
  },
];

export const BenchmarkComparisonTable: React.FC = () => {
  return (
    <div className="w-full overflow-hidden rounded-3xl bg-[#0D2218] border border-[#1A3D2C] p-6 sm:p-8 text-white shadow-xl">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1A3D2C] pb-5">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#4F9D69]">
            Comprehensive Evaluations
          </span>
          <h3 className="font-display text-2xl sm:text-3xl text-white mt-1">
            NutriAI Intelligence Benchmark Matrix
          </h3>
          <p className="font-tight text-xs sm:text-sm text-[#A3B8AC] mt-1 max-w-2xl">
            Empirical comparison across physiological accuracy, hard constraint safety invariants, machine-learning generalization, and real-time execution.
          </p>
        </div>
        <div className="font-mono text-[11px] text-[#7A9988] bg-[#132E21] px-3 py-1.5 rounded-full border border-[#234D38] self-start sm:self-auto">
          Frozen Phase 4 ML Suite
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-tight text-xs sm:text-[13px] border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-[#1E4532] text-[#8EA89B]">
              <th className="py-3 px-3 font-medium w-[22%]">Domain</th>
              <th className="py-3 px-3 font-medium w-[28%]">Benchmark</th>
              <th className="py-3 px-3 font-bold text-[#4F9D69] bg-[#163826]/70 border-x border-[#2A5C3F] text-center w-[16%]">
                NutriAI Ensemble v4
              </th>
              <th className="py-3 px-3 font-medium text-[#C2D6CB] text-center w-[11%]">
                Decision Tree
              </th>
              <th className="py-3 px-3 font-medium text-[#C2D6CB] text-center w-[11%]">
                Logistic Reg.
              </th>
              <th className="py-3 px-3 font-medium text-[#C2D6CB] text-center w-[12%]">
                Naive Bayes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#153424]">
            {benchmarkData.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#112A1E] transition-colors group">
                {/* Domain column */}
                <td className="py-3 px-3 text-[#7B9B8A] font-medium align-middle">
                  {row.domain}
                </td>

                {/* Benchmark name + sub-metric */}
                <td className="py-3 px-3 text-white font-semibold align-middle">
                  <div className="flex items-center justify-between pr-2">
                    <span>{row.benchmark}</span>
                    {row.subMetric && (
                      <span className="font-mono text-[10px] text-[#7B9B8A] font-normal ml-2">
                        {row.subMetric}
                      </span>
                    )}
                  </div>
                </td>

                {/* NutriAI Hero Highlight Column */}
                <td className="py-3 px-3 text-center align-middle font-bold text-white bg-[#163826]/70 border-x border-[#2A5C3F] font-mono text-sm group-hover:bg-[#1B432E]/90 transition-colors">
                  <span className="text-[#64D88E] drop-shadow-[0_0_8px_rgba(100,216,142,0.3)]">
                    {row.nutriAiScore}
                  </span>
                </td>

                {/* Comparison Columns */}
                <td className="py-3 px-3 text-center align-middle text-[#B5CCC0] font-mono">
                  {row.decisionTreeScore}
                </td>
                <td className="py-3 px-3 text-center align-middle text-[#8EA89B] font-mono">
                  {row.logisticRegressionScore}
                </td>
                <td className="py-3 px-3 text-center align-middle text-[#8EA89B] font-mono">
                  {row.naiveBayesScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Methodology Footnote (Matching Image 1) */}
      <div className="mt-5 pt-4 border-t border-[#1A3D2C] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[#7B9B8A]">
        <span>Methodology: nutriai.health/models/evals-methodology/ensemble-v4</span>
        <span className="text-[#4F9D69]">Normalized 80/20 Holdout Split • Stratified 5-Fold Validation</span>
      </div>
    </div>
  );
};
