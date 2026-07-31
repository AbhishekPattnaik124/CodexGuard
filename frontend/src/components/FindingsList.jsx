import { motion } from 'framer-motion';
import { AlertTriangle, Play, Wrench } from 'lucide-react';

export function FindingsList({ findings, prStatus, onSimulateExploit, onApplyFix, onGenerateReport }) {
  const renderDiff = (target, replacement) => {
    if (!target && !replacement) return null;
    return (
      <div className="diff-container">
        {target && (
          <div className="diff-block diff-remove">
            <div className="diff-header">Current (Vulnerable)</div>
            <pre><code>{target}</code></pre>
          </div>
        )}
        {replacement && (
          <div className="diff-block diff-add">
            <div className="diff-header">Proposed (Secure)</div>
            <pre><code>{replacement}</code></pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="findings-section"
    >
      <div className="findings-header">
        <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle color="var(--danger-color)" /> Audit Findings ({findings.length})
        </h3>
        <button className="btn-secondary" onClick={onGenerateReport}>
          Generate Report
        </button>
      </div>

      <div className="findings-list">
        {findings.map((finding, idx) => (
          <motion.div 
            key={finding.id} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="finding-card"
            whileHover={{ scale: 1.01, borderColor: 'var(--primary-color)' }}
          >
            <div className="finding-header">
              <div>
                <h4 className="finding-title">{finding.type}</h4>
                <div className="finding-meta">
                  <span>File: {finding.file} (Line {finding.line_range})</span>
                  <span className="badge badge-critical">{finding.severity}</span>
                </div>
              </div>
              <span style={{color: 'var(--success-color)', fontWeight: '600', fontSize: '0.875rem'}}>
                {finding.confidence}% Match
              </span>
            </div>
            
            <div className="finding-body">
              <p>{finding.explanation}</p>
              
              <div className="diff-viewer">
                {renderDiff(finding.target_snippet, finding.replacement_snippet)}
              </div>

              <div style={{background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '6px', marginTop: '1rem'}}>
                <p style={{margin: '0 0 0.5rem 0', fontWeight: '500', color: 'var(--text-main)', fontSize: '0.85rem'}}>Reviewer Notes:</p>
                <p style={{margin: 0, fontSize: '0.85rem'}}>{finding.review_notes}</p>
              </div>
            </div>

            <div className="finding-actions">
              <button 
                className="btn-secondary"
                onClick={() => onSimulateExploit(finding)}
              >
                <Play size={14} style={{ marginRight: '0.5rem' }} /> Simulate Exploit
              </button>
              <button 
                className={`btn-primary ${prStatus[finding.id] === 'success' ? 'btn-success' : ''}`}
                onClick={() => onApplyFix(finding)}
                disabled={prStatus[finding.id] === 'loading' || prStatus[finding.id] === 'success'}
              >
                {prStatus[finding.id] === 'loading' ? (
                  <><span className="spinner"></span> Applying Patch...</>
                ) : prStatus[finding.id] === 'success' ? (
                  '✓ Fix Applied Locally'
                ) : (
                  <><Wrench size={14} style={{ marginRight: '0.5rem' }} /> Apply Remediation</>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
