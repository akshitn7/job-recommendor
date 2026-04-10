# Compares the user's extracted skills against each job's required skills from the database. 
# Calculates match percentage, filters out jobs below 60%, identifies skill gaps per job, and 
# returns results ranked by match percentage.
def match_jobs(user_skills, jobs, match_threshold):
    """
    Compare user skills and return matched jobs
    """
    user_skills_set = set(s.lower() for s in user_skills)
    matched_jobs = []
 
    for job in jobs:
        required_skills = set(s.lower() for s in job["required_skills"])
 
        if not required_skills:
            continue
 
        matched_skills = user_skills_set & required_skills
        match_percent = round(len(matched_skills) / len(required_skills) * 100, 1)
        if match_percent <= match_threshold:
            continue
        skill_gaps = required_skills - user_skills_set
        matched_jobs.append({
            "id": job["id"],
            "title": job["title"],
            "company": job["company"],
            "location": job["location"],
            "job_type": job["job_type"],
            "experience_level": job["experience_level"],
            "salary_min": job["salary_min"],
            "salary_max": job["salary_max"],
            "source_url": job["source_url"],
            "match_percent": match_percent,
            "matched_skills": list(matched_skills),
            "skill_gaps": list(skill_gaps),
        })
 
    matched_jobs.sort(key=lambda x: x["match_percent"], reverse=True)
    return matched_jobs