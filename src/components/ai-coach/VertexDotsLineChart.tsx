import React, { useState } from 'react';
import { Flame, Activity, Sparkles, TrendingUp } from 'lucide-react';

interface DayPoint {
  day: string;
  actual: number;
  target: number;
}

const defaultWeeklyPoints: DayPoint[] = [
  { day: 'Mon', actual: 2180, target: 2200 },
  { day: 'Tue', actual: 2240, target: 2200 },
  { day: 'Wed', actual: 2190, target: 2200 },
  { day: 'Thu', actual: 2260, target: 2200 },
  { day: 'Fri', actual: 2210, target: 2200 },
  { day: 'Sat', actual: 2250, target: 2200 },
  { day: 'Sun', actual: 2200, target: 2200 },
];

export const VertexDotsLineChart: React.FC<{ points?: DayPoint[] }> = ({
  points = defaultWeeklyPoints,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 680;
  const height = 340;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 35;
  const paddingBottom = 55;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const yTicks = [1000, 1500, 2000, 2500];
  const minY = 800;
  const maxY = 2600;

  const getX = (idx: number) => paddingLeft + (idx / (points.length - 1)) * chartWidth;
  const getY = (val: number) =>
    paddingTop + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;

  // Build smooth Bezier curve spline
  const getCurvePath = () => {
    if (points.length < 2) return '';
    let d = `M ${getX(0)} ${getY(points[0].actual)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const x0 = getX(i);
      const y0 = getY(points[i].actual);
      const x1 = getX(i + 1);
      const y1 = getY(points[i + 1].actual);
      const cx = (x0 + x1) / 2;
      d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    return d;
  };

  const curvePath = getCurvePath();
  const areaPath = `${curvePath} L ${getX(points.length - 1)} ${paddingTop + chartHeight} L ${getX(0)} ${paddingTop + chartHeight} Z`;
  const targetY = getY(points[0]?.target || 2200);

  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="relative group/card h-full w-full rounded-[28px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between hover:border-[#2F6D4C] hover:shadow-[0_24px_50px_-20px_rgba(100,216,142,0.22)] transition-all overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1A3D2C] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] font-semibold text-[#64D88E] uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> METABOLIC TRAJECTORY
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#163826] text-[#A8D5B5] border border-[#23583C]">
              Mifflin-St Jeor Bound
            </span>
          </div>
          <h3 className="font-tight font-bold text-xl sm:text-2xl text-white">
            Weekly Caloric Tracking Horizon
          </h3>
          <p className="font-tight text-xs text-[#A3B8AC] mt-1">
            Scheduled daily caloric intake tracking strictly against metabolic target with zero dangerous drift.
          </p>
        </div>

        {/* Hover Inspector Quick Metric */}
        {hoveredPoint ? (
          <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#163826] border border-[#2F6D4C] text-xs font-mono">
            <span className="text-[#8EA89B]">{hoveredPoint.day}:</span>
            <span className="font-bold text-[#64D88E]">{hoveredPoint.actual} kcal</span>
            <span className="text-[#7A9988]">
              ({hoveredPoint.actual >= hoveredPoint.target ? '+' : ''}
              {hoveredPoint.actual - hoveredPoint.target} kcal)
            </span>
          </div>
        ) : (
          <div className="shrink-0 flex items-center gap-2 px-3 py-1 rounded-full bg-[#163826] text-[#64D88E] border border-[#23583C] font-mono text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Target: {points[0]?.target || 2200} kcal/day</span>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full my-auto py-3 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-hidden select-none"
        >
          <defs>
            <linearGradient id="curveAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F9D69" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#10271C" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#163927"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fontFamily="monospace"
                  fill="#7A9988"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Area Under Curve */}
          <path d={areaPath} fill="url(#curveAreaGrad)" />

          {/* Main Bezier Spline */}
          <path
            d={curvePath}
            fill="none"
            stroke="#64D88E"
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 4px 10px rgba(100,216,142,0.4))',
            }}
          />

          {/* Day Vertex Nodes */}
          {points.map((p, idx) => {
            const cx = getX(idx);
            const cy = getY(p.actual);
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={p.day}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Glow ring on hover */}
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill="#64D88E"
                    fillOpacity="0.25"
                    stroke="#64D88E"
                    strokeWidth="1.5"
                  />
                )}

                {/* Node circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4.5}
                  fill={isHovered ? '#FFFFFF' : '#64D88E'}
                  stroke="#07130D"
                  strokeWidth="2"
                  style={{
                    transition: 'all 0.2s ease',
                    filter: isHovered ? 'drop-shadow(0 0 8px #64D88E)' : undefined,
                  }}
                />

                {/* Hover Value Tooltip above node */}
                {isHovered && (
                  <g>
                    <rect
                      x={cx - 36}
                      y={cy - 34}
                      width="72"
                      height="24"
                      rx="6"
                      fill="#12301F"
                      stroke="#64D88E"
                      strokeWidth="1"
                    />
                    <text
                      x={cx}
                      y={cy - 18}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="monospace"
                      fill="#FFFFFF"
                    >
                      {p.actual} kcal
                    </text>
                  </g>
                )}

                {/* Day Label on X Axis */}
                <text
                  x={cx}
                  y={paddingTop + chartHeight + 24}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight={isHovered ? '700' : '500'}
                  fontFamily="monospace"
                  fill={isHovered ? '#FFFFFF' : '#8EA89B'}
                  style={{ transition: 'fill 0.2s ease' }}
                >
                  {p.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Invariant Note */}
      <div className="pt-4 border-t border-[#1A3D2C] flex items-center justify-between text-[11px] font-mono text-[#7A9988]">
        <div className="flex items-center gap-1.5 text-[#64D88E]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Average daily variance &lt; 2.1% against target ceiling</span>
        </div>
        <span className="text-[#A3B8AC]">Continuous Adaptation</span>
      </div>
    </div>
  );
};
