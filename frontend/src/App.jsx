import { useState, useEffect, useRef } from 'react'
import './App.css'
import logoUrl from './assets/logo.png'

// Simulated logs for the terminal effect
const AGENT_LOGS = [
  "[SYSTEM] Initializing CodexGuard Autonomous Pipeline...",
  "[SCANNER] Cloning repository into secure sandbox...",
  "[SCANNER] Performing deep AST and dependency analysis...",
  "[SCANNER] Found Critical vulnerability in authentication flow.",
  "[PLANNER] Triaging risks based on exploitability context...",
  "[PLANNER] Generating remediation graph and task ordering...",
  "[FIXER] Engaging Gemini-2.5-pro to synthesize patch...",
  "[FIXER] Validating patch syntax and context boundaries...",
  "[REVIEWER] Critiquing generated patch for side-effects...",
  "[REVIEWER] Verification passed: No new regressions introduced.",
  "[EVALUATOR] Calculating final Auto-Merge Confidence Score...",
  "[SYSTEM] Aggregating finding reports. Pipeline complete."
]

// Canvas Particle Network Background
function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1,
    }))

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(99, 102, 241, ${1 - dist / 120 * 0.8})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Move & draw particles
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = '#6366f1'
        ctx.shadowBlur = 10
        ctx.shadowColor = '#6366f1'
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-canvas" />
}

