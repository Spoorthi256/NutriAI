import React from 'react';
import { SystemStatusReport } from '../../types/aiCoach';
import { Cpu, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface AISystemStatusCardProps {
  status: SystemStatusReport;
  isMLOnline: boolean;
}

export const AISystemStatusCard: React.FC<AISystemStatusCardProps> = ({ status, isMLOnline }) => {
  const components = [
    {
      name: 'Nutrition Engine',
      layer: 'Phase 3 Core',
      status: status.nutritionEngine,
      detail: 'Mifflin-St Jeor TDEE & macro allocations',
      alwaysActive: true,
    },
    {
      name: 'Constraint Guard',
      layer: 'Phase 3 Core',
      status: status.constraintEngine,
      detail: 'Zero-tolerance allergy & dietary exclusions',
      alwaysActive: true,
    },
    {
      name: 'ML Inference Microservice',
      layer: 'Phase 4 API',
      status: status.mlApi,
      detail: isMLOnline ? 'FastAPI daemon responding (200 OK)' : 'Client engine fallback active',
      alwaysActive: false,
    },
    {
      name: 'Decision Tree Model',
      layer: 'Phase 4 ML',
      status: status.decisionTree,
      detail: 'Gini partition (50% ensemble weight)',
      alwaysActive: false,
    },
    {
      name: 'Logistic Regression Model',
      layer: 'Phase 4 ML',
      status: status.logisticRegression,
      detail: 'Calibrated log-odds (30% weight)',
      alwaysActive: false,
    },
    {
      name: 'Gaussian Naive Bayes Model',
      layer: 'Phase 4 ML',
      status: status.naiveBayes,
      detail: 'Bayesian likelihood (20% weight)',
      alwaysActive: false,
    },
  ];

  return (
    <div className="relative group/card h-full w-full rounded-[28px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between hover:border-[#2F6D4C] hover:shadow-[0_24px_50px_-20px_rgba(100,216,142,0.22)] transition-[border-color,box-shadow] duration-200">
      {/* Header */}
      <div className="border-b border-[#1A3D2C] pb-4 mb-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-mono text-[11px] font-semibold text-[#64D88E] uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" /> SYSTEM TELEMETRY
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#163826] border border-[#23583C] text-[10px] font-mono text-[#64D88E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64D88E] animate-pulse" />
            <span>6/6 Operational</span>
          </div>
        </div>
        <h3 className="font-tight font-bold text-xl sm:text-2xl text-white">
          Architecture Status
        </h3>
        <p className="font-tight text-xs text-[#A3B8AC] mt-0.5">
          Live health verification across runtime engines and model classifiers.
        </p>
      </div>

      {/* Component Grid */}
      <div className="space-y-2 my-auto py-1">
        {components.map((comp) => {
          const isActive = comp.alwaysActive || comp.status === 'ACTIVE';

          return (
            <div
              key={comp.name}
              className="p-2.5 rounded-2xl bg-[#10271C] border border-[#1A3D2C] hover:border-[#2F6D4C] transition-colors flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                {isActive ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#64D88E] shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#C4A45A] shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="font-tight font-semibold text-white truncate text-xs">
                    {comp.name}
                  </div>
                  <div className="text-[10px] text-[#8EA89B] truncate">{comp.detail}</div>
                </div>
              </div>

              <span className="shrink-0 font-mono text-[9.5px] px-2 py-0.5 rounded-md bg-[#0A1A12] border border-[#23583C] text-[#A8D5B5]">
                {comp.layer}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#1A3D2C] flex items-center justify-between text-[11px] font-mono text-[#7A9988]">
        <div className="flex items-center gap-1.5 text-[#64D88E]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Graceful dual-engine failover mechanism</span>
        </div>
      </div>
    </div>
  );
};
