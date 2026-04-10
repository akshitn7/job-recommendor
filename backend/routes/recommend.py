# Defines the single POST /api/recommend endpoint. Receives the uploaded resume file, calls parser, 
# skill_extractor, queries, and matcher services in order, and returns the final JSON response.
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.parser import extract_text
from services.skill_extractor import extract_skills
from services.matcher import match_jobs
from db.queries import fetch_jobs

router = APIRouter()

@router.post("/recommend")
async def recommend(
    resume: UploadFile = File(...),
    primary_skill: str = Form(default=None),
    location: str = Form(default=None),
    match_threshold: int = Form(default=40)
):
    # validate file type
    if not resume.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # step 1 — parse resume
    file = await resume.read()
    try:
        resume_text = extract_text(file, resume.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse resume: {str(e)}")

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume appears to be empty.")

    # step 2 — extract skills from resume
    user_skills = extract_skills(resume_text)

    if not user_skills:
        raise HTTPException(status_code=400, detail="No skills could be extracted from the resume.")

    # step 3 — fetch jobs from DB with filters
    jobs = fetch_jobs(primary_skill, location)

    if not jobs:
        return {
            "extracted_skills": user_skills,
            "matched_jobs": [],
            "message": "No jobs found matching your filters."
        }

    # step 4 — match user skills against jobs
    matched_jobs = match_jobs(user_skills, jobs, match_threshold)

    return {
        "extracted_skills": user_skills,
        "matched_jobs": matched_jobs,
        "total_matched": len(matched_jobs)
    }