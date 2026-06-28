import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, ChevronRight, PlusSquare, Upload, Loader2, FileText, TrendingUp } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const map = {
    Pending:    'badge badge-yellow',
    Processing: 'badge badge-indigo',
    Completed:  'badge badge-green',
    Failed:     'badge badge-red',
    Active:     'badge badge-green',
    Inactive:   'badge badge-slate',
  };
  return <span className={map[status] || 'badge badge-slate'}>{status}</span>;
};

const getExams = () => {
  try { return JSON.parse(localStorage.getItem('examai-exams') || '[]'); }
  catch { return []; }
};

const getSubmissions = (userId, role) => {
  try {
    const all = JSON.parse(localStorage.getItem('examai-submissions') || '[]');
    if (role === 'Student') return all.filter(s => s.studentId === userId);
    if (role === 'Teacher') {
      const myExamIds = getExams().filter(e => e.teacherId === userId).map(e => e._id);
      return all.filter(s => myExamIds.includes(s.examId));
    }
    return all;
  } catch { return []; }
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const allExams = getExams();
      const mySubmissions = getSubmissions(user?.id, user?.role);

      // student ke liye — jo exams already submit ho chuke hain unhe hatao
      const submittedExamIds = new Set(mySubmissions.map(s => s.examId));

      const myExams = user?.role === 'Teacher'
        ? allExams.filter(e => e.teacherId === user.id)
        : allExams.filter(e => e.status === 'Active' && !submittedExamIds.has(e._id));

      setExams(myExams);
      setSubmissions(mySubmissions);
      setLoading(false);
    }, 400);
  }, [user]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={30} color="var(--primary)" className="animate-spin" />
    </div>
  );

  const isStudent = user?.role === 'Student';
  const isTeacher = user?.role === 'Teacher';
  const graded    = submissions.filter(s => s.status === 'Completed').length;
  const pending   = submissions.filter(s => s.status === 'Pending').length;
  const avgScore  = graded > 0
    ? (submissions.filter(s => s.status === 'Completed').reduce((a, s) => a + (s.totalMarks || 0), 0) / graded).toFixed(1)
    : '—';

  const stats = [
    { icon: BookOpen,    label: isStudent ? 'Available Exams' : 'My Exams', value: exams.length,  color: '#5b5ef4', bg: 'rgba(91,94,244,0.1)'  },
    { icon: CheckCircle, label: 'Graded',                                   value: graded,         color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { icon: Clock,       label: 'Pending',                                  value: pending,        color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { icon: TrendingUp,  label: 'Avg Score',                                value: avgScore,       color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-content">
        <div style={{ marginBottom: '2rem' }}>
          <p className="section-eyebrow">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.375rem', letterSpacing: '-0.02em' }}>
            Hello, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.9rem' }}>
            {isStudent ? 'View your exams and check submission results.' : 'Manage your exams and review AI-graded submissions.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(168px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {stats.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="stat-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 36, height: 36, background: bg, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color={color} />
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: submissions.length ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                {isStudent ? 'Available Exams' : 'My Exams'}
              </h2>
              {isTeacher && (
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/teacher/exam/create')}>
                  <PlusSquare size={13} /> New Exam
                </button>
              )}
            </div>
            {exams.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, background: 'var(--bg-elevated)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
                  <FileText size={22} color="var(--subtle)" />
                </div>
                <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.9rem' }}>
                  {isTeacher ? 'No exams yet. Create your first one!' : 'All exams submitted! Check your results below.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {exams.map(exam => (
                  <div key={exam._id} className="exam-row" style={{ padding: '1rem 1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <StatusBadge status={exam.status} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--subtle)' }}>{exam.questions?.length || 0} Questions</span>
                      </div>
                      <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam.title}</p>
                    </div>
                    {isStudent && (
                      <button onClick={() => navigate(`/student/exam/${exam._id}/submit`)} className="btn btn-primary btn-xs" style={{ flexShrink: 0 }}>
                        <Upload size={11} /> Submit
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {submissions.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 1rem' }}>Submissions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {submissions.slice(0, 8).map(sub => (
                  <div
                    key={sub._id}
                    onClick={() => navigate(isStudent ? `/student/submission/${sub._id}` : `/teacher/submission/${sub._id}`)}
                    className="exam-row"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.125rem', cursor: 'pointer' }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sub.examTitle || 'Exam'}
                      </p>
                      {!isStudent && sub.studentName && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0 }}>{sub.studentName}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
                      {sub.status === 'Completed' && (
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#10b981' }}>{sub.totalMarks} pts</span>
                      )}
                      <StatusBadge status={sub.status} />
                      <ChevronRight size={14} color="var(--subtle)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;