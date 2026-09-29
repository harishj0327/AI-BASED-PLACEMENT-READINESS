# Cloud Deployment Guide (Google Cloud Run & Firestore)

This document provides deployment guidelines for deploying the system to Google Cloud Run and Firebase Firestore.

## 1. Google Cloud Architecture

```text
User 
 ↓
Cloud-hosted React App (Firebase Hosting / Vercel / Cloud CDN)
 ↓
Google Cloud Run (Containerized FastAPI API)
 ↓
Scikit-Learn ML Model & Joblib Pipeline
 ↓
Google Cloud Firestore
```

## 2. Deploying Backend to Google Cloud Run

### Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend and trained ML models
COPY backend/ backend/
COPY ml/models/ ml/models/
COPY ml/preprocessing/ ml/preprocessing/

ENV PORT=8080
ENV HOST=0.0.0.0
ENV PYTHONPATH=/app

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### Build & Deploy with Google Cloud CLI
```bash
# 1. Set Google Cloud project
gcloud config set project YOUR_PROJECT_ID

# 2. Build container via Cloud Build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/placement-readiness-api

# 3. Deploy to Cloud Run
gcloud run deploy placement-readiness-api \
  --image gcr.io/YOUR_PROJECT_ID/placement-readiness-api \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
```

## 3. Cloud Firestore & Security Rules

Deploy the Firestore security rules:
```bash
firebase deploy --only firestore:rules
```

Rules ensure that students can only read and write their own assessment records:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /predictions/{predictionId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /model_metadata/{doc} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## 4. Frontend Deployment (Firebase Hosting / Vercel)
```bash
npm run build
firebase deploy --only hosting
```
