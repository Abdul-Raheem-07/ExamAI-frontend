import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Brain, LogOut, LayoutDashboard, PlusSquare, ShieldCheck, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [];
  if (user.role === 'Student')      links.push({ label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' });
  else if (user.role === 'Teacher') {
    links.push({ label: 'Dashboard', icon: LayoutDashboard, path: '/teacher/dashboard' });
    links.push({ label: 'New Exam',  icon: PlusSquare,      path: '/teacher/exam/create' });
  } else if (user.role === 'Admin') links.push({ label: 'Admin',     icon: ShieldCheck,    path: '/admin/dashboard'   });

  return (
    <nav className="nav-bar">
      <div style={{ maxWidth: 1180, margin: '0 auto', width: '100%', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Logo */}
        <button
          onClick={() => navigate(links[0]?.path || '/')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, #5b5ef4, #7c3aed)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={17} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>ExamAI</span>
        </button>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
          {links.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.45rem 0.875rem',
                  borderRadius: 8, border: 'none', fontFamily: 'inherit',
                  background: active ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(91,94,244,0.1)') : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--muted)',
                  fontSize: '0.85rem', fontWeight: active ? 600 : 500,
                  cursor: 'pointer', transition: '0.15s',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text)'; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}}
              >
                <Icon size={15} /> {label}
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            style={{
              width: 34, height: 34, borderRadius: 9,
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: '0.15s', color: 'var(--muted)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Avatar */}
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #5b5ef4, #7c3aed)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.8125rem',
            flexShrink: 0,
          }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>

          {/* Logout */}
          <button onClick={handleLogout} className="btn btn-danger-ghost btn-sm">
            <LogOut size={13} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
