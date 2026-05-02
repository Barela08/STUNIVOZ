import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, Github } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../../components/common';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithGithub } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    accountType: 'student',
    fullName: '',
    companyName: '',
    companyDomain: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    const role = formData.accountType === 'provider' ? 'provider' : 'student';
    const displayName = role === 'provider' ? formData.companyName : formData.fullName;

    if (!displayName.trim()) {
      setError(role === 'provider' ? 'Company name is required' : 'Full name is required');
      setLoading(false);
      return;
    }

    const { error } = await signUp(formData.email, formData.password, displayName, role, {
      company_name: role === 'provider' ? formData.companyName : undefined,
      company_domain: role === 'provider' ? formData.companyDomain : undefined,
      is_verified: role === 'provider' ? false : undefined
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');

    const { error } = await signInWithGoogle();

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGithubSignUp = async () => {
    setLoading(true);
    setError('');

    const { error } = await signInWithGithub();

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const passwordRequirements = [
    { met: formData.password.length >= 6, text: 'At least 6 characters' },
    { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(formData.password), text: 'One number' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-10 h-10 text-primary-500" />
            <span className="font-display font-bold text-2xl text-gray-900">STUNIVOZ</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h1>
            <p className="text-gray-500">
              Start your career journey with STUNIVOZ
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              icon={<User className="w-5 h-5" />}
              value={formData.fullName}
              onChange={handleChange}
              required={formData.accountType === 'student'}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, accountType: 'student' })}
                  className={`px-4 py-2.5 rounded-lg border text-sm font-medium ${
                    formData.accountType === 'student'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, accountType: 'provider' })}
                  className={`px-4 py-2.5 rounded-lg border text-sm font-medium ${
                    formData.accountType === 'provider'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Company
                </button>
              </div>
            </div>

            {formData.accountType === 'provider' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  name="companyName"
                  type="text"
                  placeholder="Registered company name"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Company Domain"
                  name="companyDomain"
                  type="text"
                  placeholder="company.com"
                  value={formData.companyDomain}
                  onChange={handleChange}
                />
              </div>
            )}

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              icon={<Mail className="w-5 h-5" />}
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                icon={<Lock className="w-5 h-5" />}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Requirements */}
            {formData.password && (
              <div className="space-y-2 text-sm">
                {passwordRequirements.map((req, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 ${
                      req.met ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                    {req.text}
                  </div>
                ))}
              </div>
            )}

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              icon={<Lock className="w-5 h-5" />}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-500 hover:text-primary-600">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-500 hover:text-primary-600">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Create Account
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-500">or sign up with</span>
            </div>
          </div>

          {/* Social Sign Up */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleGoogleSignUp}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.13-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleGithubSignUp}
              disabled={loading}
            >
              <Github className="w-5 h-5" />
              GitHub
            </Button>
          </div>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Image/Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent-500 to-accent-700 items-center justify-center p-12">
        <div className="max-w-lg text-center text-white">
          <div className="mb-8">
            <Sparkles className="w-20 h-20 mx-auto mb-6" />
            <h2 className="font-display text-4xl font-bold mb-4">
              Land Your Dream Internship
            </h2>
            <p className="text-accent-100 text-lg">
              Join thousands of students who found their perfect career opportunity through STUNIVOZ.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">AI-Powered Resume Builder</div>
                  <div className="text-accent-100 text-sm">Create professional resumes in minutes</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">Smart Recommendations</div>
                  <div className="text-accent-100 text-sm">Get personalized internship suggestions</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">Career Roadmap</div>
                  <div className="text-accent-100 text-sm">Track your progress and grow</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
