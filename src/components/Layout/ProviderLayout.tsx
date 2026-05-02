import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Calendar, Users, Settings, LogOut, Menu, X, Building2, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common';

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
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between h-full px-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span className="font-display font-bold text-xl text-gray-900">Provider</span>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-900 text-white z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-blue-400" />
              <span className="font-display font-bold text-xl">Provider Panel</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-gray-800">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
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

      {/* Main Content */}
      <main className="lg:pl-72 pt-16 lg:pt-0">
        <header className="hidden lg:flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 sticky top-0 z-30">
          <h2 className="text-xl font-bold text-gray-800">Company Dashboard</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
              C
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
};
