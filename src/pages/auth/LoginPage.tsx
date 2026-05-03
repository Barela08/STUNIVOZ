import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogleOAuth, signInWithGitHubOAuth } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
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
    const { error } = await signIn(formData.email, formData.password);
    if (error) {
      setError(error.message || 'Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    const { error } = await signInWithGoogleOAuth();
    if (error) {
      setError(error.message || 'Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGitHubSignIn = async () => {
    setGithubLoading(true);
    setError('');
    const { error } = await signInWithGitHubOAuth();
    if (error) {
      setError(error.message || 'GitHub sign-in failed. Please ensure GitHub is enabled in Firebase Console.');
      setGithubLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex dark:bg-gray-950 bg-gray-50 transition-colors duration-300">
      {/* Left Panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          title="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>

        <div className="w-full max-w-md animate-slide-up">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl dark:text-white text-gray-900">STUNIVOZ</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold dark:text-white text-gray-900 mb-2">Welcome back!</h1>
            <p className="dark:text-gray-400 text-gray-500">Sign in to continue your career journey</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white dark:text-white text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
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
                  className="w-full pl-10 pr-12 py-3 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white dark:text-white text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                <span className="text-sm dark:text-gray-400 text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t dark:border-gray-700 border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 dark:bg-gray-950 bg-gray-50 text-sm dark:text-gray-500 text-gray-400">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading || githubLoading}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-60 font-medium dark:text-gray-300 text-gray-700"
            >
              {googleLoading ? (
                <span className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.13-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Google
            </button>

            {/* GitHub Button */}
            <button
              type="button"
              onClick={handleGitHubSignIn}
              disabled={githubLoading || loading || googleLoading}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-60 font-medium dark:text-gray-300 text-gray-700"
            >
              {githubLoading ? (
                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 dark:fill-white fill-gray-900" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              )}
              GitHub
            </button>
          </div>

          <p className="mt-8 text-center dark:text-gray-400 text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-500 hover:text-primary-600 font-medium">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Glassmorphism */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 items-center justify-center p-12">
        {/* Background blobs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-lg text-center text-white z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/20 mb-8 shadow-2xl">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-4 leading-tight">
            Your Complete Career Platform
          </h2>
          <p className="text-primary-100 text-lg mb-10">
            Build your profile, find internships, create professional resumes, and connect with opportunities.
          </p>

          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { num: '500+', label: 'Internships' },
              { num: '200+', label: 'Companies' },
              { num: '50+', label: 'Courses' },
              { num: '100+', label: 'Events' },
            ].map(({ num, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15 hover:bg-white/15 transition-all">
                <div className="text-3xl font-bold mb-1">{num}</div>
                <div className="text-primary-100 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
