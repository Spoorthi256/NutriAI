import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
  BrainCircuit,
  ShieldCheck,
  Activity,
  Cpu,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useNutri } from '../../context/NutriContext';
import { useAICoach } from '../../hooks/useAICoach';
import { calculateNutritionTargets } from '../../nutrition/calculations';

// Core cognitive sections
import { ScrollTextScrubber } from './ScrollTextScrubber';
import { HowNutriAIThinksPipeline } from './HowNutriAIThinksPipeline';

// Scientific evaluation suite & Bento charts (Strictly matching user's Image 1 Bento layout)
import { BenchmarkComparisonTable } from './BenchmarkComparisonTable';
import { DeepSWEStyleBarChart } from './DeepSWEStyleBarChart'; // Fixed coordinate alignment
import { EnsembleWeightsDonut } from './EnsembleWeightsDonut'; // Fixed text overlap & interactive hover
import { ArthurRadarChart } from './ArthurRadarChart'; // 6-axis adherence radar
import { VertexDotsLineChart } from './VertexDotsLineChart'; // Smooth Bezier tracking curve
import { GraySwanStyleSafetyChart } from './GraySwanStyleSafetyChart'; // Adversarial safety
import { RecommendationFunnel } from './RecommendationFunnel'; // 5-stage reduction funnel
import { WhyThisMealInspector } from './WhyThisMealInspector'; // Live meal explainability
import { CrossValidationPanel } from './CrossValidationPanel'; // 5-fold stratified CV
import { FeatureImportanceChart } from './FeatureImportanceChart'; // Feature weights
import { AISystemStatusCard } from './AISystemStatusCard'; // Telemetry & health
import { TechnicalDetailsAccordion } from './TechnicalDetailsAccordion'; // Specs & disclaimers

const EASE = [0.22, 1, 0.36, 1] as const;

export const LogoMark: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <img src="/nutriai_logo.png" alt="NutriAI" className={`${className} object-contain rounded-full`} />
);

