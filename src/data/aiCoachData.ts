/**
 * Audited Phase 4 Model Metrics and Interpretability Data Source
 * 
 * Sources:
 * - ml/artifacts/metrics.json (audited on 1,200 samples, 80/20 split and 5-fold CV)
 * - ml/artifacts/interpretability.json (scikit-learn feature importances and coefficients)
 */

import { ModelMetricsSummary, FeatureImportanceData } from '../types/aiCoach';

export const AUDITED_MODEL_METRICS: ModelMetricsSummary = {
  holdout_test: {
    decision_tree: {
      accuracy: 0.9500,
      precision: 0.9562,
      recall: 0.9562,
      f1_score: 0.9562,
    },
    logistic_regression: {
      accuracy: 0.7375,
      precision: 0.7284,
      recall: 0.8613,
      f1_score: 0.7893,
    },
    naive_bayes: {
      accuracy: 0.6958,
      precision: 0.7222,
      recall: 0.7591,
      f1_score: 0.7402,
    },
    ensemble: {
      accuracy: 0.9500,
      precision: 0.9562,
      recall: 0.9562,
      f1_score: 0.9562,
    },
  },
  holdout_train: {
    decision_tree: {
      accuracy: 0.9708,
      precision: 0.9675,
      recall: 0.9817,
      f1_score: 0.9745,
    },
    logistic_regression: {
      accuracy: 0.7781,
      precision: 0.7836,
      recall: 0.8425,
      f1_score: 0.8120,
    },
    naive_bayes: {
      accuracy: 0.7656,
      precision: 0.7892,
      recall: 0.8022,
      f1_score: 0.7956,
    },
    ensemble: {
      accuracy: 0.9313,
      precision: 0.9167,
      recall: 0.9670,
      f1_score: 0.9412,
    },
  },
  cross_validation_5fold: {
    decision_tree: {
      mean_accuracy: 0.9559,
      std_accuracy: 0.0133,
      mean_precision: 0.9554,
      std_precision: 0.0156,
      mean_recall: 0.9677,
      std_recall: 0.0145,
      mean_f1: 0.9614,
      std_f1: 0.0118,
    },
    logistic_regression: {
      mean_accuracy: 0.7600,
      std_accuracy: 0.0222,
      mean_precision: 0.7684,
      std_precision: 0.0221,
      mean_recall: 0.8287,
      std_recall: 0.0155,
      mean_f1: 0.7973,
      std_f1: 0.0168,
    },
    naive_bayes: {
      mean_accuracy: 0.7550,
      std_accuracy: 0.0403,
      mean_precision: 0.7842,
      std_precision: 0.0360,
      mean_recall: 0.7863,
      std_recall: 0.0337,
      mean_f1: 0.7852,
      std_f1: 0.0344,
    },
    ensemble: {
      mean_accuracy: 0.9100,
      std_accuracy: 0.0168,
      mean_precision: 0.8960,
      std_precision: 0.0228,
      mean_recall: 0.9532,
      std_recall: 0.0035,
      mean_f1: 0.9236,
      std_f1: 0.0131,
    },
  },
  dataset_info: {
    total_samples: 1200,
    train_samples: 960,
    test_samples: 240,
    features_count: 36,
  },
  ensemble_weights: {
    decision_tree: 0.35,
    logistic_regression: 0.40,
    naive_bayes: 0.25,
  },
};

export const AUDITED_INTERPRETABILITY: FeatureImportanceData = {
  decision_tree_top_features: {
    'calorie_ratio': 0.55409,
    'protein_ratio': 0.31827,
    'user_target_carbs': 0.09752,
    'meal_protein': 0.00859,
    'meal_carbs': 0.00814,
    'protein_density': 0.00426,
    'slot_target_protein': 0.00382,
    'slot_target_calories': 0.00213,
    'meal_fiber': 0.00124,
    'user_age': 0.00104,
  },
  logistic_regression_top_coefficients: {
    'protein_density': -3.06683,
    'protein_ratio': 2.77287,
    'calorie_ratio': -2.33353,
    'user_gender_unspecified': -0.64585,
    'user_goal_muscle_gain': 0.63140,
    'slot_category_lunch': -0.61395,
    'meal_protein': 0.58927,
    'slot_category_snack': 0.56514,
    'user_goal_weight_gain': -0.53258,
    'user_gender_male': 0.43162,
  },
  feature_count: 36,
};
