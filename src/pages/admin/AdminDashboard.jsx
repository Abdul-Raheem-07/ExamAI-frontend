import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckSquare, TrendingUp, GraduationCap, BookOpenCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const users       = JSON.parse(localStorage.getItem('examai-users') || '[]');
    const exams       = JSON.parse(localStorage.getItem('examai-exams') || '[]');
    const submissions = JSON.parse(localStorage.getItem('examai-submissions') || '[]');

    const students    = users.filter(u => u.role === 'Student');
    const teachers    = users.filter(u => u.role === 'Teacher');
    const completed   = submissions.filter(s => s.status === 'Completed');
    const avgScore    = completed.length > 0
      ? (completed.reduce((a, s) => a + (s.totalMarks || 0), 0) / completed.length).toFixed(1)
      : 0;
    const aiSuccess   = submissions.length > 0
      ? Math.round((completed.filter(s => s.evaluatedByAI).length / submissions.length) * 100)
      : 0;

    setMetrics({
      totalUsers: users.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalExams: exams.length,
      totalSubmissions: submissions.length,
      evaluatedSubmissions: completed.length,
      averageScore: avgScore,
      aiSuccessRate: aiSuccess,
    });
  }, []);

  const TooltipContent = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.625rem 1rem', fontSize: '0.8125rem', color: 'var(--text)' }}>
        <p style={{ margin: '0 0 0.25rem', fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, color: 'var(--primary)', fontWeight: 700 }}>{payload[0].value}</p>
      </div>
    );
  };

  if (!metrics) return null;

  const stats = [
    { icon: Users,       label: 'Total Users',  value: metrics.totalUsers,       color: '#5b5ef4', bg: 'rgba(91,94,244,0.1)'  },
    { icon: FileText,    label: 'Total Exams',  value: metrics.totalExams,        color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
    { icon: CheckSquare, label: 'Submissions',  value: metrics.totalSubmissions,  color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { icon: TrendingUp,  label: 'Avg Score',    value: metrics.averageScore,      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ];

  const roleData = [{ name: 'Students', value: metrics.totalStudents }, { name: 'Teachers', value: metrics.totalTeachers }];
  const subData  = [{ name: 'Graded',   value: metrics.evaluatedSubmissions }, { name: 'Pending', value: Math.max(0, metrics.totalSubmissions - metrics.evaluatedSubmissions) }];

  return (
    <div className="page-wrapper">
      <div className="page-content">
        <div style={{ marginBottom: '2rem' }}>
          <p className="section-eyebrow">System Overview</p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {stats.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="stat-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 42, height: 42, background: bg, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={19} color={color} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.25rem' }}>{label}</p>
                <p style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[{ icon: GraduationCap, label: 'Students', value: metrics.totalStudents, color: '#5b5ef4', bg: 'rgba(91,94,244,0.1)' },
              { icon: BookOpenCheck, label: 'Teachers',  value: metrics.totalTeachers,  color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' }].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <div style={{ width: 1, background: 'var(--border)' }} />}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 44, height: 44, background: item.bg, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                    <item.icon size={20} color={item.color} />
                  </div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', margin: 0, lineHeight: 1 }}>{item.value}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '0.25rem 0 0', fontWeight: 500 }}>{item.label}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem', fontWeight: 600 }}>AI Success Rate</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 0.5rem' }}>{metrics.aiSuccessRate}%</p>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${metrics.aiSuccessRate}%` }} /></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {[
            { title: 'User Distribution',  sub: 'Students vs Teachers',          data: roleData, colors: ['#5b5ef4', '#7c3aed'] },
            { title: 'Submission Status',   sub: `Graded vs Pending`,             data: subData,  colors: ['#10b981', '#f59e0b'] },
          ].map(({ title, sub, data, colors }) => (
            <div key={title} className="card" style={{ padding: '1.75rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.25rem' }}>{title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', margin: 0 }}>{sub}</p>
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                    <Tooltip content={<TooltipContent />} cursor={{ fill: 'var(--bg-elevated)' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={44}>
                      {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
