import React, { useEffect, useState } from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from 'react-router-dom';

const ThemeOnboardModal = () => {
  const { setTheme } = useTheme();
  const location = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show after registration — detect via flag in sessionStorage
    const shouldShow = sessionStorage.getItem('examai-show-theme-modal');
    if (shouldShow === 'yes') {
      setShow(true);
      sessionStorage.removeItem('examai-show-theme-modal');
    }
  }, [location.pathname]);

  if (!show) return null;

  const choose = (t) => {
    setTheme(t);
    setShow(false);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-box animate-fade-up" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{
          width: 52, height: 52,
          background: 'linear-gradient(135deg, #5b5ef4, #7c3aed)',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <Sparkles size={24} color="#fff" />
        </div>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.5rem' }}>
          Welcome to ExamAI! 🎉
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 2rem', lineHeight: 1.6 }}>
          Which theme do you prefer? You can always change it later from the navbar.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <button
            onClick={() => choose('light')}
            style={{
              padding: '1.25rem 1rem',
              border: '2px solid var(--border)',
              borderRadius: 12,
              background: '#f9fafb',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem',
              transition: '0.18s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#5b5ef4'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ width: 40, height: 40, background: '#fff', borderRadius: 10, border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sun size={20} color="#f59e0b" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>Light</span>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Clean & bright</span>
          </button>
          <button
            onClick={() => choose('dark')}
            style={{
              padding: '1.25rem 1rem',
              border: '2px solid var(--border)',
              borderRadius: 12,
              background: '#111827',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem',
              transition: '0.18s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ width: 40, height: 40, background: '#1e2a45', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Moon size={20} color="#a5b4fc" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>Dark</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Easy on eyes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeOnboardModal;
