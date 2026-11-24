import React, { useState } from 'react';
import { Layers, Sparkles, Scale } from 'lucide-react';

interface EnsembleWeightsDonutProps {
  weights?: {
    decision_tree: number;
    logistic_regression: number;
    naive_bayes: number;
  };
}

export const EnsembleWeightsDonut: React.FC<EnsembleWeightsDonutProps> = ({
  weights = { decision_tree: 0.5, logistic_regression: 0.3, naive_bayes: 0.2 },
}) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const items = [
    {
      id: 'dt',
      name: 'Decision Tree',
      shortName: 'Decision Tree',
      desc: 'Non-linear hierarchical splits',
      weight: weights.decision_tree,
      pct: Math.round(weights.decision_tree * 100),
      color: '#64D88E', // vibrant mint
      bgRing: '#1E4D34',
    },
    {
      id: 'lr',
      name: 'Logistic Regression',
      shortName: 'Logistic Reg.',
      desc: 'Calibrated linear logit bounds',
      weight: weights.logistic_regression,
      pct: Math.round(weights.logistic_regression * 100),
      color: '#34935A', // deep emerald
      bgRing: '#153A26',
    },
    {
      id: 'nb',
      name: 'Gaussian Naive Bayes',
      shortName: 'Naive Bayes',
      desc: 'Probabilistic prior densities',
      weight: weights.naive_bayes,
      pct: Math.round(weights.naive_bayes * 100),
      color: '#8AE4AE', // pale soft sage
      bgRing: '#22563A',
    },
  ];

  // SVG Donut geometry
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const activeItem = activeIdx !== null ? items[activeIdx] : null;

  return (
    <div className="relative group/card h-full w-full rounded-[28px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between hover:border-[#2F6D4C] hover:shadow-[0_24px_50px_-20px_rgba(100,216,142,0.22)] transition-[border-color,box-shadow] duration-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#1A3D2C] pb-4 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[11px] font-semibold text-[#64D88E] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> ENSEMBLE ARCHITECTURE
          </span>
        </div>
        <h3 className="font-tight font-bold text-xl sm:text-2xl text-white">
          Model Weights Distribution
        </h3>
        <p className="font-tight text-xs text-[#A3B8AC] mt-1">
          Tri-model linear probability mixture combining non-linear splits, logit calibration & Bayesian density.
        </p>
      </div>

      {/* Donut and Legend */}
      <div className="flex flex-col items-center gap-6 my-auto py-2">
        {/* SVG Donut Centerpiece */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={size} height={size} className="transform -rotate-90 select-none overflow-visible">
            {/* Background Track Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#0D2218"
              strokeWidth={strokeWidth}
            />

            {/* Interactive Segments */}
            {items.map((item, idx) => {
              const dashLength = item.weight * circumference;
              const strokeDasharray = `${dashLength} ${circumference - dashLength}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += dashLength;
              const isSelected = activeIdx === idx;
              const isAnySelected = activeIdx !== null;

              return (
                <circle
                  key={item.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={isSelected ? strokeWidth + 5 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="cursor-pointer transition-all duration-300"
                  style={{
                    opacity: isAnySelected && !isSelected ? 0.4 : 1,
                    filter: isSelected ? `drop-shadow(0 0 10px ${item.color})` : undefined,
                  }}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseLeave={() => setActiveIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeItem ? (
              <>
                <span className="font-mono text-2xl font-extrabold text-[#64D88E]">
                  {activeItem.pct}%
                </span>
                <span className="text-[10px] font-mono text-white/80 max-w-[100px] truncate">
                  {activeItem.shortName}
                </span>
              </>
            ) : (
              <>
                <span className="font-mono text-2xl font-extrabold text-white">100%</span>
                <span className="text-[10.5px] font-mono text-[#64D88E] uppercase tracking-wider">
                  Ensemble
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend Breakdown (Fixed Layout: No text collisions, shrink-0 badges) */}
        <div className="w-full space-y-2.5">
          {items.map((item, idx) => {
            const isSelected = activeIdx === idx;
            return (
              <div
                key={item.id}
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#163826] border-[#64D88E] shadow-[0_4px_16px_rgba(100,216,142,0.18)]'
                    : 'bg-[#10271C] border-[#1A3D2C] hover:border-[#2F6D4C] hover:bg-[#133022]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 transition-transform"
                      style={{
                        backgroundColor: item.color,
                        transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                    <span className="font-tight font-semibold text-xs sm:text-[13px] text-white truncate">
                      {item.name}
                    </span>
                  </div>

                  {/* Dedicated Percentage Pill Badge - Never Collides */}
                  <span className="shrink-0 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-[#0A1A12] border border-[#23583C] text-[#64D88E]">
                    {item.pct}%
                  </span>
                </div>

                <p className="text-[11px] text-[#8EA89B] mt-1 pl-5 leading-tight">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invariant Formula Footer */}
      <div className="pt-4 border-t border-[#1A3D2C] flex items-center justify-between text-[11px] font-mono text-[#7A9988]">
        <div className="flex items-center gap-1.5 text-[#64D88E]">
          <Scale className="w-3.5 h-3.5" />
          <span>w_dt(0.5) + w_lr(0.3) + w_nb(0.2) = 1.0</span>
        </div>
        <span className="text-[#A3B8AC]">Deterministic Convex Sum</span>
      </div>
    </div>
  );
};
