import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { PersonalizationDimension } from '../../types/aiCoach';
import { Compass, Info } from 'lucide-react';

interface PersonalizationRadarProps {
  dimensions: PersonalizationDimension[];
}

export const PersonalizationRadar: React.FC<PersonalizationRadarProps> = ({ dimensions }) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const activeDim = dimensions[selectedIdx] || dimensions[0];

  // SVG Radar geometry calculations
  const size = 260;
  const center = size / 2;
  const radius = center - 35;
  const numPoints = dimensions.length;

  const getCoordinates = (index: number, score: number) => {
    const angle = (Math.PI * 2 / numPoints) * index - Math.PI / 2;
    const r = (score / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Build polygon points string
  const polygonPoints = dimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.score);
      return `${x},${y}`;
    })
    .join(' ');

  // Grid concentric rings at 25%, 50%, 75%, 100%
  const concentricRings = [0.25, 0.50, 0.75, 1.0];

  return (
    <Card className="p-6 bg-white border-surface-border space-y-6">
      {/* Header */}
      <div className="border-b border-surface-border pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-brand-600" /> PLAN ALIGNMENT PROFILE
          </span>
        </div>
        <h2 className="text-xl font-bold text-brand-800 tracking-tight">Active Plan Alignment & Target Adherence</h2>
        <p className="text-xs text-surface-muted mt-0.5">
          Measures mathematical adherence between your generated 7-Day Meal Plan and your configured caloric, macro, and dietary settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Custom SVG Radar Polygon */}
        <div className="md:col-span-6 flex flex-col items-center justify-center">
          <div className="relative">
            <svg width={size} height={size} className="overflow-visible select-none">
              {/* Concentric grid rings */}
              {concentricRings.map((factor, idx) => (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius * factor}
                  fill="none"
                  stroke="#E3E9E5"
                  strokeDasharray={idx < 3 ? '2,2' : undefined}
                  strokeWidth="1.5"
                />
              ))}

              {/* Axis rays from center */}
              {dimensions.map((_, i) => {
                const { x, y } = getCoordinates(i, 100);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="#E3E9E5"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Data polygon */}
              <polygon
                points={polygonPoints}
                fill="rgba(47, 125, 74, 0.15)"
                stroke="#2F7D4A"
                strokeWidth="2.5"
                className="transition-all duration-500"
              />

              {/* Interactive vertices */}
              {dimensions.map((d, i) => {
                const { x, y } = getCoordinates(i, d.score);
                const isSelected = selectedIdx === i;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={isSelected ? 6 : 4}
                    fill={isSelected ? '#1F6339' : '#2F7D4A'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="cursor-pointer transition-all hover:scale-125"
                    onClick={() => setSelectedIdx(i)}
                  />
                );
              })}
            </svg>
          </div>
          <span className="text-[11px] text-surface-muted font-mono mt-2">
            Click any dimension node to view mathematical derivation
          </span>
        </div>

        {/* Right: Dimension Breakdown and Inspector */}
        <div className="md:col-span-6 space-y-4">
          <div className="space-y-2">
            {dimensions.map((dim, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={dim.dimension}
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-brand-100/60 border-brand-300 shadow-sm'
                      : 'bg-white border-surface-border hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${isSelected ? 'text-brand-800' : 'text-brand-800'}`}>
                      {dim.dimension}
                    </span>
                    <span className="font-mono font-bold text-brand-700">
                      {dim.score} / 100
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-surface-subtle mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all duration-500"
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Dimension Explanation Box */}
          {activeDim && (
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-700 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-brand-600" />
                  {activeDim.dimension} Derivation
                </span>
                <span className="font-mono text-[10px] text-surface-muted">Source: {activeDim.source}</span>
              </div>
              <p className="text-brand-800 text-[11px] leading-relaxed">
                {activeDim.explanation}
              </p>
              <div className="text-[10px] text-surface-muted pt-1 border-t border-surface-border flex items-center justify-between">
                <span>Calculated Plan Adherence</span>
                <span>Planning metric • Not medical advice</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
