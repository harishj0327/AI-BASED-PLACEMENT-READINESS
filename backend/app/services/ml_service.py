import os
import json
import logging
import numpy as np
import pandas as pd
import joblib
from typing import Dict, Any, Optional

from ..config import (
    BEST_MODEL_PATH,
    PIPELINE_PATH,
    METADATA_PATH,
    ALL_MODELS_PATH,
)
from ..schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    ModelInfoResponse,
)
from .recommendation_engine import (
    calculate_readiness_category,
    generate_skill_analysis_and_recommendations,
)

logger = logging.getLogger(__name__)

class MLService:
    def __init__(self):
        self.model = None
        self.pipeline = None
        self.metadata = {}
        self.all_models_metrics = {}
        self.is_loaded = False
        self.load_artifacts()

    def load_artifacts(self):
        try:
            if not os.path.exists(BEST_MODEL_PATH) or not os.path.exists(PIPELINE_PATH):
                logger.warning(
                    f"Model artifacts not found at {BEST_MODEL_PATH}. Attempting to train or locate artifacts..."
                )
                from ml.training.train import run_training_pipeline
                self.metadata = run_training_pipeline()

            self.model = joblib.load(BEST_MODEL_PATH)
            self.pipeline = joblib.load(PIPELINE_PATH)

            if os.path.exists(METADATA_PATH):
                with open(METADATA_PATH, "r") as f:
                    self.metadata = json.load(f)

            if os.path.exists(ALL_MODELS_PATH):
                with open(ALL_MODELS_PATH, "r") as f:
                    self.all_models_metrics = json.load(f)

            self.is_loaded = True
            logger.info("Successfully loaded ML model and preprocessing pipeline artifacts.")
        except Exception as e:
            logger.error(f"Failed to load ML artifacts: {e}", exc_info=True)
            self.is_loaded = False

    def predict(self, req: PredictionRequest) -> PredictionResponse:
        if not self.is_loaded or self.model is None or self.pipeline is None:
            self.load_artifacts()
            if not self.is_loaded:
                raise RuntimeError("ML Model artifacts could not be loaded on the server.")

        # Prepare DataFrame strictly matching canonical feature columns
        input_data = pd.DataFrame([{
            "cgpa": float(req.cgpa),
            "programming_skills": float(req.programming_skills),
            "aptitude_score": float(req.aptitude_score),
            "communication_skills": float(req.communication_skills),
            "technical_skills": float(req.technical_skills),
            "projects_score": float(req.projects_score),
            "certifications": int(req.certifications),
            "internship_experience": int(req.internship_experience),
        }])

        # Transform using saved preprocessing pipeline
        X_scaled = self.pipeline.transform(input_data)

        # Inference from trained model
        raw_pred = self.model.predict(X_scaled)
        pred_val = float(raw_pred[0])

        # Clamp strictly between 0.0 and 100.0
        final_score = round(max(0.0, min(100.0, pred_val)), 1)

        # Readiness Category
        category = calculate_readiness_category(final_score)

        # Dynamic Strengths, Gaps, and Personalized Recommendations
        strengths, skill_gaps, recommendations, skill_analysis = (
            generate_skill_analysis_and_recommendations(req, final_score)
        )

        model_name = self.metadata.get("model_name", type(self.model).__name__)
        feature_importance = self.metadata.get("feature_importance", {})

        return PredictionResponse(
            score=final_score,
            category=category,
            strengths=strengths,
            skill_gaps=skill_gaps,
            recommendations=recommendations,
            model_name=model_name,
            feature_importance=feature_importance,
            skill_analysis=skill_analysis,
        )

    def get_model_info(self) -> ModelInfoResponse:
        if not self.is_loaded:
            self.load_artifacts()

        return ModelInfoResponse(
            model_name=self.metadata.get("model_name", "Linear Regression"),
            model_version=self.metadata.get("model_version", "1.0.0"),
            training_timestamp=self.metadata.get("training_timestamp", ""),
            dataset_size=self.metadata.get("dataset_size", 1500),
            train_samples=self.metadata.get("train_samples", 1200),
            test_samples=self.metadata.get("test_samples", 300),
            feature_count=self.metadata.get("feature_count", 8),
            feature_names=self.metadata.get("feature_names", []),
            metrics=self.metadata.get("metrics", {}),
            feature_importance=self.metadata.get("feature_importance", {}),
            all_models_metrics=self.all_models_metrics or self.metadata.get("all_models_metrics", {}),
            selection_criterion=self.metadata.get("selection_criterion", "Lowest RMSE"),
            dataset_label=self.metadata.get("dataset_label", "Prototype trained on a generated academic dataset"),
        )

# Global singleton instance
ml_service = MLService()
