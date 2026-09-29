"""
Preprocessing Pipeline for Placement Readiness Score Predictor.
Uses scikit-learn Pipeline and ColumnTransformer to prevent data leakage.
"""

from typing import List, Tuple
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

# Canonical feature list expected by model
FEATURE_NAMES: List[str] = [
    "cgpa",
    "programming_skills",
    "aptitude_score",
    "communication_skills",
    "technical_skills",
    "projects_score",
    "certifications",
    "internship_experience",
]

TARGET_COLUMN: str = "placement_readiness_score"

FEATURE_RANGES = {
    "cgpa": (0.0, 10.0),
    "programming_skills": (0.0, 100.0),
    "aptitude_score": (0.0, 100.0),
    "communication_skills": (0.0, 100.0),
    "technical_skills": (0.0, 100.0),
    "projects_score": (0.0, 100.0),
    "certifications": (0, 10),
    "internship_experience": (0, 24),
}


class RangeValidator(BaseEstimator, TransformerMixin):
    """Clamps features strictly within their valid academic bounds."""

    def __init__(self, feature_ranges=None):
        self.feature_ranges = feature_ranges or FEATURE_RANGES

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_copy = X.copy()
        if isinstance(X_copy, pd.DataFrame):
            for col, (min_v, max_v) in self.feature_ranges.items():
                if col in X_copy.columns:
                    X_copy[col] = X_copy[col].clip(lower=min_v, upper=max_v)
            return X_copy
        elif isinstance(X_copy, np.ndarray):
            # Assumes order matches FEATURE_NAMES
            for idx, col in enumerate(FEATURE_NAMES):
                min_v, max_v = self.feature_ranges[col]
                X_copy[:, idx] = np.clip(X_copy[:, idx], min_v, max_v)
            return X_copy
        return X_copy


def build_preprocessing_pipeline() -> ColumnTransformer:
    """Builds a scikit-learn ColumnTransformer with Imputation and Standard Scaling."""
    numeric_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, FEATURE_NAMES),
        ],
        remainder="drop"
    )

    return preprocessor


def validate_input_dict(data: dict) -> Tuple[bool, str]:
    """Validates incoming dictionary against expected feature types and ranges."""
    for field in FEATURE_NAMES:
        if field not in data:
            return False, f"Missing required feature: '{field}'"
        val = data[field]
        if not isinstance(val, (int, float)):
            return False, f"Feature '{field}' must be a numerical value, got {type(val).__name__}"
        min_v, max_v = FEATURE_RANGES[field]
        if val < min_v or val > max_v:
            return False, f"Feature '{field}' value {val} outside valid range [{min_v}, {max_v}]"
    return True, ""
