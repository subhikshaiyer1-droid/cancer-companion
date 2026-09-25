import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, AlertCircle, ArrowRight } from 'lucide-react';

export const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isRateLimit, setIsRateLimit] = useState(false);
  const [isUserExists, setIsUserExists] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setIsRateLimit(false);
    setIsUserExists(false);

    if (password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    
    try {
      await register(email, password, fullName);
      navigate('/onboarding');
    } catch (err) {
      const msg = err?.message || err?.error_description || '';
      const code = err?.code || '';
      const status = err?.status;

      const isRateLimited = status === 429 || code === 'over_email_send_rate_limit' || code === 'rate_limit' || msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('security purposes');
      const isExisting = code === 'user_already_exists' || msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists');

      if (isRateLimited) {
        setIsRateLimit(true);
        setError('Supabase verification email rate limit reached. If you already signed up, please sign in below. Otherwise, please wait a few minutes before trying again.');
      } else if (isExisting) {
        setIsUserExists(true);
        setError('An account with this email address already exists. Please sign in to your existing account.');
      } else {
        setError(msg || 'Failed to create an account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg mb-4">
          <Heart className="w-6 h-6 text-white fill-white" />
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Join Cancer Companion
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Start organizing your care journey today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-200 dark:border-slate-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{error}</p>
                </div>
                {(isRateLimit || isUserExists) && (
                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      to="/login"
                      className="w-full text-center py-2 px-4 rounded-xl bg-sky-600 text-white font-semibold text-xs hover:bg-sky-700 transition-colors shadow-sm"
                    >
                      Sign In to Existing Account
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-800 dark:text-white disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-800 dark:text-white disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-800 dark:text-white disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-800 dark:text-white disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-sky-500 to-indigo-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
