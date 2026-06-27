import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthProvider';
import { useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateExam from './pages/teacher/CreateExam';
import SubmitExam from './pages/student/SubmitExam';
import EvaluationResult from './pages/teacher/EvaluationResult';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import WakeUpOverlay from './components/WakeUpOverlay';
import Navbar from './components/Navbar';
import ThemeOnboardModal from './components/ThemeOnboardModal';

const AppRoutes = () => {
  const location = useLocation();
  return (
    <Routes location={location}>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
        <Route path="/student/dashboard" element={<Dashboard />} />
        <Route path="/student/exam/:id/submit" element={<SubmitExam />} />
        <Route path="/student/submission/:id" element={<EvaluationResult />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Teacher', 'Admin']} />}>
        <Route path="/teacher/dashboard" element={<Dashboard />} />
        <Route path="/teacher/exam/create" element={<CreateExam />} />
        <Route path="/teacher/submission/:id" element={<EvaluationResult />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
};

function ToasterWrapper() {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: isDark ? '#1e2a45' : '#fff',
          color: isDark ? '#f1f5f9' : '#111827',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          borderRadius: 12,
          fontSize: '0.85rem',
          padding: '10px 14px',
          boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)',
        },
        success: { iconTheme: { primary: '#10b981', secondary: isDark ? '#1e2a45' : '#fff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: isDark ? '#1e2a45' : '#fff' } },
      }}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <ToasterWrapper />
      <WakeUpOverlay>
        <Navbar />
        <ThemeOnboardModal />
        <AppRoutes />
      </WakeUpOverlay>
    </AuthProvider>
  );
}

export default App;
