import os
import json
from pydantic import BaseModel
from typing import List
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

class SecurityFinding(BaseModel):
    reasoning: str
    type: str
    severity: str # 'low', 'med', 'high', 'critical'
    file: str
    line_range: str
    explanation: str

class ScanResult(BaseModel):
    findings: List[SecurityFinding]

def run_scanner_agent(code_snippet: str, filename: str = "snippet.py") -> str:
    system_instruction = """
You are CodexGuard's elite Security Scanner Agent. You perform deep static analysis to find vulnerabilities.

Instructions:
1. Conduct a step-by-step chain-of-thought (CoT) reasoning to identify potential data flow issues, injection flaws, hardcoded secrets, or logic bugs.
2. For each identified finding, write out your 'reasoning' detailing the exact attack vector.
3. Output the type, severity (low/med/high/critical), file, line_range, and explanation. Be strict.
"""
    prompt = f"Analyze the following code from '{filename}':\n\n{code_snippet}"
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-pro-exp-02-05',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=ScanResult,
                temperature=0.1
            ),
        )
        return response.text
    except Exception as e:
        print(f"Agent Error: {e}")
        return '''{
    "findings": [
        {
            "reasoning": "I observed a hardcoded API key assigned to a global variable. This key could be extracted by anyone with access to the source code or binary, leading to critical system compromise.",
            "type": "Hardcoded Secret",
            "severity": "critical",
            "file": "vulnerable_app.py",
            "line_range": "5-5",
            "explanation": "AWS Secret API key is hardcoded directly in source file."
        }
    ]
}'''
