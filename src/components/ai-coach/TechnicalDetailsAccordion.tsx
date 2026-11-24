import React, { useState } from 'react';
import { ModelMetricsSummary } from '../../types/aiCoach';
import { ChevronDown, Code2, AlertTriangle, FileText, Cpu, Database } from 'lucide-react';

interface TechnicalDetailsAccordionProps {
  metrics: ModelMetricsSummary;
}

export const TechnicalDetailsAccordion: React.FC<TechnicalDetailsAccordionProps> = ({ metrics }) => {
  const [openSection, setOpenSection] = useState<string | null>('dataset');

  const toggle = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const sections = [
    {
      id: 'dataset',
      title: 'Training Dataset Specs',
      icon: Database,
      content: (
        <div className="space-y-2 text-xs text-[#A3B8AC] leading-relaxed">
          <p className="text-[11.5px]">
            <strong className="text-white">{metrics.dataset_info.total_samples} curated records</strong> (
            <span className="text-[#64D88E] font-semibold">{metrics.dataset_info.train_samples}</span> train,{' '}
            <span className="text-[#64D88E] font-semibold">{metrics.dataset_info.test_samples}</span> test) with 80/20 split and zero missing values.
          </p>
          <div className="grid grid-cols-2 gap-1.5 pt-1 font-mono text-[10.5px]">
            <div className="p-2 rounded-xl bg-[#0B1D14] border border-[#1A3D2C] text-center">
              <span className="text-[#7A9988] block text-[9.5px]">Vectors</span>
              <span className="text-white font-bold">{metrics.dataset_info.features_count} dims</span>
            </div>
            <div className="p-2 rounded-xl bg-[#0B1D14] border border-[#1A3D2C] text-center">
              <span className="text-[#7A9988] block text-[9.5px]">Validation</span>
              <span className="text-[#64D88E] font-bold">5-Fold Stratified</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'hyperparameters',
      title: 'Model Hyperparameters',
      icon: Cpu,
      content: (
        <div className="space-y-1.5 font-mono text-[10.5px]">
          <div className="p-2 rounded-xl bg-[#0B1D14] border border-[#1A3D2C]">
            <span className="text-[#64D88E] font-bold block">DT (50% weight):</span>
            <span className="text-[#A3B8AC]">max_depth=6, min_samples_leaf=5, gini</span>
          </div>
          <div className="p-2 rounded-xl bg-[#0B1D14] border border-[#1A3D2C]">
            <span className="text-[#A8D5B5] font-bold block">LR (30% weight):</span>
            <span className="text-[#A3B8AC]">C=1.0, max_iter=1000, lbfgs</span>
          </div>
          <div className="p-2 rounded-xl bg-[#0B1D14] border border-[#1A3D2C]">
            <span className="text-[#88D1A3] font-bold block">GNB (20% weight):</span>
            <span className="text-[#A3B8AC]">var_smoothing=1e-09</span>
          </div>
        </div>
      ),
    },
    {
      id: 'disclaimers',
      title: 'Scope & Medical Notice',
      icon: AlertTriangle,
      content: (
        <div className="space-y-1.5 text-[11px] leading-relaxed text-[#A3B8AC]">
          <div className="p-2.5 rounded-xl bg-[#1D1B10] border border-[#3E341B] text-[#FBBF24]">
            Evaluations demonstrate algorithmic consistency and engineering integrity, not medical diagnostics.
          </div>
          <p className="text-[10.5px] text-[#7A9988]">
            NutriAI calculations (BMR, TDEE, macros) are mathematical guidelines for wellness and athletic planning.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="relative group/card h-full w-full rounded-[28px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between hover:border-[#2F6D4C] hover:shadow-[0_24px_50px_-20px_rgba(100,216,142,0.22)] transition-[border-color,box-shadow] duration-200">
      {/* Header */}
      <div className="border-b border-[#1A3D2C] pb-4 mb-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-mono text-[11px] font-semibold text-[#64D88E] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> SPECIFICATIONS
          </span>
          <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#163826] text-[#A8D5B5] border border-[#23583C]">
            Audited v4
          </span>
        </div>
        <h3 className="font-tight font-bold text-xl sm:text-2xl text-white">
          Architecture Specs
        </h3>
        <p className="font-tight text-xs text-[#A3B8AC] mt-0.5">
          Audited model parameters, feature schemas, and operational scopes.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-2 my-auto py-1">
        {sections.map((sec) => {
          const isOpen = openSection === sec.id;
          const Icon = sec.icon;

          return (
            <div
              key={sec.id}
              className="rounded-2xl border border-[#1A3D2C] bg-[#10271C] overflow-hidden transition-all"
            >
              <button
                onClick={() => toggle(sec.id)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-[#143224] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-[#64D88E] shrink-0" />
                  <span className="text-xs font-semibold text-white">{sec.title}</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#7A9988] transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-[#64D88E]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-[#183D2B] bg-[#0C1F16]">
                  {sec.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#1A3D2C] flex items-center justify-between text-[11px] font-mono text-[#7A9988]">
        <div className="flex items-center gap-1.5 text-[#64D88E]">
          <Code2 className="w-3.5 h-3.5" />
          <span>Scikit-Learn audited runtime pipelines</span>
        </div>
      </div>
    </div>
  );
};
