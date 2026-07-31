# CodexGuard: The God-Tier AI Security Swarm 🚀

CodexGuard is an autonomous, self-healing cyber-security swarm with a neural threat-mapping cortex and interactive voice synthesis. 

Unlike traditional static analysis tools that run a single scan, CodexGuard deploys a **Multi-Agent Debate Swarm** (powered by Gemini 2.0 Pro and Gemini 2.5 Flash) that recursively finds vulnerabilities, proposes patches, and aggressively debates the fixes until they are production-ready. 

All of this happens live, streaming in real-time to a cyberpunk terminal while a JARVIS-style AI physically speaks the logs out loud, alongside a 2D physics-based repository map!

## 🌟 God-Tier Features
* **Autonomous Debate Swarm**: A Scanner, Planner, Fixer, and Reviewer agent that argue over code patches until perfection is reached.
* **Neural Threat Map**: A fully interactive `react-force-graph-2d` representation of the repository's directory architecture.
* **AI Voice Synthesis**: Browser-native WebSpeech API wrapper that dynamically reads critical security logs out loud.
* **Real-Time WebSocket Streaming**: Zero hanging—watch the AI's internal monologue stream directly to a CRT-styled terminal.
* **Graceful Degradation Fallback**: If corporate firewalls block GitHub clones, the app seamlessly falls back to a simulated matrix architecture so the demo never fails.

## 🛠 Tech Stack
* **Frontend**: React, Vite, `react-force-graph-2d`
* **Backend**: Python, Flask, Flask-SocketIO, Eventlet
* **AI Core**: Google GenAI SDK (`gemini-2.0-pro-exp-02-05` & `gemini-2.5-flash`)

## 🚀 How to Run Locally

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*(Ensure you have created a `.env` file from `.env.example` with your `GEMINI_API_KEY`)*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173`, turn up your system volume, and hit **Run Security Audit**!
