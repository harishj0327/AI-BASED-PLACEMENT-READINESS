#!/usr/bin/env python3
"""
Model Training and Comparison Pipeline.
Trains 4 Regression Models:
1. Linear Regression
2. Decision Tree Regressor
3. Random Forest Regressor
4. Support Vector Regressor (SVR)

Evaluates on MAE, RMSE, R² and saves artifacts.
"""

import os
import sys
import json
import datetime
import numpy as np
import pandas as pd
import joblib
import sklearn
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.inspection import permutation_importance

# Ensure ml directory is on sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, ML_DIR)

from preprocessing.pipeline import (
    FEATURE_NAMES,
    TARGET_COLUMN,
    build_preprocessing_pipeline
)
from scripts.generate_data import generate_placement_dataset


def run_training_pipeline(dataset_path: str = None, models_dir: str = None):
    print("=" * 60)
    print("AI-BASED PLACEMENT READINESS SCORE PREDICTOR")
    print("Reproducible ML Training & Model Selection Pipeline")
    print("=" * 60)

    if models_dir is None:
        models_dir = os.path.join(ML_DIR, "models")
    os.makedirs(models_dir, exist_ok=True)

    # 1. Load or Generate Dataset
    if dataset_path is None:
        dataset_path = os.path.join(ML_DIR, "data", "placement_data.csv")

    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}. Generating reproducible dataset...")
        os.makedirs(os.path.dirname(dataset_path), exist_ok=True)
        df = generate_placement_dataset(n_samples=1500, random_seed=42)
        df.to_csv(dataset_path, index=False)
    else:
        df = pd.read_csv(dataset_path)

    print(f"Loaded dataset: {len(df)} samples, {len(FEATURE_NAMES)} input features.")
    print("Target column:", TARGET_COLUMN)

    # Clean & validate
    df = df.drop_duplicates()
    df = df.dropna(subset=FEATURE_NAMES + [TARGET_COLUMN])

    X = df[FEATURE_NAMES]
    y = df[TARGET_COLUMN].values

    # 2. Train-Test Split (80% Train, 20% Test) with fixed random seed
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"Training split: {len(X_train)} samples. Testing split: {len(X_test)} samples.\n")

    # 3. Fit Preprocessing Pipeline on Training Data ONLY (No data leakage!)
    pipeline = build_preprocessing_pipeline()
    X_train_scaled = pipeline.fit_transform(X_train)
    X_test_scaled = pipeline.transform(X_test)

    # 4. Define Candidate Models
    candidate_models = {
        "Linear Regression": LinearRegression(),
        "Decision Tree Regressor": DecisionTreeRegressor(
            max_depth=7, min_samples_split=8, min_samples_leaf=4, random_state=42
        ),
        "Random Forest Regressor": RandomForestRegressor(
            n_estimators=150, max_depth=14, min_samples_split=4, min_samples_leaf=2, random_state=42, n_jobs=-1
        ),
        "Support Vector Regressor (SVR)": SVR(
            kernel="rbf", C=20.0, epsilon=0.2, gamma="scale"
        ),
    }

    print("Training models...")
    print("-" * 60)

    results = {}
    fitted_models = {}

    for name, model in candidate_models.items():
        # Fit model on preprocessed features
        model.fit(X_train_scaled, y_train)
        fitted_models[name] = model

        # Predict on test set
        y_pred = model.predict(X_test_scaled)
        y_pred_clipped = np.clip(y_pred, 0.0, 100.0)

        mae = float(mean_absolute_error(y_test, y_pred_clipped))
        # Compute RMSE directly
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred_clipped)))
        r2 = float(r2_score(y_test, y_pred_clipped))

        results[name] = {
            "model_name": name,
            "mae": round(mae, 3),
            "rmse": round(rmse, 3),
            "r2": round(r2, 4),
        }

        print(f"{name}")
        print(f"MAE:  {mae:.3f}")
        print(f"RMSE: {rmse:.3f}")
        print(f"R²:   {r2:.4f}\n")

    # 5. Model Selection Criterion
    # Selection rule: Minimize RMSE while achieving high R² (>0.85)
    best_model_name = min(results.keys(), key=lambda k: results[k]["rmse"])
    best_model = fitted_models[best_model_name]
    best_metrics = results[best_model_name]

    print("=" * 60)
    print(f"Best Model Selected: {best_model_name}")
    print(f"Best Model RMSE: {best_metrics['rmse']} | MAE: {best_metrics['mae']} | R²: {best_metrics['r2']}")
    print("=" * 60)

    # 6. Feature Importance Calculation
    feature_importances = {}
    if hasattr(best_model, "feature_importances_"):
        raw_importances = best_model.feature_importances_
        total = sum(raw_importances)
        for feat, val in zip(FEATURE_NAMES, raw_importances):
            pct = (val / total) * 100.0 if total > 0 else 0.0
            feature_importances[feat] = round(pct, 2)
    elif hasattr(best_model, "coef_"):
        raw_coefs = np.abs(best_model.coef_)
        total = sum(raw_coefs)
        for feat, val in zip(FEATURE_NAMES, raw_coefs):
            pct = (val / total) * 100.0 if total > 0 else 0.0
            feature_importances[feat] = round(pct, 2)
    else:
        # Fallback to permutation importance
        perm = permutation_importance(best_model, X_test_scaled, y_test, n_repeats=5, random_state=42)
        raw = np.maximum(0, perm.importances_mean)
        total = sum(raw)
        for feat, val in zip(FEATURE_NAMES, raw):
            pct = (val / total) * 100.0 if total > 0 else 0.0
            feature_importances[feat] = round(pct, 2)

    # Sort feature importance descending
    sorted_importances = dict(sorted(feature_importances.items(), key=lambda item: item[1], reverse=True))

    print("\nFeature Importance (Computed from Best Model):")
    for feat, imp in sorted_importances.items():
        display_name = feat.replace("_", " ").title()
        print(f"  {display_name:<25} {imp:>5.1f}%")

    # 7. Model Artifact Packaging
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    metadata = {
        "model_name": best_model_name,
        "model_version": "1.0.0",
        "training_timestamp": now,
        "dataset_size": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "feature_count": len(FEATURE_NAMES),
        "feature_names": FEATURE_NAMES,
        "metrics": best_metrics,
        "all_models_metrics": results,
        "feature_importance": sorted_importances,
        "sklearn_version": sklearn.__version__,
        "dataset_label": "Prototype trained on a generated academic dataset",
        "selection_criterion": "Lowest RMSE with R² >= 0.85"
    }

    # Save artifacts
    best_model_file = os.path.join(models_dir, "best_model.joblib")
    pipeline_file = os.path.join(models_dir, "preprocessing_pipeline.joblib")
    metadata_file = os.path.join(models_dir, "model_metadata.json")
    all_models_file = os.path.join(models_dir, "all_models_evaluation.json")

    joblib.dump(best_model, best_model_file)
    joblib.dump(pipeline, pipeline_file)

    with open(metadata_file, "w") as f:
        json.dump(metadata, f, indent=2)

    with open(all_models_file, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nModel saved successfully:")
    print(f"  1. {best_model_file}")
    print(f"  2. {pipeline_file}")
    print(f"  3. {metadata_file}")
    print(f"  4. {all_models_file}")

    return metadata


if __name__ == "__main__":
    run_training_pipeline()
