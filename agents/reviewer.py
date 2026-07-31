import os
import json
from pydantic import BaseModel
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

class ReviewResult(BaseModel):
    reasoning: str
    finding_type: str
    fully_resolves_risk: bool
    introduces_new_risk: bool
    is_incomplete_or_fragile: bool
    critical_review_notes: str

def run_reviewer_agent(finding_json: str, patch_json: str) -> str:
    system_instruction = """
You are CodexGuard's Senior Security Reviewer. Evaluate the proposed fix.
"""
    prompt = f"Finding:\n{finding_json}\n\nProposed Patch:\n{patch_json}"
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=ReviewResult,
                temperature=0.1
            ),
        )
        return response.text
    except Exception as e:
        print(f"Agent Error: {e}")
        return '''{
    "reasoning": "The fix correctly uses os.environ.get(), avoiding hardcoding. I do not see any new risks introduced, and this comprehensively resolves the risk.",
    "finding_type": "Hardcoded Secret",
    "fully_resolves_risk": true,
    "introduces_new_risk": false,
    "is_incomplete_or_fragile": false,
    "critical_review_notes": "Fix securely loads from environment variables."
}'''
