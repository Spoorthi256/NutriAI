import React from 'react';
import { useAICoach } from '../../hooks/useAICoach';
import { AICoachHero } from './AICoachHero';
import { PersonalizationRadar } from './PersonalizationRadar';
import { RecommendationFunnel } from './RecommendationFunnel';
import { WeeklyNutritionLineChart } from './WeeklyNutritionLineChart';
import { PersonalizationOverTimePlaceholder } from './PersonalizationOverTimePlaceholder';
import { HowNutriAIThinksPipeline } from './HowNutriAIThinksPipeline';
import { WhyThisMealInspector } from './WhyThisMealInspector';
import { ModelIntelligenceChart } from './ModelIntelligenceChart';
import { EnsembleWeightsDonut } from './EnsembleWeightsDonut';
import { CrossValidationPanel } from './CrossValidationPanel';
import { FeatureImportanceChart } from './FeatureImportanceChart';
import { AISystemStatusCard } from './AISystemStatusCard';
import { TechnicalDetailsAccordion } from './TechnicalDetailsAccordion';

export const AICoachView: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-surface-bg text-brand-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
        
        {/* 1. Hero Header & Quick Stats */}
        <AICoachHero
          isMLOnline={isMLOnline}
          totalMeals={funnelCounts.totalMeals}
        />

        {/* 2. Top Intelligence Row: Personalization Profile Radar + Recommendation Filtering Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PersonalizationRadar dimensions={radarDimensions} />
          <RecommendationFunnel counts={funnelCounts} />
        </div>

        {/* 3. 7-Day Macro Adherence Line Chart + Adaptive Learning Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyNutritionLineChart
            weeklyPlan={weeklyPlan}
            profile={userProfile}
          />
          <PersonalizationOverTimePlaceholder />
        </div>

        {/* 4. Interactive Recommendation Pipeline Walkthrough */}
        <HowNutriAIThinksPipeline />

        {/* 5. "Why This Meal?" Detailed Inspector */}
        <WhyThisMealInspector
          meals={allScheduledMeals}
          activeMeal={activeMeal}
          explanation={mealExplanation}
          onSelectMeal={setSelectedMealId}
          isMLOnline={isMLOnline}
        />

        {/* 6. ML Performance Architecture: Comparative Charts & Ensemble Weights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModelIntelligenceChart metrics={metrics} />
          <EnsembleWeightsDonut weights={metrics.ensemble_weights} />
        </div>

        {/* 7. Deep Statistical Rigor: 5-Fold Cross Validation + Feature Importance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CrossValidationPanel metrics={metrics} />
          <FeatureImportanceChart data={interpretability} />
        </div>

        {/* 8. Diagnostic Health Check + Technical Specifications Accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AISystemStatusCard
            status={systemStatus}
            isMLOnline={isMLOnline}
          />
          <TechnicalDetailsAccordion metrics={metrics} />
        </div>

      </div>
    </div>
  );
};
