from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    cgpa: float = Field(..., ge=0.0, le=10.0, description="Academic CGPA on a scale of 0 to 10")
    programming_skills: float = Field(..., ge=0.0, le=100.0, description="Programming proficiency score (0-100)")
    aptitude_score: float = Field(..., ge=0.0, le=100.0, description="Quantitative and logical aptitude score (0-100)")
    communication_skills: float = Field(..., ge=0.0, le=100.0, description="Verbal and interview communication score (0-100)")
    technical_skills: float = Field(..., ge=0.0, le=100.0, description="Core CS/Technical subject score (0-100)")
    projects_score: float = Field(..., ge=0.0, le=100.0, description="Quality and complexity of academic/portfolio projects (0-100)")
    certifications: int = Field(..., ge=0, le=10, description="Number of recognized industry certifications (0-10)")
    internship_experience: int = Field(..., ge=0, le=24, description="Internship experience in months (0-24)")

    class Config:
        json_schema_extra = {
            "example": {
                "cgpa": 8.2,
                "programming_skills": 75.0,
                "aptitude_score": 70.0,
                "communication_skills": 80.0,
                "technical_skills": 78.0,
                "projects_score": 75.0,
                "certifications": 2,
                "internship_experience": 6
            }
        }

class PredictionResponse(BaseModel):
    id: Optional[str] = None
    score: float = Field(..., ge=0.0, le=100.0, description="Calculated Placement Readiness Score")
    category: str = Field(..., description="Readiness Category (Highly Ready, Moderately Ready, etc.)")
    strengths: List[str]
    skill_gaps: List[str]
    recommendations: List[str]
    model_name: str
    feature_importance: Optional[Dict[str, float]] = None
    skill_analysis: Optional[Dict[str, float]] = None
    created_at: Optional[str] = None

class SavePredictionRequest(BaseModel):
    prediction_data: PredictionResponse
    input_features: PredictionRequest
    user_id: Optional[str] = None

class ModelInfoResponse(BaseModel):
    model_name: str
    model_version: str
    training_timestamp: str
    dataset_size: int
    train_samples: int
    test_samples: int
    feature_count: int
    feature_names: List[str]
    metrics: Dict[str, Any]
    feature_importance: Dict[str, float]
    all_models_metrics: Dict[str, Dict[str, Any]]
    selection_criterion: str
    dataset_label: str
