import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Users, FileText, CheckSquare, TrendingUp, AlertCircle, GraduationCap, BookOpenCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isDark } = useTheme();

  useEffect(() => {
    axios.get('/admin/dashboard')
      .then(r => setMetrics(r.data.metrics))
      .catch(err => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
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

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={30} color="var(--primary)" className="animate-spin" />
    </div>
  );
  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, background: 'rgba(239,68,68,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AlertCircle size={22} color="#ef4444" />
      </div>
      <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
      <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );
  if (!metrics) return null;

  const stats = [
    { icon: Users,       label: 'Total Users',  value: metrics.totalUsers  || 0, color: '#5b5ef4', bg: 'rgba(91,94,244,0.1)' },
    { icon: FileText,    label: 'Total Exams',  value: metrics.totalExams  || 0, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
    { icon: CheckSquare, label: 'Submissions',  value: metrics.totalSubmissions || 0, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { icon: TrendingUp,  label: 'Avg Score',    value: Number(metrics.averageScore || 0).toFixed(1), color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ];

  const roleData = [
    { name: 'Students', value: metrics.totalStudents || 0 },
    { name: 'Teachers', value: metrics.totalTeachers || 0 },
  ];
  const subData = [
    { name: 'AI Graded', value: metrics.evaluatedSubmissions || 0 },
    { name: 'Pending',   value: Math.max(0, (metrics.totalSubmissions || 0) - (metrics.evaluatedSubmissions || 0)) },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-content">
        <div style={{ marginBottom: '2rem' }}>
          <p className="section-eyebrow">System Overview</p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
        </div>

        {/* Stats */}
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

        {/* Role breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, background: 'rgba(91,94,244,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                  <GraduationCap size={21} color="#5b5ef4" />
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', margin: 0, lineHeight: 1 }}>{metrics.totalStudents || 0}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '0.25rem 0 0', fontWeight: 500 }}>Students</p>
              </div>
              <div style={{ width: 1, background: 'var(--border)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, background: 'rgba(124,58,237,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                  <BookOpenCheck size={21} color="#7c3aed" />
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', margin: 0, lineHeight: 1 }}>{metrics.totalTeachers || 0}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '0.25rem 0 0', fontWeight: 500 }}>Teachers</p>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem', fontWeight: 600 }}>AI Success Rate</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 0.5rem' }}>{metrics.aiSuccessRate || 0}%</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${metrics.aiSuccessRate || 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {[
            { title: 'User Distribution', sub: 'Students vs Teachers', data: roleData, colors: ['#5b5ef4', '#7c3aed'] },
            { title: 'Submission Status',  sub: `AI Success Rate: ${metrics.aiSuccessRate || 0}%`, data: subData, colors: ['#10b981', '#f59e0b'] },
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
