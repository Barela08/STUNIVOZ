import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, Briefcase, Calendar, 
  BookOpen, Plug, Bot, UserCog, Megaphone, Palette, 
  Settings2, Bell, LineChart, Shield, Database, LogOut, Menu, X 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/companies', icon: Building2, label: 'Companies' },
  { path: '/admin/internships', icon: Briefcase, label: 'Internships' },
  { path: '/admin/events', icon: Calendar, label: 'Events' },
  { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { path: '/admin/api', icon: Plug, label: 'API System' },
  { path: '/admin/ai', icon: Bot, label: 'AI Control' },
  { path: '/admin/staff', icon: UserCog, label: 'Staff' },
  { path: '/admin/ads', icon: Megaphone, label: 'Ads System' },
  { path: '/admin/ui', icon: Palette, label: 'UI Control' },
  { path: '/admin/features', icon: Settings2, label: 'Features' },
  { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { path: '/admin/analytics', icon: LineChart, label: 'Analytics' },
  { path: '/admin/security', icon: Shield, label: 'Security' },
  { path: '/admin/backup', icon: Database, label: 'Backup' },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between h-full px-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-600" />
            <span className="font-display font-bold text-xl text-gray-900">Admin</span>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-900 text-white z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-red-500" />
              <span className="font-display font-bold text-xl">Admin Panel</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-gray-800">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto space-y-1 custom-scrollbar">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  location.pathname === item.path
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800" onClick={signOut}>
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      <main className="lg:pl-72 pt-16 lg:pt-0">
        <header className="hidden lg:flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 sticky top-0 z-30">
          <h2 className="text-xl font-bold text-gray-800">System Administration</h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
};
