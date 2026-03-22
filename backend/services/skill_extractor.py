# Sends extracted resume text to the LLM API with a structured prompt. Parses the JSON response to
# return a clean list of skills found in the resume. Handles LLM errors and inconsistent responses.

import json
from google import genai
from google.genai import types
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import GEMINI_API_KEY, GEMINI_MODEL

client = genai.Client(api_key=GEMINI_API_KEY)

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
    Resume Text:
    {resume_text}
    Example Output: ["python", "aws", "docker", "react", "postgresql"]"""

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=list[str]
            )
        )
        skills = json.loads(response.text.strip())
        return [s.strip().lower() for s in skills if isinstance(s, str) and len(s.strip()) > 1]

    except Exception as e:
        print(f"Skill extraction failed: {e}")
        return []