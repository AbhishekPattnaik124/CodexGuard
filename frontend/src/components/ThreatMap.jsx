import { useEffect, useRef, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { io } from 'socket.io-client';

export function ThreatMap({ isRunning }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isRunning) {
        setGraphData({ nodes: [], links: [] });
        return;
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://codexguard-backend.onrender.com';
    socketRef.current = io(API_BASE_URL);

    
    socketRef.current.on('repo_map', (data) => {
        setGraphData(data);
    });

    return () => {
        if (socketRef.current) socketRef.current.disconnect();
    };
  }, [isRunning]);

  const paintRing = useCallback((node, ctx) => {
    // Add a glowing effect for files, making root and dirs different
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.val * 2 + 2, 0, 2 * Math.PI, false);
    
    if (node.group === 'root') {
        ctx.fillStyle = 'rgba(0, 243, 255, 0.2)';
        ctx.strokeStyle = '#00f3ff';
    } else if (node.group === 'dir') {
        ctx.fillStyle = 'rgba(255, 0, 234, 0.2)';
        ctx.strokeStyle = '#ff00ea';
    } else {
        // Files
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    }

    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();
  }, []);

  if (graphData.nodes.length === 0) {
      return (
          <div className="empty-state">
              <div className="spinner" style={{ borderColor: 'transparent', borderTopColor: '#ff00ea', borderRightColor: '#ff00ea' }}></div>
              <p>AWAITING REPOSITORY UPLINK...</p>
          </div>
      );
  }

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,243,255,0.2)' }}>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="id"
        nodeCanvasObject={paintRing}
        linkColor={() => 'rgba(0, 243, 255, 0.1)'}
        backgroundColor="rgba(2, 2, 5, 0.8)"
        width={750}
        height={400}
      />
    </div>
  );
}
