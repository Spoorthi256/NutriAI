"""
Comprehensive ML Model Training, Evaluation, and Cross-Validation Pipeline

Features:
- Stratified 80/20 train/test holdout evaluation
- 5-Fold Stratified Cross-Validation (Mean & Std for Acc, Prec, Rec, F1)
- Training vs Test comparison (overfitting audit)
- Feature importance and interpretability extraction
- Zero-leakage pipeline fit only on train split/folds

DISCLAIMER:
Metrics reported here demonstrate the prototype ML pipeline's ability to fit
synthetic training patterns. They do NOT represent clinical validation.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from ml.services.feature_engineering import FeatureEngineeringPipeline
from ml.models.decision_tree import DecisionTreeRecommender
from ml.models.logistic_regression import LogisticRegressionRecommender
from ml.models.naive_bayes import NaiveBayesRecommender
from ml.models.ensemble import EnsembleRecommender

ARTIFACTS_DIR = 'ml/artifacts'
DATA_PATH = 'ml/data/training_data.csv'

def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, model_name: str) -> dict:
    return {
        'model': model_name,
        'accuracy': round(float(accuracy_score(y_true, y_pred)), 4),
        'precision': round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        'recall': round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        'f1_score': round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
    }

def run_cross_validation(df: pd.DataFrame, n_splits: int = 5, random_state: int = 42) -> dict:
    """
    Performs strict 5-fold Stratified Cross Validation.
    In each fold, FeatureEngineeringPipeline is fitted ONLY on the fold training data.
    """
    X_raw = df.drop(columns=['is_recommended'])
    y = df['is_recommended'].values

    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)

    fold_results = {
        'decision_tree': {'accuracy': [], 'precision': [], 'recall': [], 'f1_score': []},
        'logistic_regression': {'accuracy': [], 'precision': [], 'recall': [], 'f1_score': []},
        'naive_bayes': {'accuracy': [], 'precision': [], 'recall': [], 'f1_score': []},
        'ensemble': {'accuracy': [], 'precision': [], 'recall': [], 'f1_score': []},
    }

    for fold_idx, (train_idx, val_idx) in enumerate(skf.split(X_raw, y)):
        X_train_fold_raw = X_raw.iloc[train_idx]
        X_val_fold_raw = X_raw.iloc[val_idx]
        y_train_fold = y[train_idx]
        y_val_fold = y[val_idx]

        # Fit feature pipeline strictly on fold training data
        fold_pipeline = FeatureEngineeringPipeline()
        X_train_fold, _ = fold_pipeline.fit_transform(X_train_fold_raw)
        X_val_fold = fold_pipeline.transform(X_val_fold_raw)

        # 1. Decision Tree
        dt = DecisionTreeRecommender(max_depth=5, min_samples_split=10, random_state=random_state)
        dt.fit(X_train_fold, y_train_fold)
        m_dt = compute_metrics(y_val_fold, dt.predict(X_val_fold), "DT")
        for k in ['accuracy', 'precision', 'recall', 'f1_score']:
            fold_results['decision_tree'][k].append(m_dt[k])

        # 2. Logistic Regression
        lr = LogisticRegressionRecommender(C=1.0, max_iter=1000, random_state=random_state)
        lr.fit(X_train_fold, y_train_fold)
        m_lr = compute_metrics(y_val_fold, lr.predict(X_val_fold), "LR")
        for k in ['accuracy', 'precision', 'recall', 'f1_score']:
            fold_results['logistic_regression'][k].append(m_lr[k])

        # 3. Naive Bayes
        nb = NaiveBayesRecommender(var_smoothing=1e-9)
        nb.fit(X_train_fold, y_train_fold)
        m_nb = compute_metrics(y_val_fold, nb.predict(X_val_fold), "NB")
        for k in ['accuracy', 'precision', 'recall', 'f1_score']:
            fold_results['naive_bayes'][k].append(m_nb[k])

        # 4. Weighted Ensemble
        ensemble = EnsembleRecommender(dt, lr, nb, dt_weight=0.35, lr_weight=0.40, nb_weight=0.25)
        m_ens = compute_metrics(y_val_fold, ensemble.predict(X_val_fold), "Ensemble")
        for k in ['accuracy', 'precision', 'recall', 'f1_score']:
            fold_results['ensemble'][k].append(m_ens[k])

    cv_summary = {}
    for model_key, metrics_dict in fold_results.items():
        cv_summary[model_key] = {
            'mean_accuracy': round(float(np.mean(metrics_dict['accuracy'])), 4),
            'std_accuracy': round(float(np.std(metrics_dict['accuracy'])), 4),
            'mean_precision': round(float(np.mean(metrics_dict['precision'])), 4),
            'std_precision': round(float(np.std(metrics_dict['precision'])), 4),
            'mean_recall': round(float(np.mean(metrics_dict['recall'])), 4),
            'std_recall': round(float(np.std(metrics_dict['recall'])), 4),
            'mean_f1': round(float(np.mean(metrics_dict['f1_score'])), 4),
            'std_f1': round(float(np.std(metrics_dict['f1_score'])), 4),
        }

    return cv_summary

def run_training_pipeline():
    print("=" * 70)
    print("NUTRIAI PHASE 4 — ML RECOMMENDATION AUDIT & TRAINING PIPELINE")
    print("=" * 70)

    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Training dataset not found at {DATA_PATH}. Run generate_dataset.py first.")

    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} samples from {DATA_PATH}")

    X_raw = df.drop(columns=['is_recommended'])
    y = df['is_recommended'].values

    # 1. 80/20 Holdout Split (stratified, random_state=42)
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_raw, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"Holdout: Train={len(X_train_raw)} (pos={np.sum(y_train)}) | Test={len(X_test_raw)} (pos={np.sum(y_test)})")

    # 2. Fit Feature Engineering Pipeline strictly on train split
    pipeline = FeatureEngineeringPipeline()
    X_train, feature_names = pipeline.fit_transform(X_train_raw)
    X_test = pipeline.transform(X_test_raw)

    # 3. Train models
    dt = DecisionTreeRecommender(max_depth=5, min_samples_split=10, random_state=42)
    dt.fit(X_train, y_train)

    lr = LogisticRegressionRecommender(C=1.0, max_iter=1000, random_state=42)
    lr.fit(X_train, y_train)

    nb = NaiveBayesRecommender(var_smoothing=1e-9)
    nb.fit(X_train, y_train)

    ensemble = EnsembleRecommender(dt, lr, nb, dt_weight=0.35, lr_weight=0.40, nb_weight=0.25)

    # 4. Training vs Test Comparison (Overfitting Audit)
    train_metrics = {
        'decision_tree': compute_metrics(y_train, dt.predict(X_train), "Decision Tree (Train)"),
        'logistic_regression': compute_metrics(y_train, lr.predict(X_train), "Logistic Regression (Train)"),
        'naive_bayes': compute_metrics(y_train, nb.predict(X_train), "Naive Bayes (Train)"),
        'ensemble': compute_metrics(y_train, ensemble.predict(X_train), "Weighted Ensemble (Train)"),
    }

    test_metrics = {
        'decision_tree': compute_metrics(y_test, dt.predict(X_test), "Decision Tree (Test)"),
        'logistic_regression': compute_metrics(y_test, lr.predict(X_test), "Logistic Regression (Test)"),
        'naive_bayes': compute_metrics(y_test, nb.predict(X_test), "Naive Bayes (Test)"),
        'ensemble': compute_metrics(y_test, ensemble.predict(X_test), "Weighted Ensemble (Test)"),
    }

    # 5. 5-Fold Stratified Cross Validation
    print("\nRunning 5-Fold Stratified Cross Validation (Strict Zero-Leakage)...")
    cv_metrics = run_cross_validation(df, n_splits=5, random_state=42)

    # 6. Feature Importance & Interpretability Extraction
    dt_importances = dict(zip(feature_names, [round(float(v), 5) for v in dt.model.feature_importances_]))
    sorted_dt_importances = dict(sorted(dt_importances.items(), key=lambda item: item[1], reverse=True)[:10])

    lr_coefs = dict(zip(feature_names, [round(float(v), 5) for v in lr.model.coef_[0]]))
    sorted_lr_coefs = dict(sorted(lr_coefs.items(), key=lambda item: abs(item[1]), reverse=True)[:10])

    interpretability_report = {
        'decision_tree_top_features': sorted_dt_importances,
        'logistic_regression_top_coefficients': sorted_lr_coefs,
        'feature_count': len(feature_names),
        'disclaimer': 'Feature importances reflect statistical associations in the prototype dataset. They do not prove clinical causality.'
    }

    # Display Tables
    print("\n" + "=" * 70)
    print("A. HOLDOUT TEST EVALUATION (80/20 Split)")
    print("=" * 70)
    print(f"{'Model':<22} | {'Accuracy':<10} | {'Precision':<10} | {'Recall':<10} | {'F1 Score':<10}")
    print("-" * 70)
    for k in ['decision_tree', 'logistic_regression', 'naive_bayes', 'ensemble']:
        m = test_metrics[k]
        print(f"{m['model'].replace(' (Test)', ''):<22} | {m['accuracy']:<10.4f} | {m['precision']:<10.4f} | {m['recall']:<10.4f} | {m['f1_score']:<10.4f}")

    print("\n" + "=" * 70)
    print("B. 5-FOLD CROSS VALIDATION EVALUATION")
    print("=" * 70)
    print(f"{'Model':<22} | {'Mean Acc':<10} | {'Std Acc':<10} | {'Mean F1':<10} | {'Std F1':<10}")
    print("-" * 70)
    for k in ['decision_tree', 'logistic_regression', 'naive_bayes', 'ensemble']:
        cv = cv_metrics[k]
        print(f"{k.replace('_', ' ').title():<22} | {cv['mean_accuracy']:<10.4f} | {cv['std_accuracy']:<10.4f} | {cv['mean_f1']:<10.4f} | {cv['std_f1']:<10.4f}")

    print("\n" + "=" * 70)
    print("C. TRAINING VS TEST COMPARISON (Overfitting Check)")
    print("=" * 70)
    print(f"{'Model':<22} | {'Train Acc':<10} | {'Test Acc':<10} | {'Train F1':<10} | {'Test F1':<10}")
    print("-" * 70)
    for k in ['decision_tree', 'logistic_regression', 'naive_bayes', 'ensemble']:
        tr = train_metrics[k]
        te = test_metrics[k]
        print(f"{k.replace('_', ' ').title():<22} | {tr['accuracy']:<10.4f} | {te['accuracy']:<10.4f} | {tr['f1_score']:<10.4f} | {te['f1_score']:<10.4f}")
    print("=" * 70)

    # Serialize Artifacts
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    joblib.dump(pipeline, os.path.join(ARTIFACTS_DIR, 'feature_pipeline.joblib'))
    joblib.dump(dt, os.path.join(ARTIFACTS_DIR, 'decision_tree.joblib'))
    joblib.dump(lr, os.path.join(ARTIFACTS_DIR, 'logistic_regression.joblib'))
    joblib.dump(nb, os.path.join(ARTIFACTS_DIR, 'naive_bayes.joblib'))
    joblib.dump(ensemble, os.path.join(ARTIFACTS_DIR, 'ensemble.joblib'))

    complete_metrics = {
        'holdout_test': test_metrics,
        'holdout_train': train_metrics,
        'cross_validation_5fold': cv_metrics,
        'dataset_info': {
            'total_samples': len(df),
            'train_samples': len(X_train),
            'test_samples': len(X_test),
            'features_count': len(feature_names),
        },
        'ensemble_weights': {
            'decision_tree': round(ensemble.dt_weight, 3),
            'logistic_regression': round(ensemble.lr_weight, 3),
            'naive_bayes': round(ensemble.nb_weight, 3),
        },
        'disclaimer': 'Prototype evaluation results only. Not clinically validated.'
    }

    with open(os.path.join(ARTIFACTS_DIR, 'metrics.json'), 'w') as f:
        json.dump(complete_metrics, f, indent=2)

    with open(os.path.join(ARTIFACTS_DIR, 'interpretability.json'), 'w') as f:
        json.dump(interpretability_report, f, indent=2)

    print(f"\nAll artifacts, metrics, and interpretability saved to '{ARTIFACTS_DIR}/'")
    return complete_metrics

if __name__ == '__main__':
    run_training_pipeline()
