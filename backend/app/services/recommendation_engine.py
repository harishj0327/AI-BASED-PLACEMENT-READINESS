from typing import List, Tuple, Dict
from ..schemas.prediction import PredictionRequest

def calculate_readiness_category(score: float) -> str:
    """
    Converts predicted score into standardized readiness categories:
    80–100: Highly Ready
    60–79:  Moderately Ready
    40–59:  Needs Improvement
    0–39:   Not Ready
    """
    clamped_score = max(0.0, min(100.0, score))
    if clamped_score >= 80.0:
        return "Highly Ready"
    elif clamped_score >= 60.0:
        return "Moderately Ready"
    elif clamped_score >= 40.0:
        return "Needs Improvement"
    else:
        return "Not Ready"


def generate_skill_analysis_and_recommendations(
    req: PredictionRequest, score: float
) -> Tuple[List[str], List[str], List[str], Dict[str, float]]:
    """
    Performs multi-factor feature evaluation to identify strengths,
    skill gaps, and prioritized actionable recommendations.
    """
    strengths: List[str] = []
    skill_gaps: List[str] = []
    recommendations: List[str] = []

    # Map features for easy evaluation
    skill_analysis = {
        "programming_skills": req.programming_skills,
        "aptitude_score": req.aptitude_score,
        "communication_skills": req.communication_skills,
        "technical_skills": req.technical_skills,
        "projects_score": req.projects_score,
        "cgpa_scaled": round(req.cgpa * 10.0, 1),
    }

    # 1. Programming Skills Evaluation
    if req.programming_skills >= 78.0:
        strengths.append("Programming & Algorithmic Problem Solving")
    elif req.programming_skills < 60.0:
        skill_gaps.append("Programming Fundamentals & Coding")
        recommendations.append(
            "Strengthen programming fundamentals (Data Structures & Algorithms) and solve coding challenges regularly."
        )

    # 2. Technical Skills Evaluation
    if req.technical_skills >= 75.0:
        strengths.append("Core Technical Knowledge (CS Concepts)")
    elif req.technical_skills < 60.0:
        skill_gaps.append("Core Technical Concepts")
        recommendations.append(
            "Strengthen core technical concepts (DBMS, Operating Systems, Computer Networks, and OOP) relevant to placement drives."
        )

    # 3. Aptitude Evaluation
    if req.aptitude_score >= 75.0:
        strengths.append("Quantitative & Logical Aptitude")
    elif req.aptitude_score < 60.0:
        skill_gaps.append("Aptitude & Logical Reasoning")
        recommendations.append(
            "Practice quantitative aptitude, logical reasoning, and timed problem-solving sets to clear initial screening rounds."
        )

    # 4. Communication Skills Evaluation
    if req.communication_skills >= 75.0:
        strengths.append("Communication & Interview Articulation")
    elif req.communication_skills < 60.0:
        skill_gaps.append("Communication & Presentation")
        recommendations.append(
            "Practice technical explanations, mock interviews, and group discussions to improve verbal clarity."
        )

    # 5. Projects Evaluation
    if req.projects_score >= 75.0:
        strengths.append("Practical Project Portfolio")
    elif req.projects_score < 60.0:
        skill_gaps.append("Project Portfolio & Real-world Implementation")
        recommendations.append(
            "Build 2-3 end-to-end practical projects, deploy them live, and document architecture on GitHub."
        )

    # 6. Academic CGPA
    if req.cgpa >= 8.5:
        strengths.append("Academic Consistency (High CGPA)")
    elif req.cgpa < 7.0:
        skill_gaps.append("Academic CGPA Threshold")
        recommendations.append(
            f"Focus on maintaining consistent academic performance to stay comfortably above the {req.cgpa:.1f} eligibility cutoff."
        )

    # 7. Internship Experience
    if req.internship_experience >= 6:
        strengths.append(f"Industry Experience ({req.internship_experience} months)")
    elif req.internship_experience == 0:
        skill_gaps.append("Industry / Internship Exposure")
        recommendations.append(
            "Pursue internships, research assistantships, or open-source software contributions for practical industry exposure."
        )

    # 8. Certifications
    if req.certifications >= 3:
        strengths.append(f"Industry Certifications ({req.certifications} completed)")
    elif req.certifications < 1:
        recommendations.append(
            "Complete recognized cloud or domain certifications (e.g., AWS, GCP, Azure, or Full-Stack) to validate skills."
        )

    # Default fallback if student is well-rounded
    if not strengths:
        strengths.append("Balanced foundational competencies across academics and technical tracks")
    if not skill_gaps:
        skill_gaps.append("Advanced System Design and Competitive Programming optimization")
    if not recommendations:
        recommendations.append(
            "Maintain current performance level, participate in mock interview panels, and practice advanced system design."
        )

    return strengths, skill_gaps, recommendations, skill_analysis
