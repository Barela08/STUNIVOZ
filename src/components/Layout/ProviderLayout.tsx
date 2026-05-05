import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Calendar, Users, Settings, LogOut, Menu, X, Building2, Bell, Moon, Sun, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { changePassword } from '../../services/firebase';

interface ProviderLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/provider', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/provider/internships/new', icon: Briefcase, label: 'Post Internship' },
  { path: '/provider/events/new', icon: Calendar, label: 'Post Event' },
  { path: '/provider/applicants', icon: Users, label: 'Applicants' },
  { path: '/provider/settings', icon: Settings, label: 'Company Settings' },
];

export const ProviderLayout: React.FC<ProviderLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });

  const openChangePwd = () => { setPwdForm({ current: '', newPwd: '', confirm: '' }); setPwdError(''); setPwdSuccess(false); setShowChangePwd(true); };

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (pwdForm.newPwd !== pwdForm.confirm) { setPwdError('New passwords do not match.'); return; }
    if (pwdForm.newPwd.length < 8) { setPwdError('New password must be at least 8 characters.'); return; }
    if (pwdForm.newPwd === pwdForm.current) { setPwdError('New password must differ from current.'); return; }
    setPwdLoading(true);
    const result = await changePassword(pwdForm.current, pwdForm.newPwd);
    setPwdLoading(false);
    if (result.success) { setPwdSuccess(true); setPwdForm({ current: '', newPwd: '', confirm: '' }); }
    else {
      const code = result.error?.code || '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') setPwdError('Current password is incorrect.');
      else if (code === 'auth/requires-recent-login') setPwdError('Session expired. Sign out and back in, then retry.');
      else setPwdError(result.error?.message || 'Failed to change password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-40 transition-colors">
        <div className="flex items-center justify-between h-full px-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/stunivoz-new-logo.png" alt="STUNIVOZ" className="h-8 w-auto object-contain" />
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
          </button>
        </div>
      </header>

      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-900 text-white z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-lg px-2 py-1">
                <img src="/stunivoz-new-logo.png" alt="STUNIVOZ" className="h-7 w-auto object-contain" />
              </div>
              <span className="font-display font-bold text-sm text-blue-400">Company</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-gray-800">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-gray-800/50">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || 'C'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'Company'}</p>
                <p className="text-xs text-gray-400 truncate">{profile?.email || ''}</p>
              </div>
            </div>
            <div className="flex gap-2 mb-2">
              <button onClick={toggleTheme} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-all font-medium">
                {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
                {isDark ? 'Light' : 'Dark'}
              </button>
              <button onClick={signOut} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all font-medium">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
            <button onClick={openChangePwd} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-all font-medium">
              <Lock className="w-4 h-4" /> Change Password
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:pl-72 pt-16 lg:pt-0">
        <header className="hidden lg:flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Company Dashboard</h2>
          <div className="flex items-center gap-3">
            <button onClick={openChangePwd} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700">
              <Lock className="w-4 h-4" /> Change Password
            </button>
            <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>
            <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-all">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-6">{children}</div>
      </main>

      {showChangePwd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">Change Password</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{profile?.email}</p>
                </div>
              </div>
              <button onClick={() => setShowChangePwd(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {pwdSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Password Changed!</h4>
                  <p className="text-sm text-gray-500 mb-5">Your password has been updated successfully.</p>
                  <button onClick={() => setShowChangePwd(false)} className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors">Done</button>
                </div>
              ) : (
                <form onSubmit={handleChangePwd} className="space-y-4">
                  {pwdError && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"><p className="text-sm text-red-600 dark:text-red-400">{pwdError}</p></div>}
                  {[
                    { label: 'Current Password', key: 'current', show: showCurrent, toggle: () => setShowCurrent(v => !v) },
                    { label: 'New Password', key: 'newPwd', show: showNew, toggle: () => setShowNew(v => !v) },
                    { label: 'Confirm New Password', key: 'confirm', show: showConfirm, toggle: () => setShowConfirm(v => !v) },
                  ].map(({ label, key, show, toggle }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type={show ? 'text' : 'password'} value={pwdForm[key as keyof typeof pwdForm]}
                          onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))} placeholder={label} required
                          className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                        <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowChangePwd(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                    <button type="submit" disabled={pwdLoading} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                      {pwdLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
