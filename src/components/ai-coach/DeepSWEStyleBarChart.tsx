import React, { useState } from 'react';
import { ModelMetricsSummary } from '../../types/aiCoach';
import { Sparkles, Trophy, Info } from 'lucide-react';

interface BarData {
  id: string;
  name: string;
  sublabel: string;
  score: number;
  precision: number;
  recall: number;
  f1: number;
  isHero?: boolean;
  role: string;
}

export const DeepSWEStyleBarChart: React.FC<{ metrics?: ModelMetricsSummary }> = ({ metrics }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const barItems: BarData[] = metrics
    ? [
        {
          id: 'ensemble',
          name: 'NutriAI Ensemble',
          sublabel: 'Blended Core',
          score: metrics.holdout_test.ensemble.accuracy * 100,
          precision: metrics.holdout_test.ensemble.precision * 100,
          recall: metrics.holdout_test.ensemble.recall * 100,
          f1: metrics.holdout_test.ensemble.f1_score * 100,
          isHero: true,
          role: 'Optimal balance across diversity, accuracy & edge cases',
        },
        {
          id: 'dt',
          name: 'Decision Tree',
          sublabel: 'Solo (50% w)',
          score: metrics.holdout_test.decision_tree.accuracy * 100,
          precision: metrics.holdout_test.decision_tree.precision * 100,
          recall: metrics.holdout_test.decision_tree.recall * 100,
          f1: metrics.holdout_test.decision_tree.f1_score * 100,
          role: 'Hierarchical rule partitioning on macro & caloric intervals',
        },
        {
          id: 'lr',
          name: 'Logistic Reg.',
          sublabel: 'Solo (30% w)',
          score: metrics.holdout_test.logistic_regression.accuracy * 100,
          precision: metrics.holdout_test.logistic_regression.precision * 100,
          recall: metrics.holdout_test.logistic_regression.recall * 100,
          f1: metrics.holdout_test.logistic_regression.f1_score * 100,
          role: 'Smooth logit probabilities providing smooth calibration',
        },
        {
          id: 'nb',
          name: 'Naive Bayes',
          sublabel: 'Solo (20% w)',
          score: metrics.holdout_test.naive_bayes.accuracy * 100,
          precision: metrics.holdout_test.naive_bayes.precision * 100,
          recall: metrics.holdout_test.naive_bayes.recall * 100,
          f1: metrics.holdout_test.naive_bayes.f1_score * 100,
          role: 'Bayesian prior likelihoods resisting anomalous noise',
        },
      ]
    : [
        {
          id: 'ensemble',
          name: 'NutriAI Ensemble',
          sublabel: 'Blended Core',
          score: 95.0,
          precision: 95.6,
          recall: 95.6,
          f1: 95.6,
          isHero: true,
          role: 'Optimal balance across diversity, accuracy & edge cases',
        },
        {
          id: 'dt',
          name: 'Decision Tree',
          sublabel: 'Solo (50% w)',
          score: 95.0,
          precision: 95.6,
          recall: 95.6,
          f1: 95.6,
          role: 'Hierarchical rule partitioning on macro & caloric intervals',
        },
        {
          id: 'lr',
          name: 'Logistic Reg.',
          sublabel: 'Solo (30% w)',
          score: 73.8,
          precision: 72.8,
          recall: 86.1,
          f1: 78.9,
          role: 'Smooth logit probabilities providing smooth calibration',
        },
        {
          id: 'nb',
          name: 'Naive Bayes',
          sublabel: 'Solo (20% w)',
          score: 69.6,
          precision: 72.2,
          recall: 75.9,
          f1: 74.0,
          role: 'Bayesian prior likelihoods resisting anomalous noise',
        },
      ];

  // Exact mathematical geometry
  const width = 720;
  const height = 370;
  const paddingLeft = 70;
  const paddingRight = 30;
  const paddingTop = 45;
  const paddingBottom = 65;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const yTicks = [0, 20, 40, 60, 80, 100];
  const barWidth = 104;
  const totalBars = barItems.length;
  const barGap = (chartWidth - barWidth * totalBars) / (totalBars + 1);

  const hoveredItem = hoveredIdx !== null ? barItems[hoveredIdx] : null;

  return (
    <div className="relative group/card h-full w-full rounded-[28px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between hover:border-[#2F6D4C] hover:shadow-[0_24px_50px_-20px_rgba(100,216,142,0.22)] transition-[border-color,box-shadow] duration-200 overflow-hidden">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1A3D2C] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] font-semibold text-[#64D88E] uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" /> EMPIRICAL EVALUATION
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#163826] text-[#A8D5B5] border border-[#23583C]">
              n = 240 Holdout
            </span>
          </div>
          <h3 className="font-tight font-bold text-xl sm:text-2xl text-white">
            Holdout Generalization Accuracy (80/20 Split)
          </h3>
          <p className="font-tight text-xs text-[#A3B8AC] mt-1">
            Precision nutritional candidate ranking evaluated against unbiased test set. Higher is better.
          </p>
        </div>

        {/* Hover Inspector Quick Badge */}
        {hoveredItem ? (
          <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#163826] border border-[#2F6D4C] text-xs font-mono">
            <span className="text-[#8EA89B]">{hoveredItem.name}:</span>
            <span className="font-bold text-[#64D88E]">{hoveredItem.score.toFixed(1)}% Acc</span>
            <span className="text-[#7A9988]">| F1: {(hoveredItem.f1 / 100).toFixed(3)}</span>
          </div>
        ) : (
          <div className="shrink-0 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A1A12] border border-[#1A3D2C] text-[11px] font-mono text-[#7A9988]">
            <Info className="w-3 h-3 text-[#64D88E]" />
            <span>Hover bars for metric breakdown</span>
          </div>
        )}
      </div>

      {/* SVG Coordinate Space */}
      <div className="relative w-full my-auto py-3 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-hidden select-none"
        >
          {/* Subtle gradient definitions */}
          <defs>
            <linearGradient id="heroBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F9D69" />
              <stop offset="100%" stopColor="#245E39" />
            </linearGradient>
            <linearGradient id="soloBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B422F" />
              <stop offset="100%" stopColor="#11291E" />
            </linearGradient>
            <linearGradient id="soloBarHoverGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2A6347" />
              <stop offset="100%" stopColor="#163826" />
            </linearGradient>
          </defs>

          {/* Y Axis Grid Lines & Ticks */}
          {yTicks.map((tick) => {
            const y = paddingTop + chartHeight - (tick / 100) * chartHeight;
            return (
              <g key={tick}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#163927"
                  strokeWidth="1"
                  strokeDasharray={tick === 0 || tick === 100 ? undefined : '3,3'}
                />
                <text
                  x={paddingLeft - 12}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#7A9988"
                  fontFamily="monospace"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Y Axis Label */}
          <text
            x={-height / 2 + 10}
            y={22}
            transform="rotate(-90)"
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="#8EA89B"
            fontFamily="monospace"
            letterSpacing="0.08em"
          >
            SCORE (%)
          </text>

          {/* Baseline X Axis */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={width - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#214D36"
            strokeWidth="1.5"
          />

          {/* Bars & Labels (Mathematically Exact Coordinates) */}
          {barItems.map((item, idx) => {
            const barX = paddingLeft + barGap * (idx + 1) + barWidth * idx;
            const barCenterX = barX + barWidth / 2;
            const barH = (item.score / 100) * chartHeight;
            const barY = paddingTop + chartHeight - barH;
            const textY = barY - 10;
            const isHovered = hoveredIdx === idx;
            const isOtherHovered = hoveredIdx !== null && !isHovered;

            return (
              <g
                key={item.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Score Percentage Label Directly Above Bar */}
                <text
                  x={barCenterX}
                  y={textY}
                  textAnchor="middle"
                  fontSize={item.isHero || isHovered ? '14' : '13'}
                  fontWeight="bold"
                  fill={item.isHero ? '#64D88E' : isHovered ? '#FFFFFF' : '#B5CCC0'}
                  fontFamily="monospace"
                  style={{
                    transition: 'all 0.2s ease',
                    filter: isHovered ? 'drop-shadow(0 0 6px rgba(100,216,142,0.6))' : undefined,
                  }}
                >
                  {item.score.toFixed(1)}%
                </text>

                {/* Bar Rect (Pure SVG with exact math) */}
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barH}
                  rx="6"
                  ry="6"
                  fill={
                    item.isHero
                      ? 'url(#heroBarGrad)'
                      : isHovered
                      ? 'url(#soloBarHoverGrad)'
                      : 'url(#soloBarGrad)'
                  }
                  stroke={
                    item.isHero
                      ? '#64D88E'
                      : isHovered
                      ? '#4F9D69'
                      : '#1F4A34'
                  }
                  strokeWidth={item.isHero || isHovered ? '2' : '1.2'}
                  opacity={isOtherHovered ? 0.45 : 1}
                  style={{
                    transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                    filter: item.isHero || isHovered ? 'drop-shadow(0 6px 14px rgba(47,125,74,0.4))' : undefined,
                  }}
                />

                {/* Primary Model Name Label Centered Under Bar */}
                <text
                  x={barCenterX}
                  y={paddingTop + chartHeight + 20}
                  textAnchor="middle"
                  fontSize="12.5"
                  fontWeight={item.isHero || isHovered ? '700' : '600'}
                  fill={item.isHero ? '#FFFFFF' : isHovered ? '#FFFFFF' : '#D1E3D9'}
                  fontFamily="sans-serif"
                  style={{ transition: 'fill 0.2s ease' }}
                >
                  {item.name}
                </text>

                {/* Secondary Sublabel Centered Under Model Name */}
                <text
                  x={barCenterX}
                  y={paddingTop + chartHeight + 35}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="monospace"
                  fill={item.isHero ? '#64D88E' : '#7A9988'}
                  letterSpacing="0.04em"
                >
                  {item.sublabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Methodology & Safety Invariant Footer */}
      <div className="pt-4 border-t border-[#1A3D2C] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-[#7A9988]">
        <div className="flex items-center gap-1.5 text-[#64D88E]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Decision Tree provides highest raw accuracy (95.0%); Ensemble adds robust generalization</span>
        </div>
        <span className="text-[#A3B8AC]">Standard Scikit-Learn Benchmark</span>
      </div>
    </div>
  );
};
