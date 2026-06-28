import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Brain, Clock, CheckCircle, AlertCircle, CheckCircle2, XCircle, Edit3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const StatusBadge = ({ status }) => {
  const map = {
    Pending:   { cls: 'badge badge-yellow', icon: <Clock size={10} /> },
    Completed: { cls: 'badge badge-green',  icon: <CheckCircle size={10} /> },
    Failed:    { cls: 'badge badge-red',    icon: <AlertCircle size={10} /> },
  };
  const s = map[status] || map.Pending;
  return <span className={s.cls}>{s.icon} {status}</span>;
};

const EvaluationResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [submission, setSubmission] = useState(null);
  const [showOverride, setShowOverride] = useState(false);
  const [newScore, setNewScore] = useState('');
  const [justification, setJustification] = useState('');

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('examai-submissions') || '[]');
    const found = all.find(s => s._id === id);
    setSubmission(found || null);
  }, [id]);

  const handleOverride = (e) => {
    e.preventDefault();
    const all = JSON.parse(localStorage.getItem('examai-submissions') || '[]');
    const updated = all.map(s => s._id === id
      ? { ...s, totalMarks: Number(newScore), evaluatedByAI: false, overrideJustification: justification }
      : s
    );
    localStorage.setItem('examai-submissions', JSON.stringify(updated));
    setSubmission(prev => ({ ...prev, totalMarks: Number(newScore), evaluatedByAI: false, overrideJustification: justification }));
    toast.success('Marks updated');
    setShowOverride(false);
  };

  const backPath = user?.role === 'Student' ? '/student/dashboard' : '/teacher/dashboard';

  if (!submission) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
      Submission not found.
    </div>
  );

  const confidence  = submission.confidence || 0;
  const confData    = [{ name: 'Confidence', value: confidence }, { name: 'Rest', value: 100 - confidence }];
  const maxPossible = submission.feedback?.reduce((s, f) => s + (f.maxMarks || 0), 0) || 0;
  const percentage  = maxPossible > 0 ? Math.round((submission.totalMarks / maxPossible) * 100) : 0;

  return (
    <div className="page-wrapper">
      <div className="page-content">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate(backPath)} className="btn btn-ghost" style={{ width: 36, height: 36, padding: 0, justifyContent: 'center', flexShrink: 0 }}><ArrowLeft size={16} /></button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              {user?.role === 'Teacher' ? 'AI Evaluation Result' : 'My Result'}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.8125rem', margin: 0 }}>{submission.examTitle} · <span style={{ fontFamily: 'monospace' }}>#{id?.slice(-6)}</span></p>
          </div>
          <StatusBadge status={submission.status} />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
            <p className="section-eyebrow" style={{ marginBottom: '0.75rem' }}>Total Score</p>
            <p style={{ fontSize: '3.25rem', fontWeight: 900, margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }} className="gradient-text">{submission.totalMarks ?? 0}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', margin: '0.5rem 0 0' }}>{maxPossible > 0 ? `out of ${maxPossible} pts (${percentage}%)` : 'points'}</p>
            <div className="progress-bar" style={{ marginTop: '0.875rem' }}><div className="progress-fill" style={{ width: `${percentage}%` }} /></div>
          </div>

          <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
            <p className="section-eyebrow" style={{ marginBottom: '0.5rem' }}>AI Confidence</p>
            <div style={{ height: 100, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={confData} cx="50%" cy="50%" innerRadius={30} outerRadius={44} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                    <Cell fill="#5b5ef4" /><Cell fill="var(--bg-elevated)" />
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.125rem' }}>{confidence}%</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <p className="section-eyebrow" style={{ marginBottom: '1rem' }}>Details</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Brain size={13} /> AI Graded</span>
                <span className={submission.evaluatedByAI ? 'badge badge-green' : 'badge badge-slate'}>{submission.evaluatedByAI ? 'Yes' : 'No'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Clock size={13} /> Date</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-2)', fontWeight: 500 }}>{new Date(submission.updatedAt).toLocaleDateString()}</span>
              </div>
              {submission.studentName && user?.role === 'Teacher' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>Student</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-2)', fontWeight: 600 }}>{submission.studentName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Question-wise Breakdown</h2>
            {user?.role === 'Teacher' && (
              <button onClick={() => { setNewScore(submission.totalMarks); setShowOverride(true); }} className="btn btn-ghost btn-sm">
                <Edit3 size={13} /> Override Marks
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {submission.feedback?.map((fb, i) => {
              const isMCQ   = fb.type === 'mcq';
              const correct = isMCQ && fb.isCorrect;
              return (
                <div key={i} style={{ padding: '1.25rem', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 44 }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', margin: '0 0 0.25rem', letterSpacing: '0.08em' }}>Q</p>
                    <p style={{ fontSize: '1.625rem', fontWeight: 900, color: 'var(--text)', margin: 0, lineHeight: 1 }}>{fb.question}</p>
                  </div>
                  <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch', flexShrink: 0 }} />
                  <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 44 }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', margin: '0 0 0.25rem', letterSpacing: '0.08em' }}>Score</p>
                    <p style={{ fontSize: '1.625rem', fontWeight: 900, color: '#10b981', margin: 0, lineHeight: 1 }}>{fb.score}</p>
                    {fb.maxMarks && <p style={{ fontSize: '0.68rem', color: 'var(--muted)', margin: '0.125rem 0 0' }}>/{fb.maxMarks}</p>}
                  </div>
                  <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    {isMCQ ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          {correct ? <CheckCircle2 size={15} color="#10b981" /> : <XCircle size={15} color="#ef4444" />}
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: correct ? '#10b981' : '#ef4444' }}>{correct ? 'Correct' : 'Incorrect'}</span>
                          <span className="badge badge-indigo" style={{ marginLeft: 'auto' }}>MCQ</span>
                        </div>
                        {fb.selectedOption && <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0 0 0.25rem' }}>Your answer: <strong style={{ color: 'var(--text-2)' }}>{fb.selectedOption}</strong></p>}
                        {!correct && fb.correctOption && <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>Correct answer: <strong style={{ color: '#10b981' }}>{fb.correctOption}</strong></p>}
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.5rem' }}>AI Remarks</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>{fb.remarks}</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showOverride && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 1.5rem' }}>Override Marks</h3>
            <form onSubmit={handleOverride} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label className="label">New Total Score</label><input type="number" required value={newScore} onChange={e => setNewScore(e.target.value)} className="input" /></div>
              <div><label className="label">Reason</label><textarea required rows={3} value={justification} onChange={e => setJustification(e.target.value)} className="input" placeholder="Why are you adjusting the marks?" style={{ resize: 'vertical' }} /></div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowOverride(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationResult;
