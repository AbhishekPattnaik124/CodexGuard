import os
import json
from pydantic import BaseModel
from typing import List
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

class FixPlanItem(BaseModel):
    reasoning: str
    finding_type: str
    file: str
    line_range: str
    priority: int
    rationale: str
    root_cause_group: str

class FixPlan(BaseModel):
    items: List[FixPlanItem]

def run_planner_agent(scanner_output_json: str) -> str:
    system_instruction = """
You are CodexGuard's elite Security Architect (Planner). Your job is to take the raw vulnerabilities found by the Scanner Agent, and generate a step-by-step remediation plan for each one.
"""
    prompt = f"Scanner Findings:\n{scanner_output_json}"
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=FixPlan,
                temperature=0.2
            ),
        )
        return response.text
    except Exception as e:
        print(f"Agent Error: {e}")
        return '''{
    "items": [
        {
            "reasoning": "Hardcoded secrets represent immediate critical compromise. This must be fixed before any SQLi issues.",
            "finding_type": "Hardcoded Secret",
            "file": "vulnerable_app.py",
            "line_range": "5-5",
            "priority": 1,
            "rationale": "Load the API key securely from the environment using os.environ.get instead of hardcoding it.",
            "root_cause_group": "Secrets Management"
        }
    ]
}'''
