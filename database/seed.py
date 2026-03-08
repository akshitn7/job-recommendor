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
from google import genai
from google.genai import types
import json
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))
#===========================================================
# DATABASE CONNECTION
#===========================================================
def get_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

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
LOCATIONS = [
    "San Francisco, CA", "New York, NY", "Seattle, WA",
    "Austin, TX", "Boston, MA", "Chicago, IL",
    "Los Angeles, CA", "Denver, CO", "Atlanta, GA",
    "Dallas, TX", "Miami, FL", "Portland, OR",
    "Toronto, Canada", "Vancouver, Canada", "Montreal, Canada",
    "London, UK", "Berlin, Germany", "Amsterdam, Netherlands",
    "Paris, France", "Dublin, Ireland", "Stockholm, Sweden",
    "Zurich, Switzerland", "Barcelona, Spain",
    "Bangalore, India", "Mumbai, India", "Hyderabad, India",
    "Singapore", "Tokyo, Japan", "Seoul, South Korea",
    "Dubai, UAE", "Tel Aviv, Israel",
    "Sydney, Australia", "Melbourne, Australia"
]
JOB_TYPES = ["remote", "remote", "hybrid", "hybrid", "onsite"]
NOISE_WORDS = {
    "basics", "basic", "fundamentals", "fundamental",
    "advanced", "intermediate", "proficiency", "proficient",
    "knowledge", "understanding", "concepts", "concept",
    "experience", "skills", "skill", "tools", "tool",
    "principles", "techniques", "methodology", "expert",
    "working", "strong", "solid", "good", "exposure", "usage", "process"
    "scripting"
}
SOFT_SKILLS = {
    "communication", "teamwork", "leadership", "problem solving",
    "critical thinking", "time management", "adaptability",
    "creativity", "collaboration", "interpersonal", "presentation",
    "multitasking", "attention to detail", "work ethic",
    "analytical", "organizational", "decision making", "mentoring",
    "negotiation", "conflict resolution", "emotional intelligence",
}
KNOWN_SKILLS = {
    "html", "css", "javascript", "typescript", "react", "angular",
    "vue", "vue.js", "next.js", "tailwind", "bootstrap",
    "jquery", "webpack", "vite", "redux", "python", "java", "node.js", "c#", "c++", "go", "ruby", "php",
    "rust", "scala", "fastapi", "django", "flask", "spring", "express",
    "asp.net", ".net", "graphql", "rest", "rest apis", "microservices",
    "sql", "mysql", "postgresql", "mongodb", "redis", "sqlite",
    "oracle", "cassandra", "sql server", "dynamodb", "firebase",
    "elasticsearch", "aws", "azure", "google cloud", "gcp", "docker", "kubernetes",
    "terraform", "ci/cd", "jenkins", "linux", "ansible", "helm",
    "github actions", "gitlab ci", "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
    "keras", "pandas", "numpy", "scikit-learn", "spark", "apache spark",
    "airflow", "apache airflow", "tableau", "power bi", "matplotlib",
    "seaborn", "hadoop", "kafka", "computer vision",
    "reinforcement learning", "android", "ios", "flutter", "react native", "swift", "kotlin",
    "git", "agile", "scrum", "system design", "oop", "data structures",
    "algorithms", "bash", "shell scripting", "postman", "jira",
    "a/b testing", "linux", "unit testing", "test driven development",
    "tdd", "mvc", "api", "oauth", "jwt"
}
#============================================================
# HELPER FUNCTIONS
#============================================================
def get_salary(experience_level):
    """Set random salary based on experience level"""
    key = experience_level.lower().strip()
    if "lead" in key:
        low, high = (150000, 200000)
    elif "senior" in key:
        low, high = (130000, 175000)
    elif "mid" in key:
        low, high = (90000, 130000)
    elif "junior" in key or "entry" in key:
        low, high = (60000, 90000)
    # for experience level = experienced
    else:                               
        low, high = (90000, 150000)
    salary_min = random.randint(low, (low + high) // 2)
    salary_max = random.randint((low + high) // 2, high)
    return salary_min, salary_max

def random_posted_date():
    """Set random date when job was posted"""
    return date.today() - timedelta(days=random.randint(1, 30))

def make_source_url(company, title):
    """Synthesized URL for Job Postings"""
    company_name = company.lower().replace(" ", "")
    title_name = title.lower().replace(" ", "-").replace("/", "-")
    return f"https://{company_name}.com/jobs/{title_name}"

def clean_skill_token(skill):
    """Removing noisy words from the skills. Ex: (Python Basics) -> (Python)"""
    skill = skill.strip()
    words = skill.lower().split()
    cleaned = [w for w in words if w not in NOISE_WORDS]
    return " ".join(cleaned).strip()

#============================================================
# SKILL EXTRACTION
#============================================================
def extract_skills(skills_string):
    """
    Step 1: Extract Skills from Skills String
    Step 2: Clean the individual Skill token
    Step 3: Match against known Skills dictionary
    Step 4: If unmatched use LLM to extract final clean skill list.
    """
    matched = []
    unmatched = []

    #extract individual skill clean it and store in raw
    raw_skills = []
    for skill in skills_string.split(";"):
        skill = clean_skill_token(skill)
        if skill and skill not in SOFT_SKILLS:
            raw_skills.append(skill)
    
    #add matched skill to matched and let the rest be cleaned by llm 
    for skill in raw_skills:
        if skill.lower() in KNOWN_SKILLS:
            matched.append(skill)
        else:
            unmatched.append(skill)
    
    #use llm to extract the unseen skills
    llm_skills = []
    if unmatched:
        llm_skills = extract_with_llm(unmatched)
    
    #add the new skills to known skills to increase hit chance and avoid using llm.
    for skill in llm_skills:
        KNOWN_SKILLS.add(skill.lower())
    
    #at the end remove redundancy in skills
    all_skills = matched + llm_skills
    final = []
    for skill in all_skills:
        if skill.lower() not in final:
            final.append(skill.lower())

    return final

def extract_with_llm(unmatched):
    """Send unmatched skill as a text to LLM for extraction"""
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    model = os.getenv("GEMINI_MODEL")
    
    chunks = "; ".join(unmatched)
    prompt = f"""You are a skill extraction assistant.
    Extract individual clean tech skill names from these raw chunks.
    Rules:
    - Return only real, specific skill names in lowercase
    - Remove noise words like "basics", "advanced", "fundamentals"
    - Return the top level skill if the skill is a subcategory. Example : supervised learning -> machine learning, unsupervised learning -> machine learning
    - Return specific tool name only. Example: Testing with xUnit -> "xunit"
    - Do not include soft skills like communication, teamwork, leadership
    - Split any bundled skills separated by / or , Example: HTML/CSS -> ["html","css"], Exception: A/B Testing -> ["a/b testing"]
    - You can use this skill set for reference: {KNOWN_SKILLS}. Don't discard skills which not mentioned in this list
    Raw chunks: {chunks}

    Example:
    Raw Chunks: data analysis using python; machine learning basics: regression, classification; Familiarity with Metasploit, Wireshark
    Expected Output: ["data analysis", "python", "machine learning", "metasploit", "wireshark"]"""

    try:
        try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=list[str]
            )
        )
        content = response.text.strip()
        skills = json.loads(content)
        return skills

    except Exception as e:
        print(f"LLM failed: {e} — skipping unmatched chunks")
        return unmatched

#============================================================
# SEEDING JOBS
#============================================================
def seed_jobs(cursor, rows):
    return 

#===========================================================
# MAIN
#===========================================================
def main():
    dataset_path = os.path.join(os.path.dirname(__file__), "job_dataset.csv")
    if not os.path.exists(dataset_path):
        print("Error: Dataset not found")
        print("Place job_dataset.csv in database folder and try again.")
        sys.exit(1) 
    
    print("Reading Dataset")
    with open(dataset_path) as f:
        rows = list(csv.DictReader(f))
    print(f"{len(rows)} rows found")
    print("Connecting to database")
    conn = get_connection()
    cursor = conn.cursor()
    try:
        print("Seeding Jobs from Dataset")
        seed_jobs(cursor, rows)
        print("Database Seeded Succesfully")
    
    except Exception as e:
        conn.rollback()
        print(f"Seeding Failed: {e}")
    
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()