export const AICoachDedicatedPage: React.FC = () => {
  const { setActiveView, setActiveTab, resetConversation } = useNutri();
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    userProfile,
    weeklyPlan,
    isMLOnline,
    systemStatus,
    radarDimensions,
    funnelCounts,
    allScheduledMeals,
    activeMeal,
    mealExplanation,
    setSelectedMealId,
    metrics,
    interpretability,
  } = useAICoach();

  const handleStartOnboarding = () => {
    setActiveView('auth');
  };

  const navLinks = [
    { label: 'Home', onClick: () => setActiveView('landing') },
    { label: 'About', onClick: () => setActiveView('landing') },
    { label: 'AI Coach', active: true, onClick: () => {} },
  ];

  // Derive weekly line chart points from user's live weekly plan
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayAbbr: Record<string, string> = {
    Monday: 'Mon',
    Tuesday: 'Tue',
    Wednesday: 'Wed',
    Thursday: 'Thu',
    Friday: 'Fri',
    Saturday: 'Sat',
    Sunday: 'Sun',
  };

  const targets = calculateNutritionTargets(userProfile);
  const targetCalories = targets.dailyCalories;

  const weeklyLinePoints = daysOrder.map((dayName) => {
    const dayPlan = weeklyPlan?.find((p) => p.day === dayName);
    const actualKcal =
      dayPlan?.meals?.reduce((acc, m) => acc + (m.calories || 0), 0) || targetCalories;
    return {
      day: dayAbbr[dayName] || dayName.slice(0, 3),
      actual: actualKcal,
      target: targetCalories,
    };
  });

  return (
    <div className="min-h-screen bg-[#07130D] text-white font-tight antialiased selection:bg-[#2F7D4A] selection:text-white">
      {/* ---------------- FLOATING PILL NAVBAR ---------------- */}
      <header className="fixed top-5 inset-x-0 z-50 flex justify-center px-4">
        <motion.nav
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative w-full max-w-[780px] h-[56px] flex items-center justify-between gap-4 rounded-full bg-[#ECECE5]/95 backdrop-blur-md px-3 sm:px-4 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.5)] border border-[#E4DFD4]"
        >
          {/* Logo */}
          <button
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-2.5 pl-2 text-[#1F3A30] hover:opacity-90 transition-opacity"
          >
            <LogoMark className="w-[22px] h-[22px]" />
            <span className="font-tight font-bold italic tracking-[-0.03em] text-[18px]">NutriAI</span>
          </button>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((l) => (
              <button
                key={l.label}
                onClick={l.onClick}
                className={`px-4 py-1.5 rounded-full font-tight text-[14px] transition-all ${
                  l.active
                    ? 'bg-[#1F3A30] text-white font-semibold shadow-sm'
                    : 'text-[#1F3A30]/80 hover:text-[#1F3A30] hover:bg-black/[0.04] font-medium'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('auth')}
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full font-tight text-[14px] text-[#1F3A30] font-semibold hover:bg-black/[0.04] transition-all"
            >
              Sign In
            </button>
            <button
              onClick={handleStartOnboarding}
              className="group hidden sm:inline-flex items-center gap-2 h-[42px] px-5 rounded-full bg-[#1F3A30] hover:bg-[#2B4C3F] text-white font-tight font-semibold text-[14px] tracking-[-0.01em] transition-all shadow-sm"
            >
              Start your plan now
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Open menu"
              className="w-[42px] h-[42px] rounded-full bg-[#BFCBC3] hover:bg-[#AFBDB4] text-[#1F3A30] flex items-center justify-center transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" strokeWidth={1.8} />}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="absolute right-0 top-[calc(100%+12px)] w-64 rounded-3xl bg-[#ECECE5] p-3 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] border border-[#E4DFD4]"
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setActiveView('landing');
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-[14.5px] text-[#1F3A30] hover:bg-[#BFCBC3]/40 transition-colors"
                >
                  Home
                  <ArrowUpRight className="w-4 h-4 opacity-50" />
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setActiveView('landing');
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-[14.5px] text-[#1F3A30] hover:bg-[#BFCBC3]/40 transition-colors"
                >
                  About
                  <ArrowUpRight className="w-4 h-4 opacity-50" />
                </button>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-[14.5px] font-semibold text-[#1F3A30] bg-[#BFCBC3]/60 transition-colors"
                >
                  AI Coach (Active)
                  <BrainCircuit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setActiveView('auth');
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-[14.5px] text-[#1F3A30] hover:bg-[#BFCBC3]/40 transition-colors"
                >
                  Sign In / Sign Up
                  <ArrowUpRight className="w-4 h-4 opacity-50" />
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleStartOnboarding();
                  }}
                  className="sm:hidden mt-2 w-full h-11 rounded-2xl bg-[#1F3A30] text-white font-semibold text-[14.5px]"
                >
                  Start your plan now
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </header>

      {/* ---------------- 1. CLEAN EDITORIAL HERO (NO SPINNING RING!) ---------------- */}
      <section className="relative min-h-[92vh] pt-36 pb-20 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#050E09] via-[#07130D] to-[#0A1A12]">
        {/* Soft Ambient Radial Glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[820px] h-[520px] rounded-full bg-[#2F7D4A]/12 blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-[1240px] mx-auto px-6 flex flex-col items-center text-center">
          {/* Top Pill Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#122D1F] border border-[#1E4D34] mb-8 text-[12.5px] font-mono text-[#A8D5B5]"
          >
            <span className="w-2 h-2 rounded-full bg-[#64D88E] animate-pulse" />
            <span>FROZEN PHASE 4 ML CORE</span>
            <span className="text-[#3E7D58]">•</span>
            <span className="text-white font-semibold">100% DETERMINISTIC SAFETY</span>
            <span className="text-[#3E7D58]">•</span>
            <span className="text-[#64D88E]">&lt; 12MS INFERENCE</span>
          </motion.div>

          {/* EDITORIAL HERO TYPOGRAPHY: CLEAN, BOLD, AND STATELY */}
          <div className="relative flex flex-col items-center justify-center select-none w-full">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.2, ease: EASE }}
              className="font-display text-white text-[76px] sm:text-[115px] md:text-[150px] lg:text-[180px] leading-[0.88] tracking-[-0.015em] uppercase"
            >
              YOUR AI
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.35, ease: EASE }}
              className="font-display text-transparent bg-clip-text bg-gradient-to-r from-[#64D88E] via-[#A8D5B5] to-[#FFFFFF] text-[76px] sm:text-[115px] md:text-[150px] lg:text-[180px] leading-[0.88] tracking-[-0.015em] uppercase"
            >
              COACH
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            className="mt-8 max-w-[680px] font-tight text-[16px] sm:text-[19px] leading-[1.6] text-[#A3B8AC]"
          >
            NutriAI unifies machine-learning ranking models with evidence-based physiology — delivering transparent,
            adaptive nutrition engineered for human performance.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-4"
          >
            <button
              onClick={handleStartOnboarding}
              className="group inline-flex items-center gap-2.5 h-[54px] px-8 rounded-full bg-[#2F7D4A] hover:bg-[#3B965B] text-white font-tight font-semibold text-[15px] tracking-[-0.01em] shadow-[0_12px_28px_-8px_rgba(47,125,74,0.6)] transition-all hover:-translate-y-0.5"
            >
              Experience Live AI Workspace
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <a
              href="#evaluations"
              className="inline-flex items-center gap-2 h-[54px] px-6 rounded-full bg-[#10271C] hover:bg-[#163826] border border-[#1A3D2C] hover:border-[#2F6D4C] text-[#C2D6CB] hover:text-white font-tight font-medium text-[14.5px] transition-all"
            >
              Explore Scientific Verification Suite
              <ChevronRight className="w-4 h-4 text-[#64D88E]" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ---------------- 2. SMOOTH STICKY SCROLL SCRUBBER ---------------- */}
      <ScrollTextScrubber text="NutriAI Intelligence is faster, smarter and engineered for human performance" />

      {/* ---------------- 3. COGNITIVE ARCHITECTURE (IMPROVED HIGH-DENSITY CARDS) ---------------- */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0A1A12] border-t border-[#143324]">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#163826] border border-[#23583C] text-[#64D88E] text-xs font-semibold uppercase tracking-wider font-mono">
              <Cpu className="w-3.5 h-3.5" /> Autonomous Cognitive Architecture
            </div>
            <h2 className="font-display text-[36px] sm:text-[50px] leading-tight text-white">
              How NutriAI Understands Human Nutrition
            </h2>
            <p className="font-tight text-[15px] sm:text-[16px] text-[#A3B8AC] leading-relaxed">
              Unlike simplistic calorie calculators or hallucinatory chatbot prompts, NutriAI implements a 4-tier
              autonomous intelligence pipeline combining metabolic equations, zero-leakage safety filters, and
              probabilistic ensemble ranking.
            </p>
          </div>

          {/* 4 Sleek High-Density Cognitive Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1 */}
            <div className="relative group/pillar rounded-[26px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 hover:border-[#2F6D4C] hover:shadow-[0_20px_45px_-20px_rgba(100,216,142,0.2)] transition-[border-color,box-shadow] duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#163826] border border-[#23583C] flex items-center justify-center text-[#64D88E]">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#64D88E]">01</span>
                </div>
                <h4 className="font-tight font-bold text-lg text-white mb-1">
                  Physiological Perception
                </h4>
                <div className="font-mono text-[10.5px] text-[#7A9988] mb-2.5 uppercase tracking-wider">
                  Mifflin-St Jeor Engine
                </div>
                <p className="font-tight text-xs text-[#A3B8AC] leading-relaxed">
                  Applies validated Mifflin-St Jeor metabolic equations, activity coefficients, and goal differentials to
                  partition daily calorie and macronutrient budgets precisely across meal slots.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1A3D2C] flex items-center justify-between text-[10.5px] font-mono text-[#64D88E]">
                <span>±0 kcal deviation</span>
                <span>Deterministic</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="relative group/pillar rounded-[26px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 hover:border-[#2F6D4C] hover:shadow-[0_20px_45px_-20px_rgba(100,216,142,0.2)] transition-[border-color,box-shadow] duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#163826] border border-[#23583C] flex items-center justify-center text-[#64D88E]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#64D88E]">02</span>
                </div>
                <h4 className="font-tight font-bold text-lg text-white mb-1">
                  Hard Constraint Satisfier
                </h4>
                <div className="font-mono text-[10.5px] text-[#7A9988] mb-2.5 uppercase tracking-wider">
                  Zero-Leakage Invariant
                </div>
                <p className="font-tight text-xs text-[#A3B8AC] leading-relaxed">
                  A non-negotiable zero-leakage Boolean filter. Meals containing user allergens or violating dietary
                  philosophies (vegan, vegetarian, keto) are pruned before candidate ranking.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1A3D2C] flex items-center justify-between text-[10.5px] font-mono text-[#64D88E]">
                <span>0.00% allergen breach</span>
                <span>Safety Guard</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="relative group/pillar rounded-[26px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 hover:border-[#2F6D4C] hover:shadow-[0_20px_45px_-20px_rgba(100,216,142,0.2)] transition-[border-color,box-shadow] duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#163826] border border-[#23583C] flex items-center justify-center text-[#64D88E]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#64D88E]">03</span>
                </div>
                <h4 className="font-tight font-bold text-lg text-white mb-1">
                  Multi-Model Ensemble
                </h4>
                <div className="font-mono text-[10.5px] text-[#7A9988] mb-2.5 uppercase tracking-wider">
                  Tri-Model Probability
                </div>
                <p className="font-tight text-xs text-[#A3B8AC] leading-relaxed">
                  Combines Decision Trees (50%), Logistic Regression (30%), and Gaussian Naive Bayes (20%) in an
                  ensemble to score and rank candidates with optimal balance and diversity.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1A3D2C] flex items-center justify-between text-[10.5px] font-mono text-[#64D88E]">
                <span>3 Blended Models</span>
                <span>95% Holdout Acc</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="relative group/pillar rounded-[26px] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] p-6 hover:border-[#2F6D4C] hover:shadow-[0_20px_45px_-20px_rgba(100,216,142,0.2)] transition-[border-color,box-shadow] duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#163826] border border-[#23583C] flex items-center justify-center text-[#64D88E]">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#64D88E]">04</span>
                </div>
                <h4 className="font-tight font-bold text-lg text-white mb-1">
                  Conversational Action Core
                </h4>
                <div className="font-mono text-[10.5px] text-[#7A9988] mb-2.5 uppercase tracking-wider">
                  Atomic State Mutations
                </div>
                <p className="font-tight text-xs text-[#A3B8AC] leading-relaxed">
                  Interprets natural language commands like "swap Wednesday dinner for higher protein" into atomic
                  plan mutations while safeguarding against contradictory requests.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1A3D2C] flex items-center justify-between text-[10.5px] font-mono text-[#64D88E]">
                <span>Context Aware</span>
                <span>Active Planner</span>
              </div>
            </div>
          </div>

          {/* Interactive Responsive Decision Pipeline */}
          <div>
            <HowNutriAIThinksPipeline />
          </div>
        </div>
      </section>

      {/* ---------------- 4. STATS & KEY MODEL TELEMETRY ---------------- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0A1A12] via-[#0E261B] to-[#0A1A12] border-t border-[#143324]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#4F9D69] font-semibold">
              Empirical Performance Verification
            </span>
            <h3 className="font-display text-2xl sm:text-4xl text-white">
              Production Telemetry & Generalization Metrics
            </h3>
          </div>

          {/* 5 High-Impact Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] text-center hover:border-[#2F6D4C] transition-all shadow-md">
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#64D88E]">95.0%</div>
              <div className="font-tight font-semibold text-xs text-white mt-1">Holdout Accuracy</div>
              <div className="font-mono text-[10px] text-[#7A9988] mt-0.5">80/20 Test Holdout</div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] text-center hover:border-[#2F6D4C] transition-all shadow-md">
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#64D88E]">0.9236</div>
              <div className="font-tight font-semibold text-xs text-white mt-1">5-Fold CV Mean F1</div>
              <div className="font-mono text-[10px] text-[#7A9988] mt-0.5">±0.0131 Std Dev</div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] text-center hover:border-[#2F6D4C] transition-all shadow-md">
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#64D88E]">&lt; 12ms</div>
              <div className="font-tight font-semibold text-xs text-white mt-1">Inference Latency</div>
              <div className="font-mono text-[10px] text-[#7A9988] mt-0.5">In-Memory Engine</div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] text-center hover:border-[#2F6D4C] transition-all shadow-md">
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#64D88E]">0.00%</div>
              <div className="font-tight font-semibold text-xs text-white mt-1">Allergen Breach Rate</div>
              <div className="font-mono text-[10px] text-[#7A9988] mt-0.5">Zero-Tolerance Guard</div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0F271C] to-[#0B1D14] border border-[#1A3D2C] text-center col-span-2 md:col-span-1 hover:border-[#2F6D4C] transition-all shadow-md">
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#64D88E]">1,200</div>
              <div className="font-tight font-semibold text-xs text-white mt-1">Training Samples</div>
              <div className="font-mono text-[10px] text-[#7A9988] mt-0.5">Zero Null Values</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 5. PINTEREST BENTO GRID (MATCHING IMAGE 1 EXACTLY!) ---------------- */}
      <section id="evaluations" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#07130D] border-t border-[#143324]">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#163826] border border-[#23583C] text-[#64D88E] text-xs font-semibold uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5" /> Scientific Verification Suite
            </div>
            <h2 className="font-display text-[36px] sm:text-[48px] leading-tight text-white">
              Visualizing Model Performance & Safety
            </h2>
            <p className="font-tight text-[16px] text-[#A3B8AC] leading-relaxed">
              Real evaluation artifacts, benchmark comparisons, and constraint boundary tests rendered directly from
              the frozen Phase 4 model suite.
            </p>
          </div>

          {/* BENTO HERO: Scientific Benchmark Comparison Table (Full Width) */}
          <div className="w-full">
            <BenchmarkComparisonTable />
          </div>

          {/* ============================================================== */}
          {/* BENTO GRID PROPER (MATCHING USER SKETCH IN IMAGE 1)            */}
          {/* Row 1: [ 2-col wide (left)  | 1-col (right) ]                  */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left (Span 2): Holdout Generalization Accuracy Bar Chart */}
            <div className="lg:col-span-2">
              <DeepSWEStyleBarChart metrics={metrics} />
            </div>

            {/* Right (Span 1): Ensemble Weights Donut */}
            <div className="lg:col-span-1">
              <EnsembleWeightsDonut weights={metrics.ensemble_weights} />
            </div>
          </div>

          {/* ============================================================== */}
          {/* Row 2: [ 1-col (left)       | 2-col wide (right) ]             */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left (Span 1): 6-Axis Adherence Radar Chart */}
            <div className="lg:col-span-1">
              <ArthurRadarChart
                data={radarDimensions.map((d) => ({
                  label: d.dimension,
                  score: d.score,
                }))}
              />
            </div>

            {/* Right (Span 2): Smooth Caloric Tracking Bezier Curve */}
            <div className="lg:col-span-2">
              <VertexDotsLineChart points={weeklyLinePoints} />
            </div>
          </div>

          {/* ============================================================== */}
          {/* Row 3: [ 1-col | 1-col | 1-col (3 equal columns) ]             */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Col 1: Adversarial Constraint Safety Chart */}
            <div className="lg:col-span-1">
              <GraySwanStyleSafetyChart />
            </div>

            {/* Col 2: Candidate Reduction Funnel */}
            <div className="lg:col-span-1">
              <RecommendationFunnel counts={funnelCounts} />
            </div>

            {/* Col 3: Why This Meal Inspector */}
            <div className="lg:col-span-1">
              <WhyThisMealInspector
                meals={allScheduledMeals}
                activeMeal={activeMeal}
                explanation={mealExplanation}
                onSelectMeal={setSelectedMealId}
                isMLOnline={isMLOnline}
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* DEEP VERIFICATION SUITE: 1, 2, 4 CARDS IN ONE ROW               */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch pt-2">
            {/* Card 1: 5-Fold Stratified Cross-Validation */}
            <div className="lg:col-span-1">
              <CrossValidationPanel metrics={metrics} />
            </div>

            {/* Card 2: Architecture Telemetry Status */}
            <div className="lg:col-span-1">
              <AISystemStatusCard status={systemStatus} isMLOnline={isMLOnline} />
            </div>

            {/* Card 4: Architecture Specifications & Equations */}
            <div className="lg:col-span-1">
              <TechnicalDetailsAccordion metrics={metrics} />
            </div>
          </div>

          {/* ============================================================== */}
          {/* CARD 3 IN ITS OWN FULL-WIDTH ROW                               */}
          {/* ============================================================== */}
          <div className="w-full pt-2">
            <FeatureImportanceChart data={interpretability} />
          </div>
        </div>
      </section>

      {/* ---------------- 6. BOTTOM HIGH IMPACT CTA ---------------- */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0A1A12] via-[#0E261B] to-[#050E09] text-center border-t border-[#143324]">
        <div className="max-w-[700px] mx-auto space-y-6">
          <h2 className="font-display text-white text-[42px] sm:text-[56px] leading-[1.05] uppercase">
            Ready to train with intelligent nutrition?
          </h2>
          <p className="font-tight text-[16px] text-[#BFCBC3] max-w-[500px] mx-auto leading-relaxed">
            Experience real-time meal planning, custom macronutrient targets, and door-to-door delivery validation.
          </p>
          <div className="pt-2">
            <button
              onClick={handleStartOnboarding}
              className="inline-flex items-center gap-2.5 h-[54px] px-8 rounded-full bg-[#2F7D4A] hover:bg-[#3B965B] text-white font-tight font-semibold text-[15px] shadow-[0_12px_28px_-8px_rgba(47,125,74,0.6)] transition-all hover:-translate-y-0.5"
            >
              Start Your Personalised Plan
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- 7. FOOTER ---------------- */}
      <footer className="bg-[#050E09] text-white px-6 pt-14 pb-10 border-t border-white/10">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-12">
          <div>
            <div className="flex items-center gap-2.5 text-[26px] font-tight font-bold italic tracking-tight">
              <LogoMark className="w-[26px] h-[26px]" />
              <span>NutriAI</span>
            </div>
            <p className="mt-8 max-w-[280px] font-tight font-semibold text-[14.5px] leading-snug text-[#BFCBC3]">
              Intelligent Wellbeing for Individuals, Teams and Global Workforces.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 font-tight text-[13.5px]">
            <div>
              <div className="font-semibold text-white mb-3">Product</div>
              <ul className="space-y-2.5 text-white/70">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>AI Coach</button></li>
                <li><button onClick={() => setActiveView('landing')}>Features</button></li>
                <li><button onClick={handleStartOnboarding}>Build my plan</button></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-3">Company</div>
              <ul className="space-y-2.5 text-white/70">
                <li><button onClick={() => setActiveView('landing')}>About</button></li>
                <li><button onClick={() => setActiveView('landing')}>Reviews</button></li>
                <li><button onClick={() => setActiveView('landing')}>Contact</button></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-3">Legal</div>
              <ul className="space-y-2.5 text-white/70">
                <li><span>Terms of Use</span></li>
                <li><span>Privacy Policy</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-[1000px] mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2 font-tight text-[12px] text-white/40">
          <span>© {new Date().getFullYear()} NutriAI Health Systems. All rights reserved.</span>
          <span>Nutrition estimates are for planning purposes and are not medical advice.</span>
        </div>
      </footer>
    </div>
  );
};
