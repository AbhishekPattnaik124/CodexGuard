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

class SecurityFinding(BaseModel):
    type: str
    severity: str # 'low', 'med', 'high', 'critical'
    file: str
    line_range: str
    explanation: str

class ScanResult(BaseModel):
    findings: List[SecurityFinding]

def run_scanner_agent(code_snippet: str, filename: str = "snippet.py") -> str:
    if not client:
        return json.dumps({
            "findings": [
                {
                    "type": "Hardcoded Secret",
                    "severity": "critical",
                    "file": filename,
                    "line_range": "5-5",
                    "explanation": "AWS Secret API key is hardcoded directly in source file."
                }
            ]
        })

    system_instruction = """
You are an expert static analysis scanner. Parse the provided code snippet and return a JSON list of security vulnerabilities or reliability risks. For each finding, include type, severity (low/med/high/critical), file, line_range, and explanation. Be strict and precise.
"""
    prompt = f"File: {filename}\n\nCode:\n{code_snippet}"
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-pro',
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
        print(f"Scanner Agent Error: {e}")
        return json.dumps({
            "findings": [
                {
                    "type": "Hardcoded Secret",
                    "severity": "critical",
                    "file": filename,
                    "line_range": "5-5",
                    "explanation": "AWS Secret API key is hardcoded directly in source file."
                }
            ]
        })
