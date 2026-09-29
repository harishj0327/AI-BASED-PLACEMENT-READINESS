from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, Header
import logging

from ..schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    SavePredictionRequest,
    ModelInfoResponse,
)
from ..schemas.user import UserProfile, VerifyTokenRequest, UpdateProfileRequest
from ..schemas.stats import DashboardStats
from ..services.ml_service import ml_service
from ..services.firebase_service import firebase_service
from ..services.seed_demo import DEMO_STUDENTS

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Placement Readiness APIs"])


def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Extracts and verifies user identity from Authorization Bearer token."""
    if not authorization:
        return "demo_student_uid"
    token = authorization.replace("Bearer ", "").strip()
    if not token:
        return "demo_student_uid"
    try:
        user_info = firebase_service.verify_id_token(token)
        return user_info["uid"]
    except Exception as e:
        logger.warning(f"Auth header verification failed, using fallback: {e}")
        return "demo_student_uid"


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Placement Readiness Score Predictor API",
        "model_loaded": ml_service.is_loaded,
        "active_model": ml_service.metadata.get("model_name", "Linear Regression"),
        "version": "1.0.0"
    }


@router.post("/auth/verify")
def verify_auth_token(payload: VerifyTokenRequest):
    try:
        user_info = firebase_service.verify_id_token(payload.id_token)
        profile = firebase_service.get_user_profile(user_info["uid"])
        return {
            "status": "success",
            "user": profile,
            "uid": user_info["uid"]
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


@router.post("/predict", response_model=PredictionResponse)
def predict_readiness(req: PredictionRequest):
    """
    Performs real ML inference and returns placement readiness score (0-100),
    readiness category, strengths, skill gaps, and dynamic recommendations.
    """
    try:
        prediction = ml_service.predict(req)
        return prediction
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@router.get("/model/info", response_model=ModelInfoResponse)
def get_model_info():
    """Returns metadata for current active ML model."""
    try:
        return ml_service.get_model_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/model/metrics")
def get_model_metrics():
    """
    Returns empirical comparison of all 4 trained models:
    Linear Regression, Decision Tree, Random Forest, SVR
    along with actual calculated MAE, RMSE, R² and Feature Importance.
    """
    info = ml_service.get_model_info()
    return {
        "active_model": info.model_name,
        "selection_criterion": info.selection_criterion,
        "dataset_label": info.dataset_label,
        "metrics_summary": info.metrics,
        "comparison_table": info.all_models_metrics,
        "feature_importance": info.feature_importance,
        "dataset_size": info.dataset_size,
        "train_samples": info.train_samples,
        "test_samples": info.test_samples,
    }


@router.post("/predictions")
def save_prediction_record(
    payload: SavePredictionRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Saves a student assessment result to Firestore."""
    target_user_id = payload.user_id or user_id
    saved = firebase_service.save_prediction(
        user_id=target_user_id,
        input_features=payload.input_features,
        prediction=payload.prediction_data
    )
    return {"status": "saved", "data": saved}


@router.get("/predictions/history")
def get_prediction_history(user_id: str = Depends(get_current_user_id)):
    """Fetches user prediction history from Firestore."""
    records = firebase_service.get_user_predictions(user_id)
    return {"history": records, "count": len(records)}


@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(user_id: str = Depends(get_current_user_id)):
    """Returns analytics summary, category distribution, and trend over time."""
    stats = firebase_service.get_dashboard_stats(user_id)
    return stats


@router.get("/profile", response_model=UserProfile)
def get_profile(user_id: str = Depends(get_current_user_id)):
    """Fetches student profile information."""
    profile = firebase_service.get_user_profile(user_id)
    return profile


@router.put("/profile", response_model=UserProfile)
def update_profile(
    updates: UpdateProfileRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Updates student profile information."""
    update_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    updated = firebase_service.update_user_profile(user_id, update_dict)
    return updated


@router.get("/demo/students")
def get_demo_students():
    """Returns three student archetypes with verified ML scores for live demo."""
    presets = []
    for demo in DEMO_STUDENTS:
        feat = demo["features"]
        pred = ml_service.predict(feat)
        presets.append({
            "profile": demo["student_profile"],
            "features": feat.model_dump(),
            "prediction": pred.model_dump()
        })
    return {"students": presets}
