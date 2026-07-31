# CodexGuard: Autonomous Self-Healing Cyber Swarm

## Inspiration
Static analysis tools are slow, noisy, and require a human engineer to sift through hundreds of false positives. We wanted to build something that felt like it belonged in 2077—an AI that doesn't just find vulnerabilities, but actively reasons about them, debates the fixes with itself, and physically speaks to you while mapping your architecture in real-time. We were inspired by sci-fi interfaces like JARVIS and the idea of true "Agentic" workflows.

## What it does
CodexGuard is a God-Tier cybersecurity dashboard. You give it a GitHub repository, and it unleashes a **Multi-Agent Debate Swarm**. 
- The **Scanner** agent parses your code to find vulnerabilities.
- The **Planner** agent architectures a step-by-step remediation plan.
- The **Fixer** writes the actual code patch.
- The **Senior Reviewer** aggressively critiques the patch. If it's flawed, it rejects it and forces the Fixer into a multi-turn debate loop until the code is bulletproof.

While this happens, an **AI Voice Engine** speaks the logs out loud, and a **2D Physics Threat Map** visually graphs your entire repository architecture in real-time.

## How we built it
- **Frontend**: React and Vite, using `react-force-graph-2d` for the physics-based node visualization. We styled it with a custom Cyberpunk CSS skin (neon accents, glassmorphism, CRT scanlines).
- **Backend**: Python and Flask. We used `Flask-SocketIO` for real-time, non-blocking log streaming. 
- **AI Swarm Core**: We used the Google GenAI SDK, leveraging `gemini-2.0-pro-exp-02-05` for extreme precision during the scanning phase, and `gemini-2.5-flash` for blazing-fast generation during the Debate Loop.
- **Voice Engine**: We built a custom wrapper around the browser-native `SpeechSynthesis` API to give the agent a voice.

## Challenges we ran into
One major challenge was network restrictions in the hackathon sandbox environment blocking our `git clone` requests. We solved this by building a **Graceful Degradation Fallback**—a script that intercepts network timeouts and instantly simulates a localized, mocked repository architecture so the Swarm and Threat Map can continue running flawlessly for the demo.
Additionally, syncing the backend AI generation speeds with the WebSocket stream caused buffer locks, which we had to resolve by manually yielding to the `eventlet` event loop.

## Accomplishments that we're proud of
We are incredibly proud of the **Multi-Agent Debate Loop**. Watching two distinct AI personas (the Fixer and the Reviewer) argue about code security and recursively improve a patch without human intervention is magical. Combining that with the JARVIS-style voice synthesis makes the application feel genuinely alive.

## What we learned
We learned how to orchestrate complex multi-agent architectures using structured JSON schema constraints in Gemini. We also learned a ton about `react-force-graph` and how to seamlessly push high-throughput WebSocket events from a blocking Python backend.

## What's next for CodexGuard
In the future, we plan to implement a one-click "Merge Fix" button that uses the GitHub API to automatically open a Pull Request with the AI's validated security patch. We also want to scale the Threat Map to 3D VR spaces for true neural-net immersion!
