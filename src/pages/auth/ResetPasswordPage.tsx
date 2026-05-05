import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { verifyResetToken, submitNewPassword } from '../../services/passwordResetService';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [tokenState, setTokenState] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [tokenEmail, setTokenEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setTokenState('invalid'); return; }
    verifyResetToken(token).then((res) => {
      if (res.valid) { setTokenEmail(res.email || ''); setTokenState('valid'); }
      else setTokenState('invalid');
    }).catch(() => setTokenState('invalid'));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await submitNewPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center mb-8">
            <img src="/stunivoz-new-logo.png" alt="STUNIVOZ" className="h-12 w-auto object-contain" />
          </div>

          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          {tokenState === 'checking' && (
            <div className="flex flex-col items-center py-12 gap-4">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
              <p className="text-gray-500">Verifying reset link…</p>
            </div>
          )}

          {tokenState === 'invalid' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
              <p className="text-gray-500 mb-6">This password reset link is invalid or has expired. Please request a new one.</p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
              >
                Request New Link
              </Link>
            </div>
          )}

          {tokenState === 'valid' && !success && (
            <>
              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Set New Password</h1>
                {tokenEmail && (
                  <p className="text-gray-500">For <span className="font-medium text-gray-700">{tokenEmail}</span></p>
                )}
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      required
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {password && (
                  <div className="space-y-1">
                    {[
                      { label: 'At least 8 characters', ok: password.length >= 8 },
                      { label: 'Passwords match', ok: password === confirmPassword && confirmPassword.length > 0 },
                    ].map(({ label, ok }) => (
                      <div key={label} className={`flex items-center gap-2 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className={`w-3.5 h-3.5 ${ok ? 'text-green-500' : 'text-gray-300'}`} />
                        {label}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                </button>
              </form>
            </>
          )}

          {success && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Password Updated!</h1>
              <p className="text-gray-500 mb-2">Your password has been reset successfully.</p>
              <p className="text-sm text-gray-400">Redirecting to login…</p>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
          <div className="w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-lg text-center text-white relative z-10">
          <div className="inline-flex bg-white rounded-2xl px-4 py-3 shadow-2xl mx-auto mb-6">
            <img src="/stunivoz-new-logo.png" alt="STUNIVOZ" className="h-14 w-auto object-contain" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">Almost There!</h2>
          <p className="text-primary-100 text-lg">Set your new password and get back to building your career.</p>
        </div>
      </div>
    </div>
  );
};