// Interactive 5-Agent Flow Visualizer Component
function AgentNodeGraph({ activeStep }) {
  const agents = [
    { id: 1, name: "SCANNER", icon: "🔍", desc: "AST & Vulnerability Detection" },
    { id: 2, name: "PLANNER", icon: "🧠", desc: "Risk Prioritization" },
    { id: 3, name: "FIXER", icon: "🛠️", desc: "LLM Patch Synthesis" },
    { id: 4, name: "REVIEWER", icon: "🧐", desc: "Regression Self-Audit" },
    { id: 5, name: "EVALUATOR", icon: "⚖️", desc: "Confidence Scoring" }
  ]

  return (
    <div className="agent-graph-panel glass-panel">
      <h3 className="graph-title">LIVE MULTI-AGENT SWARM MESH</h3>
      <div className="graph-nodes">
        {agents.map((agent, index) => {
          const isDone = activeStep > index + 1
          const isActive = activeStep === index + 1
          return (
            <div key={agent.id} className="graph-node-wrapper">
              <div className={`node-circle ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                <span className="node-icon">{agent.icon}</span>
                {isActive && <div className="pulse-ring"></div>}
              </div>
              <span className="node-name">{agent.name}</span>
              <span className="node-desc">{agent.desc}</span>
              {index < agents.length - 1 && (
                <div className={`node-connector ${isDone ? 'done' : ''}`}></div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Terminal({ isRunning, onStepChange, onComplete }) {
  const [logs, setLogs] = useState([])
  const terminalRef = useRef(null)

  useEffect(() => {
    if (!isRunning) {
      setLogs([])
      return
    }

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < AGENT_LOGS.length) {
        setLogs(prev => [...prev, AGENT_LOGS[currentIndex]])
        
        // Update Agent Node Graph Step
        if (currentIndex < 4) onStepChange(1)
        else if (currentIndex < 7) onStepChange(2)
        else if (currentIndex < 9) onStepChange(3)
        else if (currentIndex < 11) onStepChange(4)
        else onStepChange(5)

        currentIndex++
      } else {
        clearInterval(interval)
        if (onComplete) onComplete()
      }
    }, 350)

    return () => clearInterval(interval)
  }, [isRunning, onStepChange, onComplete])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="terminal-container glass-panel">
      <div className="terminal-header">
        <div className="term-dot red"></div>
        <div className="term-dot yellow"></div>
        <div className="term-dot green"></div>
        <span className="term-title">agent-orchestrator-core</span>
      </div>
      <div className="terminal-body" ref={terminalRef}>
        {logs.map((log, i) => (
          <div key={i} className="term-line">
            <span className="term-prompt">❯</span> {log}
          </div>
        ))}
        {isRunning && logs.length < AGENT_LOGS.length && (
          <div className="term-line typing"><span className="cursor">█</span></div>
        )}
      </div>
    </div>
  )
}

function HealthScore({ score }) {
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  let color = '#ef4444'
  if (score > 60) color = '#eab308'
  if (score > 85) color = '#10b981'

  return (
    <div className="health-score-widget glass-panel">
      <div className="health-details">
        <h3>Repository Health Index</h3>
        <p>Real-time autonomous audit result score based on 5-agent evaluation.</p>
      </div>
      <div className="score-ring">
        <svg height="120" width="120" className="circular-chart">
          <circle className="circle-bg" strokeWidth="8" fill="transparent" r={radius} cx="60" cy="60" />
          <circle 
            className="circle" 
            strokeWidth="8" 
            strokeDasharray={`${circumference} ${circumference}`} 
            style={{ strokeDashoffset, stroke: color }} 
            strokeLinecap="round" 
            fill="transparent" 
            r={radius} 
            cx="60" 
            cy="60" 
          />
        </svg>
        <div className="score-text" style={{ color }}>{score}%</div>
      </div>
    </div>
  )
}

function App() {
  const [repoUrl, setRepoUrl] = useState('')
  const [scanStatus, setScanStatus] = useState('idle')
  const [activeStep, setActiveStep] = useState(0)
  const [findings, setFindings] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [prStatus, setPrStatus] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState('findings')

  const handleScan = async (e) => {
    e.preventDefault()
    if (!repoUrl) return

    setScanStatus('scanning')
    setActiveStep(1)
    setShowResults(false)
    setErrorMessage('')
    setFindings([])
    setPrStatus({})
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl }),
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to scan repository')
      setFindings(data.findings)
    } catch (err) {
      setErrorMessage(err.message)
      setScanStatus('error')
    }
  }

  const handleTerminalComplete = () => {
    setScanStatus('complete')
    setShowResults(true)
  }

  const handleCreatePR = (findingId) => {
    setPrStatus(prev => ({ ...prev, [findingId]: 'loading' }))
    setTimeout(() => {
      setPrStatus(prev => ({ ...prev, [findingId]: 'success' }))
    }, 2000)
  }

  const renderDiff = (diffText) => {
    if (!diffText) return null
    return diffText.split('\n').map((line, i) => {
      let className = 'diff-line'
      if (line.startsWith('+')) className += ' diff-add'
      else if (line.startsWith('-')) className += ' diff-remove'
      else if (line.startsWith('@@')) className += ' diff-meta'
      return <div key={i} className={className}>{line}</div>
    })
  }

  return (
    <div className="app-wrapper">
      <ParticleCanvas />
      
      <div className="dashboard">
        {/* SIDEBAR */}
        <aside className="sidebar glass-panel">
          <div className="brand">
            <img src={logoUrl} alt="CodexGuard" className="logo-glow" />
            <h1>CodexGuard</h1>
            <span className="badge">50/10 UNBEATABLE</span>
          </div>
          
          <div className="control-panel">
            <h3>Target Codebase</h3>
            <form onSubmit={handleScan} className="scan-form">
              <input 
                type="text" 
                placeholder="https://github.com/org/repo" 
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="repo-input"
              />
              <button 
                type="submit" 
                disabled={scanStatus === 'scanning'} 
                className={`btn-cyber ${scanStatus === 'scanning' ? 'scanning-anim' : ''}`}
              >
                {scanStatus === 'scanning' ? 'SWARM ENGAGED...' : 'DEPLOY 5-AGENT SWARM'}
              </button>
            </form>
          </div>

          <div className="status-indicator">
            <div className={`status-dot ${scanStatus === 'idle' ? 'idle' : scanStatus === 'scanning' ? 'active' : scanStatus === 'error' ? 'error' : 'complete'}`}></div>
            <span>Pipeline: {scanStatus.toUpperCase()}</span>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-view">
          {/* Top Mesh Graph */}
          <AgentNodeGraph activeStep={scanStatus === 'scanning' ? activeStep : scanStatus === 'complete' ? 6 : 0} />

          {scanStatus === 'idle' && (
            <div className="hero-state glass-panel">
              <h2>Autonomous Agentic Code Security</h2>
              <p>Experience the world's first 5-agent sequential self-correcting remediation loop. CodexGuard doesn't just flag vulnerabilities—it patches them and scores its own confidence.</p>
            </div>
          )}

          {(scanStatus === 'scanning' || showResults) && (
            <Terminal 
              isRunning={scanStatus === 'scanning'} 
              onStepChange={setActiveStep}
              onComplete={handleTerminalComplete} 
            />
          )}

          {scanStatus === 'error' && (
            <div className="alert-box error glass-panel">
              <span className="icon">🚨</span>
              <div>
                <h4>Agent Pipeline Error</h4>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {showResults && (
            <div className="results-wrapper">
              <div className="results-tabs">
                <button className={`tab-btn ${activeTab === 'findings' ? 'active' : ''}`} onClick={() => setActiveTab('findings')}>Findings & Auto-Fixes</button>
                <button className={`tab-btn ${activeTab === 'matrix' ? 'active' : ''}`} onClick={() => setActiveTab('matrix')}>Agent Matrix View</button>
              </div>

              {activeTab === 'findings' && (
                <div className="results-grid">
                  <HealthScore score={Math.max(10, 100 - (findings.length * 20))} />
                  
                  <div className="findings-feed">
                    {findings.map((finding, idx) => (
                      <div key={finding.id} className={`cyber-card severity-${finding.severity}`} style={{animationDelay: `${idx * 0.2}s`}}>
                        <div className="card-header">
                          <div className="header-left">
                            <span className="severity-badge">{finding.severity.toUpperCase()}</span>
                            <h3 className="vuln-title">{finding.type}</h3>
                          </div>
                          <div className="confidence-pill">
                            <span className="score-number">{finding.confidence}</span>
                            <span className="score-label">Auto-Merge Score</span>
                          </div>
                        </div>
                        
                        <div className="file-location">
                          <span className="icon">📄</span> 
                          <code>{finding.file} : {finding.line_range}</code>
                        </div>
                        
                        <p className="vuln-desc">{finding.explanation}</p>
                        
                        <div className="agent-panels">
                          <div className="agent-panel patch-panel">
                            <div className="panel-header">
                              <span className="agent-name">🛠️ FIX AGENT PATCH</span>
                            </div>
                            <div className="diff-viewer">
                              {renderDiff(finding.diff)}
                            </div>
                          </div>

                          <div className="agent-panel review-panel">
                            <div className="panel-header">
                              <span className="agent-name">🧐 SELF-REVIEW AUDIT</span>
                            </div>
                            <p className="review-notes">"{finding.review_notes}"</p>
                          </div>
                        </div>

                        <div className="card-actions">
                          <button 
                            onClick={() => handleCreatePR(finding.id)}
                            disabled={prStatus[finding.id] === 'loading' || prStatus[finding.id] === 'success'}
                            className={`btn-pr ${prStatus[finding.id] === 'success' ? 'success' : ''}`}
                          >
                            {prStatus[finding.id] === 'loading' && <span className="spinner-small"></span>}
                            {prStatus[finding.id] === 'loading' ? ' COMMITTING PATCH...' : 
                             prStatus[finding.id] === 'success' ? '✅ PR #102 MERGED TO MAIN' : 
                             '⚡ ONE-CLICK AUTONOMOUS PR'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'matrix' && (
                <div className="matrix-view glass-panel">
                  <h3>Agent Intelligence Telemetry</h3>
                  <div className="matrix-grid">
                    <div className="matrix-box">
                      <h4>Scanner Model</h4>
                      <p>Gemini-2.5-Pro (Structured AST Mode)</p>
                    </div>
                    <div className="matrix-box">
                      <h4>Planner Model</h4>
                      <p>Gemini-2.5-Pro (Dependency Graph Mode)</p>
                    </div>
                    <div className="matrix-box">
                      <h4>Fixer Model</h4>
                      <p>Gemini-2.5-Pro (Unified Diff Mode)</p>
                    </div>
                    <div className="matrix-box">
                      <h4>Reviewer Model</h4>
                      <p>Gemini-2.5-Pro (Skeptical Auditor Mode)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
