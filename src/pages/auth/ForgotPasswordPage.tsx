import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button, Input } from '../../components/common';
import { resetPassword } from '../../services/firebase';
export const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Direct call to Firebase for password reset
      const result = await resetPassword(email);

      if (!result.success) throw result.error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending the reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <img src="/stunivoz-logo-cropped.png" alt="STUNIVOZ" className="h-12 w-auto object-contain" />
          </div>

          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
              Reset your password
            </h1>
            <p className="text-gray-500">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">Check your email for a reset link.</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              icon={<Mail className="w-5 h-5" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={success}
            >
              Send Reset Link
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Right Panel - Image/Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
          <div className="w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-lg text-center text-white relative z-10">
          <div className="mb-8">
            <div className="inline-flex bg-white rounded-2xl px-4 py-3 shadow-2xl mx-auto mb-6">
              <img src="/stunivoz-logo-cropped.png" alt="STUNIVOZ" className="h-14 w-auto object-contain" />
            </div>
            <h2 className="font-display text-4xl font-bold mb-4">
              Secure Your Account
            </h2>
            <p className="text-primary-100 text-lg">
              Don't worry, happens to the best of us. We'll get you back into your account in no time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
