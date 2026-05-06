import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, FileText, Briefcase, Calendar,
  BookOpen, Users, Settings, LogOut, Menu, X, Bell, Search,
  ChevronDown, Sparkles, Target, TrendingUp, MessageSquare,
  Brain, MenuSquare, Star, Globe, Moon, Sun, Award, BellRing, Map, Bot, LogIn,
  HelpCircle, Shield, Send, Loader2, Minimize2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAdminSettings } from '../../contexts/AdminSettingsContext';
import { careerChatReply } from '../../services/aiService';

interface LayoutProps {
  children: React.ReactNode;
}

// ─── Floating AI Chat Widget ──────────────────────────────────────────────────
type ChatMsg = { role: 'bot' | 'user'; text: string };

function formatLine(line: string, i: number) {
  if (!line.trim()) return <div key={i} className="h-1" />;
  if (/^[•*-] /.test(line)) {
    const parts = line.slice(2).split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className="flex gap-1.5 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
        <span className="text-primary-500 shrink-0">•</span>
        <span>{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</span>
      </p>
    );
  }
  const parts = line.split(/\*\*(.*?)\*\*/g);
  return <p key={i} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</p>;
}

const FloatingAiChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([{
    role: 'bot',
    text: "Hi! I'm your AI Career Advisor 👋\nAsk me anything about internships, resume, interviews, or career guidance!",
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, typing, open]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || typing) return;
    setInput('');
    setError('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setTyping(true);
    try {
      const reply = await careerChatReply(msg, messages);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (err: any) {
      const m = err?.message || '';
      setError(m.includes('No API key') ? 'AI not configured. Ask admin to set API key.' : 'Could not respond. Try again.');
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't respond right now. Try the AI Help page for more options." }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* Panel */}
      <div className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-sm transition-all duration-300 origin-bottom-right ${open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ height: '480px' }}>

          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 flex-shrink-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">AI Career Advisor</p>
              <p className="text-[10px] text-white/70 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-green-300 inline-block" /> Online · STUNIVOZ
              </p>
            </div>
            <Link to="/ai-help" onClick={() => setOpen(false)}
              className="text-[10px] text-white/80 hover:text-white font-medium px-2 py-1 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0">
              Full page →
            </Link>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors flex-shrink-0">
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50/50 dark:bg-gray-950/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className={`max-w-[82%] px-3 py-2 rounded-2xl text-xs shadow-sm ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm'}`}>
                  {msg.role === 'user'
                    ? <p className="leading-relaxed">{msg.text}</p>
                    : <div className="space-y-0.5">{msg.text.split('\n').map((l, i) => formatLine(l, i))}</div>
                  }
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-2.5 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="flex gap-1">
                    {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                  </div>
                </div>
              </div>
            )}
            {error && <p className="text-center text-[10px] text-red-500 px-2">{error}</p>}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-3 py-2 flex gap-1.5 flex-wrap border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
            {['Find internships', 'Resume tips', 'Interview prep'].map(p => (
              <button key={p} onClick={() => send(p)} disabled={typing}
                className="px-2.5 py-1 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-full font-medium transition-colors disabled:opacity-50 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />{p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 bg-white dark:bg-gray-900 flex-shrink-0">
            <div className="flex gap-2 items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-400/20 transition-all">
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none" />
              <button onClick={() => send()} disabled={!input.trim() || typing}
                className="w-7 h-7 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white flex items-center justify-center transition-all flex-shrink-0">
                {typing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-20 sm:right-24 z-50 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${open ? 'bg-gray-700 hover:bg-gray-800' : 'bg-gradient-to-br from-primary-500 to-accent-500 hover:shadow-primary-500/30 hover:shadow-2xl'}`}
        title="AI Career Advisor"
      >
        {open
          ? <X className="w-6 h-6 text-white" />
          : (
            <>
              <Bot className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full animate-pulse" />
            </>
          )
        }
      </button>
    </>
  );
};

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/profile', icon: GraduationCap, label: 'My Profile' },
  { path: '/internships', icon: Briefcase, label: 'Internships' },
  { path: '/roadmaps', icon: Map, label: 'Roadmaps' },
  { path: '/courses', icon: BookOpen, label: 'Courses' },
  { path: '/events', icon: Calendar, label: 'Events' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/ai-help', icon: Bot, label: 'AI Help' },
  { path: '/resume', icon: FileText, label: 'Resume Builder' },
  { path: '/ats', icon: Target, label: 'ATS Analyzer' },
  { path: '/recommendations', icon: Sparkles, label: 'Recommendations' },
  { path: '/career', icon: Bot, label: 'AI Advisor' },
  { path: '/skills', icon: Star, label: 'Skills' },
  { path: '/practice', icon: Brain, label: 'Practice' },
  { path: '/planner', icon: MenuSquare, label: 'Planner' },
  { path: '/gamification', icon: Award, label: 'Gamification' },
  { path: '/content', icon: Globe, label: 'Content Hub' },
  { path: '/reviews', icon: MessageSquare, label: 'Reviews' },
  { path: '/notifications', icon: BellRing, label: 'Notifications' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { logoUrl } = useAdminSettings();
  const logoSrc = logoUrl || '/stunivoz-brand-logo.png';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-40 transition-colors">
        <div className="flex items-center justify-between h-full px-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <img src={logoSrc} alt="STUNIVOZ" className="h-9 w-auto object-contain" />
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transform transition-all duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-gray-800">
            <img src={logoSrc} alt="STUNIVOZ" className="h-11 w-auto object-contain" />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            {[navItems.slice(0, 6), navItems.slice(6, 12), navItems.slice(12)].map((group, gi) => (
              <React.Fragment key={gi}>
                {gi > 0 && <div className="my-3 h-px bg-gray-100 dark:bg-gray-800" />}
                <div className="space-y-0.5">
                  {group.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                        location.pathname === item.path
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </React.Fragment>
            ))}
          </nav>

          {/* Help & Legal Links */}
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Link to="/help" className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium">
                <HelpCircle className="w-3 h-3" /> Help
              </Link>
              <span className="text-gray-300 dark:text-gray-700">·</span>
              <Link to="/privacy" className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium">
                <Shield className="w-3 h-3" /> Privacy
              </Link>
              <span className="text-gray-300 dark:text-gray-700">·</span>
              <Link to="/terms" className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium">
                Terms
              </Link>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center leading-relaxed">
              Created by <span className="font-semibold text-gray-500 dark:text-gray-500">Nilesh Barela</span>
              <br />Founder, <a href="https://hackifypro.com" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 font-semibold">HackifyPro</a>
            </p>
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {profile?.full_name || 'Student'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {profile?.email || ''}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleTheme}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-medium"
                  >
                    {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
                    {isDark ? 'Light' : 'Dark'}
                  </button>
                  <button
                    onClick={signOut}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-medium"
                >
                  {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
                  {isDark ? 'Light' : 'Dark'}
                </button>
                <Link
                  to="/login"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Floating AI Chat Widget */}
      <FloatingAiChat />

      {/* WhatsApp Help Button */}
      <a
        href="https://wa.me/917414935405?text=Hi%2C%20I%20need%20help%20with%20STUNIVOZ"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white pl-3 pr-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="text-sm font-semibold hidden sm:inline">Need Help?</span>
      </a>

      {/* Main Content */}
      <main className="lg:pl-72 pt-16 lg:pt-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search internships, events, courses..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>
            <Link to="/notifications" className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-all">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
            <Link to="/community" className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1" />
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1 rounded-xl transition-all">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden xl:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">{profile?.full_name || 'Student'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Student</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
};
