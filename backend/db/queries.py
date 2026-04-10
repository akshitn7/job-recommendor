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
    """Fetch jobs with their required skills from the database. Filtered by primary skill and location."""
    
    db = next(get_db())
 
    try:
        query = f"""
            SELECT * FROM jobs_with_skills
            WHERE '{primary_skill}' = ANY(required_skills)
        """
        if location:
            query += f""" AND location = '{location}';"""

        result = db.execute(text(query))
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