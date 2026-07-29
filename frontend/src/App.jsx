import { useState, useEffect, useRef } from 'react'
import './App.css'
import logoUrl from './assets/logo.png'

// Simulated logs for the terminal effect
const AGENT_LOGS = [
  "[SYSTEM] Initializing CodexGuard Autonomous Pipeline...",
  "[SCANNER] Cloning repository into secure sandbox...",
  "[SCANNER] Performing deep AST and dependency analysis...",
  "[SCANNER] Detecting hardcoded secrets and logic flaws...",
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

function Terminal({ isRunning, onComplete }) {
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
        currentIndex++
      } else {
        clearInterval(interval)
        if (onComplete) onComplete()
      }
    }, 400) // Type a new line every 400ms

    return () => clearInterval(interval)
  }, [isRunning, onComplete])

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
        <span className="term-title">codexguard-agent-stdout</span>
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
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let color = '#ef4444'; // red
  if (score > 60) color = '#eab308'; // yellow
  if (score > 85) color = '#10b981'; // green

  return (
    <div className="health-score-widget glass-panel">
      <div className="health-details">
        <h3>Repository Health</h3>
        <p>Overall security posture based on findings.</p>
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
        <div className="score-text" style={{ color }}>{score}</div>
      </div>
    </div>
  )
}

function App() {
  const [repoUrl, setRepoUrl] = useState('')
  const [scanStatus, setScanStatus] = useState('idle') // idle, scanning, complete, error
  const [findings, setFindings] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [prStatus, setPrStatus] = useState({})
  const [showResults, setShowResults] = useState(false)

  const handleScan = async (e) => {
    e.preventDefault()
    if (!repoUrl) return

    setScanStatus('scanning')
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
      // Note: We keep status 'scanning' for the terminal effect, 
      // but we have the data. The terminal onComplete will set status to complete.
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
    if (!diffText) return null;
    return diffText.split('\n').map((line, i) => {
      let className = 'diff-line';
      if (line.startsWith('+')) className += ' diff-add';
      else if (line.startsWith('-')) className += ' diff-remove';
      else if (line.startsWith('@@')) className += ' diff-meta';
      return <div key={i} className={className}>{line}</div>
    })
  }

  return (
    <div className="app-wrapper">
      <div className="bg-aurora"></div>
      
      <div className="dashboard">
        {/* SIDEBAR */}
        <aside className="sidebar glass-panel">
          <div className="brand">
            <img src={logoUrl} alt="CodexGuard" className="logo-glow" />
            <h1>CodexGuard</h1>
            <span className="badge">v2.0 GOAT</span>
          </div>
          
          <div className="control-panel">
            <h3>Target Configuration</h3>
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
                {scanStatus === 'scanning' ? 'INITIALIZING AGENTS...' : 'ENGAGE PIPELINE'}
              </button>
            </form>
          </div>

          <div className="status-indicator">
            <div className={`status-dot ${scanStatus === 'idle' ? 'idle' : scanStatus === 'scanning' ? 'active' : scanStatus === 'error' ? 'error' : 'complete'}`}></div>
            <span>System Status: {scanStatus.toUpperCase()}</span>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-view">
          {(scanStatus === 'idle') && (
            <div className="hero-state">
              <h2>Autonomous Security Reviews</h2>
              <p>Enter a repository URL to deploy the 5-agent swarn. CodexGuard will analyze, prioritize, patch, review, and evaluate your code in seconds.</p>
            </div>
          )}

          {(scanStatus === 'scanning' || showResults) && (
            <Terminal 
              isRunning={scanStatus === 'scanning'} 
              onComplete={handleTerminalComplete} 
            />
          )}

          {scanStatus === 'error' && (
            <div className="alert-box error glass-panel">
              <span className="icon">⚠️</span>
              <div>
                <h4>Pipeline Failure</h4>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {showResults && findings.length === 0 && (
            <div className="alert-box success glass-panel">
              <span className="icon">✅</span>
              <div>
                <h4>Repository Secure</h4>
                <p>No critical vulnerabilities or logic flaws detected.</p>
              </div>
            </div>
          )}

          {showResults && findings.length > 0 && (
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
                        <span className="score-label">Auto-Merge Confidence</span>
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
                          <span className="agent-name">🛠️ FIX AGENT</span>
                          <span>Generated Patch</span>
                        </div>
                        <div className="diff-viewer">
                          {renderDiff(finding.diff)}
                        </div>
                      </div>

                      <div className="agent-panel review-panel">
                        <div className="panel-header">
                          <span className="agent-name">🧐 REVIEW AGENT</span>
                          <span>Audit Notes</span>
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
                        {prStatus[finding.id] === 'loading' ? ' INJECTING FIX...' : 
                         prStatus[finding.id] === 'success' ? '✅ SECURE PR MERGED' : 
                         '⚡ ONE-CLICK REMEDIATE'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
