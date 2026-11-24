/**
 * AI Coach Intelligence Page Type Definitions
 */

export interface ModelMetricSet {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
}

export interface CrossValidationMetricSet {
  mean_accuracy: number;
  std_accuracy: number;
  mean_precision: number;
  std_precision: number;
  mean_recall: number;
  std_recall: number;
  mean_f1: number;
  std_f1: number;
}

export interface ModelMetricsSummary {
  holdout_test: Record<'decision_tree' | 'logistic_regression' | 'naive_bayes' | 'ensemble', ModelMetricSet>;
  holdout_train: Record<'decision_tree' | 'logistic_regression' | 'naive_bayes' | 'ensemble', ModelMetricSet>;
  cross_validation_5fold: Record<'decision_tree' | 'logistic_regression' | 'naive_bayes' | 'ensemble', CrossValidationMetricSet>;
  dataset_info: {
    total_samples: number;
    train_samples: number;
    test_samples: number;
    features_count: number;
  };
  ensemble_weights: {
    decision_tree: number;
    logistic_regression: number;
    naive_bayes: number;
  };
}

export interface FeatureImportanceData {
  decision_tree_top_features: Record<string, number>;
  logistic_regression_top_coefficients: Record<string, number>;
  feature_count: number;
}

export interface PersonalizationDimension {
  dimension: string;
  score: number; // 0 - 100
  explanation: string;
  source: string;
}

export interface MealExplanationScore {
  mealId: string;
  mealName: string;
  category: string;
  calories: number;
  protein: number;
  goalAlignment: number; // 0 - 100
  calorieMatch: number;   // 0 - 100
  proteinMatch: number;   // 0 - 100
  preferenceFit: number;  // 0 - 100
  varietyScore: number;   // 0 - 100
  mlProbabilities?: {
    decisionTree: number;
    logisticRegression: number;
    naiveBayes: number;
    ensemble: number;
  };
}

export interface PipelineFunnelCounts {
  totalMeals: number;
  dietCompatible: number;
  allergyCompatible: number;
  slotCandidates: number;
  weeklyPlanMeals: number;
}

export type EngineStatusState = 'ACTIVE' | 'OFFLINE' | 'FALLBACK';

export interface SystemStatusReport {
  nutritionEngine: EngineStatusState;
  constraintEngine: EngineStatusState;
  decisionTree: EngineStatusState;
  logisticRegression: EngineStatusState;
  naiveBayes: EngineStatusState;
  ensemble: EngineStatusState;
  mlApi: EngineStatusState;
  recommendationMode: 'ML ENSEMBLE' | 'DETERMINISTIC FALLBACK';
}
