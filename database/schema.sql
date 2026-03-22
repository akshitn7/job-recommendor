-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);


-- Job Posting
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location  VARCHAR(255),
    job_type VARCHAR(50) DEFAULT 'onsite',
    experience_level VARCHAR(50),
    years_of_experience VARCHAR(20),
    salary_min INTEGER,
    salary_max INTEGER,
    description TEXT,
    posted_at DATE,
    source_url VARCHAR(500)
);


-- Junction table: jobs <-> skills
CREATE TABLE job_skills (
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);


-- Indexes
CREATE INDEX idx_job_skills_job_id ON job_skills(job_id);
CREATE INDEX idx_job_skills_skill_id ON job_skills(skill_id);
CREATE INDEX idx_jobs_title ON jobs(title);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_skills_name ON skills(name);