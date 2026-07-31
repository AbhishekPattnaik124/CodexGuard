import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, ShieldCheck, Download } from 'lucide-react';

export function ExploitModal({ finding, onClose }) {
  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="modal-content"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Terminal size={24} /> Simulated Exploit Proof
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        
        <div style={{ padding: '1rem', background: '#000', borderRadius: '6px', fontFamily: 'monospace', color: '#10b981', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
          <p>$ python3 exploit.py --target {finding.file}</p>
          <p>[*] Initiating attack vector for {finding.type}...</p>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 1 }}
          >
            [+] Exploit successful! System compromised.
          </motion.p>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          This confirms the vulnerability is actively exploitable in a simulated environment.
        </p>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </div>
  )
}

export function AuditCertificateModal({ repoUrl, onClose }) {
  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="modal-content certificate-modal"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Audit Certificate</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Target: {repoUrl}</p>
        <div style={{ margin: '2rem 0', padding: '1.5rem', border: '1px solid var(--success-color)', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.05)', textAlign: 'center' }}>
          <ShieldCheck size={48} color="var(--success-color)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--success-color)', margin: '0 0 1rem 0' }}>VERIFIED SECURE</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>All critical findings have been remediated and verified by the autonomous swarm.</p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}><Download size={16} style={{ marginRight: '0.5rem' }} /> Download PDF</button>
          <button className="btn-primary" style={{ marginLeft: '1rem' }} onClick={onClose}>Done</button>
        </div>
      </motion.div>
    </div>
  )
}
