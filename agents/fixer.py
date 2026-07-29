import os
import json
from pydantic import BaseModel
from typing import List
from google import genai
from google.genai import types

# Initialize the Gemini client
client = genai.Client()

class FixPatch(BaseModel):
    file: str
    unified_diff: str
    rationale: str

class FixGenerationResult(BaseModel):
    patches: List[FixPatch]

def run_fix_agent(planner_output_json: str, original_code: str) -> str:
    system_instruction = """
You are a fix-generation agent. For each item in the fix plan, generate a minimal, safe code diff that resolves the specific risk described. Do not refactor unrelated code. Output each fix as a unified diff with a one-sentence rationale.
"""
    prompt = f"Original Code:\n{original_code}\n\nFix Plan:\n{planner_output_json}"
    
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

if __name__ == "__main__":
    # Mock planner output and original code
    mock_plan = json.dumps({
        "items": [
            {
                "finding_type": "Hardcoded Secret",
                "file": "vulnerable_app.py",
                "line_range": "5-5",
                "priority": 1,
                "rationale": "High exploitability if checked into source control.",
                "root_cause_group": "Secrets Management"
            },
            {
                "finding_type": "SQL Injection",
                "file": "vulnerable_app.py",
                "line_range": "11-11",
                "priority": 2,
                "rationale": "Allows arbitrary database execution.",
                "root_cause_group": "Input Validation"
            }
        ]
    })
    
    original_code = '''
from flask import request
import sqlite3
import os

SECRET_API_KEY = "sk-live-1234567890abcdef"

def get_user():
    user_id = request.args.get('id')
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    # SQL Injection risk
    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
    return cursor.fetchall()
'''
    
    print("Running Fix Agent on mock plan...")
    try:
        result_json = run_fix_agent(mock_plan, original_code)
        print("\n=== Fix Agent Output ===")
        parsed = json.loads(result_json)
        print(json.dumps(parsed, indent=2))
    except Exception as e:
        print(f"Error running agent: {e}")
        print("Make sure your GEMINI_API_KEY environment variable is set.")
