# Contains all database query functions. Currently holds one function that fetches all job 
# postings from the PostgreSQL jobs table and returns them as a list for the matcher to process.
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
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
 
def fetch_jobs(primary_skill, location):
    """
    Fetch jobs with their required skills from the database.
    Filters by primary skill and location.
    Returns a list of job dicts with required_skills list.
    """
    db = next(get_db())
 
    try:
        # Base query — joins jobs with their skills
        query = """
            SELECT
                j.id,
                j.title,
                j.company,
                j.location,
                j.job_type,
                j.experience_level,
                j.salary_min,
                j.salary_max,
                j.source_url,
                ARRAY_AGG(LOWER(s.name)) AS required_skills
            FROM jobs j
            JOIN job_skills js ON j.id = js.job_id
            JOIN skills s ON js.skill_id = s.id
        """
 
        filters = []
        params = {}
 
        # Filter by primary skill
        if primary_skill:
            filters.append("""
                j.id IN (
                    SELECT js2.job_id FROM job_skills js2
                    JOIN skills s2 ON js2.skill_id = s2.id
                    WHERE LOWER(s2.name) = LOWER(:primary_skill)
                )
            """)
            params["primary_skill"] = primary_skill
 
        # Filter by location
        if location and location.lower() != "any":
            filters.append("(LOWER(j.location) = LOWER(:location) OR LOWER(j.job_type) = 'remote')")
            params["location"] = location
 
        # Append WHERE clause if filters exist
        if filters:
            query += " WHERE " + " AND ".join(filters)
 
        # Group by job id to aggregate skills
        query += " GROUP BY j.id"
 
        result = db.execute(text(query), params)
        rows = result.fetchall()
 
        jobs = []
        for row in rows:
            jobs.append({
                "id":               row.id,
                "title":            row.title,
                "company":          row.company,
                "location":         row.location,
                "job_type":         row.job_type,
                "experience_level": row.experience_level,
                "salary_min":       row.salary_min,
                "salary_max":       row.salary_max,
                "source_url":       row.source_url,
                "required_skills":  row.required_skills or []
            })
 
        return jobs
 
    finally:
        db.close()
 