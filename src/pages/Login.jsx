import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Brain, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) return;
    setLoading(true);
    try {
      const user = await login(trimmedEmail, password);
      if (!user?.role) return;
      switch (user.role) {
        case 'Student': navigate('/student/dashboard'); break;
        case 'Teacher': navigate('/teacher/dashboard'); break;
        case 'Admin':   navigate('/admin/dashboard');   break;
        default:        navigate('/');
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle bg accent */}
      <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(91,94,244,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeInUp 0.35s ease both' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #5b5ef4, #7c3aed)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(91,94,244,0.3)' }}>
            <Brain size={25} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.03em' }}>Welcome back</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: '0.875rem' }}>Sign in to continue to ExamAI</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {/* Email */}
            <div>
              <label className="label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)', pointerEvents: 'none' }} />
                <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@example.com" style={{ paddingLeft: '2.4rem' }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="label" style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Forgot?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)', pointerEvents: 'none' }} />
                <input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="••••••••" style={{ paddingLeft: '2.4rem', paddingRight: '2.7rem' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--subtle)', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: 4, justifyContent: 'center', width: '100%', padding: '0.8rem' }}>
              {loading ? <Loader2 size={17} className="animate-spin" /> : <> Sign In <ArrowRight size={15} /> </>}
            </button>
          </form>

          <div className="divider" style={{ margin: '1.5rem 0' }} />
          <p style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--muted)', margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
