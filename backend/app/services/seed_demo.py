"""
Demo Data Seeder for Placement Readiness Score Predictor.
Populates realistic student profiles with actual ML model predictions.
"""

from ..schemas.prediction import PredictionRequest
from .ml_service import ml_service
from .firebase_service import firebase_service

DEMO_STUDENTS = [
    {
        "student_profile": {
            "name": "Aarav Sharma (Strong Student)",
            "email": "aarav.sharma@campus.edu",
            "college": "Indian Institute of Technology",
            "branch": "Computer Science & Engineering",
            "batch": "2022-2026",
            "cgpa": 8.95
        },
        "features": PredictionRequest(
            cgpa=8.95,
            programming_skills=88.0,
            aptitude_score=85.0,
            communication_skills=82.0,
            technical_skills=86.0,
            projects_score=85.0,
            certifications=3,
            internship_experience=9
        )
    },
    {
        "student_profile": {
            "name": "Priya Patel (Average Student)",
            "email": "priya.patel@campus.edu",
            "college": "State Technological University",
            "branch": "Information Technology",
            "batch": "2022-2026",
            "cgpa": 7.35
        },
        "features": PredictionRequest(
            cgpa=7.35,
            programming_skills=65.0,
            aptitude_score=62.0,
            communication_skills=68.0,
            technical_skills=64.0,
            projects_score=60.0,
            certifications=1,
            internship_experience=3
        )
    },
    {
        "student_profile": {
            "name": "Rohan Gupta (Needs Improvement)",
            "email": "rohan.gupta@campus.edu",
            "college": "Regional Engineering College",
            "branch": "Electronics and Telecommunication",
            "batch": "2022-2026",
            "cgpa": 5.8
        },
        "features": PredictionRequest(
            cgpa=5.8,
            programming_skills=42.0,
            aptitude_score=48.0,
            communication_skills=52.0,
            technical_skills=45.0,
            projects_score=40.0,
            certifications=0,
            internship_experience=0
        )
    }
]

def seed_demo_data():
    print("Seeding demo students with real ML inference...")
    for idx, demo in enumerate(DEMO_STUDENTS):
        user_id = f"demo_student_{idx + 1}"
        # Update user profile
        firebase_service.update_user_profile(user_id, {
            "uid": user_id,
            **demo["student_profile"]
        })
        # Perform real ML prediction
        prediction = ml_service.predict(demo["features"])
        # Save prediction
        saved = firebase_service.save_prediction(user_id, demo["features"], prediction)
        print(f"Seeded {demo['student_profile']['name']}: Score={saved['score']}/100, Category={saved['category']}")

if __name__ == "__main__":
    seed_demo_data()
