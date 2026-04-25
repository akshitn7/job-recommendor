import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from services.parser import extract_text
from services.skill_extractor import extract_skills
from services.matcher import match_jobs
from db.queries import fetch_jobs

router = APIRouter()


@router.post("/recommend")
async def recommend(
    request: Request,
    resume: UploadFile = File(...),
    primary_skill: str = Form(default=None),
    location: str = Form(default=None),
    match_threshold: int = Form(default=40)
):
    if not resume.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file = await resume.read()

    try:
        resume_text = extract_text(file, resume.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse resume: {str(e)}")

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume appears to be empty.")

    user_skills = extract_skills(resume_text)

    if not user_skills:
        raise HTTPException(status_code=400, detail="No skills could be extracted from the resume.")

    jobs = fetch_jobs(primary_skill, location)

    if not jobs:
        return {
            "extracted_skills": user_skills,
            "matched_jobs": [],
            "message": "No jobs found matching your filters."
        }

    skill_embeddings = request.app.state.skill_embeddings
    matched_jobs = match_jobs(user_skills, jobs, skill_embeddings, match_threshold)

    return {
        "extracted_skills": user_skills,
        "matched_jobs": matched_jobs,
        "total_matched": len(matched_jobs)
    }