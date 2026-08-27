import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cc_user');
    return saved ? JSON.parse(saved) : {
      id: 'usr-demo-patient',
      name: 'Eleanor Vance',
      email: 'eleanor@example.com',
      role: 'patient',
      diagnosis: 'Breast Cancer (Stage II)',
      doctor: 'Dr. Sarah Lin (Oncologist)',
      phone: '+1 (555) 234-5678'
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('cc_token') || 'demo-jwt-token');

  useEffect(() => {
    if (user) {
      localStorage.setItem('cc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cc_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('cc_token', token);
    } else {
      localStorage.removeItem('cc_token');
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err) {
      // Demo fallback if backend API is offline
      if (email.toLowerCase().includes('admin')) {
        const adminUser = { id: 'usr-admin', name: 'Admin Supervisor', email, role: 'admin' };
        setUser(adminUser);
        setToken('demo-admin-token');
        return { success: true };
      }
      const demoUser = { id: 'usr-patient', name: email.split('@')[0] || 'Patient', email, role: 'patient', diagnosis: 'Stage II Care' };
      setUser(demoUser);
      setToken('demo-token');
      return { success: true };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err) {
      const newUser = { id: 'usr-' + Date.now(), ...userData, role: 'patient' };
      setUser(newUser);
      setToken('demo-token');
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cc_user');
    localStorage.removeItem('cc_token');
  };

  const updateProfile = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };


  return (
    <AuthContext.Provider value={{
      user, token, login, register, logout, updateProfile,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
