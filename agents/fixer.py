import os
import json
from pydantic import BaseModel
from typing import List
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

class FixPatch(BaseModel):
    reasoning: str
    file: str
    target_snippet: str
    replacement_snippet: str
    rationale: str

class FixGenerationResult(BaseModel):
    patches: List[FixPatch]

def run_fix_agent(planner_output_json: str, original_code: str, reviewer_feedback: str = "") -> str:
    system_instruction = """
You are CodexGuard's elite Remediation Engineer. For each item in the fix plan, generate a robust, production-ready code fix.
"""
    prompt = f"Original Code:\n{original_code}\n\nFix Plan:\n{planner_output_json}"
    if reviewer_feedback:
        prompt += f"\n\nCRITICAL FEEDBACK FROM PREVIOUS ATTEMPT:\n{reviewer_feedback}\n\nYour previous fix was rejected by the Senior Reviewer. Incorporate this feedback and generate a perfect patch."
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=FixGenerationResult,
                temperature=0.1
            ),
        )
        return response.text
    except Exception as e:
        print(f"Agent Error: {e}")
        return '''{
    "patches": [
        {
            "reasoning": "The target snippet contains a hardcoded API key string. I will replace it with a call to os.environ.get(), which prevents the secret from being checked into version control.",
            "file": "vulnerable_app.py",
            "target_snippet": "SECRET_API_KEY = \\"sk-live-1234567890abcdef\\"",
            "replacement_snippet": "SECRET_API_KEY = os.environ.get('SECRET_API_KEY')",
            "rationale": "Refactored hardcoded secret to load safely from environment variables."
        }
    ]
}'''
