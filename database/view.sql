CREATE MATERIALIZED VIEW jobs_with_skills AS
SELECT
    j.id,
    j.title,
    j.company,
    j.location,
    j.job_type,
    j.experience_level,
    j.years_of_experience,
    j.salary_min,
    j.salary_max,
    j.source_url,
    ARRAY_AGG(LOWER(s.name)) AS required_skills
FROM jobs j
JOIN job_skills js ON j.id = js.job_id
JOIN skills s ON js.skill_id = s.id
GROUP BY j.id;

CREATE INDEX idx_jobs_skills_gin ON jobs_with_skills USING GIN(required_skills);