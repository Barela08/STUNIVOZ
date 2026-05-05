import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, Lock, ArrowRight, Eye, EyeOff, User, Phone, Globe, Moon, Sun, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { registerUser } from '../../services/firebase';
import { setDocument } from '../../services/firebase';

export const ProviderRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    password: '',
    confirmPassword: '',
    industry: '',
    size: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');

    const result = await registerUser(formData.email, formData.password);
    if (!result.success || !result.user) {
      const code = (result.error as any)?.code || '';
      if (code === 'auth/email-already-in-use') setError('This email is already registered. Try logging in.');
      else if (code === 'auth/unauthorized-domain') setError(`Domain "${window.location.hostname}" is not authorized in Firebase Console.`);
      else setError((result.error as any)?.message || 'Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    await setDocument('profiles', result.user.uid, {
      id: result.user.uid,
      email: formData.email,
      full_name: formData.contactName,
      role: 'company',
      company_name: formData.companyName,
      phone: formData.phone,
      website: formData.website,
      industry: formData.industry,
      company_size: formData.size,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    setStep('success');
    setLoading(false);
    setTimeout(() => navigate('/provider/login'), 3000);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-950 bg-slate-50">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Registration Successful!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your company account has been created. Our team will review and activate it shortly.
            Redirecting to login...
          </p>
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex dark:bg-gray-950 bg-slate-50 transition-colors duration-300">
      {/* Left Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 items-center justify-center p-12">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-slate-700/30 rounded-full blur-3xl" />
        <div className="relative z-10 text-center text-white max-w-lg">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/15 mb-8 shadow-2xl">
            <Building2 className="w-12 h-12 text-blue-200" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">Join as a Company</h2>
          <p className="text-blue-200 text-lg mb-8">
            Post internships, host events, and connect with thousands of talented students across India.
          </p>
          <div className="space-y-3">
            {[
              'Access 10,000+ student profiles',
              'Post unlimited internship listings',
              'Host events and webinars',
              'AI-powered candidate matching',
            ].map(text => (
              <div key={text} className="flex items-center gap-3 text-left bg-white/8 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <CheckCircle className="w-4 h-4 text-blue-300 flex-shrink-0" />
                <span className="text-blue-100 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-y-auto">
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>

        <div className="w-full max-w-md py-8">
          <div className="flex items-center gap-3 mb-6">
            <img src="/stunivoz-new-logo.png" alt="STUNIVOZ" className="h-10 w-auto object-contain" />
            <div>
              <span className="font-display font-bold text-xl dark:text-white text-gray-900">STUNIVOZ</span>
              <span className="block text-xs text-blue-500 font-medium">Company Portal</span>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold dark:text-white text-gray-900 mb-1">Create Company Account</h1>
            <p className="dark:text-gray-400 text-gray-500 text-sm">Fill in your company details to get started</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold dark:text-gray-300 text-gray-600 mb-1 uppercase tracking-wide">Company Name *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="companyName" type="text" required
                  placeholder="e.g. Acme Technologies Pvt Ltd"
                  value={formData.companyName} onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white dark:text-white text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold dark:text-gray-300 text-gray-600 mb-1 uppercase tracking-wide">Contact Person Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="contactName" type="text" required
                  placeholder="e.g. Arjun Sharma"
                  value={formData.contactName} onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white dark:text-white text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold dark:text-gray-300 text-gray-600 mb-1 uppercase tracking-wide">Industry</label>
                <select
                  name="industry" value={formData.industry} onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white dark:text-white text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="">Select...</option>
                  <option>Technology</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Education</option>
                  <option>E-commerce</option>
                  <option>Manufacturing</option>
                  <option>Consulting</option>
                  <option>Media</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold dark:text-gray-300 text-gray-600 mb-1 uppercase tracking-wide">Company Size</label>
                <select
                  name="size" value={formData.size} onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white dark:text-white text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="">Select...</option>
                  <option>1–10</option>
                  <option>11–50</option>
                  <option>51–200</option>
                  <option>201–500</option>
                  <option>500+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold dark:text-gray-300 text-gray-600 mb-1 uppercase tracking-wide">Company Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="email" type="email" required
                  placeholder="hr@yourcompany.com"
                  value={formData.email} onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white dark:text-white text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold dark:text-gray-300 text-gray-600 mb-1 uppercase tracking-wide">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="phone" type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone} onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white dark:text-white text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold dark:text-gray-300 text-gray-600 mb-1 uppercase tracking-wide">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="website" type="url"
                    placeholder="https://yourcompany.com"
                    value={formData.website} onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white dark:text-white text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold dark:text-gray-300 text-gray-600 mb-1 uppercase tracking-wide">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="password" type={showPassword ? 'text' : 'password'} required
                  placeholder="At least 6 characters"
                  value={formData.password} onChange={handleChange}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white dark:text-white text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold dark:text-gray-300 text-gray-600 mb-1 uppercase tracking-wide">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="confirmPassword" type={showPassword ? 'text' : 'password'} required
                  placeholder="Re-enter password"
                  value={formData.confirmPassword} onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-900 bg-white dark:text-white text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" required className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
              <span className="text-xs dark:text-gray-400 text-gray-500">
                I agree to STUNIVOZ's{' '}
                <span className="text-blue-500 cursor-pointer hover:underline">Terms of Service</span>
                {' '}and{' '}
                <span className="text-blue-500 cursor-pointer hover:underline">Privacy Policy</span>
              </span>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Company Account <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm dark:text-gray-500 text-gray-400">
            Already have an account?{' '}
            <Link to="/provider/login" className="text-blue-500 hover:text-blue-600 font-medium">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-sm dark:text-gray-500 text-gray-400">
            Are you a student?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium">
              Student login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
