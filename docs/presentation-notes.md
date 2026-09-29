# Presentation Notes & Viva Voce Guide

This document contains structured slides/talking points for the college Machine Learning and Cloud Computing final project defense.

---

## 1. Introduction
- **Project Title:** AI-Based Placement Readiness Score Predictor
- **Domain:** Educational Data Mining, Applied Machine Learning, Cloud Architecture
- **Objective:** Evaluate student placement eligibility via an 8-factor continuous regression system, providing predictive scores (0–100), explainability, and dynamic remediation.

---

## 2. Problem Statement
- Campus placement screening routinely reduces student profiles to a single scalar: **CGPA**.
- CGPA does not measure coding agility, algorithmic problem solving, system design aptitude, or interview articulation.
- Students fail campus interviews without understanding their specific skill gaps or receiving targeted guidance.

---

## 3. Literature Survey Summary
- **Early Works:** Focused on binary classification ("Placed" vs "Not Placed") using naive Bayes or basic decision trees. High false-negative rates when hiring targets shifted.
- **Recent Approaches:** Multi-criteria decision analysis (MCDA) and regression models showing that technical coding and quantitative aptitude account for >40% of screening round success.
- **Gap Identified:** Lack of an integrated, cloud-native deployment combining real continuous regression with explainable feature importance and dynamic recommendation feedback.

---

## 4. System Design
- Decoupled 3-tier architecture:
  1. **Presentation Layer:** React 19 SPA with Recharts and Tailwind CSS.
  2. **Inference & Application Layer:** Python FastAPI container on Google Cloud Run.
  3. **Data Layer:** Cloud Firestore document storage & Firebase Auth.

---

## 5. Existing vs. Proposed System

| Parameter | Existing Approaches | Proposed System |
| :--- | :--- | :--- |
| **Output Type** | Binary ("Will get placed: Yes/No") | Continuous score ($0 \le \text{Score} \le 100$) + Tier |
| **Input Breadth** | Only CGPA & Branch | 8 Academic, Coding, and Experience dimensions |
| **Evaluation Metrics** | Simple Accuracy / Precision | MAE (3.567), RMSE (4.549), $R^2$ (0.7817) |
| **Explainability** | Black-box output | Learned Feature Importance % |
| **Remediation** | None / Generic tips | Dynamic, rule-prioritized action items |

---

## 6. Algorithms Evaluated
1. **Linear Regression (Best Model):**
   - MAE: 3.567 | RMSE: 4.549 | $R^2$: 0.7817
   - OLS minimizes residual sum of squares across standardized features.
2. **Support Vector Regressor (SVR):**
   - MAE: 3.822 | RMSE: 4.796 | $R^2$: 0.7572
   - RBF kernel handles continuous non-linear boundaries.
3. **Random Forest Regressor:**
   - MAE: 3.997 | RMSE: 5.095 | $R^2$: 0.7261
   - Ensemble of 150 bootstrapped estimators.
4. **Decision Tree Regressor:**
   - MAE: 5.250 | RMSE: 6.670 | $R^2$: 0.5306
   - Orthogonal axis-aligned splits result in higher variance.

---

## 7. Output & Categorization
- Continuous Score: 0 – 100
- Categories:
  - 80–100: **Highly Ready**
  - 60–79: **Moderately Ready**
  - 40–59: **Needs Improvement**
  - 0–39: **Not Ready**
- Dynamic outputs: Strengths, Areas to Improve, Tailored Recommendations.

---

## 8. How to Explain the ML Pipeline in Viva

> **Examiner Question:** *"Explain your ML training pipeline step by step and how you prevented data leakage."*

**Answer:**
1. **Dataset Formation:** 1,500 structured records with realistic distributions and noise simulating human interview variance.
2. **Train-Test Split:** We partitioned the data into 80% train (1,200 samples) and 20% test (300 samples) using a fixed random seed (42).
3. **Preventing Data Leakage:** Preprocessing was wrapped in a scikit-learn `Pipeline` and `ColumnTransformer`. The median imputer and `StandardScaler` were **fit strictly on the training partition**. The test partition and real-time inference payloads are only **transformed** using the saved pipeline artifact.
4. **Benchmarking:** We evaluated 4 models on MAE, RMSE, and $R^2$.
5. **Selection:** Linear Regression achieved the lowest RMSE (4.549) and highest $R^2$ (0.7817) and was saved as `best_model.joblib`.
6. **Feature Importance:** Extracted coefficients/importances: Programming (~23.1%) and Aptitude (~16.0%) were the strongest determinants.

---

## 9. How to Explain the Cloud Architecture in Viva

> **Examiner Question:** *"How is this system cloud-native and how does it scale?"*

**Answer:**
1. **Containerized Microservice:** The FastAPI backend is packaged as a Docker container deployed to **Google Cloud Run**. Cloud Run auto-scales from 0 to N instances based on concurrent incoming HTTP traffic, ensuring scale-to-zero cost efficiency.
2. **Stateless Backend:** The inference service is completely stateless; model artifacts are loaded in memory upon startup for sub-millisecond predictions.
3. **Persistent Cloud Storage:** Student profiles and past prediction histories are stored in **Google Cloud Firestore**, a globally replicated, serverless NoSQL document database.
4. **Secure Authentication:** Client-side tokens from **Firebase Authentication** are verified server-side on every write, preventing unauthorized impersonation.

---

## 10. Conclusion & Future Scope
- **Conclusion:** Replaces simplistic CGPA filters with a continuous, statistically verified multi-factor placement assessment engine.
- **Future Scope:**
  - Automated resume parsing via NLP to populate skill scores automatically.
  - Company-specific readiness profiles (e.g., Product vs Service vs Fintech cutoffs).
  - Integration with campus LMS platforms (Canvas, Moodle).
