import React from 'react';
import { useNutri } from '../../context/NutriContext';
import { ArtifactType } from '../../types';
import { NutritionProfileArtifact } from './NutritionProfileArtifact';
import { WeeklyMealPlanArtifact } from './WeeklyMealPlanArtifact';
import { DeliveryQRArtifact } from './DeliveryQRArtifact';
import { Sparkles, FileText, Calendar, Truck, Download } from 'lucide-react';

export const ArtifactWorkspace: React.FC = () => {
  const { activeArtifact, setActiveArtifact, sendMessage } = useNutri();

  const artifactTabs: { id: ArtifactType; label: string; icon: React.ReactNode }[] = [
    { id: 'nutrition_profile', label: 'Nutrition Profile', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'weekly_meal_plan', label: '7-Day Meal Plan', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'delivery_schedule', label: 'Delivery Pass & QR', icon: <Truck className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white border-l border-surface-border overflow-hidden select-none">
      {/* Top Workspace Header */}
      <div className="h-12 border-b border-surface-border px-6 flex items-center justify-between flex-shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-bold text-brand-800 uppercase tracking-wider">
            Structured Artifact Workspace
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => sendMessage('Export my current artifact as a PDF document')}
            className="p-1.5 rounded-lg text-surface-muted hover:text-brand-800 hover:bg-surface-hover text-xs flex items-center gap-1 transition-colors font-medium"
            title="Export Artifact"
          >
            <Download className="w-3.5 h-3.5 text-surface-muted" /> Export
          </button>
        </div>
      </div>

      {/* Artifact Tab Switcher */}
      <div className="p-3 border-b border-surface-border bg-surface-subtle flex items-center gap-2 overflow-x-auto no-scrollbar">
        {artifactTabs.map((tab) => {
          const isActive = activeArtifact === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveArtifact(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-100 text-brand-700 border border-brand-300 shadow-sm'
                  : 'bg-white hover:bg-surface-hover text-surface-muted hover:text-brand-800 border border-surface-border'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Artifact Viewport Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {activeArtifact === 'nutrition_profile' && <NutritionProfileArtifact />}
        {activeArtifact === 'weekly_meal_plan' && <WeeklyMealPlanArtifact />}
        {activeArtifact === 'delivery_schedule' && <DeliveryQRArtifact />}
      </div>
    </div>
  );
};
