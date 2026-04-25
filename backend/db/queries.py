import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import numpy as np
from sqlalchemy import text
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from config import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def fetch_jobs(primary_skill: str, location: str):
    db = next(get_db())

    try:
        if location:
            query = text("""
                SELECT * FROM jobs_with_skills
                WHERE :primary_skill = ANY(required_skills)
                AND location = :location
            """)
            result = db.execute(
                query,
                {
                    "primary_skill": primary_skill.lower(),
                    "location": location
                }
            )
        else:
            query = text("""
                SELECT * FROM jobs_with_skills
                WHERE :primary_skill = ANY(required_skills)
            """)
            result = db.execute(
                query,
                {
                    "primary_skill": primary_skill.lower()
                }
            )

        rows = result.fetchall()

        jobs = []
        for row in rows:
            jobs.append({
                "id": row.id,
                "title": row.title,
                "company": row.company,
                "location": row.location,
                "job_type": row.job_type,
                "experience_level": row.experience_level,
                "salary_min": row.salary_min,
                "salary_max": row.salary_max,
                "source_url": row.source_url,
                "required_skills": row.required_skills
            })

        return jobs

    finally:
        db.close()


def load_skill_embeddings() -> dict:
    db = next(get_db())

    try:
        result = db.execute(
            text("SELECT name, embedding FROM skills WHERE embedding IS NOT NULL")
        )
        rows = result.fetchall()

        skill_embeddings = {}
        for name, embedding in rows:
            skill_embeddings[name.lower().strip()] = np.array(embedding)

        print(f"[startup] Loaded embeddings for {len(skill_embeddings)} skills.")
        return skill_embeddings

    finally:
        db.close()
