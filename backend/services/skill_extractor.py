# Sends extracted resume text to the LLM API with a structured prompt. Parses the JSON response to
# return a clean list of skills found in the resume. Handles LLM errors and inconsistent responses.
import json
from groq import Groq
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import GROQ_API_KEY, GROQ_MODEL

client = Groq(api_key=GROQ_API_KEY)

def extract_skills(resume_text):
    """Send resume text to Gemini LL and get a clean list of skills extracted from the resume."""
    prompt = f"""You are a resume skill extraction assistant.
    Extract all skills from the resume text below.
    Rules:
    - Return only real, specific skill names in lowercase
    - Remove noise words like "basics", "advanced", "fundamentals"
    - Return the top level skill if the skill is a subcategory. Example: supervised learning -> machine learning
    - Return specific tool name only. Example: Testing with xUnit -> "xunit"
    - Split any bundled skills. Example: HTML/CSS -> ["html", "css"]
    - Include frameworks, languages, tools, platforms, databases, cloud services
    - Return a JSON array of skills with no explanation, no markdown, no extra text. Example: ["python", "aws", "docker", "react", "postgresql"]
    Resume Text:
    {resume_text}
    Example Output: ["python", "aws", "docker", "react", "postgresql"]"""

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        skills = json.loads(content)
        return skills['skills']

    except Exception as e:
        print(f"Skill extraction failed: {e}")
        return []