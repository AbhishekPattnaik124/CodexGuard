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

def execute_pipeline(code_snippet: str, filename: str = "snippet.py", log_callback=None):
    """
    Executes the 5-agent pipeline and returns a structured list of findings
    formatted for the React dashboard.
    """
    results = []
    
    try:
        # 1. Scanner Agent
        if log_callback: log_callback("INITIALIZING NEURAL NET AUDIT...")
        if log_callback: log_callback("ENGAGING SCANNER AGENT...")
        scanner_raw = run_scanner_agent(code_snippet, filename)
        scanner_data = json.loads(scanner_raw)
        risks = scanner_data.get("findings", [])
        
        if log_callback: log_callback(f"SCAN COMPLETE. DETECTED {len(risks)} VULNERABILITIES.")
        
        if not risks:
            return []
            
        # 2. Planner Agent
        if log_callback: log_callback("ENGAGING PLANNER AGENT TO PRIORITIZE REMEDIATION...")
        planner_raw = run_planner_agent(scanner_raw)
        if log_callback: log_callback("REMEDIATION PLAN SYNTHESIZED.")
        
        # 3. Fix Agent
        if log_callback: log_callback("ENGAGING FIXER AGENT FOR CODE PATCH GENERATION...")
        fixer_raw = run_fix_agent(planner_raw, code_snippet)
        fixer_data = json.loads(fixer_raw)
        patches = fixer_data.get("patches", [])
        if log_callback: log_callback(f"GENERATED {len(patches)} FIX PATCHES.")
        
        # Match patches back to risks based on finding_type (simplified matching)
        for i, risk in enumerate(risks):
            # --- START DEBATE LOOP ---
            max_iterations = 3
            current_iteration = 0
            reviewer_feedback = ""
            review_raw = "{}"
            review_data = {}
            target_snippet = ""
            replacement_snippet = ""
            
            while current_iteration < max_iterations:
                current_iteration += 1
                
                # Try to find a matching patch
                # Fallback to the first patch if no direct match by type
                patch = next((p for p in patches if p.get('rationale', '') != ''), patches[0] if patches else None)
                
                target_snippet = patch.get('target_snippet', '') if patch else ""
                replacement_snippet = patch.get('replacement_snippet', '') if patch else ""
                
                # 4. Review Agent
                if log_callback: log_callback(f"REVIEWING PATCH FOR: {risk.get('type', 'Unknown')} (Iteration {current_iteration})...")
                review_raw = run_reviewer_agent(json.dumps(risk), f"Target:\n{target_snippet}\nReplacement:\n{replacement_snippet}")
                review_data = json.loads(review_raw)
                
                fully_resolves = review_data.get('fully_resolves_risk', False)
                introduces_new = review_data.get('introduces_new_risk', True)
                
                if fully_resolves and not introduces_new:
                    if log_callback: log_callback("PATCH ACCEPTED BY SENIOR REVIEWER.")
                    break # Break the while loop
                else:
                    reviewer_feedback = review_data.get("critical_review_notes", "The fix is incomplete or introduces a new risk.")
                    if log_callback: log_callback(f"PATCH REJECTED. INITIATING SELF-HEALING LOOP ({current_iteration}/{max_iterations})...")
                    
                    if current_iteration < max_iterations:
                        # Re-run fixer with feedback
                        fixer_raw = run_fix_agent(planner_raw, code_snippet, reviewer_feedback)
                        fixer_data = json.loads(fixer_raw)
                        patches = fixer_data.get("patches", [])
                        if log_callback: log_callback("NEW FIX PATCH GENERATED BASED ON FEEDBACK.")
            # --- END DEBATE LOOP ---
            
            # 5. Eval Agent
            if log_callback: log_callback("EVALUATING CONFIDENCE SCORE...")
            eval_raw = run_eval_agent(json.dumps(risk), f"Target:\n{target_snippet}\nReplacement:\n{replacement_snippet}", review_raw)
            eval_data = json.loads(eval_raw)
            
            # Extract feedback from reviewer
            review_notes = review_data.get("critical_review_notes", "")
            
            results.append({
                "id": str(uuid.uuid4()),
                "type": risk.get("type", "Unknown"),
                "severity": risk.get("severity", "med"),
                "file": risk.get("file", filename),
                "line_range": risk.get("line_range", "0-0"),
                "explanation": risk.get("explanation", ""),
                "target_snippet": target_snippet,
                "replacement_snippet": replacement_snippet,
                "confidence": eval_data.get("confidence_score", 0),
                "review_notes": review_notes
            })
            
        return results
        
    except Exception as e:
        print(f"Pipeline Execution Error: {e}")
        # In a real app we'd throw this, but for the hackathon we'll return a mock error state
        raise e

