import React, { useState } from 'react';
import { DayPlan, UserProfile } from '../../types';
import { calculateNutritionTargets } from '../../nutrition/calculations';
import { Activity, Flame, Dumbbell, Wheat, Droplet } from 'lucide-react';

interface WeeklyNutritionLineChartProps {
  weeklyPlan: DayPlan[];
  profile: UserProfile;
}

export const WeeklyNutritionLineChart: React.FC<WeeklyNutritionLineChartProps> = ({
  weeklyPlan,
  profile,
}) => {
  const [metric, setMetric] = useState<'calories' | 'protein' | 'carbs' | 'fat'>('calories');
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null);

  const targets = calculateNutritionTargets(profile);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const metricConfigs = {
    calories: {
      label: 'Calories',
      unit: 'kcal',
      icon: Flame,
      color: '#2F7D4A', // soft primary green
      target: targets.dailyCalories,
      getValue: (d: DayPlan) => d.totalCalories,
    },
    protein: {
      label: 'Protein',
      unit: 'g',
      icon: Dumbbell,
      color: '#0284C7', // sky
      target: targets.proteinGrams,
      getValue: (d: DayPlan) => d.totalProtein,
    },
    carbs: {
      label: 'Carbs',
      unit: 'g',
      icon: Wheat,
      color: '#D97706', // amber
      target: targets.carbsGrams,
      getValue: (d: DayPlan) => d.meals.reduce((acc, m) => acc + (m.carbs || 0), 0),
    },
    fat: {
      label: 'Fat',
      unit: 'g',
      icon: Droplet,
      color: '#E11D48', // rose
      target: targets.fatGrams,
      getValue: (d: DayPlan) => d.meals.reduce((acc, m) => acc + (m.fat || 0), 0),
    },
  };

  const config = metricConfigs[metric];
  const Icon = config.icon;

  const values = weeklyPlan.map((d) => config.getValue(d));
  const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 0;

  // Chart coordinate math
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 30;

  const yMin = Math.min(minVal, config.target) * 0.85;
  const yMax = Math.max(maxVal, config.target) * 1.15;
  const yRange = yMax - yMin || 1;

  const points = values.map((val, idx) => {
    const x = paddingX + (idx / Math.max(1, values.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((val - yMin) / yRange) * (height - paddingY * 2);
    return { x, y, val, day: dayLabels[idx] || `Day ${idx + 1}` };
  });

  const linePath = points.length
    ? `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
    : '';

  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`
    : '';

  // Target line Y coordinate
  const targetY = height - paddingY - ((config.target - yMin) / yRange) * (height - paddingY * 2);

  return (
    <div className="bg-white rounded-2xl border border-surface-border p-6 shadow-card-subtle transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-600" />
            <h3 className="text-base font-semibold text-brand-800 tracking-tight">
              7-Day Macro Adherence Profile
            </h3>
          </div>
          <p className="text-xs text-surface-muted mt-0.5">
            Real daily variance across Monday through Sunday in active meal plan
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-surface-subtle border border-surface-border self-start sm:self-auto">
          {(['calories', 'protein', 'carbs', 'fat'] as const).map((mKey) => (
            <button
              key={mKey}
              onClick={() => setMetric(mKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium capitalize transition-all ${
                metric === mKey
                  ? 'bg-brand-100 text-brand-700 font-semibold border border-brand-300'
                  : 'text-surface-muted hover:text-brand-800'
              }`}
            >
              {mKey}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Quick Stats */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border">
          <span className="text-[10px] uppercase font-mono text-surface-muted font-medium">Target</span>
          <div className="text-sm font-bold font-mono text-brand-700">
            {config.target} <span className="text-[10px] text-surface-muted">{config.unit}</span>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border">
          <span className="text-[10px] uppercase font-mono text-surface-muted font-medium">Weekly Avg</span>
          <div className="text-sm font-bold font-mono text-brand-800">
            {avg} <span className="text-[10px] text-surface-muted">{config.unit}</span>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border">
          <span className="text-[10px] uppercase font-mono text-surface-muted font-medium">7-Day Range</span>
          <div className="text-sm font-bold font-mono text-brand-800">
            {minVal} - {maxVal}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border">
          <span className="text-[10px] uppercase font-mono text-surface-muted font-medium">Variance</span>
          <div className="text-sm font-bold font-mono text-brand-700">
            ±{Math.round(Math.max(Math.abs(maxVal - config.target), Math.abs(config.target - minVal)))} {config.unit}
          </div>
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="mt-4 relative bg-surface-subtle rounded-xl p-3 border border-surface-border">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 overflow-visible"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Target Reference Line */}
          <line
            x1={paddingX}
            y1={targetY}
            x2={width - paddingX}
            y2={targetY}
            stroke="#2F7D4A"
            strokeDasharray="4 4"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <text
            x={width - paddingX + 5}
            y={targetY + 3}
            fill="#2F7D4A"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Target {config.target}
          </text>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#areaGrad)" />

          {/* Progression Line */}
          <path
            d={linePath}
            fill="none"
            stroke={config.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => {
            const isHovered = hoveredDayIdx === idx;
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredDayIdx(idx)}
                onMouseLeave={() => setHoveredDayIdx(null)}
                className="cursor-pointer"
              >
                {/* Vertical helper on hover */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={height - paddingY}
                    stroke="#C7D8CD"
                    strokeDasharray="2 2"
                  />
                )}

                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#1F6339' : config.color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* Day label below */}
                <text
                  x={p.x}
                  y={height - 10}
                  textAnchor="middle"
                  fill="#68756D"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {p.day}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover readout box */}
        {hoveredDayIdx !== null && points[hoveredDayIdx] && (
          <div className="absolute top-4 left-6 px-3 py-1.5 rounded-lg bg-white border border-brand-300 shadow-modal text-xs font-mono">
            <span className="text-surface-muted">{points[hoveredDayIdx].day}: </span>
            <span className="text-brand-700 font-bold">
              {points[hoveredDayIdx].val} {config.unit}
            </span>
            <span className="text-surface-muted text-[10px] ml-2">
              (Diff: {points[hoveredDayIdx].val - config.target > 0 ? '+' : ''}
              {points[hoveredDayIdx].val - config.target} {config.unit})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
