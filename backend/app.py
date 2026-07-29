from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
import sys

# Add the agents folder to path so we can import the pipeline
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agents'))
from pipeline import execute_pipeline

app = Flask(__name__)
CORS(app)

DB_FILE = 'sentinel.db'

def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                repo_url TEXT,
                status TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "CodexGuard Backend Running"})

@app.route('/api/scan', methods=['POST'])
def trigger_scan():
    data = request.json
    repo_url = data.get('repo_url', '')
    
    # In a real app, we would clone the repo based on repo_url here.
    # For this hackathon demo, we'll use a mocked vulnerable snippet if repo_url is empty,
    # or treat the repo_url string itself as the code snippet if it doesn't look like a URL.
    
    code_to_scan = repo_url
    
    if not code_to_scan or code_to_scan.startswith('http'):
        code_to_scan = '''
from flask import request
import sqlite3
import os

SECRET_API_KEY = "sk-live-1234567890abcdef"

def get_user():
    user_id = request.args.get('id')
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
    return cursor.fetchall()
'''

    try:
        results = execute_pipeline(code_to_scan, "vulnerable_app.py")
        return jsonify({
            "status": "complete",
            "findings": results
        }), 200
    except Exception as e:
        # Fallback to mock data if API key is missing during the demo
        if "API key" in str(e):
             return jsonify({
                "status": "complete",
                "findings": [
                    {
                      "id": "mock-1",
                      "type": "Hardcoded Secret",
                      "severity": "critical",
                      "file": "vulnerable_app.py",
                      "line_range": "5-5",
                      "explanation": "API key is hardcoded.",
                      "diff": "--- vulnerable_app.py\n+++ vulnerable_app.py\n@@ -4,3 +4,3 @@\n-SECRET_API_KEY = \"sk-live-1234567890abcdef\"\n+SECRET_API_KEY = os.environ.get('SECRET_API_KEY')",
                      "confidence": 98,
                      "review_notes": "(Mock Mode - Missing API Key) Fix securely loads from environment variables."
                    }
                ]
             }), 200
             
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    if not os.path.exists(DB_FILE):
        init_db()
    app.run(debug=True, port=5000)
