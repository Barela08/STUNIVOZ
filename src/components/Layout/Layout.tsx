import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Briefcase,
  Calendar,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
  Target,
  TrendingUp,
  MessageSquare,
  Brain,
  MenuSquare,
  Star,
  Globe,
  Moon,
  Sun,
  BarChart3,
  Award,
  BellRing
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/profile', icon: GraduationCap, label: 'My Profile' },
  { path: '/resume', icon: FileText, label: 'Resume Builder' },
  { path: '/ats', icon: Target, label: 'ATS Analyzer' },
  { path: '/recommendations', icon: Sparkles, label: 'Recommendations' },
  { path: '/internships', icon: Briefcase, label: 'Internships' },
  { path: '/events', icon: Calendar, label: 'Events' },
  { path: '/courses', icon: BookOpen, label: 'Courses' },
  { path: '/career', icon: TrendingUp, label: 'Career Path' },
  { path: '/skills', icon: Star, label: 'Skills' },
  { path: '/practice', icon: Brain, label: 'Practice' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/planner', icon: MenuSquare, label: 'Planner' },
  { path: '/gamification', icon: Award, label: 'Gamification' },
  { path: '/content', icon: Globe, label: 'Content Hub' },
  { path: '/reviews', icon: MessageSquare, label: 'Reviews' },
  { path: '/notifications', icon: BellRing, label: 'Notifications' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const { profile, signOut } = useAuth();

  return (
    <div className={`min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`}>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between h-full px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-500" />
            <span className="font-display font-bold text-xl text-gray-900">STUNIVOZ</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary-500" />
              <span className="font-display font-bold text-xl text-gray-900">STUNIVOZ</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.slice(0, 6).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="my-4 h-px bg-gray-200" />

            <div className="space-y-1">
              {navItems.slice(6, 12).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="my-4 h-px bg-gray-200" />

            <div className="space-y-1">
              {navItems.slice(12).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-semibold">
                  {profile?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {profile?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 pt-16 lg:pt-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search internships, events, courses..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
            <Link to="/community" className="p-2 rounded-lg hover:bg-gray-100">
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">
                  {profile?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
};
