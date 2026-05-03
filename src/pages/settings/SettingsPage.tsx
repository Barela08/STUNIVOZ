import React, { useState } from 'react';
import { Trash2, LogOut, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { resetPassword } from '../../services/firebase';

export const SettingsPage: React.FC = () => {
  const auth = useAuth();
  const { profile, user, updateProfile, signOut } = auth;

  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [pwdStatus, setPwdStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pwdLoading, setPwdLoading] = useState(false);

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

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setPwdLoading(true);
    setPwdStatus('idle');
    const result = await resetPassword(user.email);
    setPwdLoading(false);
    if (result.success) {
      setPwdStatus('success');
    } else {
      setPwdStatus('error');
    }
  };

  const Toggle: React.FC<{ value: boolean; onChange: () => void }> = ({ value, onChange }) => (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-primary-500' : 'bg-gray-300'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader title="Profile Settings" subtitle="Update your personal information" />
            <CardContent>
              <div className="space-y-4">
                {profileStatus === 'success' && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    <CheckCircle className="w-4 h-4" /> Profile updated successfully!
                  </div>
                )}
                {profileStatus === 'error' && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
            <CardHeader title="Change Password" subtitle="Send a password reset link to your email" />
            <CardContent>
              <div className="space-y-4">
                {pwdStatus === 'success' && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    <CheckCircle className="w-4 h-4" /> Password reset email sent! Check your inbox.
                  </div>
                )}
                {pwdStatus === 'error' && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <AlertCircle className="w-4 h-4" /> Failed to send reset email. Please try again.
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  We'll send a password reset link to <strong>{user?.email}</strong>.
                </p>
                <Button variant="primary" onClick={handlePasswordReset} loading={pwdLoading}>
                  Send Reset Link
                </Button>
              </div>
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
                  <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-primary-500">
                    <option value="public">Public</option>
                    <option value="connections">Connections Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader title="Danger Zone" subtitle="Irreversible actions" />
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={signOut}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
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
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary-600 text-2xl font-bold">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">{profile?.full_name || 'Student'}</h3>
                <p className="text-sm text-gray-500 mb-1">{user?.email}</p>
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full mb-4">Free Plan</span>
                <Button variant="primary" className="w-full">Upgrade</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Quick Links" />
            <CardContent>
              <div className="space-y-2">
                {['Help Center', 'Privacy Policy', 'Terms of Service'].map(link => (
                  <button key={link} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-gray-700 text-sm">{link}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
                <button
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-colors"
                  onClick={signOut}
                >
                  <span className="text-red-600 text-sm">Sign Out</span>
                  <LogOut className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
