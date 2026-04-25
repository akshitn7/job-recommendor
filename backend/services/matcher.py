from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

SEMANTIC_THRESHOLD = 0.6


def match_jobs(user_skills: list, jobs: list, skill_embeddings: dict, match_threshold: int):
    user_skills = [s.lower().strip() for s in user_skills]
    user_skills_set = set(user_skills)
    resume_embeddings = model.encode(user_skills)

    matched_jobs = []

    for job in jobs:
        required_skills = [s.lower().strip() for s in job["required_skills"]]

        if not required_skills:
            continue

        exact_matches = []
        unmatched_job_skills = []

        for job_skill in required_skills:
            if job_skill in user_skills_set:
                exact_matches.append(job_skill)
            else:
                unmatched_job_skills.append(job_skill)

        semantic_matches = []
        still_unmatched = []

        for job_skill in unmatched_job_skills:
            job_embedding = skill_embeddings.get(job_skill)

            if job_embedding is None:
                still_unmatched.append(job_skill)
                continue

            scores = cosine_similarity([job_embedding], resume_embeddings)[0]
            best_idx = scores.argmax()
            best_score = float(scores[best_idx])

            if best_score >= SEMANTIC_THRESHOLD:
                semantic_matches.append({
                    "job_skill": job_skill,
                    "matched_by": user_skills[best_idx]
                })
            else:
                still_unmatched.append(job_skill)

        total_matched = len(exact_matches) + len(semantic_matches)
        match_percent = round(total_matched / len(required_skills) * 100, 1)

        if match_percent <= match_threshold:
            continue

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
            "exact_matches": exact_matches,
            "semantic_matches": semantic_matches,
            "unmatched": still_unmatched,
        })

    matched_jobs.sort(key=lambda x: x["match_percent"], reverse=True)
    return matched_jobs