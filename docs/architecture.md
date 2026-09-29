# Architecture & System Design Document

## 1. System Overview

The **AI-Based Placement Readiness Score Predictor** is architected as a decoupled, multi-tier system with distinct layers for Model Training, Preprocessing, API Inference, Persistence, and Presentation.

```text
[ Browser Client / React 19 SPA ]
            │  HTTPS / JSON (Bearer Token)
            ▼
[ Gateway / Reverse Proxy (Node/Express or Cloud Run) ]
            │  Proxy to internal port 8000
            ▼
[ Inference Service (FastAPI / Uvicorn) ]
    ├── Token Verification (Firebase Auth)
    ├── Input Range Validation (Pydantic v2)
    ├── Preprocessing Pipeline (Scikit-Learn ColumnTransformer)
    ├── ML Regressor (Best Model: Linear Regression)
    └── Dynamic Recommendation Engine
            │
            ├──────────────────────────┐
            ▼                          ▼
[ Cloud Firestore NoSQL DB ]   [ ML Model Artifacts ]
  - /users                       - best_model.joblib
  - /students                    - preprocessing_pipeline.joblib
  - /predictions                 - model_metadata.json
  - /model_metadata              - all_models_evaluation.json
```

## 2. ML Pipeline Design (Preventing Data Leakage)

1. **Stratification & Splitting:**
   - Total records: 1,500
   - Train partition: 80% (1,200 records)
   - Test partition: 20% (300 records)
   - Fixed random state: `42` for exact academic reproducibility.

2. **Preprocessing Pipeline:**
   - Numerical Imputation: `SimpleImputer(strategy='median')`
   - Feature Standardization: `StandardScaler(with_mean=True, with_std=True)`
   - Preprocessing is fitted **strictly on $X_{\text{train}}$**; $X_{\text{test}}$ and production inference inputs are transformed using the saved pre-fitted scaler.

3. **Algorithm Benchmarking:**
   - Evaluates Linear Regression (Ordinary Least Squares), Support Vector Regressor (Radial Basis Function Kernel), Random Forest (150 trees, max depth 14), and Decision Tree (max depth 7).

## 3. Database Schema (Firestore)

- **`users/{uid}`**:
  - `name`: string
  - `email`: string
  - `college`: string
  - `branch`: string
  - `batch`: string
  - `createdAt`: ISO 8601 timestamp
  - `updatedAt`: ISO 8601 timestamp

- **`students/{uid}`**:
  - Latest evaluated features: `cgpa`, `programming_skills`, `aptitude_score`, `communication_skills`, `technical_skills`, `projects_score`, `certifications`, `internship_experience`
  - `updatedAt`: ISO timestamp

- **`predictions/{predictionId}`**:
  - `userId`: string (Firebase UID)
  - `inputFeatures`: map of 8 features
  - `score`: float (0–100)
  - `category`: string ("Highly Ready", "Moderately Ready", "Needs Improvement", "Not Ready")
  - `strengths`: list of string
  - `skillGaps`: list of string
  - `recommendations`: list of string
  - `modelName`: string ("Linear Regression")
  - `createdAt`: ISO timestamp

- **`model_metadata/current`**:
  - `modelName`, `mae`, `rmse`, `r2`, `trainedAt`, `datasetSize`, `featureCount`
