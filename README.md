# Hireable
### AI-Powered Job Recommendation System
 
> Upload your resume. Discover your best-fit jobs. Learn what's missing.
 
---
 
## Project Overview
 
Hireable is a full-stack AI-powered job recommendation engine. Users upload their resume, the system extracts skills using an LLM, matches those skills against a database of real jobs, and returns ranked recommendations along with skill gap analysis — all without storing any user data.
 
---
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JS |
| Backend | Python, FastAPI, Uvicorn |
| Database | PostgreSQL, SQLAlchemy |
| Resume Parsing | PyMuPDF, python-docx |
| LLM — Resume | Gemini 2.0 Flash |
| LLM — Seeding | Groq / LLaMA 3.1 |
 
---
 
## How It Works
 
```
1. User uploads resume (PDF/DOCX) + primary skill + location(s)
2. POST /api/recommend
3. parser.py        →  extract raw text from file (in memory, never saved)
4. skill_extractor  →  Gemini LLM  →  ["python", "aws", "docker"]
5. database.py      →  fetch_jobs(primary_skill, locations) from PostgreSQL
6. matcher.py       →  set intersection → match % → filter ≥ 60% → rank
7. return JSON with matched_jobs, skill_gaps, extracted_skills
```
 
### Matching Logic
 
```python
user_skills  = {"python", "aws", "docker"}
job_required = {"python", "aws", "docker", "kubernetes", "terraform"}
 
matched      = user_skills & job_required   # {"python", "aws", "docker"}
gaps         = job_required - user_skills   # {"kubernetes", "terraform"}
match %      = 3 / 5 × 100                 # 60% → recommended ✓
threshold    = 60%
```
 
---