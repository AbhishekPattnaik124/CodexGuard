import { useState } from 'react'
import './App.css'
import logoUrl from './assets/logo.png'

function App() {
  const [repoUrl, setRepoUrl] = useState('')
  const [scanStatus, setScanStatus] = useState('idle') // idle, scanning, complete, error
  const [findings, setFindings] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  
  // Track the PR creation status for each finding individually
  const [prStatus, setPrStatus] = useState({})

  const handleScan = async (e) => {
    e.preventDefault()
    if (!repoUrl) return

    setScanStatus('scanning')
    setErrorMessage('')
    setFindings([])
    setPrStatus({})
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repo_url: repoUrl }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan repository')
      }
      
      setFindings(data.findings)
      setScanStatus('complete')
    } catch (err) {
      setErrorMessage(err.message)
      setScanStatus('error')
    }
  }

  const handleCreatePR = (findingId) => {
    // Set to loading
    setPrStatus(prev => ({ ...prev, [findingId]: 'loading' }))
    
    // Simulate API call for stretch goal demo
    setTimeout(() => {
      setPrStatus(prev => ({ ...prev, [findingId]: 'success' }))
    }, 2000)
  }

  return (
    <div className="app-wrapper">
      <div className="bg-gradient-mesh"></div>
      
      <div className="app-container">
        <header className="header">
          <img src={logoUrl} alt="CodexGuard Logo" className="logo" />
          <h1>🛡️ CodexGuard</h1>
          <p>Autonomous Multi-Agent Code Security & Reliability Reviewer</p>
        </header>

        <main className="main-content">
          <section className="input-section glass-panel">
            <h2>Scan Repository</h2>
            <form onSubmit={handleScan} className="scan-form">
              <input 
                type="text" 
                placeholder="Paste GitHub Repo URL or Code Snippet..." 
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="repo-input"
              />
              <button type="submit" disabled={scanStatus === 'scanning'} className={`scan-btn ${scanStatus === 'scanning' ? 'pulse' : ''}`}>
                {scanStatus === 'scanning' ? 'Agent Pipeline Running...' : 'Start Security Scan'}
              </button>
            </form>
          </section>

          {scanStatus !== 'idle' && (
            <section className="results-section">
              <h2>Pipeline Results</h2>
              
              {scanStatus === 'scanning' && (
                <div className="loading-state glass-panel">
                  <div className="spinner"></div>
                  <p className="fade-in-text">Scanner Agent is reading codebase...</p>
                  <p className="fade-in-text" style={{animationDelay: '0.5s'}}>Planner Agent is triaging risks...</p>
                  <p className="fade-in-text" style={{animationDelay: '1s'}}>Fix Agent is generating patches...</p>
                  <p className="fade-in-text" style={{animationDelay: '1.5s'}}>Review & Eval Agents are scoring confidence...</p>
                </div>
              )}
              
              {scanStatus === 'error' && (
                <div className="error-state glass-panel">
                  <p>Error: {errorMessage}</p>
                </div>
              )}

              {scanStatus === 'complete' && findings.length === 0 && (
                <div className="success-state glass-panel">
                  <p>✅ No vulnerabilities detected! Code is clean.</p>
                </div>
              )}

              {scanStatus === 'complete' && findings.length > 0 && (
                <div className="findings-list">
                  {findings.map(finding => (
                    <div key={finding.id} className={`finding-card glass-panel severity-${finding.severity}`}>
                      <div className="finding-header">
                        <span className="finding-type">{finding.type}</span>
                        <span className="finding-severity">{finding.severity.toUpperCase()}</span>
                      </div>
                      <p className="finding-file"><code>{finding.file}:{finding.line_range}</code></p>
                      <p className="finding-explanation">{finding.explanation}</p>
                      
                      <div className="agent-box planner-box">
                        <h4>Fix Agent Proposed Patch</h4>
                        <pre><code>{finding.diff}</code></pre>
                      </div>

                      <div className="agent-box review-box">
                        <h4>Self-Review Agent Notes</h4>
                        <p>{finding.review_notes}</p>
                      </div>

                      <div className="agent-box eval-box">
                        <h4>Eval Agent Confidence Score</h4>
                        <div className="confidence-meter">
                          <div className="confidence-fill" style={{width: `${finding.confidence}%`}}></div>
                        </div>
                        <span>{finding.confidence} / 100 Auto-Merge Confidence</span>
                      </div>
                      
                      {/* Stretch Goal Demo Integration */}
                      <div className="pr-action-container">
                        <button 
                          onClick={() => handleCreatePR(finding.id)}
                          disabled={prStatus[finding.id] === 'loading' || prStatus[finding.id] === 'success'}
                          className={`pr-btn ${prStatus[finding.id] === 'success' ? 'pr-success' : ''}`}
                        >
                          {prStatus[finding.id] === 'loading' && <span className="pr-spinner"></span>}
                          {prStatus[finding.id] === 'loading' ? ' Committing...' : 
                           prStatus[finding.id] === 'success' ? '✅ PR #102 Created & Applied!' : 
                           '🚀 Apply Fix & Open PR'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
