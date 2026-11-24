import React, { useState } from 'react';
import {
  User,
  Calculator,
  ShieldCheck,
  Database,
  Cpu,
  Sparkles,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StageNode {
  id: string;
  step: string;
  title: string;
  tag: string;
  icon: React.ElementType;
  input: string;
  transformation: string;
  output: string;
  details: string;
}

export const HowNutriAIThinksPipeline: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<string>('hard_constraints');

  const stages: StageNode[] = [
    {
      id: 'profile',
      step: '01',
      title: 'User Profile',
      tag: 'INPUT STATE',
      icon: User,
      input: 'Age, weight, height, sex, fitness goal, activity level, allergies',
      transformation: 'Biometric sanitization & profile vector encoding',
      output: 'Validated immutable UserProfile entity',
      details: 'Captures full user biometrics and dietary declarations through natural language onboarding. Zero assumptions are made on allergen tolerance.',
    },
    {
      id: 'targets',
      step: '02',
      title: 'Nutrition Targets',
      tag: 'METABOLIC ENGINE',
      icon: Calculator,
      input: 'UserProfile entity & activity coefficient',
      transformation: 'Mifflin-St Jeor equation + goal-specific caloric differential',
      output: 'Daily kcal budget + protein, carb, fat gram allotments per slot',
      details: 'Calculates Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE). Precision macro allotments are mathematically partitioned across breakfast, lunch, dinner, and snacks.',
    },
    {
      id: 'hard_constraints',
      step: '03',
      title: 'Hard Constraints',
      tag: 'SAFETY BOUNDARY',
      icon: ShieldCheck,
      input: 'Complete 420-recipe catalogue + user allergen & diet sets',
      transformation: 'Deterministic Boolean mask pruning',
      output: 'Guaranteed safe subset of compatible recipes',
      details: 'Zero-tolerance safety invariant. Any candidate recipe containing user allergens (e.g. peanuts, tree nuts, dairy) or violating active dietary philosophies (e.g. vegan, keto) is permanently pruned before ML ranking.',
    },
    {
      id: 'candidate_pool',
      step: '04',
      title: 'Compatible Pool',
      tag: 'CLEAN CANDIDATES',
      icon: Database,
      input: 'Safe recipe subset & active daily slot constraints',
      transformation: 'Slot feasibility indexing & nutrient density sorting',
      output: 'Rankable candidate cohorts per meal slot',
      details: 'Safe recipes are indexed by slot compatibility, caloric feasibility, and macro balance ready for multi-model ranking.',
    },
    {
      id: 'ml_scoring',
      step: '05',
      title: 'ML Recommendation',
      tag: 'PREFERENCE SCORING',
      icon: Cpu,
      input: '20-dimensional engineered feature vectors per candidate',
      transformation: 'Tri-model convex ensemble: DT(50%) + LR(30%) + NB(20%)',
      output: 'Calibrated suitability probability score ∈ [0, 1]',
      details: 'Machine learning ensemble scores candidates using Decision Trees for thresholding, Logistic Regression for calibrated odds, and Naive Bayes for probabilistic density estimation.',
    },
    {
      id: 'optimization',
      step: '06',
      title: 'Variety Balancing',
      tag: 'SCHEDULE HEURISTICS',
      icon: Sparkles,
      input: 'Top-ranked candidate lists across 7 days',
      transformation: 'Recency decay penalties & disliked-ingredient down-weighting',
      output: 'Diversified weekly meal assignments',
      details: 'Prevents recipe repetition on adjacent days while rotating culinary flavor profiles, ingredients, and texture across the full 7-day calendar.',
    },
    {
      id: 'final_plan',
      step: '07',
      title: '7-Day Plan',
      tag: 'FINAL ARTIFACT',
      icon: Calendar,
      input: 'Optimized weekly schedule assignments',
      transformation: 'Plan compilation & delivery logistics verification',
      output: '7-day structured plan with QR delivery manifests',
      details: 'Compiles the finished schedule into the interactive workspace, allowing natural language chat mutations, recipe card inspections, and smart delivery tracking.',
    },
  ];

  const activeStage = stages.find((s) => s.id === activeStageId) || stages[2];
  const ActiveIcon = activeStage.icon;

  return (
    <div className="relative group/card w-full rounded-[28px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 sm:p-8 text-white shadow-xl hover:border-[#2F6D4C] hover:shadow-[0_24px_50px_-20px_rgba(100,216,142,0.22)] transition-all">
      {/* Header */}
      <div className="border-b border-[#1A3D2C] pb-5 mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] font-semibold text-[#64D88E] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> DECISION ENGINE PIPELINE
            </span>
          </div>
          <h3 className="font-tight font-bold text-2xl sm:text-3xl text-white">
            End-to-End Decision Architecture
          </h3>
          <p className="font-tight text-xs sm:text-sm text-[#A3B8AC] mt-1 max-w-2xl">
            How NutriAI transitions from conversational user inputs to a medically bounded, machine-learning personalized plan across 7 deterministic phases.
          </p>
        </div>

        <div className="font-mono text-xs px-3 py-1 rounded-full bg-[#163826] text-[#64D88E] border border-[#23583C] self-start sm:self-auto">
          Stage {activeStage.step} of 07 Selected
        </div>
      </div>

      {/* Responsive Horizontal Stepper Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
        {stages.map((stage) => {
          const isSelected = activeStageId === stage.id;
          const Icon = stage.icon;

          return (
            <button
              key={stage.id}
              onClick={() => setActiveStageId(stage.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-[#183E2A] border-[#64D88E] shadow-[0_0_16px_rgba(100,216,142,0.2)]'
                  : 'bg-[#10271C] border-[#1A3D2C] hover:border-[#2F6D4C] hover:bg-[#133022]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-[#7A9988] font-bold">
                  {stage.step}
                </span>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-[#23583C] text-[#64D88E]' : 'bg-[#0D2218] text-[#8EA89B]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="font-tight font-bold text-xs text-white truncate">
                {stage.title}
              </div>
              <div className="font-mono text-[9.5px] text-[#8EA89B] truncate mt-0.5">
                {stage.tag}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Deep-Dive Inspector */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="p-5 sm:p-6 rounded-2xl bg-[#122E21] border border-[#1F4532]"
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Left Description */}
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1B4D33] flex items-center justify-center text-[#64D88E]">
                  <ActiveIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-mono text-[10.5px] text-[#64D88E] uppercase tracking-wider">
                    STAGE {activeStage.step} • {activeStage.tag}
                  </div>
                  <h4 className="font-tight font-bold text-lg text-white">
                    {activeStage.title}
                  </h4>
                </div>
              </div>
              <p className="font-tight text-xs sm:text-[13px] text-[#C2D6CB] leading-relaxed">
                {activeStage.details}
              </p>
            </div>

            {/* Right Data Pipeline Flow */}
            <div className="lg:w-[460px] shrink-0 space-y-2 font-mono text-xs">
              {/* Input */}
              <div className="p-2.5 rounded-xl bg-[#0B1D14] border border-[#1A3D2C] flex items-start gap-2">
                <span className="text-[#7A9988] shrink-0 uppercase text-[10px]">Input:</span>
                <span className="text-[#A8D5B5] leading-tight text-[11px]">{activeStage.input}</span>
              </div>

              {/* Transformation */}
              <div className="p-2.5 rounded-xl bg-[#163826] border border-[#23583C] flex items-start gap-2">
                <span className="text-[#64D88E] shrink-0 uppercase text-[10px] font-bold">Logic:</span>
                <span className="text-white leading-tight text-[11px]">{activeStage.transformation}</span>
              </div>

              {/* Output */}
              <div className="p-2.5 rounded-xl bg-[#0B1D14] border border-[#1A3D2C] flex items-start gap-2">
                <span className="text-[#64D88E] shrink-0 uppercase text-[10px]">Output:</span>
                <span className="text-[#64D88E] font-semibold leading-tight text-[11px]">{activeStage.output}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
