# AI-Based Placement Readiness Score Predictor

An end-to-end Machine Learning and Cloud Computing academic project that predicts a student's placement readiness score (0–100) using continuous regression algorithms across 8 academic, technical, and experience dimensions instead of relying solely on CGPA.

> **Academic Notice:** *Prototype trained on a generated academic dataset.* The system estimates placement readiness based on the available input features and empirical model training; it does not guarantee hiring or placement outcomes.

---

## 1. Problem Statement & Objectives

Campus recruitment evaluation often over-relies on cumulative CGPA as an initial threshold filter. In contrast, modern technical hiring processes demand a multifaceted blend of algorithmic problem-solving, core CS fundamentals, verbal communication, practical project implementation, and industry exposure.

### Key Objectives:
1. Formulate a continuous, multi-factor placement readiness score ($0 \le \text{Score} \le 100$).
2. Train and empirically benchmark 4 regression algorithms:
   - **Linear Regression**
   - **Decision Tree Regressor**
   - **Random Forest Regressor**
   - **Support Vector Regressor (SVR)**
3. Avoid data leakage via scikit-learn preprocessing pipelines (`ColumnTransformer`, `StandardScaler`, `SimpleImputer`).
4. Select the best-performing model based on minimal Root Mean Squared Error (RMSE) and high $R^2$.
5. Provide explainability via learned feature importances.
6. Generate personalized, actionable recommendations for remediation.
7. Implement a cloud-native architecture with Google Cloud Run (FastAPI), Google Cloud Firestore, and Firebase Authentication.

---

## 2. Technology Stack

- **Machine Learning**: Python 3.11, scikit-learn, pandas, numpy, joblib
- **Backend API**: FastAPI, Pydantic v2, Uvicorn, pytest
- **Database & Storage**: Google Cloud Firestore (NoSQL document store) with persistent local fallback
- **Authentication**: Firebase Authentication (Bearer ID Tokens)
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React
- **Cloud Deployment**: Google Cloud Run (Dockerized FastAPI), Firebase Hosting / Vercel

---

## 3. High-Level Architecture

```text
                  ┌──────────────────────┐
                  │       STUDENT        │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   REACT WEB APP      │
                  │  Dashboard / Forms   │
                  └──────────┬───────────┘
                             │ REST API (Bearer Token)
                             ▼
                  ┌──────────────────────┐
                  │     FASTAPI API      │
                  └──────────┬───────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
       ┌─────────────────┐       ┌─────────────────┐
       │   ML MODEL      │       │   FIRESTORE     │
       │ Prediction      │       │ Student Data    │
       │ Recommendation  │       │ Prediction Hist.│
       └────────┬────────┘       └─────────────────┘
                │
                ▼
       ┌─────────────────┐
       │ Prediction      │
       │ Score           │
       │ Category        │
       │ Skill Analysis  │
       │ Recommendations │
       └─────────────────┘
```

---

## 4. Evaluated Machine Learning Models

All 4 models predict the continuous `placement_readiness_score` (0–100) and were evaluated on the held-out 20% test split (300 samples) from a 1,500 sample reproducible academic dataset (Seed: 42):

| Model | MAE | RMSE | $R^2$ Score | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Linear Regression** | **3.567** | **4.549** | **0.7817** | **Selected Best Model** |
| **Support Vector Regressor (SVR)** | 3.822 | 4.796 | 0.7572 | Candidate |
| **Random Forest Regressor** | 3.997 | 5.095 | 0.7261 | Candidate |
| **Decision Tree Regressor** | 5.250 | 6.670 | 0.5306 | Baseline |

### Feature Importance (Learned by Model)
- **Programming Skills**: 23.1%
- **Aptitude Score**: 16.0%
- **Technical Skills**: 14.9%
- **Communication Skills**: 13.0%
- **CGPA**: 10.9%
- **Internship Experience**: 9.7%
- **Certifications**: 8.1%
- **Projects Score**: 4.3%

---

## 5. Readiness Categories

The continuous score (0–100) is translated into discrete readiness tiers:
- **80 – 100**: Highly Ready
- **60 – 79**: Moderately Ready
- **40 – 59**: Needs Improvement
- **0 – 39**: Not Ready

---

## 6. Project Structure

```text
placement-readiness/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry
│   │   ├── config.py                # Environment & paths configuration
│   │   ├── schemas/                 # Pydantic data contracts
│   │   │   ├── prediction.py
│   │   │   ├── user.py
│   │   │   └── stats.py
│   │   ├── api/
│   │   │   └── endpoints.py         # REST endpoints
│   │   └── services/
│   │       ├── ml_service.py        # Model loading & inference
│   │       ├── recommendation_engine.py # Dynamic recommendation logic
│   │       ├── firebase_service.py  # Firestore persistence & auth
│   │       └── seed_demo.py         # Verified demo students seeding
│   ├── tests/
│   │   └── test_api.py              # Pytest test suite (10/10 passed)
│   ├── requirements.txt
│   └── .env.example
├── ml/
│   ├── data/
│   │   └── placement_data.csv       # Academic dataset
│   ├── models/
│   │   ├── best_model.joblib        # Serialized best model artifact
│   │   ├── preprocessing_pipeline.joblib # ColumnTransformer artifact
│   │   ├── model_metadata.json      # Complete metadata & metrics
│   │   └── all_models_evaluation.json # Comparison evaluation metrics
│   ├── preprocessing/
│   │   └── pipeline.py              # Preprocessing definition
│   ├── training/
│   │   └── train.py                 # Multi-model training routine
│   └── scripts/
│       ├── generate_data.py         # Reproducible dataset generator
│       └── train.py                 # CLI training entrypoint
├── src/
│   ├── components/                  # Navbar, Footer, ScoreGauge, SkillRadar, StrengthGapList
│   ├── pages/                       # Landing, Login, Register, Dashboard, Assessment, Result, History, ModelInsights, Profile, About
│   ├── lib/
│   │   └── firebase.ts              # Firebase client SDK & Auth helpers
│   ├── services/
│   │   └── api.ts                   # Typed API service
│   ├── types/                       # TypeScript interfaces
│   ├── App.tsx                      # Root application & routing
│   └── main.tsx
├── docs/
│   ├── architecture.md              # Detailed architecture documentation
│   ├── api.md                       # API contract reference
│   ├── deployment.md                # Cloud Run & Firestore deployment
│   └── presentation-notes.md        # ML & Cloud viva presentation guide
├── server.ts                        # Full-stack dev server & FastAPI bridge
└── package.json
```

---

## 7. Quickstart & Local Setup

### 1. Model Training
To retrain all 4 models and produce the joblib artifacts:
```bash
python3 ml/scripts/train.py
```

### 2. Running Unit Tests
```bash
PYTHONPATH=. pytest backend/tests/test_api.py
```

### 3. Running Full-Stack Dev Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000` with the Python FastAPI backend automatically bridged.

---

## 8. Live Demonstration Archetypes

For presentations or viva evaluations, three verified archetypes can be evaluated directly:
1. **Student A (Aarav Sharma - Strong)**: CGPA 8.95, Coding 88, Tech 86, Aptitude 85 $\rightarrow$ **Score: ~85.3 (Highly Ready)**
2. **Student B (Priya Patel - Average)**: CGPA 7.35, Coding 65, Tech 64, Aptitude 62 $\rightarrow$ **Score: ~61.3 (Moderately Ready)**
3. **Student C (Rohan Gupta - Low)**: CGPA 5.8, Coding 42, Tech 45, Aptitude 48 $\rightarrow$ **Score: ~41.3 (Needs Improvement)**
