import os
import sys
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

# Ensure root directory is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.app.config import CORS_ORIGINS
from backend.app.api.endpoints import router as api_router
from backend.app.services.seed_demo import seed_demo_data

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("placement_readiness")

app = FastAPI(
    title="AI-Based Placement Readiness Score Predictor API",
    description="Full-stack ML and Cloud Computing Academic Project API for multi-factor placement readiness prediction.",
    version="1.0.0",
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in dev/preview
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    logger.info("Initializing Placement Readiness Score Predictor API...")
    try:
        seed_demo_data()
    except Exception as e:
        logger.error(f"Seeding failed: {e}")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please verify your inputs and retry."}
    )

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "message": "AI-Based Placement Readiness Score Predictor API is operational.",
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
