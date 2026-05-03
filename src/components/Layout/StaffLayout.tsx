import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileCheck, ShieldAlert, Flag, LogOut, Menu, X, Shield, Bell, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface StaffLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/staff', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/staff/users', icon: Users, label: 'Manage Users' },
  { path: '/staff/verify', icon: FileCheck, label: 'Verify Content' },
  { path: '/staff/moderation', icon: ShieldAlert, label: 'Moderation' },
  { path: '/staff/reports', icon: Flag, label: 'Reports' },
];

export const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-40 transition-colors">
        <div className="flex items-center justify-between h-full px-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/stunivoz-logo-cropped.png" alt="STUNIVOZ" className="h-8 w-auto object-contain" />
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
          </button>
        </div>
      </header>

      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-72 bg-emerald-900 text-white z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-emerald-800">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-lg px-2 py-1">
                <img src="/stunivoz-logo-cropped.png" alt="STUNIVOZ" className="h-7 w-auto object-contain" />
              </div>
              <span className="font-display font-bold text-sm text-emerald-400">Staff</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-emerald-800">
              <X className="w-5 h-5 text-emerald-300" />
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
                    ? 'bg-emerald-700 text-white shadow-lg'
                    : 'text-emerald-200 hover:bg-emerald-800 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-emerald-800">
            <div className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-emerald-800/50">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'Staff Member'}</p>
                <p className="text-xs text-emerald-300 truncate">{profile?.email || ''}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-emerald-300 hover:bg-emerald-800 hover:text-white transition-all font-medium"
              >
                {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
                {isDark ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={signOut}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:pl-72 pt-16 lg:pt-0">
        <header className="hidden lg:flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Staff Moderation Panel</h2>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>
            <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
};
