import os
import json
import uuid
import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
import logging

from ..config import DATA_STORE_PATH, FIREBASE_PROJECT_ID
from ..schemas.prediction import PredictionRequest, PredictionResponse

logger = logging.getLogger(__name__)

class FirebaseService:
    """
    Handles Firestore persistence and Firebase Auth verification.
    Provides Cloud Firestore compatibility with persistent fallback storage.
    """

    def __init__(self):
        self.use_cloud = False
        self.firestore_db = None
        self.data_file = Path(DATA_STORE_PATH)
        self.data_file.parent.mkdir(parents=True, exist_ok=True)
        self._init_firebase()
        self._init_local_store()

    def _init_firebase(self):
        try:
            cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
            if cred_path and os.path.exists(cred_path):
                import firebase_admin
                from firebase_admin import credentials, firestore
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {"projectId": FIREBASE_PROJECT_ID})
                self.firestore_db = firestore.client()
                self.use_cloud = True
                logger.info("Connected to Google Cloud Firestore.")
            else:
                logger.info("Using persistent local Firestore store (cloud credentials not set).")
        except Exception as e:
            logger.warning(f"Cloud Firestore initialization fallback to local: {e}")
            self.use_cloud = False

    def _init_local_store(self):
        if not self.data_file.exists():
            initial_data = {
                "users": {
                    "demo_student_uid": {
                        "uid": "demo_student_uid",
                        "name": "Alex Johnson",
                        "email": "alex.johnson@campus.edu",
                        "college": "National Institute of Technology",
                        "branch": "Computer Science and Engineering",
                        "batch": "2022-2026",
                        "cgpa": 8.4,
                        "created_at": "2026-09-20T10:00:00Z",
                        "updated_at": "2026-09-29T10:00:00Z"
                    }
                },
                "students": {},
                "predictions": {},
                "model_metadata": {}
            }
            self._save_local_store(initial_data)

    def _read_local_store(self) -> Dict[str, Any]:
        try:
            with open(self.data_file, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading local store: {e}")
            return {"users": {}, "students": {}, "predictions": {}, "model_metadata": {}}

    def _save_local_store(self, data: Dict[str, Any]):
        try:
            with open(self.data_file, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving local store: {e}")

    def verify_id_token(self, id_token: str) -> Dict[str, Any]:
        """
        Verifies Firebase ID token.
        When running in demo/dev mode without server keys, verifies token structure or provides simulated profile.
        """
        if self.use_cloud:
            try:
                from firebase_admin import auth
                decoded = auth.verify_id_token(id_token)
                return {
                    "uid": decoded.get("uid"),
                    "email": decoded.get("email", ""),
                    "name": decoded.get("name", "Student User")
                }
            except Exception as e:
                logger.error(f"Token verification failed: {e}")
                raise ValueError("Invalid Firebase ID token.")
        
        # Local development / Demo mode fallback
        # If client passes a token or email string
        if id_token.startswith("demo_") or "demo" in id_token.lower():
            return {
                "uid": "demo_student_uid",
                "email": "alex.johnson@campus.edu",
                "name": "Alex Johnson"
            }
        
        if id_token.startswith("test_") or id_token.startswith("user_"):
            return {
                "uid": id_token,
                "email": f"{id_token}@campus.edu",
                "name": id_token.replace("_", " ").title()
            }
        
        # Parse simple JWT or custom payload if possible
        try:
            import base64
            parts = id_token.split(".")
            if len(parts) >= 2:
                payload_part = parts[1]
                # Pad base64
                padded = payload_part + "=" * (-len(payload_part) % 4)
                decoded_str = base64.b64decode(padded).decode("utf-8")
                payload = json.loads(decoded_str)
                uid = payload.get("user_id") or payload.get("sub") or str(uuid.uuid4())
                email = payload.get("email") or "student@university.edu"
                name = payload.get("name") or email.split("@")[0].capitalize()
                return {"uid": uid, "email": email, "name": name}
        except Exception:
            pass

        return {
            "uid": f"user_{abs(hash(id_token)) % 100000}",
            "email": "student@university.edu",
            "name": "Student User"
        }

    def save_prediction(
        self,
        user_id: str,
        input_features: PredictionRequest,
        prediction: PredictionResponse
    ) -> Dict[str, Any]:
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        pred_id = f"pred_{uuid.uuid4().hex[:10]}"

        doc_data = {
            "id": pred_id,
            "userId": user_id,
            "inputFeatures": input_features.model_dump(),
            "score": prediction.score,
            "category": prediction.category,
            "strengths": prediction.strengths,
            "skillGaps": prediction.skill_gaps,
            "recommendations": prediction.recommendations,
            "modelName": prediction.model_name,
            "createdAt": now
        }

        if self.use_cloud and self.firestore_db:
            try:
                self.firestore_db.collection("predictions").document(pred_id).set(doc_data)
                # Also update student profile record
                self.firestore_db.collection("students").document(user_id).set({
                    **input_features.model_dump(),
                    "updatedAt": now
                }, merge=True)
                return doc_data
            except Exception as e:
                logger.error(f"Firestore save error: {e}")

        # Local store fallback
        store = self._read_local_store()
        store["predictions"][pred_id] = doc_data
        store["students"][user_id] = {
            **input_features.model_dump(),
            "updatedAt": now
        }
        self._save_local_store(store)
        return doc_data

    def get_user_predictions(self, user_id: str) -> List[Dict[str, Any]]:
        if self.use_cloud and self.firestore_db:
            try:
                docs = (
                    self.firestore_db.collection("predictions")
                    .where("userId", "==", user_id)
                    .order_by("createdAt", direction="DESCENDING")
                    .limit(50)
                    .stream()
                )
                return [d.to_dict() for d in docs]
            except Exception as e:
                logger.error(f"Firestore query error: {e}")

        store = self._read_local_store()
        preds = [
            p for p in store["predictions"].values()
            if p.get("userId") == user_id or user_id == "demo_student_uid" or not p.get("userId")
        ]
        # Sort descending by date
        preds.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
        return preds

    def get_dashboard_stats(self, user_id: str) -> Dict[str, Any]:
        preds = self.get_user_predictions(user_id)
        if not preds:
            store = self._read_local_store()
            preds = list(store["predictions"].values())

        if not preds:
            return {
                "total_assessments": 0,
                "average_score": 0.0,
                "highest_score": 0.0,
                "lowest_score": 0.0,
                "category_distribution": {
                    "Highly Ready": 0,
                    "Moderately Ready": 0,
                    "Needs Improvement": 0,
                    "Not Ready": 0
                },
                "recent_trend": []
            }

        scores = [p["score"] for p in preds]
        categories = {}
        for p in preds:
            cat = p.get("category", "Needs Improvement")
            categories[cat] = categories.get(cat, 0) + 1

        recent_trend = [
            {
                "date": p.get("createdAt", "")[:10],
                "score": p["score"],
                "category": p.get("category", "")
            }
            for p in reversed(preds[-10:])
        ]

        return {
            "total_assessments": len(preds),
            "average_score": round(sum(scores) / len(scores), 1),
            "highest_score": max(scores),
            "lowest_score": min(scores),
            "category_distribution": categories,
            "recent_trend": recent_trend
        }

    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        if self.use_cloud and self.firestore_db:
            try:
                doc = self.firestore_db.collection("users").document(user_id).get()
                if doc.exists:
                    return doc.to_dict()
            except Exception as e:
                logger.error(f"Firestore user get error: {e}")

        store = self._read_local_store()
        user = store["users"].get(user_id)
        if not user:
            # Create default profile
            now = datetime.datetime.now(datetime.timezone.utc).isoformat()
            user = {
                "uid": user_id,
                "name": "Placement Candidate",
                "email": "student@campus.edu",
                "college": "Engineering College",
                "branch": "Computer Science & Engineering",
                "batch": "2023-2027",
                "cgpa": 8.0,
                "created_at": now,
                "updated_at": now
            }
            store["users"][user_id] = user
            self._save_local_store(store)
        return user

    def update_user_profile(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        updates["updated_at"] = now

        if self.use_cloud and self.firestore_db:
            try:
                self.firestore_db.collection("users").document(user_id).set(updates, merge=True)
                return self.get_user_profile(user_id)
            except Exception as e:
                logger.error(f"Firestore user update error: {e}")

        store = self._read_local_store()
        user = store["users"].get(user_id, {"uid": user_id})
        user.update(updates)
        store["users"][user_id] = user
        self._save_local_store(store)
        return user

firebase_service = FirebaseService()
