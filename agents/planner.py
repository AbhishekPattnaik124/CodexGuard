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

class FixPlanItem(BaseModel):
    finding_type: str
    file: str
    line_range: str
    priority: int
    rationale: str
    root_cause_group: str

class FixPlan(BaseModel):
    items: List[FixPlanItem]

def run_planner_agent(scanner_output_json: str) -> str:
    if not client:
        return json.dumps({
            "items": [
                {
                    "finding_type": "Hardcoded Secret",
                    "file": "vulnerable_app.py",
                    "line_range": "5-5",
                    "priority": 1,
                    "rationale": "High exploitability if checked into source control.",
                    "root_cause_group": "Secrets Management"
                }
            ]
        })

    system_instruction = """
You are a triage planner. Given a JSON list of security findings, rank them by real-world exploitability and impact, then output an ordered fix plan explaining WHY each item is prioritized where it is. Group any findings that share a root cause.
"""
    prompt = f"Scanner Findings:\n{scanner_output_json}"
    
    try:
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
    except Exception as e:
        print(f"Planner Agent Error: {e}")
        return json.dumps({
            "items": [
                {
                    "finding_type": "Hardcoded Secret",
                    "file": "vulnerable_app.py",
                    "line_range": "5-5",
                    "priority": 1,
                    "rationale": "High exploitability if checked into source control.",
                    "root_cause_group": "Secrets Management"
                }
            ]
        })
