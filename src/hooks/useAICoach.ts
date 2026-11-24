/**
 * AI Coach Intelligence Hook
 * 
 * Aggregates user profile, weekly plan, live ML API status,
 * audited model metrics, and deterministic personalization calculations.
 */

import { useState, useEffect, useMemo } from 'react';
import { useNutri } from '../context/NutriContext';
import { mlClient } from '../services/mlClient';
import { AUDITED_MODEL_METRICS, AUDITED_INTERPRETABILITY } from '../data/aiCoachData';
import {
  calculatePersonalizationRadar,
  calculatePipelineFunnel,
  explainMealSuitability,
} from '../services/aiCoachService';
import {
  SystemStatusReport,
  MealExplanationScore,
} from '../types/aiCoach';
import { Meal } from '../types';

export function useAICoach() {
  const { userProfile, weeklyPlan } = useNutri();
  const [isMLOnline, setIsMLOnline] = useState<boolean>(false);
  const [selectedMealId, setSelectedMealId] = useState<string>('');
  const [activeMetricTab, setActiveMetricTab] = useState<'accuracy' | 'precision' | 'recall' | 'f1_score'>('accuracy');
  const [activeValidationView, setActiveValidationView] = useState<'holdout' | 'cross_validation'>('holdout');

  // Check live FastAPI service health
  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      const online = await mlClient.checkHealth();
      if (mounted) setIsMLOnline(online);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 6000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // System status summary
  const systemStatus: SystemStatusReport = useMemo(() => {
    const mlState = isMLOnline ? 'ACTIVE' : 'OFFLINE';
    return {
      nutritionEngine: 'ACTIVE',
      constraintEngine: 'ACTIVE',
      decisionTree: isMLOnline ? 'ACTIVE' : 'OFFLINE',
      logisticRegression: isMLOnline ? 'ACTIVE' : 'OFFLINE',
      naiveBayes: isMLOnline ? 'ACTIVE' : 'OFFLINE',
      ensemble: isMLOnline ? 'ACTIVE' : 'OFFLINE',
      mlApi: mlState,
      recommendationMode: isMLOnline ? 'ML ENSEMBLE' : 'DETERMINISTIC FALLBACK',
    };
  }, [isMLOnline]);

  // Personalization radar dimensions
  const radarDimensions = useMemo(() => {
    return calculatePersonalizationRadar(userProfile, weeklyPlan);
  }, [userProfile, weeklyPlan]);

  // Recommendation pipeline funnel counts
  const funnelCounts = useMemo(() => {
    return calculatePipelineFunnel(userProfile, weeklyPlan);
  }, [userProfile, weeklyPlan]);

  // All meals flattened from weekly plan for selection
  const allScheduledMeals: Meal[] = useMemo(() => {
    return weeklyPlan.flatMap((d) => d.meals);
  }, [weeklyPlan]);

  // Active selected meal for "Why this meal?"
  const activeMeal = useMemo(() => {
    if (selectedMealId) {
      const found = allScheduledMeals.find((m) => m.id === selectedMealId);
      if (found) return found;
    }
    return allScheduledMeals[0] || null;
  }, [allScheduledMeals, selectedMealId]);

  // Explanation breakdown for active meal
  const mealExplanation: MealExplanationScore | null = useMemo(() => {
    if (!activeMeal) return null;
    return explainMealSuitability(activeMeal, userProfile);
  }, [activeMeal, userProfile]);

  return {
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
    activeMetricTab,
    setActiveMetricTab,
    activeValidationView,
    setActiveValidationView,
    metrics: AUDITED_MODEL_METRICS,
    interpretability: AUDITED_INTERPRETABILITY,
  };
}
