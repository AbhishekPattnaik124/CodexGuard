import os
import json
from pydantic import BaseModel
from google import genai
from google.genai import types

client = genai.Client()

class ReviewResult(BaseModel):
    finding_type: str
    fully_resolves_risk: bool
    introduces_new_risk: bool
    is_incomplete_or_fragile: bool
    critical_review_notes: str

def run_reviewer_agent(original_risk_json: str, proposed_diff: str) -> str:
    system_instruction = """
You are a skeptical senior reviewer. For each proposed diff, re-check it against the original risk description. Explicitly answer: (1) Does this fully resolve the risk? (2) Does it introduce any new risk? (3) Is anything about this fix incomplete or fragile? Be critical — assume the fix is wrong until proven otherwise.
"""
    prompt = f"Original Risk:\n{original_risk_json}\n\nProposed Fix (Diff):\n{proposed_diff}"
    
    response = client.models.generate_content(
        model='gemini-2.5-pro',
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=ReviewResult,
            temperature=0.1
        ),
    )
    return response.text

if __name__ == "__main__":
    # Mock data
    mock_risk = json.dumps({
        "finding_type": "SQL Injection",
        "explanation": "User input is directly concatenated into a SQL query."
    })
    mock_diff = '''
--- vulnerable_app.py
+++ vulnerable_app.py
@@ -10,3 +10,3 @@
     cursor = conn.cursor()
-    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
+    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
     return cursor.fetchall()
'''
    print("Running Self-Review Agent...")
    try:
        res = run_reviewer_agent(mock_risk, mock_diff)
        print(json.dumps(json.loads(res), indent=2))
    except Exception as e:
        print(f"Error: {e}")
