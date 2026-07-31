import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { audioEngine } from '../utils/AudioEngine';

// A component that types out text character by character
const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 15); // Fast typing effect
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
};

export function AuditLogs({ isRunning, onStepChange, onComplete }) {
  const [logs, setLogs] = useState([]);
  const terminalRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isRunning) {
      if (socketRef.current) {
          socketRef.current.disconnect();
      }
      return;
    }

    // Only clear logs on a fresh start
    setLogs([]);
    
    // Connect to WebSocket
    socketRef.current = io('http://127.0.0.1:5000');
    
    socketRef.current.on('connect', () => {
        setLogs(prev => [...prev, "ESTABLISHED SECURE WEBSOCKET LINK TO NEURAL CORE..."]);
    });

    socketRef.current.on('log', (data) => {
        setLogs(prev => [...prev, data.msg]);
        
        // Step inference from log text
        const msg = data.msg.toUpperCase();
        
        // Speak critical events
        if (msg.includes('INITIALIZING') || 
            msg.includes('DETECTED') || 
            msg.includes('REJECTED') || 
            msg.includes('ACCEPTED') || 
            msg.includes('COMPLETE')) {
            audioEngine.speak(data.msg);
        }

        if (msg.includes('SCAN COMPLETE')) onStepChange(1);
        if (msg.includes('REMEDIATION PLAN')) onStepChange(2);
        if (msg.includes('FIX PATCHES')) onStepChange(3);
        if (msg.includes('REVIEWING')) onStepChange(4);
        if (msg.includes('EVALUATING')) onStepChange(5);
        if (msg.includes('AUDIT COMPLETE')) {
            onStepChange(6);
            if (onComplete) {
                // Short delay to let the typewriter finish before ending
                setTimeout(() => onComplete(), 1000); 
            }
        }
    });

    return () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
    };
  }, [isRunning, onStepChange, onComplete]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="crt-console"
    >
      <div className="console-header">
        <span>sys_terminal@codexguard ~ /bin/bash (LIVE FEED)</span>
      </div>
      <div className="console-body" ref={terminalRef}>
        <AnimatePresence>
          {logs.map((log, i) => (
            <div key={i} className="console-line">
              <span className="prompt">root#</span>
              <TypewriterText text={log} />
            </div>
          ))}
        </AnimatePresence>
        {isRunning && (
          <div className="console-line">
            <span className="prompt">root#</span>
            <span className="cursor"></span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
