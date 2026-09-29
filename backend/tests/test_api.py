import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.ml_service import ml_service
from backend.app.services.recommendation_engine import (
    calculate_readiness_category,
    generate_skill_analysis_and_recommendations,
)
from backend.app.schemas.prediction import PredictionRequest

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "active_model" in data

def test_model_info_endpoint():
    response = client.get("/api/model/info")
    assert response.status_code == 200
    data = response.json()
    assert data["feature_count"] == 8
    assert "metrics" in data
    assert "feature_importance" in data
    assert data["dataset_label"] == "Prototype trained on a generated academic dataset"

def test_model_metrics_comparison():
    response = client.get("/api/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "comparison_table" in data
    table = data["comparison_table"]
    # Check that all 4 models are compared
    expected_models = [
        "Linear Regression",
        "Decision Tree Regressor",
        "Random Forest Regressor",
        "Support Vector Regressor (SVR)",
    ]
    for model_name in expected_models:
        assert model_name in table
        assert "mae" in table[model_name]
        assert "rmse" in table[model_name]
        assert "r2" in table[model_name]

def test_prediction_endpoint_valid():
    payload = {
        "cgpa": 8.2,
        "programming_skills": 75.0,
        "aptitude_score": 70.0,
        "communication_skills": 80.0,
        "technical_skills": 78.0,
        "projects_score": 75.0,
        "certifications": 2,
        "internship_experience": 6,
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert 0.0 <= data["score"] <= 100.0
    assert data["category"] in ["Highly Ready", "Moderately Ready", "Needs Improvement", "Not Ready"]
    assert isinstance(data["strengths"], list)
    assert isinstance(data["skill_gaps"], list)
    assert isinstance(data["recommendations"], list)
    assert len(data["recommendations"]) > 0

def test_prediction_invalid_range():
    # CGPA cannot be > 10.0
    invalid_payload = {
        "cgpa": 12.5,
        "programming_skills": 75.0,
        "aptitude_score": 70.0,
        "communication_skills": 80.0,
        "technical_skills": 78.0,
        "projects_score": 75.0,
        "certifications": 2,
        "internship_experience": 6,
    }
    response = client.post("/api/predict", json=invalid_payload)
    assert response.status_code == 422  # Pydantic validation error

def test_prediction_missing_field():
    incomplete_payload = {
        "cgpa": 8.0,
        "programming_skills": 80.0
        # Missing other fields
    }
    response = client.post("/api/predict", json=incomplete_payload)
    assert response.status_code == 422

def test_category_calculation():
    assert calculate_readiness_category(92.5) == "Highly Ready"
    assert calculate_readiness_category(80.0) == "Highly Ready"
    assert calculate_readiness_category(75.0) == "Moderately Ready"
    assert calculate_readiness_category(60.0) == "Moderately Ready"
    assert calculate_readiness_category(55.0) == "Needs Improvement"
    assert calculate_readiness_category(40.0) == "Needs Improvement"
    assert calculate_readiness_category(35.0) == "Not Ready"
    assert calculate_readiness_category(-5.0) == "Not Ready"
    assert calculate_readiness_category(105.0) == "Highly Ready"

def test_dynamic_recommendations():
    # Student with weak programming (<60) and 0 internships
    req = PredictionRequest(
        cgpa=7.5,
        programming_skills=45.0,
        aptitude_score=75.0,
        communication_skills=78.0,
        technical_skills=70.0,
        projects_score=70.0,
        certifications=1,
        internship_experience=0,
    )
    strengths, gaps, recs, _ = generate_skill_analysis_and_recommendations(req, 62.0)
    # Check that recommendation specifically addresses programming and internship
    combined_recs = " ".join(recs).lower()
    assert "programming" in combined_recs or "coding" in combined_recs
    assert "internship" in combined_recs or "practical" in combined_recs

def test_predictions_history_and_save():
    # 1. Save a prediction
    save_payload = {
        "prediction_data": {
            "score": 78.5,
            "category": "Moderately Ready",
            "strengths": ["Communication"],
            "skill_gaps": ["Programming"],
            "recommendations": ["Practice coding"],
            "model_name": "Linear Regression"
        },
        "input_features": {
            "cgpa": 8.0,
            "programming_skills": 70.0,
            "aptitude_score": 70.0,
            "communication_skills": 85.0,
            "technical_skills": 75.0,
            "projects_score": 70.0,
            "certifications": 1,
            "internship_experience": 3
        },
        "user_id": "test_user_123"
    }
    save_resp = client.post("/api/predictions", json=save_payload)
    assert save_resp.status_code == 200

    # 2. Get history
    hist_resp = client.get("/api/predictions/history", headers={"Authorization": "Bearer test_user_123"})
    assert hist_resp.status_code == 200
    data = hist_resp.json()
    assert "history" in data
    assert len(data["history"]) >= 1

def test_dashboard_stats():
    resp = client.get("/api/dashboard/stats", headers={"Authorization": "Bearer demo_student_1"})
    assert resp.status_code == 200
    data = resp.json()
    assert "total_assessments" in data
    assert "average_score" in data
    assert "category_distribution" in data
