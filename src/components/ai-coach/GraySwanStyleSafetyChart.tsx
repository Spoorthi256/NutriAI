import React, { useState } from 'react';
import { ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';

interface SafetyBar {
  name: string;
  totalScore: number;
  k1: number;
  k5: number;
  isHero?: boolean;
}

const safetyData: SafetyBar[] = [
  { name: 'NutriAI Core', totalScore: 0.0, k1: 0.0, k5: 0.0, isHero: true },
  { name: 'Hard Filter', totalScore: 1.0, k1: 0.4, k5: 0.6 },
  { name: 'Med-LLM', totalScore: 4.6, k1: 1.5, k5: 3.1 },
  { name: 'Health-LLM', totalScore: 8.5, k1: 2.8, k5: 5.7 },
  { name: 'Generic LLM', totalScore: 15.9, k1: 5.5, k5: 10.4 },
  { name: 'Standard App', totalScore: 31.5, k1: 10.5, k5: 21.0 },
];

export const GraySwanStyleSafetyChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 560;
  const height = 310;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 60;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const yTicks = [0, 10, 20, 30];
  const maxY = 35;

  const barWidth = 56;
  const totalBars = safetyData.length;
  const barGap = (chartWidth - barWidth * totalBars) / (totalBars + 1);

  const hoveredItem = hoveredIdx !== null ? safetyData[hoveredIdx] : null;

  return (
    <div className="relative group/card h-full w-full rounded-[28px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between hover:border-[#2F6D4C] hover:shadow-[0_24px_50px_-20px_rgba(100,216,142,0.22)] transition-[border-color,box-shadow] duration-200">
      {/* Header */}
      <div className="border-b border-[#1A3D2C] pb-4 mb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-semibold text-[#64D88E] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> CONSTRAINT SAFETY
          </span>
          <span className="font-mono text-[10.5px] px-2.5 py-0.5 rounded-full bg-[#163826] text-[#64D88E] border border-[#23583C] font-bold">
            0.00% Breaches
          </span>
        </div>
        <h3 className="font-tight font-bold text-xl sm:text-2xl text-white mt-1">
          Adversarial Safety Boundary
        </h3>
        <p className="font-tight text-xs text-[#A3B8AC] mt-0.5">
          Allergen & medical breach rate under adversarial prompting. Lower is better.
        </p>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2.5 font-mono text-[11px] text-[#8EA89B]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#64D88E]" />
            <span>NutriAI (Zero)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#225638]" />
            <span>External LLMs</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full my-auto py-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none font-tight"
        >
          {/* Y Axis Grid Lines */}
          {yTicks.map((tick) => {
            const y = paddingTop + chartHeight - (tick / maxY) * chartHeight;
            return (
              <g key={tick}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#163927"
                  strokeWidth="1"
                  strokeDasharray={tick === 0 ? undefined : '3,3'}
                />
                <text
                  x={paddingLeft - 10}
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

          {/* Baseline */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={width - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#214D36"
            strokeWidth="1.5"
          />

          {/* Stepped Bars */}
          {safetyData.map((item, idx) => {
            const barX = paddingLeft + barGap * (idx + 1) + barWidth * idx;
            const barCenterX = barX + barWidth / 2;
            const barH = (item.totalScore / maxY) * chartHeight;
            const barY = paddingTop + chartHeight - barH;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={item.name}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Score Above Bar */}
                <text
                  x={barCenterX}
                  y={barY - 8}
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="bold"
                  fill={item.isHero ? '#64D88E' : isHovered ? '#FFFFFF' : '#A3B8AC'}
                  fontFamily="monospace"
                >
                  {item.totalScore.toFixed(1)}%
                </text>

                {/* Bar Rect */}
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={Math.max(barH, 3)} // Ensure NutriAI's 0% has a crisp baseline anchor
                  rx="4"
                  ry="4"
                  fill={
                    item.isHero
                      ? '#64D88E'
                      : isHovered
                      ? '#2F6D4C'
                      : '#183D29'
                  }
                  stroke={item.isHero ? '#64D88E' : '#23583C'}
                  strokeWidth="1.2"
                  style={{
                    transition: 'all 0.2s ease',
                    filter: item.isHero || isHovered ? 'drop-shadow(0 0 8px rgba(100,216,142,0.35))' : undefined,
                  }}
                />

                {/* X Axis Label */}
                <text
                  x={barCenterX}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight={item.isHero ? '700' : '500'}
                  fill={item.isHero ? '#64D88E' : '#C2D6CB'}
                >
                  {item.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Invariant Footer */}
      <div className="pt-3 border-t border-[#1A3D2C] flex items-center justify-between text-[11px] font-mono text-[#7A9988]">
        <div className="flex items-center gap-1.5 text-[#64D88E]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Deterministic Boolean safety eliminates LLM hallucination</span>
        </div>
      </div>
    </div>
  );
};
