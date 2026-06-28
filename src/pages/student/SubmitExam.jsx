import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { UploadCloud, X, Loader2, ArrowLeft, Send, ImagePlus, CheckCircle2 } from 'lucide-react';

const MCQAnswerRow = ({ question, index, selected, onSelect }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
      <div style={{ width: 28, height: 28, flexShrink: 0, background: 'linear-gradient(135deg, #5b5ef4, #7c3aed)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.78rem', marginTop: 2 }}>{index + 1}</div>
      <div>
        <p style={{ margin: 0, color: 'var(--text)', fontWeight: 500, fontSize: '0.9375rem', lineHeight: 1.5 }}>{question.questionText}</p>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2, display: 'inline-block' }}>{question.maxMarks} marks</span>
      </div>
    </div>
    <div style={{ marginLeft: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {question.options?.map((opt, oi) => (
        <button key={oi} type="button" onClick={() => onSelect(index, oi)} className={`mcq-option${selected === oi ? ' selected' : ''}`}>
          <span className="mcq-letter">{String.fromCharCode(65 + oi)}</span>
          <span style={{ flex: 1, textAlign: 'left' }}>{opt}</span>
          {selected === oi && <CheckCircle2 size={16} color="var(--primary)" />}
        </button>
      ))}
    </div>
  </div>
);

const SubmitExam = () => {
  const { user } = useContext(AuthContext);
  const [images, setImages]       = useState([]);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [exam, setExam] = useState(null);
  const { id: examId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const exams = JSON.parse(localStorage.getItem('examai-exams') || '[]');
    const found = exams.find(e => e._id === examId);
    setExam(found || null);
    return () => images.forEach(img => URL.revokeObjectURL(img.preview));
  }, [examId]);

  const onDrop = useCallback((acceptedFiles) => {
    const newImgs = acceptedFiles.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setImages(prev => [...prev, ...newImgs]);
    toast.success(`${acceptedFiles.length} image(s) added`);
  }, []);

  const { getRootProps, getInputProps, isDragActive }   = useDropzone({ onDrop, accept: { 'image/*': [] } });
  const { getRootProps: getMoreProps, getInputProps: getMoreInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const hasMCQs    = exam?.questions?.some(q => q.type === 'mcq');
  const hasWritten = exam?.questions?.some(q => q.type !== 'mcq');
  const mcqQs      = exam?.questions?.filter(q => q.type === 'mcq') || [];
  const writtenQs  = exam?.questions?.filter(q => q.type !== 'mcq') || [];

  const handleSubmit = async () => {
    if (hasMCQs) {
      const mcqIndexes = exam.questions.map((q, i) => q.type === 'mcq' ? i : -1).filter(i => i >= 0);
      for (const i of mcqIndexes) {
        if (mcqAnswers[i] === undefined) { toast.error('Please answer all MCQ questions'); return; }
      }
    }
    if (hasWritten && !images.length) { toast.error('Upload at least one answer sheet'); return; }

    setIsUploading(true);
    await new Promise(r => setTimeout(r, 900));

    // Auto-grade MCQs
    const feedback = exam.questions.map((q, i) => {
      if (q.type === 'mcq') {
        const selectedIdx   = mcqAnswers[i];
        const selectedOpt   = q.options?.[selectedIdx];
        const isCorrect     = q.correctAnswers?.includes(selectedOpt);
        return {
          question: i + 1,
          type: 'mcq',
          score: isCorrect ? q.maxMarks : 0,
          maxMarks: q.maxMarks,
          isCorrect,
          selectedOption: selectedOpt || '—',
          correctOption: q.correctAnswers?.[0] || '',
        };
      } else {
        // Written — give a fake AI grade for demo
        const score = Math.floor(Math.random() * (q.maxMarks - Math.floor(q.maxMarks * 0.4) + 1)) + Math.floor(q.maxMarks * 0.4);
        return {
          question: i + 1,
          type: q.type,
          score,
          maxMarks: q.maxMarks,
          remarks: 'Good attempt. Key concepts covered with room for more detail.',
        };
      }
    });

    const totalMarks = feedback.reduce((s, f) => s + f.score, 0);

    const newSub = {
      _id: Date.now().toString(),
      examId: exam._id,
      examTitle: exam.title,
      studentId: user?.id,
      studentName: user?.name,
      status: 'Completed',
      totalMarks,
      confidence: Math.floor(Math.random() * 20) + 78,
      evaluatedByAI: true,
      feedback,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('examai-submissions') || '[]');
    localStorage.setItem('examai-submissions', JSON.stringify([...existing, newSub]));

    toast.success('Submitted & graded!');
    navigate(`/student/submission/${newSub._id}`);
    setIsUploading(false);
  };

  const canSubmit = !isUploading && (hasMCQs ? exam?.questions?.map((q,i)=>q.type==='mcq'?i:-1).filter(i=>i>=0).every(i=>mcqAnswers[i]!==undefined) : true) && (hasWritten ? images.length > 0 : true);

  if (!exam) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
      Exam not found.
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-content" style={{ maxWidth: 760 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/student/dashboard')} className="btn btn-ghost" style={{ width: 36, height: 36, padding: 0, justifyContent: 'center', flexShrink: 0 }}><ArrowLeft size={16} /></button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Submit Answers</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: 0 }}>{exam.title}</p>
          </div>
        </div>

        {hasMCQs && (
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Multiple Choice Questions</h2>
              <span className="badge badge-indigo">{mcqQs.length} Q</span>
            </div>
            {exam.questions.map((q, i) => q.type === 'mcq' && (
              <MCQAnswerRow key={i} question={q} index={i} selected={mcqAnswers[i]} onSelect={(qi, oi) => setMcqAnswers(prev => ({ ...prev, [qi]: oi }))} />
            ))}
          </div>
        )}

        {hasWritten && (
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
            {writtenQs.length > 0 && (
              <>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Written Questions <span className="badge badge-purple">{writtenQs.length} Q</span>
                </h2>
                {exam.questions.map((q, i) => q.type !== 'mcq' && (
                  <div key={i} style={{ display: 'flex', gap: '0.875rem', marginBottom: '0.875rem' }}>
                    <div style={{ width: 26, height: 26, flexShrink: 0, background: 'var(--bg-elevated)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontWeight: 700, fontSize: '0.8rem', marginTop: 2 }}>{i + 1}</div>
                    <div>
                      <p style={{ color: 'var(--text)', fontSize: '0.9375rem', margin: '0 0 0.125rem', lineHeight: 1.5 }}>{q.questionText}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{q.maxMarks} marks</span>
                    </div>
                  </div>
                ))}
                <div className="divider" style={{ margin: '1.5rem 0' }} />
              </>
            )}
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>Upload Answer Sheet(s)</p>
            <div {...getRootProps()} className={`dropzone${isDragActive ? ' active' : ''}`}>
              <input {...getInputProps()} />
              <div style={{ width: 48, height: 48, background: 'var(--bg-elevated)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
                <UploadCloud size={22} color={isDragActive ? 'var(--primary)' : 'var(--subtle)'} />
              </div>
              {isDragActive
                ? <p style={{ color: 'var(--primary)', fontWeight: 600, margin: 0 }}>Drop here…</p>
                : <><p style={{ color: 'var(--text)', fontWeight: 600, margin: '0 0 0.375rem', fontSize: '0.9375rem' }}>Drag & drop answer sheets</p><p style={{ color: 'var(--muted)', fontSize: '0.8125rem', margin: 0 }}>or click to browse</p></>}
            </div>
            {images.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.625rem' }}>{images.length} image(s) selected</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.625rem' }}>
                  {images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 9, overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '1' }}>
                      <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => setImages(p => p.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  <div {...getMoreProps()} style={{ border: '2px dashed var(--border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', aspectRatio: '1', background: 'var(--bg-elevated)' }}>
                    <input {...getMoreInputProps()} /><ImagePlus size={18} color="var(--subtle)" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <button onClick={handleSubmit} disabled={!canSubmit} className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', justifyContent: 'center', fontSize: '0.9375rem', opacity: canSubmit ? 1 : 0.5 }}>
          {isUploading ? <><Loader2 size={16} className="animate-spin" /> Submitting & Grading…</> : <><Send size={15} /> Submit Answers</>}
        </button>
      </div>
    </div>
  );
};

export default SubmitExam;
