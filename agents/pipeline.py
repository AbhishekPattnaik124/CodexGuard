import json
import uuid
import sys
import os
# Add agents directory to sys.path if not running from there
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scanner import run_scanner_agent
from planner import run_planner_agent
from fixer import run_fix_agent
from reviewer import run_reviewer_agent
from evaluator import run_eval_agent

def execute_pipeline(code_snippet: str, filename: str = "snippet.py"):
    """
    Executes the 5-agent pipeline and returns a structured list of findings
    formatted for the React dashboard.
    """
    results = []
    
    try:
        # 1. Scanner Agent
        scanner_raw = run_scanner_agent(code_snippet, filename)
        scanner_data = json.loads(scanner_raw)
        risks = scanner_data.get("findings", [])
        
        if not risks:
            return []
            
        # 2. Planner Agent
        planner_raw = run_planner_agent(scanner_raw)
        
        # 3. Fix Agent
        fixer_raw = run_fix_agent(planner_raw, code_snippet)
        fixer_data = json.loads(fixer_raw)
        patches = fixer_data.get("patches", [])
        
        # Match patches back to risks based on finding_type (simplified matching)
        for i, risk in enumerate(risks):
            # Try to find a matching patch
            # Fallback to the first patch if no direct match by type
            patch = next((p for p in patches if p.get('rationale', '') != ''), patches[0] if patches else None)
            
            proposed_diff = patch['unified_diff'] if patch else "No fix generated."
            
            # 4. Review Agent
            review_raw = run_reviewer_agent(json.dumps(risk), proposed_diff)
            review_data = json.loads(review_raw)
            
            # 5. Eval Agent
            eval_raw = run_eval_agent(json.dumps(risk), proposed_diff, review_raw)
            eval_data = json.loads(eval_raw)
            
            results.append({
                "id": str(uuid.uuid4()),
                "type": risk.get("type", "Unknown"),
                "severity": risk.get("severity", "med"),
                "file": risk.get("file", filename),
                "line_range": risk.get("line_range", "0-0"),
                "explanation": risk.get("explanation", ""),
                "diff": proposed_diff,
                "confidence": eval_data.get("confidence_score", 0),
                "review_notes": review_data.get("critical_review_notes", "")
            })
            
        return results
        
    except Exception as e:
        print(f"Pipeline Execution Error: {e}")
        # In a real app we'd throw this, but for the hackathon we'll return a mock error state
        raise e
