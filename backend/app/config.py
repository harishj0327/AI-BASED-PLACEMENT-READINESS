import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ML_DIR = BASE_DIR / "ml"
MODELS_DIR = ML_DIR / "models"
BEST_MODEL_PATH = MODELS_DIR / "best_model.joblib"
PIPELINE_PATH = MODELS_DIR / "preprocessing_pipeline.joblib"
METADATA_PATH = MODELS_DIR / "model_metadata.json"
ALL_MODELS_PATH = MODELS_DIR / "all_models_evaluation.json"

# Server configuration
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
).split(",")

# Firebase Configuration
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "placement-readiness-demo")
FIREBASE_SERVICE_ACCOUNT_KEY = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH", "")
FIRESTORE_DATABASE_ID = os.getenv("FIRESTORE_DATABASE_ID", "(default)")
DATA_STORE_PATH = BASE_DIR / "backend" / "data" / "firestore_local.json"
