import React, { useState } from 'react';
import { Trash2, LogOut, ChevronRight, CheckCircle, AlertCircle, Lock, Eye, EyeOff, HelpCircle, Shield, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, Input } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { changePassword } from '../../services/firebase';

export const SettingsPage: React.FC = () => {
  const auth = useAuth();
  const { profile, user, updateProfile, signOut } = auth;

  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    internAlerts: true,
    eventReminders: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileStatus('idle');
    const { error } = await updateProfile(profileForm);
    setProfileSaving(false);
    if (error) {
      setProfileStatus('error');
    } else {
      setProfileStatus('success');
      setTimeout(() => setProfileStatus('idle'), 3000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (pwdForm.newPwd !== pwdForm.confirm) { setPwdError('New passwords do not match.'); return; }
    if (pwdForm.newPwd.length < 8) { setPwdError('New password must be at least 8 characters.'); return; }
    if (pwdForm.newPwd === pwdForm.current) { setPwdError('New password must differ from current password.'); return; }
    setPwdLoading(true);
    const result = await changePassword(pwdForm.current, pwdForm.newPwd);
    setPwdLoading(false);
    if (result.success) {
      setPwdSuccess(true);
      setPwdForm({ current: '', newPwd: '', confirm: '' });
      setTimeout(() => setPwdSuccess(false), 5000);
    } else {
      const code = result.error?.code || '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') setPwdError('Current password is incorrect.');
      else if (code === 'auth/weak-password') setPwdError('New password is too weak.');
      else if (code === 'auth/requires-recent-login') setPwdError('Session expired. Sign out and sign in again, then retry.');
      else setPwdError(result.error?.message || 'Failed to change password. Try again.');
    }
  };

  const Toggle: React.FC<{ value: boolean; onChange: () => void }> = ({ value, onChange }) => (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader title="Profile Settings" subtitle="Update your personal information" />
            <CardContent>
              <div className="space-y-4">
                {profileStatus === 'success' && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" /> Profile updated successfully!
                  </div>
                )}
                {profileStatus === 'error' && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" /> Failed to update. Please try again.
                  </div>
                )}
                <Input
                  label="Full Name"
                  placeholder="Your name"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <Input placeholder="Your email" value={user?.email || ''} disabled />
                </div>
                <Input
                  label="Phone"
                  placeholder="Your phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                />
                <Button variant="primary" onClick={handleProfileSave} loading={profileSaving}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader title="Change Password" subtitle="Update your account password directly" />
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {pwdSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" /> Password changed successfully!
                  </div>
                )}
                {pwdError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" /> {pwdError}
                  </div>
                )}
                {[
                  { label: 'Current Password', key: 'current', show: showCurrent, toggle: () => setShowCurrent(v => !v) },
                  { label: 'New Password', key: 'newPwd', show: showNew, toggle: () => setShowNew(v => !v) },
                  { label: 'Confirm New Password', key: 'confirm', show: showConfirm, toggle: () => setShowConfirm(v => !v) },
                ].map(({ label, key, show, toggle }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={show ? 'text' : 'password'}
                        value={pwdForm[key as keyof typeof pwdForm]}
                        onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={label}
                        required
                        className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder-gray-400"
                      />
                      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                <Button type="submit" variant="primary" loading={pwdLoading}>
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader title="Notifications" subtitle="Manage your notification preferences" />
            <CardContent>
              <div className="space-y-4">
                {(
                  [
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive push notifications' },
                    { key: 'internAlerts', label: 'Internship Alerts', desc: 'Get notified about new internships' },
                    { key: 'eventReminders', label: 'Event Reminders', desc: 'Get reminders for upcoming events' },
                  ] as const
                ).map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                    <Toggle value={settings[item.key]} onChange={() => toggleSetting(item.key)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader title="Privacy" subtitle="Control your privacy settings" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Visibility</label>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500">
                    <option value="public">Public</option>
                    <option value="connections">Connections Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader title="Danger Zone" subtitle="Irreversible actions" />
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={signOut}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Account Status" />
            <CardContent>
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary-600 dark:text-primary-400 text-2xl font-bold">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{profile?.full_name || 'Student'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{user?.email}</p>
                <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs rounded-full mb-4">Free Plan</span>
                <Button variant="primary" className="w-full">Upgrade</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Quick Links" />
            <CardContent>
              <div className="space-y-1">
                {[
                  { label: 'Help Center', to: '/help', icon: HelpCircle },
                  { label: 'Privacy Policy', to: '/privacy', icon: Shield },
                  { label: 'Terms of Service', to: '/terms', icon: FileText },
                ].map(({ label, to, icon: Icon }) => (
                  <Link key={label} to={to} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
                <button
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  onClick={signOut}
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="text-red-600 dark:text-red-400 text-sm">Sign Out</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
