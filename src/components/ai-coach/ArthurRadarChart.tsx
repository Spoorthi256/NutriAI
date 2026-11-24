import React, { useState } from 'react';
import { Compass, Sparkles, CheckCircle2 } from 'lucide-react';

export interface RadarDimensionData {
  label: string;
  score: number;
}

interface ArthurRadarChartProps {
  data?: RadarDimensionData[];
}

const defaultDimensions: RadarDimensionData[] = [
  { label: 'Caloric Target', score: 94 },
  { label: 'Protein Density', score: 88 },
  { label: 'Allergen Safety', score: 100 },
  { label: 'Diet Compliance', score: 96 },
  { label: 'Macro Balance', score: 85 },
  { label: 'Schedule Fit', score: 90 },
];

export const ArthurRadarChart: React.FC<ArthurRadarChartProps> = ({ data = defaultDimensions }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const size = 260;
  const center = size / 2;
  const maxRadius = 92;
  const rings = [25, 50, 75, 100];
  const numAxes = data.length;

  const getCoordinates = (index: number, score: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (score / 100) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const getRingPoints = (ringScore: number) => {
    return Array.from({ length: numAxes }, (_, i) => {
      const { x, y } = getCoordinates(i, ringScore);
      return `${x},${y}`;
    }).join(' ');
  };

  const dataPolygonPoints = data
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.score);
      return `${x},${y}`;
    })
    .join(' ');

  const compositeScore = Math.round(data.reduce((acc, d) => acc + d.score, 0) / data.length);
  const hoveredDimension = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="relative group/card h-full w-full rounded-[28px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between hover:border-[#2F6D4C] hover:shadow-[0_24px_50px_-20px_rgba(100,216,142,0.22)] transition-[border-color,box-shadow] duration-200">
      {/* Header */}
      <div className="border-b border-[#1A3D2C] pb-4 mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] font-semibold text-[#64D88E] uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> PLAN ALIGNMENT PROFILE
            </span>
          </div>
          <h3 className="font-tight font-bold text-xl sm:text-2xl text-white">
            6-Axis Adherence Radar
          </h3>
          <p className="font-tight text-xs text-[#A3B8AC] mt-1">
            Personalization fidelity across calories, protein, allergens & weekly schedule.
          </p>
        </div>

        <span className="shrink-0 font-mono text-xs px-3 py-1 rounded-full bg-[#163826] text-[#64D88E] border border-[#23583C] font-semibold">
          {compositeScore}% Adherence
        </span>
      </div>

      {/* SVG Spider Radar */}
      <div className="relative flex flex-col items-center justify-center my-auto py-2">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-[210px] sm:w-[230px] h-[210px] sm:h-[230px] overflow-visible select-none"
        >
          <defs>
            <radialGradient id="radarCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2F7D4A" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0F271C" stopOpacity="0.0" />
            </radialGradient>
            <linearGradient id="radarPolygonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64D88E" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#2F7D4A" stopOpacity="0.18" />
            </linearGradient>
          </defs>

          {/* Central Radial Atmosphere */}
          <circle cx={center} cy={center} r={maxRadius} fill="url(#radarCenterGlow)" />

          {/* Concentric Polygons */}
          {rings.map((ringScore) => (
            <polygon
              key={ringScore}
              points={getRingPoints(ringScore)}
              fill="none"
              stroke="#1A402D"
              strokeWidth="1.2"
              strokeDasharray={ringScore < 100 ? '3,3' : undefined}
            />
          ))}

          {/* Radial Axis Spokes */}
          {data.map((_, idx) => {
            const { x, y } = getCoordinates(idx, 100);
            return (
              <line
                key={idx}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#1B422F"
                strokeWidth="1.2"
              />
            );
          })}

          {/* Data Polygon */}
          <polygon
            points={dataPolygonPoints}
            fill="url(#radarPolygonGrad)"
            stroke="#64D88E"
            strokeWidth="2.4"
            strokeLinejoin="round"
            style={{
              filter: 'drop-shadow(0 0 12px rgba(100,216,142,0.3))',
              transition: 'all 0.3s ease',
            }}
          />

          {/* Interactive Vertex Nodes */}
          {data.map((d, idx) => {
            const { x, y } = getCoordinates(idx, d.score);
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={d.label}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Node Ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 7 : 4.5}
                  fill={isHovered ? '#FFFFFF' : '#64D88E'}
                  stroke="#07130D"
                  strokeWidth="2"
                  style={{
                    transition: 'all 0.2s ease',
                    filter: isHovered ? 'drop-shadow(0 0 8px #64D88E)' : undefined,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Dimension Inspector Banner (Fixed height to prevent resizing) */}
        <div className="h-6 mt-1 flex items-center justify-center text-center">
          {hoveredDimension ? (
            <span className="font-mono text-xs text-[#64D88E] font-bold">
              {hoveredDimension.label}: {hoveredDimension.score}%
            </span>
          ) : (
            <span className="font-mono text-[11px] text-[#7A9988]">
              Hover vertices to inspect scores
            </span>
          )}
        </div>
      </div>

      {/* Metric Breakdown Grid (Bento Chips) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-[#1A3D2C]">
        {data.map((d, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={d.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                isHovered
                  ? 'bg-[#183E2A] border-[#64D88E]'
                  : 'bg-[#10271C] border-[#1A3D2C] hover:border-[#2F6D4C]'
              }`}
            >
              <div className="text-[10.5px] text-[#8EA89B] truncate">{d.label}</div>
              <div className="font-mono font-bold text-xs sm:text-[13px] text-[#64D88E] mt-0.5">
                {d.score}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
