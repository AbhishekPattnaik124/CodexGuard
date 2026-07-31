import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShieldAlert } from 'lucide-react'
import './App.css'
import logoUrl from './assets/logo.png'

import { AuditLogs } from './components/AuditLogs'
import { PipelineStepper } from './components/PipelineStepper'
import { FindingsList } from './components/FindingsList'
import { ExploitModal, AuditCertificateModal } from './components/Modals'
import { ThreatMap } from './components/ThreatMap'
import { audioEngine } from './utils/AudioEngine'

const PRESETS = [
  { label: "Payment Gateway (SQLi)", url: "https://github.com/enterprise/payment-gateway" },
  { label: "Auth Microservice (Secrets)", url: "https://github.com/enterprise/auth-service" },
  { label: "Cloud Backend (RCE)", url: "https://github.com/enterprise/k8s-cloud-backend" }
]

function App() {
  const [repoUrl, setRepoUrl] = useState('')
  const [scanStatus, setScanStatus] = useState('idle') // idle, scanning, complete, error
  const [activeStep, setActiveStep] = useState(0)
  const [findings, setFindings] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [exploitFinding, setExploitFinding] = useState(null)
  const [prStatus, setPrStatus] = useState({})
  const [showCert, setShowCert] = useState(false)

  const handleScan = async (e, forceUrl = null) => {
    e?.preventDefault()
    const targetUrl = forceUrl || repoUrl
    if (!targetUrl) return

    setRepoUrl(targetUrl)
    setScanStatus('scanning')
    setActiveStep(1)
    setShowResults(false)
    setFindings([])
    setPrStatus({})
    audioEngine.enable()

    try {
      const response = await fetch('http://127.0.0.1:5000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: targetUrl }),
      })
      const data = await response.json()
      if (response.ok) {
        setFindings(data.findings)
      } else {
        setScanStatus('error')
        alert("API Error: " + (data.error || "Unknown"))
      }
    } catch (err) {
      setScanStatus('error')
      console.error(err)
      alert("Failed to connect to backend scanner.")
    }
  }

  const handleTerminalComplete = useCallback(() => {
    setScanStatus('complete')
    setActiveStep(6)
    setShowResults(true)
  }, [])

  const handleApplyFix = async (finding) => {
    setPrStatus(prev => ({ ...prev, [finding.id]: 'loading' }))
    try {
      const response = await fetch('http://127.0.0.1:5000/api/apply-patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          finding_id: finding.id, 
          target_snippet: finding.target_snippet, 
          replacement_snippet: finding.replacement_snippet, 
          file: finding.file 
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to apply patch')
      
      setPrStatus(prev => ({ ...prev, [finding.id]: 'success' }))
    } catch (err) {
      alert("Error: " + err.message)
      setPrStatus(prev => ({ ...prev, [finding.id]: 'error' }))
    }
  }

  return (
    <div className="app-container">
      <div className="cyber-grid"></div>
      <div className="ambient-glow"></div>
      <div className="scanlines"></div>
      
      <AnimatePresence>
        {exploitFinding && (
          <ExploitModal 
            finding={exploitFinding} 
            onClose={() => setExploitFinding(null)} 
          />
        )}
        {showCert && (
          <AuditCertificateModal
            repoUrl={repoUrl}
            onClose={() => setShowCert(false)}
          />
        )}
      </AnimatePresence>

      <aside className="sidebar">
        <div className="brand">
          <img src={logoUrl} alt="Logo" />
          <h1>CodexGuard</h1>
        </div>
        
        <div className="nav-section">
          <h3>Demo Presets</h3>
          {PRESETS.map((p, idx) => (
            <button 
              key={idx} 
              className="preset-btn"
              onClick={(e) => handleScan(e, p.url)}
              disabled={scanStatus === 'scanning'}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          CodexGuard Enterprise v3.0<br/>
          Secure Software Development
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <h2 className="header-title">Security Audit Target</h2>
          <form onSubmit={handleScan} className="scan-form">
            <div className="input-group">
              <Search className="input-icon" size={18} />
              <input 
                type="text" 
                placeholder="e.g. https://github.com/org/repo" 
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="repo-input"
              />
            </div>
            <button 
              type="submit" 
              disabled={scanStatus === 'scanning'} 
              className="btn-primary"
            >
              {scanStatus === 'scanning' ? (
                <><span className="spinner"></span> Auditing...</>
              ) : 'Run Security Audit'}
            </button>
          </form>
        </header>

        {scanStatus === 'idle' ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="empty-state"
          >
            <ShieldAlert size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Enter a repository URL to begin the security audit.</p>
          </motion.div>
        ) : (
          <div className="dashboard-view">
            {(scanStatus === 'scanning' || showResults) && (
              <>
                <PipelineStepper activeStep={activeStep} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', height: '400px', marginBottom: '2rem' }}>
                    <ThreatMap isRunning={scanStatus === 'scanning' || showResults} />
                    <AuditLogs 
                      isRunning={scanStatus === 'scanning'} 
                      onStepChange={setActiveStep}
                      onComplete={handleTerminalComplete}
                    />
                </div>
              </>
            )}

            {showResults && findings.length > 0 && (
              <FindingsList 
                findings={findings}
                prStatus={prStatus}
                onSimulateExploit={setExploitFinding}
                onApplyFix={handleApplyFix}
                onGenerateReport={() => setShowCert(true)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
