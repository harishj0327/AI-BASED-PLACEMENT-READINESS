#!/usr/bin/env python3
"""
Academic Dataset Generator for Placement Readiness Score Predictor.
Generates a realistic, reproducible synthetic dataset for academic evaluation.
Prototype trained on a generated academic dataset.
"""

import os
import numpy as np
import pandas as pd

def generate_placement_dataset(n_samples: int = 1500, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)

    # 1. CGPA: Realistic academic distribution centered around 7.35
    cgpa = np.random.normal(loc=7.35, scale=1.1, size=n_samples)
    cgpa = np.clip(cgpa, 4.0, 10.0)

    # 2. Programming Skills (0-100): Bimodal-ish mix of beginner to skilled students
    prog_base = np.random.normal(loc=65.0, scale=16.0, size=n_samples)
    # Slight correlation with CGPA
    prog = prog_base + 0.25 * (cgpa - 7.35) * 10
    prog = np.clip(prog, 10.0, 100.0)

    # 3. Aptitude Score (0-100): Quantitative and logical problem-solving
    apt_base = np.random.normal(loc=62.0, scale=15.0, size=n_samples)
    apt = apt_base + 0.2 * (cgpa - 7.35) * 10
    apt = np.clip(apt, 10.0, 100.0)

    # 4. Communication Skills (0-100): Verbal, presentation, interview readiness
    comm = np.random.normal(loc=68.0, scale=14.0, size=n_samples)
    comm = np.clip(comm, 15.0, 100.0)

    # 5. Technical Skills (0-100): Core CS/domain concepts (OS, DBMS, CN, System Design)
    tech = 0.5 * prog + 0.3 * (cgpa / 10.0 * 100) + np.random.normal(loc=12.0, scale=8.0, size=n_samples)
    tech = np.clip(tech, 15.0, 100.0)

    # 6. Projects Score (0-100): Practical portfolio quality
    proj = 0.45 * prog + 0.25 * tech + np.random.normal(loc=15.0, scale=10.0, size=n_samples)
    proj = np.clip(proj, 10.0, 100.0)

    # 7. Certifications (0-10): Industry/cloud credentials
    certs = np.random.poisson(lam=1.8, size=n_samples)
    certs = np.clip(certs, 0, 8)

    # 8. Internship Experience (0-24 months): Many 0s, 3, 6, 12 months
    # 35% have 0 months, rest distributed up to 24 months
    has_internship = np.random.binomial(n=1, p=0.65, size=n_samples)
    intern_months = has_internship * np.random.exponential(scale=6.0, size=n_samples)
    intern_months = np.round(np.clip(intern_months, 0.0, 24.0)).astype(int)

    # 9. Realistic Non-Linear Target Calculation: Placement Readiness Score (0-100)
    # Weights reflecting industry hiring priorities:
    # Programming (24%), Technical (20%), Aptitude (18%), Communication (15%), CGPA (10%), Projects (8%), Internship (3%), Certs (2%)
    # Non-linear factors:
    # - Synergy: High programming + High projects gives a boost
    # - Low CGPA penalty (<6.0 gives slight barrier)
    # - Diminishing returns on internship experience (>12 months adds less marginal value)
    # - Gaussian noise (sigma=4.5) to reflect real human interview variance

    synergy_prog_proj = np.maximum(0, (prog - 60) * (proj - 60) / 400.0)
    internship_scaled = np.minimum(intern_months, 12) * 0.8 + np.maximum(0, intern_months - 12) * 0.25
    certs_scaled = np.minimum(certs, 4) * 1.5 + np.maximum(0, certs - 4) * 0.5
    cgpa_penalty = np.where(cgpa < 6.0, -6.0 * (6.0 - cgpa), 0.0)

    latent_score = (
        0.23 * prog +
        0.19 * tech +
        0.17 * apt +
        0.15 * comm +
        0.10 * (cgpa * 10.0) +
        0.07 * proj +
        0.05 * (internship_scaled / 12.0 * 100) +
        0.04 * (certs_scaled / 6.0 * 100) +
        synergy_prog_proj +
        cgpa_penalty +
        np.random.normal(loc=0.0, scale=4.2, size=n_samples) # Realistic noise
    )

    # Clamp strictly between 0 and 100
    readiness_score = np.clip(np.round(latent_score, 1), 5.0, 98.5)

    student_ids = [f"STU{i+1:04d}" for i in range(n_samples)]

    df = pd.DataFrame({
        "student_id": student_ids,
        "cgpa": np.round(cgpa, 2),
        "programming_skills": np.round(prog, 1),
        "aptitude_score": np.round(apt, 1),
        "communication_skills": np.round(comm, 1),
        "technical_skills": np.round(tech, 1),
        "projects_score": np.round(proj, 1),
        "certifications": certs,
        "internship_experience": intern_months,
        "placement_readiness_score": readiness_score
    })

    return df

if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    os.makedirs(output_dir, exist_ok=True)
    csv_path = os.path.join(output_dir, "placement_data.csv")

    df = generate_placement_dataset(n_samples=1500, random_seed=42)
    df.to_csv(csv_path, index=False)
    print(f"Generated {len(df)} samples and saved to {csv_path}")
    print("Dataset summary:")
    print(df.describe().round(2).to_string())
