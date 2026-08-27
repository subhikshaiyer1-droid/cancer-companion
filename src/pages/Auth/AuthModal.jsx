import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Heart, Lock, Mail, User, Stethoscope, ArrowRight, X } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const { addToast } = useTheme();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    diagnosis: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        addToast('Welcome Back', 'Logged in successfully.', 'success');
        onClose();
      } else if (mode === 'register') {
        await register(formData);
        addToast('Registration Complete', 'Your patient profile has been created.', 'success');
        onClose();
      } else if (mode === 'forgot') {
        addToast('Reset Email Sent', `Password reset instructions sent to ${formData.email}`, 'info');
        setMode('login');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = (role) => {
    if (role === 'admin') {
      login('admin@cancercompanion.org', 'adminpassword');
      addToast('Demo Mode', 'Signed in as Admin Administrator', 'success');
    } else {
      login('eleanor@example.com', 'password123');
      addToast('Demo Mode', 'Signed in as Patient Eleanor Vance', 'success');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-400 to-purple-400 flex items-center justify-center text-white shadow-md">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {mode === 'login' ? 'Patient Sign In' : mode === 'register' ? 'Join Cancer Companion' : 'Reset Password'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'login' ? 'Access your treatment logs & AI assistant' : mode === 'register' ? 'Create a calm account for your journey' : 'We will send a recovery link'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Eleanor Vance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="patient@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Diagnosis / Stage (Optional)</label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Breast Cancer Stage II"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Recovery Email'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Mode Toggle & Demo Login */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 text-center text-xs">
          {mode === 'login' ? (
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <button onClick={() => setMode('register')} className="hover:text-sky-600 font-semibold">New Patient? Register</button>
              <button onClick={() => setMode('forgot')} className="hover:text-sky-600 font-semibold">Forgot Password?</button>
            </div>
          ) : (
            <button onClick={() => setMode('login')} className="text-sky-600 font-semibold hover:underline">
              Already have an account? Sign In
            </button>
          )}

          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="text-[11px] text-slate-400">Quick Demo Access:</span>
            <button
              onClick={() => quickDemoLogin('patient')}
              className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold text-[11px] hover:bg-sky-100"
            >
              Demo Patient
            </button>
            <button
              onClick={() => quickDemoLogin('admin')}
              className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold text-[11px] hover:bg-purple-100"
            >
              Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
