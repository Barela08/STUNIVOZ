import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, Moon, Sun, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') return 'Access denied. Invalid administrator credentials.';
    if (code === 'auth/too-many-requests') return 'Too many failed attempts. Please wait a few minutes and try again.';
    if (code === 'auth/network-request-failed') return 'Network error. Please check your internet connection.';
    if (code === 'auth/unauthorized-domain') {
      const domain = window.location.hostname;
      return `Domain "${domain}" is not authorized in Firebase Console. Add it under Authentication → Settings → Authorized domains.`;
    }
    return err?.message || 'Access denied. Invalid administrator credentials.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: firebaseError } = await signIn(formData.email.trim(), formData.password);

    if (firebaseError) {
      setError(formatAuthError(firebaseError));
      setLoading(false);
      return;
    }

    // Verify role in Firestore
    try {
      const { auth } = await import('../../services/firebase');
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user after login');
      const db = getFirestore();
      const snap = await getDoc(doc(db, 'profiles', currentUser.uid));
      const role = snap.data()?.role;
      if (role !== 'admin') {
        await auth.signOut();
        setError('Access denied. This portal is for administrators only.');
        setLoading(false);
        return;
      }
    } catch {
      // If Firestore check fails, still allow in — AuthContext will handle role
    }

    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex dark:bg-gray-950 bg-red-50/30 transition-colors duration-300">
      {/* Left - Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-red-700 via-red-800 to-gray-900 items-center justify-center p-12">
        <div className="absolute top-20 right-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gray-800/30 rounded-full blur-3xl" />

        <div className="relative z-10 text-center text-white max-w-lg">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/15 mb-8 shadow-2xl">
            <ShieldCheck className="w-12 h-12 text-red-200" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">Admin Control Panel</h2>
          <p className="text-red-200 text-lg mb-8">
            Full system access. Manage users, content, security, and platform configuration.
          </p>
          <div className="p-4 bg-red-900/40 border border-red-600/40 rounded-xl text-left">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-300" />
              <span className="text-red-200 font-semibold text-sm">Restricted Access</span>
            </div>
            <p className="text-red-300/80 text-xs">
              This portal is restricted to authorized administrators only. All login attempts are monitored and logged.
            </p>
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
            <img src="/stunivoz-new-logo.png" alt="STUNIVOZ" className="h-12 w-auto object-contain" />
            <div>
              <span className="font-display font-bold text-xl dark:text-white text-gray-900">STUNIVOZ</span>
              <span className="block text-xs text-red-500 font-medium">Admin Portal</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold dark:text-white text-gray-900 mb-2">Admin Sign In</h1>
            <p className="dark:text-gray-400 text-gray-500">Enter your administrator credentials</p>
          </div>

          <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400">
              Authorized personnel only. Email/password login — no social sign-in allowed.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@stunivoz.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white dark:text-white text-gray-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
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
                  autoComplete="current-password"
                  placeholder="Enter admin password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white dark:text-white text-gray-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
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
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Access Admin Panel <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm dark:text-gray-500 text-gray-400">
            Not an admin?{' '}
            <a href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
              Student login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
