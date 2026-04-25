# One time script that loads the Kaggle jobs CSV dataset into PostgreSQL. 
# Cleans and normalizes the data, extracts required skills from job descriptions using the LLM, 
# and inserts all records into the jobs table.

#============================================================
# IMPORTING LIBRARIES
#============================================================
import csv
import random
import os
import sys
from datetime import date, timedelta
import psycopg2
import json
from groq import Groq
from sentence_transformers import SentenceTransformer

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DATABASE_URL, GROQ_API_KEY, GROQ_MODEL, SENTENCE_TRANSFORMER_MODEL
#===========================================================
# CONNECTIONS
#===========================================================
def get_connection():
    return psycopg2.connect(DATABASE_URL)
client = Groq(api_key=GROQ_API_KEY)
model = GROQ_MODEL
sentence_transformer_model = SentenceTransformer(SENTENCE_TRANSFORMER_MODEL)

#===========================================================
# SYNTHESIZED DATA
#===========================================================
COMPANIES = [
    "Google", "Microsoft", "Amazon", "Meta", "Apple",
    "Netflix", "Stripe", "Atlassian", "Shopify", "Zoom",
    "Slack", "Figma", "Notion", "Linear", "Vercel",
    "Cloudflare", "Datadog", "MongoDB", "HashiCorp", "Twilio",
    "Salesforce", "Adobe", "Uber", "Airbnb", "Spotify",
    "PayPal", "Square", "Dropbox", "GitHub", "GitLab"
]
LOCATIONS = ["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Pune","Kolkata","Ahmedabad","Jaipur","Surat",
             "Lucknow","Chandigarh","Indore","Bhopal","Nagpur","Noida","Gurgaon","Coimbatore","Kochi",
             "Thiruvananthapuram","Dehradun","Mysuru","Vadodara","Visakhapatnam","Bhubaneswar","Patna","Ranchi",
             "Guwahati"]
JOB_TYPES = ["remote", "hybrid", "onsite", "onsite"]
#============================================================
# HELPER FUNCTIONS
#============================================================
def get_salary(experience_level):
    """Set random salary based on experience level"""
    key = experience_level.lower().strip()
    if "lead" in key:
        low, high = (40, 80)
    elif "senior" in key:
        low, high = (25, 45)
    elif "mid" in key:
        low, high = (12, 24)
    elif "junior" in key or "entry" in key or 'fresher' in key:
        low, high = (4, 8)
    else:                               
        low, high = (12, 30)
    salary_min = random.randint(low, (low + high) // 2)*(10**5)
    salary_max = random.randint((low + high) // 2, high)*(10**5)
    return salary_min, salary_max

def random_posted_date():
    """Set random date when job was posted"""
    return date.today() - timedelta(days=random.randint(1, 30))

def make_source_url(company, title):
    """Synthesized URL for Job Postings"""
    company_name = company.lower().replace(" ", "")
    title_name = title.lower().replace(" ", "-").replace("/", "-")
    return f"https://{company_name}.com/jobs/{title_name}"

def clean_yoe(yoe):
    yoe = yoe.split('-')[0].split('+')[0].split()[0]
    return yoe
#============================================================
# SKILL EXTRACTION
#============================================================
def create_skills(job_title, experience_level):
    """Send jobtitle and experience level to LLM to generate expected skills."""

    prompt = f"""Given the job title "{job_title}" with experience level "{experience_level}", 
    return ONLY a JSON array of 10-15 expected skills for this role.
    Rules:
    - Return ONLY a raw JSON array, no explanation, no markdown, no extra text
    - Skills should be lowercase, 1-3 words max
    - Prioritize hard/technical skills specific to this role
    - Do not add noise words like basics, advanced, fundamentals, programming, etc.
    - Only include soft skills if they are critical for this specific role 
    (e.g. "communication" for a manager, "negotiation" for a sales role)
    - Be specific (e.g. "react" not "frontend", "pandas" not "data tools")"""

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        skills = json.loads(content)
        return skills['skills']

    except Exception as e:
        print("LLM failed: Returning None")
        return None

#============================================================
# SEEDING JOBS
#============================================================
def seed_jobs(conn, cursor, rows):
    """Extract Details from each row and seed it into the database"""
    inserted_jobs = 0
    inserted_skills = 0
    skill_cache = {}
    cursor.execute("SELECT id, name FROM skills")
    for row in cursor.fetchall():
        skill_cache[row[1]] = row[0]  # {name: id}
    print(f"Loaded {len(skill_cache)} existing skills into cache")

    def get_skill_id(skill):
        if skill not in skill_cache:
            embedding = sentence_transformer_model.encode([skill])[0].tolist()
            cursor.execute("INSERT INTO skills(name, embedding) VALUES (%s, %s) RETURNING id", (skill, embedding))
            skill_id = cursor.fetchone()[0]
            skill_cache[skill] = skill_id
            return skill_id
        else:
            return skill_cache[skill]

    for row in rows:
        title = row["Title"].strip()
        experience_level = row["ExperienceLevel"].strip()
        years_of_exp = clean_yoe(row["YearsOfExperience"])
        description = row["Responsibilities"].strip()
        company = random.choice(COMPANIES)
        location = random.choice(LOCATIONS)
        job_type = random.choice(JOB_TYPES)
        salary_min, salary_max = get_salary(experience_level)
        posted_at  = random_posted_date()
        source_url = make_source_url(company, title)
        skills = create_skills(title, experience_level)
        
        if not title or not skills:
            continue

        cursor.execute("""
            INSERT INTO jobs (
                title, company, location, job_type,
                experience_level, years_of_experience,
                salary_min, salary_max, description,
                posted_at, source_url
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
        """, (
            title, company, location, job_type,
            experience_level, years_of_exp,
            salary_min, salary_max, description,
            posted_at, source_url
        ))

        job_id = cursor.fetchone()[0]
        inserted_jobs += 1

        for skill in skills:
            skill_id = get_skill_id(skill)
            cursor.execute("""
                INSERT INTO job_skills (job_id, skill_id)
                VALUES (%s, %s) """, (job_id, skill_id))
            inserted_skills += 1
        conn.commit()
        print(f"Inserted Jobs : {inserted_jobs}, Inserted Skills : {inserted_skills}")
        

#===========================================================
# MAIN
#===========================================================
def main():
    dataset_path = os.path.join(os.path.dirname(__file__), "job_dataset.csv")
    print("Reading Dataset")
    with open(dataset_path) as f:
        rows = list(csv.DictReader(f))
    print(f"{len(rows)} rows found")
    print("Connecting to database")
    conn = get_connection()
    cursor = conn.cursor()
    print("Seeding Jobs from Dataset")
    seed_jobs(conn, cursor, rows)
    print("Database Seeded Succesfully")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()