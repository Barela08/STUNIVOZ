import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, ArrowRight, Eye, EyeOff, Moon, Sun, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export const ProviderLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, fetchProfile, signOut, devSignIn } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: loginError } = await signIn(formData.email, formData.password);
    if (loginError) {
      setError(loginError.message || 'Invalid credentials. Please try again.');
      setLoading(false);
      return;
    }

    // After login, check role in Firestore
    // user is set by auth listener, fetch profile
    const { auth } = await import('../../services/firebase');
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('Authentication failed. Please try again.');
      setLoading(false);
      return;
    }

    const userProfile = await fetchProfile(currentUser.uid);
    if (!userProfile || userProfile.role !== 'company') {
      await signOut();
      setError('Access denied. This portal is for company accounts only. Contact admin to upgrade your account.');
      setLoading(false);
      return;
    }

    navigate('/provider');
  };

  return (
    <div className="min-h-screen flex dark:bg-gray-950 bg-slate-50 transition-colors duration-300">
      {/* Left - Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 items-center justify-center p-12">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-slate-700/30 rounded-full blur-3xl" />

        <div className="relative z-10 text-center text-white max-w-lg">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/15 mb-8 shadow-2xl">
            <Building2 className="w-12 h-12 text-blue-200" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">Company Portal</h2>
          <p className="text-blue-200 text-lg mb-8">
            Post internships, manage applicants, and connect with top student talent across universities.
          </p>
          <div className="space-y-3">
            {['Post unlimited internship opportunities', 'Manage applications efficiently', 'Host events and webinars', 'Access top student talent'].map(text => (
              <div key={text} className="flex items-center gap-3 text-left bg-white/8 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-blue-300 flex-shrink-0" />
                <span className="text-blue-100 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>

        <div className="w-full max-w-md animate-slide-up">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-xl dark:text-white text-gray-900">STUNIVOZ</span>
              <span className="block text-xs text-blue-500 font-medium">Company Portal</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold dark:text-white text-gray-900 mb-2">Company Sign In</h1>
            <p className="dark:text-gray-400 text-gray-500">Access your company dashboard</p>
          </div>

          <div className="mb-5 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-600 dark:text-blue-400">
              This portal is for registered companies only. Email/password login only — no social login.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Company Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  placeholder="company@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white dark:text-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white dark:text-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In to Dashboard <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          {/* Dev Bypass */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-2 uppercase tracking-wide">Dev Mode — Skip Firebase Auth</p>
            <button
              type="button"
              onClick={() => { devSignIn('company'); navigate('/provider'); }}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-800/40 hover:bg-yellow-200 dark:hover:bg-yellow-700/40 border border-yellow-300 dark:border-yellow-700 transition-all"
            >
              Enter as Dev Company (no password needed)
            </button>
          </div>

          <p className="mt-4 text-center text-sm dark:text-gray-500 text-gray-400">
            Not a company?{' '}
            <a href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
              Student login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
