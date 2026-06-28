import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContext.js';

const DEFAULT_USERS = [
  { id: '1', name: 'Ali Student', email: 'student@demo.com', password: '123456', role: 'Student', token: 'fake-student-token' },
  { id: '2', name: 'Sir Ahmad',   email: 'teacher@demo.com', password: '123456', role: 'Teacher', token: 'fake-teacher-token' },
  { id: '3', name: 'Admin User',  email: 'admin@demo.com',   password: '123456', role: 'Admin',   token: 'fake-admin-token'   },
];

if (!localStorage.getItem('examai-users')) {
  localStorage.setItem('examai-users', JSON.stringify(DEFAULT_USERS));
}

const getUsers = () => {
  try { return JSON.parse(localStorage.getItem('examai-users') || '[]'); }
  catch { return DEFAULT_USERS; }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); }
      catch { localStorage.removeItem('user'); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    await new Promise(r => setTimeout(r, 700));
    const users = getUsers();
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      toast.error('Invalid email or password');
      throw new Error('Invalid credentials');
    }
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    localStorage.setItem('user', JSON.stringify(safeUser));
    toast.success('Logged in successfully!');
    return safeUser;
  };

  const register = async (name, email, password, role) => {
    await new Promise(r => setTimeout(r, 700));
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast.error('Email already registered');
      throw new Error('Email taken');
    }
    const newUser = {
      id: Date.now().toString(),
      name, email, password, role,
      token: 'fake-token-' + Date.now(),
    };
    localStorage.setItem('examai-users', JSON.stringify([...users, newUser]));
    const { password: _, ...safeUser } = newUser;
    setUser(safeUser);
    localStorage.setItem('user', JSON.stringify(safeUser));
    sessionStorage.setItem('examai-show-theme-modal', 'yes');
    toast.success('Account created!');
    return safeUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};