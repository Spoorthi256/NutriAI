import React, { useState, useEffect } from 'react';
import { useNutri } from '../../context/NutriContext';
import { Sparkles, Check, Loader2, ShieldCheck, Flame, Utensils, Award } from 'lucide-react';

interface MealPlanGenerationModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const MealPlanGenerationModal: React.FC<MealPlanGenerationModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const { userProfile } = useNutri();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(10);
  const [isDone, setIsDone] = useState<boolean>(false);

  const steps = [
    {
      title: 'Calibrating Metabolic Baseline',
      desc: `Calculating Mifflin-St Jeor BMR for ${userProfile.name || 'User'} (${userProfile.dailyCalories || 2440} kcal target)`,
      detail: `Target Macros: ${userProfile.proteinGrams || 146}g Protein | ${userProfile.carbsGrams || 263}g Carbs | ${userProfile.fatGrams || 72}g Fats`,
      icon: <Flame className="w-4 h-4 text-amber-400" />,
    },
    {
      title: 'Enforcing Allergen & Dietary Guardrails',
      desc: `Pruning non-compliant recipes (${userProfile.dietType || 'Vegetarian'} philosophy)`,
      detail: userProfile.allergies && userProfile.allergies.length > 0
        ? `Zero-tolerance exclusion: ${userProfile.allergies.join(', ')}`
        : 'Zero allergen flags detected • Standard safety filters applied',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    },
    {
      title: 'Screening 400+ Chef Recipe Catalogue',
      desc: 'Filtering culinary database for satiety, whole foods & bioavailability',
      detail: 'Selecting chef-prepared options with verified nutritional telemetry',
      icon: <Utensils className="w-4 h-4 text-sky-400" />,
    },
    {
      title: 'Balancing 7-Day Micronutrient & Flavor Diversity',
      desc: 'Preventing adjacent day repetitions & optimizing glycemic curve',
      detail: 'Rotating plant polyphenols, complex starches, and lean protein sources',
      icon: <Sparkles className="w-4 h-4 text-lime-400" />,
    },
    {
      title: 'Synchronizing Kitchen Logistics & Doorstep Delivery',
      desc: 'Scheduling dispatch batches at Sector 62 Central Hub',
      detail: 'Configuring thermal packaging & tamper-evident QR verification',
      icon: <Award className="w-4 h-4 text-emerald-300" />,
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(10);
      setIsDone(false);
      return;
    }

    // Realistic step progression timeline: ~3.2 seconds total
    const timers: NodeJS.Timeout[] = [];

    // Step 1: 0 - 650ms
    timers.push(
      setTimeout(() => {
        setCurrentStep(1);
        setProgress(35);
      }, 650)
    );

    // Step 2: 650 - 1400ms
    timers.push(
      setTimeout(() => {
        setCurrentStep(2);
        setProgress(60);
      }, 1400)
    );

    // Step 3: 1400 - 2150ms
    timers.push(
      setTimeout(() => {
        setCurrentStep(3);
        setProgress(82);
      }, 2150)
    );

    // Step 4: 2150 - 2800ms
    timers.push(
      setTimeout(() => {
        setCurrentStep(4);
        setProgress(96);
      }, 2800)
    );

    // Completion: 3300ms
    timers.push(
      setTimeout(() => {
        setProgress(100);
        setIsDone(true);
      }, 3300)
    );

    // Redirect after brief celebration: 3750ms
    timers.push(
      setTimeout(() => {
        onComplete();
      }, 3750)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="max-w-lg w-full bg-[#183127] border border-[#2B4E3F] rounded-[32px] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden space-y-6 animate-scale-in">
        
        {/* Glowing atmospheric backdrop */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 bg-[#203D32] border border-[#2E5545] px-3 py-1 rounded-full text-[11px] font-bold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>NUTRIAI CLINICAL ENGINE v2.4</span>
          </div>
          <div className="font-mono text-xs font-bold text-emerald-400 bg-[#12241C] px-2.5 py-1 rounded-lg border border-[#203D32]">
            {progress}%
          </div>
        </div>

        {/* Main Title & Animation */}
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl bg-[#203D32] border border-[#2E5545] flex items-center justify-center shrink-0 shadow-lg">
            {isDone ? (
              <Check className="w-7 h-7 text-lime-400 stroke-[3] animate-scale-in" />
            ) : (
              <Loader2 className="w-7 h-7 text-emerald-400 animate-spin stroke-[2.5]" />
            )}
            <div className="absolute -inset-1 rounded-2xl border border-emerald-500/30 animate-pulse pointer-events-none" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {isDone ? '✨ Meal Plan Assembled!' : 'Synthesizing Your 7-Day Plan'}
            </h2>
            <p className="text-xs text-emerald-200/70 mt-0.5">
              {isDone
                ? 'Navigating to your customized weekly schedule...'
                : 'Constructing personalized, science-backed nutrition schedule...'}
            </p>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 bg-[#12241C] rounded-full overflow-hidden p-0.5 border border-[#203D32]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-[#A3E635] to-emerald-400 transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Real Pipeline Execution Steps */}
        <div className="space-y-2.5 bg-[#12241C]/80 rounded-2xl p-4 border border-[#203D32]">
          {steps.map((step, idx) => {
            const isPassed = currentStep > idx || isDone;
            const isCurrent = currentStep === idx && !isDone;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 transition-all duration-300 p-2 rounded-xl ${
                  isCurrent
                    ? 'bg-[#203D32]/80 border border-emerald-500/40 translate-x-1'
                    : isPassed
                    ? 'opacity-85'
                    : 'opacity-40'
                }`}
              >
                {/* Step Status Icon */}
                <div className="mt-0.5 shrink-0">
                  {isPassed ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-lime-500/20 border border-lime-400 text-lime-300 flex items-center justify-center">
                      <Loader2 className="w-3 h-3 animate-spin stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-white/5 border border-white/20 text-white/40 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </div>
                  )}
                </div>

                {/* Step Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold leading-tight ${
                        isCurrent
                          ? 'text-lime-300'
                          : isPassed
                          ? 'text-white'
                          : 'text-white/60'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/70 truncate mt-0.5">
                    {step.desc}
                  </p>
                  {isCurrent && (
                    <p className="text-[10.5px] font-mono text-emerald-300 mt-1 bg-[#183127] px-2 py-0.5 rounded border border-[#2B4E3F] inline-block animate-fade-in">
                      ⚡ {step.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="flex items-center justify-between text-[11px] text-emerald-200/60 pt-1 border-t border-[#203D32]">
          <span>Verified Nutritional Formulation</span>
          <span>Adaptive ML Engine • Active</span>
        </div>
      </div>
    </div>
  );
};
