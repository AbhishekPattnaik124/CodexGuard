import os
import json
from pydantic import BaseModel
from typing import List
from google import genai
from google.genai import types

# Initialize the Gemini client
try:
    client = genai.Client()
except Exception:
    client = None

class FixPlanItem(BaseModel):
    finding_type: str
    file: str
    line_range: str
    priority: int # 1 is highest priority
    rationale: str
    root_cause_group: str

class FixPlan(BaseModel):
    items: List[FixPlanItem]

def run_planner_agent(scanner_output_json: str) -> str:
    system_instruction = """
You are a triage planner. Given a JSON list of security findings, rank them by real-world exploitability and impact, then output an ordered fix plan explaining WHY each item is prioritized where it is. Group any findings that share a root cause.
"""
    prompt = f"Scanner Findings:\n{scanner_output_json}"
    
    response = client.models.generate_content(
        model='gemini-2.5-pro',
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=FixPlan,
            temperature=0.2
        ),
    )
    
    return response.text

if __name__ == "__main__":
    # Mock scanner output
    mock_scanner_data = json.dumps({
        "findings": [
            {
                "type": "Hardcoded Secret",
                "severity": "critical",
                "file": "vulnerable_app.py",
                "line_range": "5-5",
                "explanation": "An API key is hardcoded in the source code."
            },
            {
                "type": "SQL Injection",
                "severity": "high",
                "file": "vulnerable_app.py",
                "line_range": "11-11",
                "explanation": "User input is directly concatenated into a SQL query."
            }
        ]
    })
    
    print("Running Planner Agent on mock scanner output...")
    try:
        result_json = run_planner_agent(mock_scanner_data)
        print("\n=== Planner Agent Output ===")
        parsed = json.loads(result_json)
        print(json.dumps(parsed, indent=2))
    except Exception as e:
        print(f"Error running agent: {e}")
        print("Make sure your GEMINI_API_KEY environment variable is set.")

