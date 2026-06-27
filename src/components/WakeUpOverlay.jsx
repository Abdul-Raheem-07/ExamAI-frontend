import React, { useEffect, useState } from 'react';
import { Brain, Loader2 } from 'lucide-react';

const BACKEND = import.meta.env.VITE_API_URL;

const WakeUpOverlay = ({ children }) => {
  const [status, setStatus] = useState('idle'); // idle | waking | ready | error
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!BACKEND) { setStatus('ready'); return; }

    setStatus('waking');
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);

    const ping = async () => {
      try {
        await fetch(`${BACKEND}/health`, { signal: AbortSignal.timeout(25000) });
        clearInterval(t);
        setStatus('ready');
      } catch {
        clearInterval(t);
        setStatus('error');
      }
    };
    ping();
    return () => clearInterval(t);
  }, []);

  if (status === 'ready' || status === 'idle') return children;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem' }}>
      <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #5b5ef4, #7c3aed)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(91,94,244,0.3)' }}>
        <Brain size={28} color="#fff" />
      </div>
      {status === 'waking' && (
        <>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', textAlign: 'center', margin: '0 0 0.5rem' }}>Starting up ExamAI{dots}</h2>
            <p style={{ color: 'var(--muted)', textAlign: 'center', fontSize: '0.875rem', margin: 0 }}>Server is waking up from sleep. Usually takes ~30 seconds.</p>
          </div>
          <Loader2 size={22} color="var(--primary)" className="animate-spin" />
        </>
      )}
      {status === 'error' && (
        <>
          <p style={{ color: 'var(--text)', fontWeight: 600, textAlign: 'center', margin: 0 }}>Could not reach the server.</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary btn-sm">Retry</button>
        </>
      )}
    </div>
  );
};

export default WakeUpOverlay;
