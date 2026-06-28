import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { PlusCircle, Trash2, ArrowLeft, Save, Brain, ChevronDown, X } from 'lucide-react';

const TYPES = [
  { value: 'mcq',          label: 'MCQ'          },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'long_answer',  label: 'Long Answer'  },
];

const MCQOptionRow = ({ option, index, correct, onText, onToggleCorrect, onRemove, canRemove }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
    <button type="button" onClick={() => onToggleCorrect(index)}
      style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, border: `2px solid ${correct ? '#10b981' : 'var(--border)'}`, background: correct ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.15s' }}
      title="Mark as correct answer">
      {correct && <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 900 }}>✓</span>}
    </button>
    <span style={{ width: 20, color: 'var(--muted)', fontWeight: 700, fontSize: '0.8rem', textAlign: 'center' }}>{String.fromCharCode(65 + index)}</span>
    <input className="input" placeholder={`Option ${String.fromCharCode(65 + index)}`} value={option} onChange={e => onText(index, e.target.value)} style={{ flex: 1 }} />
    {canRemove && (
      <button type="button" onClick={() => onRemove(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 4 }}>
        <X size={14} />
      </button>
    )}
  </div>
);

const QuestionCard = ({ q, index, total, onChange, onRemove }) => {
  const addOption    = () => { if (q.options.length < 6) onChange(index, 'options', [...q.options, '']); };
  const removeOption = (oi) => { const opts = q.options.filter((_, i) => i !== oi); const correct = q.correctAnswers.filter(c => c !== oi).map(c => c > oi ? c - 1 : c); onChange(index, 'options', opts); onChange(index, 'correctAnswers', correct); };
  const toggleCorrect = (oi) => { const s = new Set(q.correctAnswers); s.has(oi) ? s.delete(oi) : s.add(oi); onChange(index, 'correctAnswers', [...s]); };
  const setOptionText = (oi, val) => { const opts = [...q.options]; opts[oi] = val; onChange(index, 'options', opts); };

  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #5b5ef4, #7c3aed)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>{index + 1}</div>
          <div style={{ position: 'relative' }}>
            <select value={q.type} onChange={e => onChange(index, 'type', e.target.value)} className="input"
              style={{ paddingRight: '2rem', appearance: 'none', paddingTop: '0.35rem', paddingBottom: '0.35rem', fontSize: '0.8rem', fontWeight: 600, width: 'auto', cursor: 'pointer' }}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>Marks:</label>
            <input type="number" min="1" value={q.maxMarks} onChange={e => onChange(index, 'maxMarks', e.target.value)} className="input" style={{ width: 62, textAlign: 'center', padding: '0.35rem 0.5rem', fontSize: '0.875rem' }} />
          </div>
          {total > 1 && (
            <button type="button" onClick={() => onRemove(index)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 7, cursor: 'pointer', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center' }}>
              <Trash2 size={13} color="#ef4444" />
            </button>
          )}
        </div>
      </div>
      <textarea className="input" placeholder={`Question ${index + 1}…`} value={q.questionText} onChange={e => onChange(index, 'questionText', e.target.value)} rows={2} style={{ marginBottom: q.type === 'mcq' ? '1rem' : 0 }} />
      {q.type === 'mcq' && (
        <div style={{ marginTop: '0.75rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.625rem' }}>Options — click ○ to mark correct answer(s)</p>
          {q.options.map((opt, oi) => (
            <MCQOptionRow key={oi} option={opt} index={oi} correct={q.correctAnswers.includes(oi)} onText={setOptionText} onToggleCorrect={toggleCorrect} onRemove={removeOption} canRemove={q.options.length > 2} />
          ))}
          {q.options.length < 6 && (
            <button type="button" onClick={addOption} style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600, padding: 0 }}>
              <PlusCircle size={13} /> Add option
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const CreateExam = () => {
  const { user } = useContext(AuthContext);
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [rubric,      setRubric]      = useState('');
  const [questions,   setQuestions]   = useState([{ questionText: '', type: 'mcq', maxMarks: 5, options: ['', '', '', ''], correctAnswers: [] }]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const addQuestion    = () => setQuestions(p => [...p, { questionText: '', type: 'mcq', maxMarks: 5, options: ['', '', '', ''], correctAnswers: [] }]);
  const removeQuestion = (i) => setQuestions(p => p.filter((_, idx) => idx !== i));
  const changeQuestion = (i, field, value) => setQuestions(p => { const u = [...p]; u[i] = { ...u[i], [field]: value }; return u; });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!rubric.trim()) { toast.error('Rubric is required'); return; }
    for (const q of questions) {
      if (!q.questionText.trim()) { toast.error('All questions must have text'); return; }
      if (q.type === 'mcq') {
        if (q.options.some(o => !o.trim())) { toast.error('Fill all MCQ options'); return; }
        if (q.correctAnswers.length === 0)   { toast.error('Mark at least one correct answer'); return; }
      }
      if (!q.maxMarks || q.maxMarks <= 0) { toast.error('Marks must be > 0'); return; }
    }

    setSaving(true);
    await new Promise(r => setTimeout(r, 700));

    const newExam = {
      _id: Date.now().toString(),
      teacherId: user?.id,
      teacherName: user?.name,
      title: title.trim(),
      description: description.trim(),
      rubric: rubric.trim(),
      status: 'Active',
      createdAt: new Date().toISOString(),
      questions: questions.map((q, i) => ({
        _id: i.toString(),
        questionText: q.questionText.trim(),
        type: q.type,
        maxMarks: Number(q.maxMarks),
        ...(q.type === 'mcq' ? {
          options: q.options,
          correctAnswers: q.correctAnswers.map(idx => q.options[idx]),
        } : {}),
      })),
    };

    const existing = JSON.parse(localStorage.getItem('examai-exams') || '[]');
    localStorage.setItem('examai-exams', JSON.stringify([...existing, newExam]));

    toast.success('Exam created!');
    navigate('/teacher/dashboard');
    setSaving(false);
  };

  const totalMarks = questions.reduce((s, q) => s + (Number(q.maxMarks) || 0), 0);

  return (
    <div className="page-wrapper">
      <div className="page-content" style={{ maxWidth: 780 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/teacher/dashboard')} className="btn btn-ghost" style={{ width: 36, height: 36, padding: 0, justifyContent: 'center', flexShrink: 0 }}><ArrowLeft size={16} /></button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Create New Exam</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: 0 }}>AI will auto-grade student submissions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={15} color="var(--primary)" /> Exam Details
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div><label className="label">Exam Title *</label><input className="input" placeholder="e.g., CS101 Midterm" value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div><label className="label">Description <span style={{ color: 'var(--subtle)', fontWeight: 400 }}>(optional)</span></label><textarea className="input" rows={2} placeholder="Short description for students…" value={description} onChange={e => setDescription(e.target.value)} /></div>
              <div><label className="label">AI Grading Rubric *</label><textarea className="input" rows={3} placeholder="Key concepts, expected answers, partial marks rules…" value={rubric} onChange={e => setRubric(e.target.value)} /></div>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.125rem' }}>Questions</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0 }}>Total: {totalMarks} marks • {questions.length} question{questions.length !== 1 ? 's' : ''}</p>
              </div>
              <button type="button" onClick={addQuestion} className="btn btn-ghost btn-sm"><PlusCircle size={13} /> Add Question</button>
            </div>
            {questions.map((q, i) => <QuestionCard key={i} q={q} index={i} total={questions.length} onChange={changeQuestion} onRemove={removeQuestion} />)}
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', justifyContent: 'center', fontSize: '0.9375rem' }}>
            {saving
              ? <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Saving…</>
              : <><Save size={16} /> Save Exam</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
