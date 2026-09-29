from typing import Dict, List, Any
from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_assessments: int
    average_score: float
    highest_score: float
    lowest_score: float
    category_distribution: Dict[str, int]
    recent_trend: List[Dict[str, Any]]
