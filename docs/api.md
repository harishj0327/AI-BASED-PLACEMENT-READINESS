# REST API Reference

All backend endpoints are served under `/api` by the FastAPI application.

## Endpoints Summary

### 1. `GET /api/health`
Health check verifying service status and whether ML model artifacts are loaded.
- **Response:**
  ```json
  {
    "status": "healthy",
    "service": "Placement Readiness Score Predictor API",
    "model_loaded": true,
    "active_model": "Linear Regression",
    "version": "1.0.0"
  }
  ```

### 2. `POST /api/predict`
Executes real ML inference on 8 student parameters.
- **Request Body:**
  ```json
  {
    "cgpa": 8.2,
    "programming_skills": 75.0,
    "aptitude_score": 70.0,
    "communication_skills": 80.0,
    "technical_skills": 78.0,
    "projects_score": 75.0,
    "certifications": 2,
    "internship_experience": 6
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "score": 78.2,
    "category": "Moderately Ready",
    "strengths": [
      "Core Technical Knowledge (CS Concepts)",
      "Quantitative & Logical Aptitude",
      "Communication & Interview Articulation"
    ],
    "skill_gaps": [
      "Programming Fundamentals & Coding"
    ],
    "recommendations": [
      "Strengthen programming fundamentals (Data Structures & Algorithms) and solve coding challenges regularly."
    ],
    "model_name": "Linear Regression"
  }
  ```

### 3. `GET /api/model/info`
Returns active model version, training timestamp, dataset size, and evaluation metrics.

### 4. `GET /api/model/metrics`
Returns the 4-algorithm benchmark comparison table (MAE, RMSE, $R^2$) and learned feature importance percentages.

### 5. `POST /api/predictions`
Saves an assessment result to Firestore under the authenticated user's account.

### 6. `GET /api/predictions/history`
Retrieves past prediction records for the authenticated student.

### 7. `GET /api/dashboard/stats`
Returns aggregated analytics (average score, highest score, score distribution, and trajectory over time).

### 8. `GET /api/demo/students`
Returns three verified student archetypes for live demonstration.
