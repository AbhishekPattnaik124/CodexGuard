import os
import json
from pydantic import BaseModel
from typing import List, Optional
from google import genai
from google.genai import types

# Initialize the Gemini client
# Note: GEMINI_API_KEY environment variable needs to be set.
try:
    client = genai.Client()
except Exception:
    client = None

class Finding(BaseModel):
    type: str
    severity: str # low, med, high, critical
    file: str
    line_range: str
    explanation: str

class RiskInventory(BaseModel):
    findings: List[Finding]

def run_scanner_agent(code_snippet: str, filename: str) -> str:
    system_instruction = """
You are a security scanner agent. Given a code file or diff, first plan which categories of risk you will check for (hardcoded secrets, injection risks, missing validation, dependency vulnerabilities), then execute that plan and output a structured JSON list of findings, each with: type, severity (low/med/high/critical), file, line range, and one-sentence explanation. Do not fix anything yet — only detect.
"""
    prompt = f"File: {filename}\n\nCode:\n{code_snippet}"
    
    # We use gemini-2.5-pro for deep reasoning and accuracy in code review
    response = client.models.generate_content(
        model='gemini-2.5-pro',
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=RiskInventory,
            temperature=0.1
        ),
    )
    
    return response.text

if __name__ == "__main__":
    # Test with a highly vulnerable sample
    vulnerable_code = '''
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
    print("Running Scanner Agent on vulnerable code...")
    try:
        result_json = run_scanner_agent(vulnerable_code, "vulnerable_app.py")
        print("\n=== Scanner Agent Output ===")
        parsed = json.loads(result_json)
        print(json.dumps(parsed, indent=2))
    except Exception as e:
        print(f"Error running agent: {e}")
        print("Make sure your GEMINI_API_KEY environment variable is set.")

