import React, { useState } from 'react';
import { User, Trash2, LogOut, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const auth = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    internAlerts: true,
    eventReminders: true,
    darkMode: false,
    profileVisibility: 'public',
    language: 'en',
  });

  const toggleSetting = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader title="Profile Settings" subtitle="Update your personal information" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <Input placeholder="Your name" defaultValue="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input placeholder="Your email" defaultValue="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input placeholder="Your phone" defaultValue="+91 9876543210" />
                </div>
                <Button variant="primary">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader title="Change Password" subtitle="Update your password" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <Input type="password" placeholder="Enter current password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <Input type="password" placeholder="Enter new password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <Input type="password" placeholder="Confirm new password" />
                </div>
                <Button variant="primary">Update Password</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader title="Notifications" subtitle="Manage your notification preferences" />
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('emailNotifications')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.emailNotifications ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-500">Receive push notifications</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('pushNotifications')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.pushNotifications ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Internship Alerts</p>
                    <p className="text-sm text-gray-500">Get notified about new internships</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('internAlerts')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.internAlerts ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.internAlerts ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Event Reminders</p>
                    <p className="text-sm text-gray-500">Get reminders for upcoming events</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('eventReminders')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.eventReminders ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.eventReminders ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
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
                  <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white">
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
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4" />
                  Logout from all devices
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
                  <User className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="font-semibold text-gray-900">Free Plan</h3>
                <p className="text-sm text-gray-500 mb-4">Upgrade for more features</p>
                <Button variant="primary" className="w-full">Upgrade</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Quick Links" />
            <CardContent>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <span className="text-gray-700">Help Center</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <span className="text-gray-700">Privacy Policy</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <span className="text-gray-700">Terms of Service</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-red-600">
                  <span>Logout</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
