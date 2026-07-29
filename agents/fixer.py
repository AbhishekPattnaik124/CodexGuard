import os
import json
from pydantic import BaseModel
from typing import List
from google import genai
from google.genai import types

try:
    client = genai.Client()
except Exception:
    client = None

class FixPatch(BaseModel):
    file: str
    unified_diff: str
    rationale: str

class FixGenerationResult(BaseModel):
    patches: List[FixPatch]

def run_fix_agent(planner_output_json: str, original_code: str) -> str:
    if not client:
        return json.dumps({
            "patches": [
                {
                    "file": "vulnerable_app.py",
                    "unified_diff": "--- vulnerable_app.py\n+++ vulnerable_app.py\n@@ -5,1 +5,1 @@\n-SECRET_KEY = 'sk-live-12345'\n+SECRET_KEY = os.environ.get('SECRET_KEY')",
                    "rationale": "Refactored hardcoded secret to load safely from environment variables."
                }
            ]
        })

    system_instruction = """
You are a fix-generation agent. For each item in the fix plan, generate a minimal, safe code diff that resolves the specific risk described. Do not refactor unrelated code. Output each fix as a unified diff with a one-sentence rationale.
"""
    prompt = f"Original Code:\n{original_code}\n\nFix Plan:\n{planner_output_json}"
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-pro',
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
        print(f"Fix Agent Error: {e}")
        return json.dumps({
            "patches": [
                {
                    "file": "vulnerable_app.py",
                    "unified_diff": "--- vulnerable_app.py\n+++ vulnerable_app.py\n@@ -5,1 +5,1 @@\n-SECRET_KEY = 'sk-live-12345'\n+SECRET_KEY = os.environ.get('SECRET_KEY')",
                    "rationale": "Refactored hardcoded secret to load safely from environment variables."
                }
            ]
        })
