import os
import json
from pydantic import BaseModel
from google import genai
from google.genai import types

try:
    client = genai.Client()
except Exception:
    client = None

class EvalScore(BaseModel):
    confidence_score: int # 0-100
    justification: str

def run_eval_agent(original_risk_json: str, proposed_diff: str, review_notes_json: str) -> str:
    system_instruction = """
You are a confidence-scoring agent. Given a risk, its proposed fix, and the self-review notes, output a confidence score from 0–100 representing how safe this fix would be to auto-merge without further human review, plus a one-sentence justification for the score.
"""
    prompt = f"Original Risk:\n{original_risk_json}\n\nProposed Fix (Diff):\n{proposed_diff}\n\nReview Notes:\n{review_notes_json}"
    
    response = client.models.generate_content(
        model='gemini-2.5-pro',
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=EvalScore,
            temperature=0.1
        ),
    )
    return response.text

if __name__ == "__main__":
    # Mock data
    mock_risk = json.dumps({"finding_type": "SQL Injection"})
    mock_diff = "diff..."
    mock_review = json.dumps({
        "fully_resolves_risk": True,
        "introduces_new_risk": False,
        "is_incomplete_or_fragile": False,
        "critical_review_notes": "The fix correctly uses parameterized queries which entirely eliminates the SQL injection vector."
    })
    
    print("Running Eval Agent...")
    try:
        res = run_eval_agent(mock_risk, mock_diff, mock_review)
        print(json.dumps(json.loads(res), indent=2))
    except Exception as e:
        print(f"Error: {e}")

