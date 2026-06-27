import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Brain, Mail, Lock, User, ChevronDown, ArrowRight, Loader2, Eye, EyeOff, GraduationCap, BookOpenCheck } from 'lucide-react';

const RoleCard = ({ value, selected, onSelect, icon: Icon, title, desc }) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    style={{
      flex: 1, padding: '1rem 0.75rem',
      border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: 12,
      background: selected ? (document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(99,102,241,0.12)' : 'rgba(91,94,244,0.06)') : 'var(--bg-elevated)',
      cursor: 'pointer', transition: '0.15s',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
      fontFamily: 'inherit',
    }}
  >
    <div style={{ width: 38, height: 38, borderRadius: 10, background: selected ? 'linear-gradient(135deg, #5b5ef4, #7c3aed)' : 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} color={selected ? '#fff' : 'var(--muted)'} />
    </div>
    <div>
      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>{title}</p>
      <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>{desc}</p>
    </div>
  </button>
);

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('Student');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !password) return;
    if (password !== confirmPassword) { alert('Passwords do not match'); return; }
    setLoading(true);
    try {
      const user = await register(trimmedName, trimmedEmail, password, role);
      // Trigger theme onboard modal
      sessionStorage.setItem('examai-show-theme-modal', 'yes');
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
      <div style={{ position: 'absolute', top: '5%', right: '10%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 460, animation: 'fadeInUp 0.35s ease both' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #5b5ef4, #7c3aed)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(91,94,244,0.3)' }}>
            <Brain size={25} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.03em' }}>Create account</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: '0.875rem' }}>Join ExamAI and get started</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* Role selector */}
            <div>
              <label className="label">I am a…</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <RoleCard value="Student" selected={role === 'Student'} onSelect={setRole} icon={GraduationCap} title="Student" desc="Submit answers" />
                <RoleCard value="Teacher" selected={role === 'Teacher'} onSelect={setRole} icon={BookOpenCheck} title="Teacher" desc="Create exams" />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)', pointerEvents: 'none' }} />
                <input type="text" required autoComplete="name" value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Your full name" style={{ paddingLeft: '2.4rem' }} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)', pointerEvents: 'none' }} />
                <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@example.com" style={{ paddingLeft: '2.4rem' }} />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)', pointerEvents: 'none' }} />
                  <input type={showPassword ? 'text' : 'password'} required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="Password" style={{ paddingLeft: '2.4rem', paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--subtle)', display: 'flex', alignItems: 'center' }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)', pointerEvents: 'none' }} />
                  <input type={showConfirmPassword ? 'text' : 'password'} required autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input" placeholder="Confirm" style={{ paddingLeft: '2.4rem', paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--subtle)', display: 'flex', alignItems: 'center' }}>
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: 4, justifyContent: 'center', width: '100%', padding: '0.8rem' }}>
              {loading ? <Loader2 size={17} className="animate-spin" /> : <> Create Account <ArrowRight size={15} /> </>}
            </button>
          </form>

          <div className="divider" style={{ margin: '1.5rem 0' }} />
          <p style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--muted)', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
