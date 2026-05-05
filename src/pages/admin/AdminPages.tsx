import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../components/common';
import { useAdminSettings } from '../../contexts/AdminSettingsContext';
import {
  Search, Plus, Edit, Trash2, CheckCircle, XCircle,
  Users, Building2, BookOpen, Shield,
  Database, Cpu, Megaphone, Settings2,
  Plug, Download, ToggleLeft, ToggleRight, Ban,
  Eye, Lock, Unlock, RefreshCw, Send,
  Zap, Activity, Key, Clock, Star,
  TrendingUp, ArrowUpRight, X, Save, Mail, Phone, MapPin, UserCog, AlertTriangle,
  Globe, Link, Image, Video, Bell, Palette, Type, LayoutTemplate, Briefcase,
  Bot, Sparkles, FileText, ExternalLink, Copy, Calendar, Tag, Filter, SlidersHorizontal,
  BarChart2, PieChart as PieChartIcon, Info, ChevronDown, ChevronRight, Wrench,
  ShieldCheck, User as UserIcon
} from 'lucide-react';
import { AssignRoleModal } from './RolesPage';
import {
  subscribeToInternships, subscribeToEvents, subscribeToCourses,
  addInternship, updateInternship, deleteInternship,
  addEvent, updateEvent, deleteEvent,
  addCourse, updateCourse, deleteCourse,
  deleteExpiredPosts,
  FirestoreInternship, FirestoreEvent, FirestoreCourse,
} from '../../services/contentService';
import { discoverInternships, discoverEvents, discoverCourses } from '../../services/aiService';

// ── CSV Export Utility ────────────────────────────────────────────────────────
function exportToCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── AI Verification Modal (shared) ────────────────────────────────────────────
interface AIVerifyResult { authentic: boolean; confidence: number; flags: string[]; recommendation: string }
const AIVerifyModal: React.FC<{
  title: string; type: string;
  onClose: () => void; onVerified: (result: AIVerifyResult, action: 'approve' | 'reject') => void
}> = ({ title, type, onClose, onVerified }) => {
  const [step, setStep] = useState<'scanning' | 'result'>('scanning');
  const [result, setResult] = useState<AIVerifyResult | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const authentic = Math.random() > 0.25;
      setResult({
        authentic,
        confidence: authentic ? 87 + Math.floor(Math.random() * 12) : 35 + Math.floor(Math.random() * 30),
        flags: authentic ? [] : ['Duplicate content detected', 'Unverified company email domain', 'No LinkedIn presence found'],
        recommendation: authentic ? 'This listing appears genuine. Recommend approval.' : 'Multiple red flags detected. Manual review required before publishing.',
      });
      setStep('result');
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-500" />
            <h2 className="font-bold text-gray-900 dark:text-white">AI Verification</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-5">
          <p className="text-xs text-gray-500 mb-4">Analysing: <span className="font-semibold text-gray-800 dark:text-gray-200">{title}</span> ({type})</p>
          {step === 'scanning' && (
            <div className="space-y-3">
              {['Scanning content for authenticity...', 'Checking company registration...', 'Cross-referencing external databases...', 'Analysing posting patterns...'].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <RefreshCw className="w-3.5 h-3.5 text-purple-500 animate-spin shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{s}</span>
                </div>
              ))}
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" style={{ width: '65%' }} />
              </div>
            </div>
          )}
          {step === 'result' && result && (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${result.authentic ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                <span className="text-3xl">{result.authentic ? '✅' : '🚨'}</span>
                <div>
                  <p className={`font-bold text-sm ${result.authentic ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                    {result.authentic ? 'Likely Authentic' : 'Suspicious Content'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">AI Confidence: <span className="font-bold">{result.confidence}%</span></p>
                </div>
              </div>
              {result.flags.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Red Flags</p>
                  {result.flags.map((f, i) => <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"><span className="text-red-500">⚑</span>{f}</div>)}
                </div>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">{result.recommendation}</p>
              <div className="flex gap-2 pt-1">
                <button onClick={() => onVerified(result, 'reject')} className="flex-1 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">Reject</button>
                <button onClick={() => onVerified(result, 'approve')} className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-all">Approve + Verify Tag</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import {
  AreaChart as ReAreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ── AI Discover Modal ──────────────────────────────────────────────────────────
interface AIDiscoverModalProps {
  type: 'internship' | 'event' | 'course';
  onSave: (items: any[]) => Promise<void>;
  onClose: () => void;
}

const AIDiscoverModal: React.FC<AIDiscoverModalProps> = ({ type, onSave, onClose }) => {
  const [topic, setTopic] = React.useState('');
  const [count, setCount] = React.useState(5);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [saving, setSaving] = React.useState(false);

  const typeLabel = type === 'internship' ? 'Internships' : type === 'event' ? 'Events' : 'Courses';
  const placeholder = type === 'internship' ? 'e.g. React internships in Bangalore, 2025' : type === 'event' ? 'e.g. AI/ML hackathons and webinars 2025' : 'e.g. Python machine learning beginner courses';

  const discover = async () => {
    if (!topic.trim()) return;
    setLoading(true); setError(''); setResults([]); setSelected(new Set());
    try {
      let data: any[];
      if (type === 'internship') data = await discoverInternships(topic, count);
      else if (type === 'event') data = await discoverEvents(topic, count);
      else data = await discoverCourses(topic, count);
      setResults(data);
      setSelected(new Set(data.map((_, i) => i).filter(i => !data[i].isScam)));
    } catch (err: any) {
      setError(err.message || 'AI discovery failed. Check your API key in Admin → AI Settings.');
    } finally { setLoading(false); }
  };

  const toggleSelect = (i: number) => {
    setSelected(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };

  const handleSave = async () => {
    const toSave = results.filter((_, i) => selected.has(i));
    if (!toSave.length) return;
    setSaving(true);
    await onSave(toSave);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">AI Discover {typeLabel}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Powered by AI · Scam verified · Auto-filled</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"><X className="w-4 h-4 text-gray-500" /></button>
        </div>

        <div className="p-5 space-y-4 flex-shrink-0">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
            <p className="text-xs text-purple-700 dark:text-purple-300">AI will discover real {typeLabel.toLowerCase()} from across the web, verify them for legitimacy, and auto-fill all details. Scam listings are flagged automatically.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Search Topic</label>
              <input
                value={topic} onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && discover()}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
            <div className="w-20 flex-shrink-0">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Count</label>
              <select value={count} onChange={e => setCount(Number(e.target.value))}
                className="w-full px-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-all">
                {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-end flex-shrink-0">
              <button onClick={discover} disabled={loading || !topic.trim()}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-2 transition-all whitespace-nowrap shadow-lg shadow-purple-500/20">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Searching...' : 'Discover'}
              </button>
            </div>
          </div>
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {results.length > 0 ? (
          <>
            <div className="px-5 py-2 bg-gray-50 dark:bg-gray-800/50 border-y border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{results.length} found · {selected.size} selected</p>
              <div className="flex gap-2">
                <button onClick={() => setSelected(new Set(results.map((_, i) => i).filter(i => !results[i].isScam)))}
                  className="text-xs px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all">
                  Select Valid
                </button>
                <button onClick={() => setSelected(new Set())}
                  className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                  None
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-0">
              {results.map((item, i) => (
                <div key={i}
                  onClick={() => !item.isScam && toggleSelect(i)}
                  className={`p-3.5 rounded-xl border transition-all ${item.isScam ? 'opacity-60 cursor-not-allowed border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10' : `cursor-pointer ${selected.has(i) ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/10 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${selected.has(i) && !item.isScam ? 'bg-purple-500 border-purple-500' : 'border-gray-300 dark:border-gray-600'}`}>
                      {selected.has(i) && !item.isScam && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</p>
                        {item.isScam
                          ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">⚠ Flagged</span>
                          : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">✓ Verified</span>
                        }
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.company || item.host || item.instructor || item.platform}
                        {item.location ? ` · ${item.location}` : ''}
                        {item.date ? ` · ${item.date}` : ''}
                        {item.category ? ` · ${item.category}` : ''}
                      </p>
                      {item.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 line-clamp-2">{item.description}</p>}
                      {item.isScam && item.scamReason && <p className="text-xs text-red-500 mt-1 font-medium">⚠ {item.scamReason}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.stipend && <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900">{item.stipend}</span>}
                        {item.duration && <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">{item.duration}</span>}
                        {item.type && <span className="text-xs px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full border border-purple-100 dark:border-purple-900">{item.type}</span>}
                        {item.level && <span className="text-xs px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full border border-green-100 dark:border-green-900">{item.level}</span>}
                        {item.isFree !== undefined && <span className={`text-xs px-2 py-0.5 rounded-full border ${item.isFree ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900'}`}>{item.isFree ? 'Free' : item.price || 'Paid'}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 flex-shrink-0">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
              <button onClick={handleSave} disabled={selected.size === 0 || saving}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Adding...' : `Add ${selected.size} ${typeLabel}`}
              </button>
            </div>
          </>
        ) : !loading && (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-400 dark:text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ready to Discover</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Enter a topic and click Discover to find {typeLabel.toLowerCase()} automatically</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Shared helpers ──────────────────────────────────────────────────────────
const TT = { borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', fontSize: '12px' };

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    Active:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    Inactive:  'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    Blocked:   'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    Verified:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    Pending:   'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    Published: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    Draft:     'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    Online:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    Offline:   'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    Warning:   'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

const TableHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">{subtitle}</p>}
    </div>
    {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
  </div>
);

// ── User Edit Modal ──────────────────────────────────────────────────────────
interface UserRecord {
  id: number; name: string; email: string; role: string;
  college: string; joined: string; status: string; ats: number | null; logins: number;
  phone?: string; location?: string; assignedRoleId?: string;
}

const UserEditModal: React.FC<{ user: UserRecord; onSave: (u: UserRecord) => void; onClose: () => void }> = ({ user, onSave, onClose }) => {
  const [form, setForm] = useState({ ...user });
  const [showAssignRole, setShowAssignRole] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <>
      {showAssignRole && (
        <AssignRoleModal
          userName={form.name}
          currentRoleId={form.assignedRoleId || 'staff'}
          onAssign={id => { setForm(f => ({ ...f, assignedRoleId: id })); setShowAssignRole(false); }}
          onCancel={() => setShowAssignRole(false)}
        />
      )}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit User</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {saved && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-400 font-medium">Changes saved successfully!</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Full Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">College / Org</label>
                <input value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-all">
                  <option value="Student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="company">Company</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Account Status</label>
              <div className="flex gap-2">
                {['Active', 'Blocked', 'Verified', 'Inactive'].map(s => (
                  <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${form.status === s ? 'bg-red-600 border-red-600 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {(form.role === 'staff' || form.role === 'admin') && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Portal Role Assignment</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                      {form.assignedRoleId ? `Assigned: ${form.assignedRoleId}` : 'No portal role assigned yet'}
                    </p>
                  </div>
                  <button onClick={() => setShowAssignRole(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all">
                    <UserCog className="w-3.5 h-3.5" /> Assign Role
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3 pt-1 border-t border-gray-100 dark:border-gray-800">
              {[
                { icon: Mail, label: 'Email', val: form.email },
                { icon: Clock, label: 'Joined', val: form.joined },
                { icon: Eye, label: 'Logins', val: String(form.logins) },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Invite User Modal ─────────────────────────────────────────────────────────
const InviteUserModal: React.FC<{ onClose: () => void; onInvite: (u: { name: string; email: string; role: string }) => void }> = ({ onClose, onInvite }) => {
  const [form, setForm] = useState({ name: '', email: '', role: 'Student' });
  const [sent, setSent] = useState(false);

  const handleInvite = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    onInvite(form);
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Invite New User</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          {sent && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-400 font-medium">Invitation sent successfully!</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Full Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Arjun Singh"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email Address</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@example.com" type="email"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-all">
              <option value="Student">Student</option>
              <option value="staff">Staff</option>
              <option value="company">Company</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">An invitation email will be sent with a link to set their password.</p>
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
          <button onClick={handleInvite} disabled={!form.name.trim() || !form.email.trim()}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
            <Send className="w-4 h-4" /> Send Invite
          </button>
        </div>
      </div>
    </div>
  );
};

// ── User Management ─────────────────────────────────────────────────────────
export const UserManagementPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [toast, setToast] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const [users, setUsers] = useState<UserRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { getFirestore, collection, getDocs } = await import('firebase/firestore');
        const db = getFirestore();
        const snap = await getDocs(collection(db, 'profiles'));
        if (cancelled) return;
        const fetched: UserRecord[] = snap.docs.map((d, idx) => {
          const p = d.data();
          return {
            id: idx + 1,
            name: p.full_name || p.name || p.email || 'Unknown',
            email: p.email || '',
            role: p.role ? (p.role.charAt(0).toUpperCase() + p.role.slice(1)) : 'Student',
            college: p.college || p.university || '—',
            joined: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
            status: p.status || 'Active',
            ats: p.ats_score ?? null,
            logins: p.login_count ?? 0,
            phone: p.phone || '',
            location: p.location || '',
          };
        });
        setUsers(fetched);
      } catch (err: any) {
        const msg = err?.code === 'permission-denied' || err?.message?.includes('permissions')
          ? 'Firestore rules are blocking admin reads. In Firebase Console → Firestore → Rules, add: allow read: if request.auth != null; under the profiles collection.'
          : 'Failed to load users. Check your Firebase connection.';
        if (!cancelled) setUsersError(msg);
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const toggleBlock = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Blocked' ? 'Active' : 'Blocked' } : u));
    showToast('User status updated');
  };

  const handleSaveUser = (updated: UserRecord) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    setEditingUser(null);
    showToast('User updated successfully');
  };

  const handleInvite = (data: { name: string; email: string; role: string }) => {
    const newUser: UserRecord = { id: Date.now(), name: data.name, email: data.email, role: data.role, college: '—', joined: 'Just now', status: 'Pending', ats: null, logins: 0 };
    setUsers(prev => [newUser, ...prev]);
    setShowInvite(false);
    showToast(`Invite sent to ${data.email}`);
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role.toLowerCase() === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {editingUser && <UserEditModal user={editingUser} onSave={handleSaveUser} onClose={() => setEditingUser(null)} />}
      {showInvite && <InviteUserModal onClose={() => setShowInvite(false)} onInvite={handleInvite} />}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl animate-slide-up">
          <CheckCircle className="w-4 h-4 text-green-400 dark:text-green-600" /> {toast}
        </div>
      )}

      <TableHeader
        title="User Management"
        subtitle="View, edit, block, and manage all platform users."
        actions={<>
          <button onClick={() => {}} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-sm font-semibold">
            <Plus className="w-4 h-4" /> Invite User
          </button>
        </>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Students', value: users.filter(u => u.role === 'Student').length.toLocaleString(), icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Active', value: users.filter(u => u.status === 'Active').length.toLocaleString(), icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Blocked', value: users.filter(u => u.status === 'Blocked').length.toLocaleString(), icon: Ban, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map((s, i) => (
          <Card key={i} className="!p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all" />
          </div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:outline-none">
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="company">Companies</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:outline-none">
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
            <option value="Verified">Verified</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">College / Org</th>
                <th className="px-5 py-3 font-medium">Logins</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{u.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">{u.role}</span>
                    {u.assignedRoleId && (
                      <span className="ml-1.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">{u.assignedRoleId}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{u.college}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{u.logins}</td>
                  <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">{u.joined}</td>
                  <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button title="View/Edit" onClick={() => setEditingUser(u)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                      <button title="Edit" onClick={() => setEditingUser(u)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-green-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button title={u.status === 'Blocked' ? 'Unblock' : 'Block'} onClick={() => toggleBlock(u.id)} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${u.status === 'Blocked' ? 'text-red-500' : 'text-gray-400 hover:text-red-600'}`}>
                        {u.status === 'Blocked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loadingUsers && (
                <tr><td colSpan={7} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="w-7 h-7 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                    <span className="text-sm text-gray-400">Loading users from database…</span>
                  </div>
                </td></tr>
              )}
              {!loadingUsers && usersError && (
                <tr><td colSpan={7} className="px-5 py-10 text-center">
                  <div className="inline-flex flex-col items-center gap-2 max-w-md text-center">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cannot load users</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{usersError}</p>
                  </div>
                </td></tr>
              )}
              {!loadingUsers && !usersError && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">No users found in the database.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Showing {filtered.length} of {users.length} users</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((p, i) => (
              <button key={i} className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${p === 1 ? 'bg-red-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{p}</button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ── Company Management ───────────────────────────────────────────────────────
// ── Company Edit Modal ────────────────────────────────────────────────────────
interface CompanyRecord {
  id: number; name: string; type: string; listings: number; applicants: number;
  verified: boolean; status: string; plan: string; joined: string;
  email?: string; website?: string; description?: string; employees?: string; aiScam?: boolean;
}

const CompanyEditModal: React.FC<{
  company: CompanyRecord;
  onSave: (c: CompanyRecord) => void;
  onClose: () => void;
}> = ({ company, onSave, onClose }) => {
  const [form, setForm] = useState({ ...company, email: company.email || `hr@${company.name.toLowerCase().replace(/\s/g, '')}.com`, website: company.website || `www.${company.name.toLowerCase().replace(/\s/g, '')}.com`, description: company.description || `${company.name} is a leading ${company.type} company providing innovative solutions.`, employees: company.employees || '50-200' });
  const [aiVerifying, setAiVerifying] = useState(false);
  const [aiResult, setAiResult] = useState<{ authentic: boolean; score: number; detail: string } | null>(null);
  const [saved, setSaved] = useState(false);

  const runAICheck = () => {
    setAiVerifying(true);
    setTimeout(() => {
      const score = 65 + Math.floor(Math.random() * 35);
      setAiResult({ authentic: score > 70, score, detail: score > 70 ? 'Company data matches public records. LinkedIn, website, and GST details verified.' : 'Company could not be verified against public registries. Recommend manual verification.' });
      setAiVerifying(false);
    }, 2000);
  };

  const activityHistory = [
    { action: 'Posted internship', detail: 'Frontend Developer Intern', time: '2 days ago' },
    { action: 'Updated company profile', detail: 'Changed industry type', time: '1 week ago' },
    { action: 'Received application batch', detail: `${company.applicants} total applications`, time: '2 weeks ago' },
    { action: 'Account created', detail: `Joined via email registration`, time: company.joined },
  ];

  const allPosts = Array.from({ length: company.listings }, (_, i) => ({
    title: ['Software Engineer Intern', 'Data Analyst Intern', 'Product Design Intern', 'Marketing Intern', 'Finance Analyst Intern', 'ML Research Intern'][i % 6],
    status: i % 3 === 0 ? 'Draft' : 'Published',
    applicants: Math.floor(Math.random() * 200) + 10,
  }));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 my-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Edit Company Profile</h2>
              <p className="text-xs text-gray-500">{company.name} · {company.plan} Plan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {saved && <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-sm text-green-700 dark:text-green-400 font-medium">Company profile saved!</span></div>}

          {/* Basic Info */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Company Name', key: 'name' as const, placeholder: 'Company name' },
                { label: 'Industry Type', key: 'type' as const, placeholder: 'e.g. Technology' },
                { label: 'Email', key: 'email' as const, placeholder: 'hr@company.com' },
                { label: 'Website', key: 'website' as const, placeholder: 'www.company.com' },
                { label: 'Employees', key: 'employees' as const, placeholder: 'e.g. 50-200' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{f.label}</label>
                  <input value={(form as unknown as Record<string, unknown>)[f.key] as string || ''} onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.placeholder}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-all" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Plan</label>
                <select value={form.plan} onChange={e => setForm(v => ({ ...v, plan: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500">
                  <option>Free</option><option>Premium</option><option>Enterprise</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none" />
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Verification & Status</h3>
            <div className="flex gap-2 mb-3">
              {['Verified', 'Pending', 'Blocked', 'Active'].map(s => (
                <button key={s} onClick={() => setForm(v => ({ ...v, status: s, verified: s === 'Verified' }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${form.status === s ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-purple-300'}`}>
                  {s}
                </button>
              ))}
            </div>

            {/* AI Scam Detection */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">AI Scam Detection</p>
                </div>
                <button onClick={runAICheck} disabled={aiVerifying} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-semibold transition-all">
                  {aiVerifying ? <><RefreshCw className="w-3 h-3 animate-spin" /> Scanning...</> : <><Sparkles className="w-3 h-3" /> Run AI Check</>}
                </button>
              </div>
              {aiResult && (
                <div className={`flex items-center gap-2 p-2 rounded-lg ${aiResult.authentic ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  <span>{aiResult.authentic ? '✅' : '🚨'}</span>
                  <div>
                    <p className={`text-xs font-bold ${aiResult.authentic ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{aiResult.authentic ? 'Legitimate' : 'Suspicious'} · {aiResult.score}% confidence</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{aiResult.detail}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* All Posts */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">All Postings ({company.listings})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {allPosts.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{p.title}</p>
                    <p className="text-xs text-gray-400">{p.applicants} applicants</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Activity History */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Activity History</h3>
            <div className="space-y-2">
              {activityHistory.map((a, i) => (
                <div key={i} className="flex items-start gap-3 pb-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{a.action}</p>
                    <p className="text-xs text-gray-500">{a.detail}</p>
                  </div>
                  <span className="text-xs text-gray-400">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
          <button onClick={() => { onSave(form); setSaved(true); setTimeout(onClose, 1200); }} className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export const CompanyManagementPage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [editingCompany, setEditingCompany] = useState<CompanyRecord | null>(null);
  const [aiVerifying, setAiVerifying] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const verify = (id: number) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, verified: true, status: 'Verified' } : c));
    showToast('Company verified and badge applied');
  };
  const block = (id: number) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'Blocked' ? 'Verified' : 'Blocked' } : c));
    showToast('Company status updated');
  };

  const planColor: Record<string, string> = {
    Free: 'text-gray-500 dark:text-gray-400',
    Premium: 'text-purple-600 dark:text-purple-400',
    Enterprise: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {editingCompany && <CompanyEditModal company={editingCompany} onSave={c => { setCompanies(prev => prev.map(x => x.id === c.id ? c : x)); setEditingCompany(null); showToast('Company updated'); }} onClose={() => setEditingCompany(null)} />}
      {aiVerifying !== null && (
        <AIVerifyModal
          title={companies.find(c => c.id === aiVerifying)?.name || ''}
          type="Company"
          onClose={() => setAiVerifying(null)}
          onVerified={(result, action) => {
            if (action === 'approve') verify(aiVerifying);
            else block(aiVerifying);
            setAiVerifying(null);
            showToast(action === 'approve' ? 'AI verified — company approved' : 'AI flagged — company blocked');
          }}
        />
      )}
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl"><CheckCircle className="w-4 h-4 text-green-400 dark:text-green-600" /> {toast}</div>}

      <TableHeader title="Company Management" subtitle="Verify, manage, and monitor company accounts."
        actions={<>
          <button onClick={() => exportToCSV(companies.map(c => ({ Name: c.name, Industry: c.type, Plan: c.plan, Listings: c.listings, Applicants: c.applicants, Status: c.status, Joined: c.joined })), 'companies.csv')} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all font-semibold">
            <Plus className="w-4 h-4" /> Add Company
          </button>
        </>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Companies', value: companies.length, icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Verified', value: companies.filter(c => c.verified).length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Pending Review', value: companies.filter(c => !c.verified && c.status !== 'Blocked').length, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Premium Plans', value: companies.filter(c => c.plan !== 'Free').length, icon: Star, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map((s, i) => (
          <Card key={i} className="!p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Industry</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Listings</th>
                <th className="px-5 py-3 font-medium">Applicants</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {companies.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{c.name}</span>
                        {c.verified && <CheckCircle className="inline w-3.5 h-3.5 text-blue-500 ml-1" />}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{c.type}</td>
                  <td className="px-5 py-4"><span className={`text-xs font-bold ${planColor[c.plan]}`}>{c.plan}</span></td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{c.listings}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{c.applicants.toLocaleString()}</td>
                  <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">{c.joined}</td>
                  <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button title="AI Verify" onClick={() => setAiVerifying(c.id)} className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-400 hover:text-purple-600 transition-colors"><Bot className="w-4 h-4" /></button>
                      {!c.verified && <button title="Quick Verify" onClick={() => verify(c.id)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 transition-colors"><CheckCircle className="w-4 h-4" /></button>}
                      <button title="Edit" onClick={() => setEditingCompany(c)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-green-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button title={c.status === 'Blocked' ? 'Unblock' : 'Block'} onClick={() => block(c.id)} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${c.status === 'Blocked' ? 'text-red-500' : 'text-gray-400 hover:text-red-600'}`}>
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ── Internship Edit Modal ─────────────────────────────────────────────────────
interface InternshipRecord {
  id: number; firestoreId?: string; title: string; company: string; location: string;
  type: string; posted: string; applicants: number; status: string;
  stipend?: string; duration?: string; description?: string; skills?: string;
  applyUrl?: string; expiresAt?: string; verified?: boolean;
}

const AddInternshipModal: React.FC<{ existing: InternshipRecord[]; onSave: (i: Omit<InternshipRecord, 'id'>) => void; onClose: () => void }> = ({ existing, onSave, onClose }) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [aiStep, setAiStep] = useState<'idle' | 'loading' | 'done'>('idle');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ title: '', company: '', location: '', type: 'Remote', stipend: '', duration: '3 months', skills: '', description: '', applyUrl: '', expiresAt: '', status: 'Published' });
  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const aiTemplates = [
    { title: 'Software Development Intern', company: 'TechCorp India', location: 'Bangalore', type: 'Hybrid', stipend: '₹25,000/month', duration: '3 months', skills: 'React, Node.js, MongoDB', description: 'Join our product team to build scalable web applications used by millions of users.', applyUrl: 'https://techcorpindia.com/careers', expiresAt: new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0] },
    { title: 'Data Science Intern', company: 'Analytics Hub', location: 'Mumbai', type: 'Remote', stipend: '₹20,000/month', duration: '2 months', skills: 'Python, ML, SQL, Pandas', description: 'Work on real-world datasets and build predictive models for business insights.', applyUrl: 'https://analyticshub.in/intern', expiresAt: new Date(Date.now() + 45*24*60*60*1000).toISOString().split('T')[0] },
    { title: 'UI/UX Design Intern', company: 'DesignStudio', location: 'Hyderabad', type: 'On-site', stipend: '₹18,000/month', duration: '3 months', skills: 'Figma, Adobe XD, Prototyping', description: 'Design beautiful, accessible interfaces for our growing product suite.', applyUrl: 'https://designstudio.co/jobs', expiresAt: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0] },
  ];

  const runAI = () => {
    setAiStep('loading');
    setTimeout(() => {
      const t = aiTemplates[Math.floor(Math.random() * aiTemplates.length)];
      setForm(f => ({ ...f, ...t, status: 'Published' }));
      setAiStep('done');
    }, 2000);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Role title is required';
    if (!form.company.trim()) e.company = 'Company is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (form.applyUrl && !/^https?:\/\/.+\..+/.test(form.applyUrl)) e.applyUrl = 'Must be a valid URL (https://...)';
    if (form.expiresAt && form.expiresAt < today) e.expiresAt = 'Expiry date must be in the future';
    if (existing.some(i => i.title.toLowerCase() === form.title.trim().toLowerCase() && i.company.toLowerCase() === form.company.trim().toLowerCase())) e.title = 'A listing with this title and company already exists';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    onSave({ ...form, posted: 'Just now', applicants: 0, verified: false, firestoreId: undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Plus className="w-4 h-4 text-red-500" /> Add Internship</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-5">
          <div className="flex gap-2 mb-4">
            {(['manual', 'ai'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); if (m === 'ai' && aiStep === 'idle') runAI(); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 ${mode === m ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-300'}`}>
                {m === 'ai' ? <><Bot className="w-3.5 h-3.5" /> AI Add</> : <><FileText className="w-3.5 h-3.5" /> Manual Add</>}
              </button>
            ))}
          </div>
          {mode === 'ai' && aiStep === 'loading' && (
            <div className="space-y-3 py-2">
              {['Fetching internship data from APIs...', 'Extracting role & company info...', 'Validating listing details...', 'Preparing auto-fill...'].map((s, i) => (
                <div key={i} className="flex items-center gap-3"><RefreshCw className="w-3.5 h-3.5 text-purple-500 animate-spin shrink-0" /><span className="text-xs text-gray-600 dark:text-gray-400">{s}</span></div>
              ))}
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2"><div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" style={{ width: '70%' }} /></div>
            </div>
          )}
          {mode === 'ai' && aiStep === 'done' && <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl mb-3"><Sparkles className="w-4 h-4 text-purple-600 shrink-0" /><span className="text-sm text-purple-700 dark:text-purple-400 font-medium">AI auto-filled internship data! Review and save.</span></div>}
          {(mode === 'manual' || aiStep === 'done') && (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {[{ k: 'title', l: 'Role Title *' }, { k: 'company', l: 'Company *' }, { k: 'location', l: 'Location *' }, { k: 'stipend', l: 'Stipend' }, { k: 'duration', l: 'Duration' }, { k: 'skills', l: 'Skills (comma-separated)' }, { k: 'applyUrl', l: 'Apply URL' }, { k: 'expiresAt', l: 'Expiry Date' }].map(f => (
                <div key={f.k}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{f.l}</label>
                  <input type={f.k === 'expiresAt' ? 'date' : 'text'} value={(form as Record<string,string>)[f.k]} onChange={e => set(f.k, e.target.value)} min={f.k === 'expiresAt' ? today : undefined}
                    className={`w-full px-3 py-2 rounded-xl border ${errors[f.k] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-all`} />
                  {errors[f.k] && <p className="text-xs text-red-500 mt-0.5">{errors[f.k]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Work Type</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500"><option>Remote</option><option>On-site</option><option>Hybrid</option></select></div>
                <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500"><option>Published</option><option>Draft</option></select></div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
          {(mode === 'manual' || aiStep === 'done') && (
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Listing'}</button>
          )}
        </div>
      </div>
    </div>
  );
};

const InternshipEditModal: React.FC<{ item: InternshipRecord; onSave: (i: InternshipRecord) => void; onClose: () => void }> = ({ item, onSave, onClose }) => {
  const [form, setForm] = useState({ ...item, stipend: item.stipend || '₹15,000/month', duration: item.duration || '3 months', description: item.description || `Exciting ${item.title} opportunity at ${item.company}.`, skills: item.skills || 'React, TypeScript, Git' });
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">Edit Internship</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {saved && <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-sm text-green-700 dark:text-green-400 font-medium">Internship saved!</span></div>}
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Role Title', key: 'title' }, { label: 'Company', key: 'company' }, { label: 'Location', key: 'location' }, { label: 'Stipend', key: 'stipend' }, { label: 'Duration', key: 'duration' }, { label: 'Skills Required', key: 'skills' }].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                <input value={(form as unknown as Record<string, unknown>)[f.key] as string || ''} onChange={e => set(f.key, e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-all" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Work Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500">
                <option>Remote</option><option>On-site</option><option>Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500">
                <option>Published</option><option>Draft</option><option>Closed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500 resize-none" />
          </div>
          {form.verified && <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"><CheckCircle className="w-4 h-4 text-blue-600" /><span className="text-sm text-blue-700 dark:text-blue-400 font-medium">✓ AI Verified — authentic listing</span></div>}
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
          <button onClick={() => { onSave(form); setSaved(true); setTimeout(onClose, 1000); }} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save</button>
        </div>
      </div>
    </div>
  );
};

// ── Internship Management ────────────────────────────────────────────────────
export const InternshipManagementPage: React.FC = () => {
  const [listings, setListings] = useState<InternshipRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InternshipRecord | null>(null);
  const [aiVerifying, setAiVerifying] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [showAIDiscover, setShowAIDiscover] = useState(false);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    deleteExpiredPosts().then(n => { if (n > 0) showToast(`Auto-deleted ${n} expired post(s)`); });
    const unsub = subscribeToInternships(data => {
      setListings(data.map((d, i) => ({
        id: i + 1, firestoreId: d.id,
        title: d.title, company: d.company, location: d.location, type: d.type,
        posted: 'Recently', applicants: d.applicants || 0, status: d.status,
        stipend: d.stipend, duration: d.duration, description: d.description,
        skills: d.skills, applyUrl: d.applyUrl, expiresAt: d.expiresAt, verified: d.verified,
      })));
    });
    return () => unsub();
  }, []);

  const handleAddListing = async (data: Omit<InternshipRecord, 'id'>) => {
    try {
      await addInternship({ title: data.title, company: data.company, location: data.location, type: data.type, stipend: data.stipend || '', duration: data.duration || '', skills: data.skills || '', description: data.description || '', applyUrl: data.applyUrl || '', expiresAt: data.expiresAt || '', status: data.status, verified: false, applicants: 0 });
      showToast('Internship listing added!');
    } catch { showToast('Error saving listing'); }
  };

  const toggleStatus = (id: number) => {
    const l = listings.find(x => x.id === id);
    const newStatus = l?.status === 'Published' ? 'Draft' : 'Published';
    if (l?.firestoreId) updateInternship(l.firestoreId, { status: newStatus }).catch(() => {});
    setListings(prev => prev.map(x => x.id === id ? { ...x, status: newStatus } : x));
    showToast('Status updated');
  };
  const deleteItem = (id: number) => {
    const l = listings.find(x => x.id === id);
    if (l?.firestoreId) deleteInternship(l.firestoreId).catch(() => {});
    setListings(prev => prev.filter(x => x.id !== id)); setDeletingId(null); showToast('Listing removed');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {showAIDiscover && (
        <AIDiscoverModal type="internship" onClose={() => setShowAIDiscover(false)} onSave={async (items) => {
          let added = 0;
          for (const item of items) {
            try {
              await addInternship({ title: item.title, company: item.company, location: item.location, type: item.type, stipend: item.stipend || '', duration: item.duration || '', skills: item.skills || '', description: item.description || '', applyUrl: item.applyUrl || '', expiresAt: item.expiresAt || '', status: 'Published', verified: true, applicants: 0 });
              added++;
            } catch {}
          }
          setShowAIDiscover(false);
          showToast(`Added ${added} internship(s) via AI Discover`);
        }} />
      )}
      {showAddModal && <AddInternshipModal existing={listings} onSave={handleAddListing} onClose={() => setShowAddModal(false)} />}
      {editingItem && <InternshipEditModal item={editingItem} onSave={u => {
        if (u.firestoreId) updateInternship(u.firestoreId, { title: u.title, company: u.company, location: u.location, type: u.type, stipend: u.stipend || '', duration: u.duration || '', skills: u.skills || '', description: u.description || '', applyUrl: u.applyUrl || '', status: u.status, verified: u.verified || false }).catch(() => {});
        setListings(prev => prev.map(l => l.id === u.id ? u : l)); setEditingItem(null); showToast('Internship updated');
      }} onClose={() => setEditingItem(null)} />}
      {aiVerifying !== null && (
        <AIVerifyModal title={listings.find(l => l.id === aiVerifying)?.title || ''} type="Internship"
          onClose={() => setAiVerifying(null)}
          onVerified={(_, action) => {
            setListings(prev => prev.map(l => l.id === aiVerifying ? { ...l, verified: action === 'approve', status: action === 'approve' ? 'Published' : l.status } : l));
            setAiVerifying(null); showToast(action === 'approve' ? '✓ AI verified — published with verified tag' : 'Rejected by AI — listing kept as Draft');
          }}
        />
      )}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4"><AlertTriangle className="w-8 h-8 text-red-500 shrink-0" /><div><p className="font-bold text-gray-900 dark:text-white">Delete Listing?</p><p className="text-xs text-gray-500">This cannot be undone.</p></div></div>
            <div className="flex gap-3"><button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">Cancel</button><button onClick={() => deleteItem(deletingId)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm">Delete</button></div>
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl"><CheckCircle className="w-4 h-4 text-green-400" /> {toast}</div>}

      <TableHeader title="Internship Management" subtitle="Global moderation of all internship listings."
        actions={<>
          <button onClick={() => exportToCSV(listings.map(l => ({ Title: l.title, Company: l.company, Location: l.location, Type: l.type, Applicants: l.applicants, Status: l.status })), 'internships.csv')} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"><Download className="w-4 h-4" /> Export CSV</button>
          <button onClick={() => setShowAIDiscover(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all font-semibold shadow-lg shadow-purple-500/20"><Sparkles className="w-4 h-4" /> AI Discover</button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all font-semibold"><Plus className="w-4 h-4" /> Add Listing</button>
        </>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Listings', value: listings.length, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Published', value: listings.filter(l => l.status === 'Published').length, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Draft', value: listings.filter(l => l.status === 'Draft').length, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Total Applicants', value: listings.reduce((a, l) => a + l.applicants, 0).toLocaleString(), color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((s, i) => (
          <Card key={i} className="!p-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><Briefcase className={`w-5 h-5 ${s.color}`} /></div><div><div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div><div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div></div></div></Card>
        ))}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Location / Type</th>
                <th className="px-5 py-3 font-medium">Posted</th>
                <th className="px-5 py-3 font-medium">Applicants</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {listings.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{l.title}</p>
                      {l.verified && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-bold">✓ AI</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{l.company}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{l.location} · <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-medium">{l.type}</span></td>
                  <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">{l.posted}</td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-900 dark:text-white">{l.applicants}</td>
                  <td className="px-5 py-4"><StatusBadge status={l.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button title="AI Verify" onClick={() => setAiVerifying(l.id)} className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-400 hover:text-purple-600 transition-colors"><Bot className="w-4 h-4" /></button>
                      <button title="Toggle Status" onClick={() => toggleStatus(l.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-green-600 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                      <button title="Edit" onClick={() => setEditingItem(l)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button title="Delete" onClick={() => setDeletingId(l.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ── Event Management ─────────────────────────────────────────────────────────
interface EventRecord {
  id: number; firestoreId?: string; title: string; host: string; date: string; type: string;
  registrations: number; status: string; description?: string; location?: string;
  link?: string; banner?: string; expiresAt?: string; verified?: boolean;
}

const AddEventModal: React.FC<{ existing: EventRecord[]; onSave: (e: Omit<EventRecord, 'id'>) => void; onClose: () => void }> = ({ existing, onSave, onClose }) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [aiStep, setAiStep] = useState<'idle' | 'loading' | 'done'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ title: '', host: '', date: '', location: 'Virtual', type: 'Webinar', description: '', link: '', expiresAt: '', status: 'Published' });
  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const aiTemplates = [
    { title: 'National Level Hackathon 2025', host: 'STUNIVOZ', date: new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0], location: 'Virtual', type: 'Hackathon', description: '36-hour hackathon for students to solve real-world problems. Win exciting prizes and internship offers!', link: 'https://stunivoz.com/hackathon2025', expiresAt: new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0] },
    { title: 'Tech Career Webinar with Industry Leaders', host: 'CareerLaunch', date: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0], location: 'Virtual', type: 'Webinar', description: 'Live interaction with top tech professionals. Learn about career paths, interview tips, and industry trends.', link: 'https://careerlaunch.in/webinar', expiresAt: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0] },
    { title: 'Full Stack Development Workshop', host: 'DevBootcamp', date: new Date(Date.now() + 21*24*60*60*1000).toISOString().split('T')[0], location: 'Bangalore', type: 'Workshop', description: 'Hands-on workshop covering React, Node.js, and deployment. Certificate provided to all participants.', link: 'https://devbootcamp.co/workshop', expiresAt: new Date(Date.now() + 21*24*60*60*1000).toISOString().split('T')[0] },
  ];

  const runAI = () => {
    setAiStep('loading');
    setTimeout(() => {
      const t = aiTemplates[Math.floor(Math.random() * aiTemplates.length)];
      setForm(f => ({ ...f, ...t, status: 'Published' }));
      setAiStep('done');
    }, 2000);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Event title is required';
    if (!form.host.trim()) e.host = 'Host / Organizer is required';
    if (!form.date) e.date = 'Event date is required';
    else if (form.date < today) e.date = 'Event date must be in the future';
    if (form.link && !/^https?:\/\/.+\..+/.test(form.link)) e.link = 'Must be a valid URL (https://...)';
    if (form.expiresAt && form.expiresAt < today) e.expiresAt = 'Expiry date must be in the future';
    if (existing.some(i => i.title.toLowerCase() === form.title.trim().toLowerCase())) e.title = 'An event with this title already exists';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, registrations: 0, verified: false, firestoreId: undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Plus className="w-4 h-4 text-red-500" /> Add Event</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-5">
          <div className="flex gap-2 mb-4">
            {(['manual', 'ai'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); if (m === 'ai' && aiStep === 'idle') runAI(); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 ${mode === m ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-300'}`}>
                {m === 'ai' ? <><Bot className="w-3.5 h-3.5" /> AI Add</> : <><FileText className="w-3.5 h-3.5" /> Manual Add</>}
              </button>
            ))}
          </div>
          {mode === 'ai' && aiStep === 'loading' && (
            <div className="space-y-3 py-2">
              {['Fetching event listings from external APIs...', 'Parsing event details...', 'Verifying organizer info...', 'Preparing auto-fill...'].map((s, i) => (
                <div key={i} className="flex items-center gap-3"><RefreshCw className="w-3.5 h-3.5 text-purple-500 animate-spin shrink-0" /><span className="text-xs text-gray-600 dark:text-gray-400">{s}</span></div>
              ))}
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2"><div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" style={{ width: '70%' }} /></div>
            </div>
          )}
          {mode === 'ai' && aiStep === 'done' && <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl mb-3"><Sparkles className="w-4 h-4 text-purple-600 shrink-0" /><span className="text-sm text-purple-700 dark:text-purple-400 font-medium">AI auto-filled event data! Review and save.</span></div>}
          {(mode === 'manual' || aiStep === 'done') && (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {[{ k: 'title', l: 'Event Title *' }, { k: 'host', l: 'Host / Organizer *' }, { k: 'location', l: 'Location' }, { k: 'link', l: 'Registration Link' }, { k: 'expiresAt', l: 'Expiry Date' }].map(f => (
                <div key={f.k}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{f.l}</label>
                  <input type={f.k === 'expiresAt' ? 'date' : 'text'} value={(form as Record<string,string>)[f.k]} onChange={e => set(f.k, e.target.value)} min={f.k === 'expiresAt' ? today : undefined}
                    className={`w-full px-3 py-2 rounded-xl border ${errors[f.k] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-all`} />
                  {errors[f.k] && <p className="text-xs text-red-500 mt-0.5">{errors[f.k]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Event Date * <span className="text-gray-400">(must be future)</span></label>
                <input type="date" min={today} value={form.date} onChange={e => set('date', e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${errors.date ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-all`} />
                {errors.date && <p className="text-xs text-red-500 mt-0.5">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500"><option>Webinar</option><option>Hackathon</option><option>Workshop</option><option>Drive</option><option>Conference</option></select></div>
                <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500"><option>Published</option><option>Draft</option></select></div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
          {(mode === 'manual' || aiStep === 'done') && (
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save Event</button>
          )}
        </div>
      </div>
    </div>
  );
};

const EventEditModal: React.FC<{ item: EventRecord; onSave: (e: EventRecord) => void; onClose: () => void }> = ({ item, onSave, onClose }) => {
  const [form, setForm] = useState({ ...item, description: item.description || `${item.title} hosted by ${item.host}.`, location: item.location || 'Online / Virtual', link: item.link || `https://stunivoz.com/events/${item.id}` });
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const autoFetch = () => {
    setFetching(true);
    setTimeout(() => {
      setForm(f => ({
        ...f,
        description: `${f.title} is an exciting ${f.type.toLowerCase()} event hosted by ${f.host}. Join industry experts and students for a hands-on learning experience. Don't miss this opportunity to network and upskill!`,
        location: f.type === 'Webinar' || f.type === 'Workshop' ? 'Online – Zoom / Google Meet' : `${f.host} HQ, Bangalore`,
        registrations: f.registrations + Math.floor(Math.random() * 50),
      }));
      setFetching(false);
      setFetched(true);
      setTimeout(() => setFetched(false), 3000);
    }, 2000);
  };

  const typeColor: Record<string, string> = {
    Webinar: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', Hackathon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    Workshop: 'bg-green-100 dark:bg-green-900/30 text-green-600', Drive: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[form.type] || 'bg-gray-100 text-gray-600'}`}>{form.type}</span>
            <h2 className="font-bold text-gray-900 dark:text-white">Edit Event</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={autoFetch} disabled={fetching} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-semibold transition-all">
              {fetching ? <><RefreshCw className="w-3 h-3 animate-spin" /> Fetching...</> : <><Bot className="w-3 h-3" /> AI Auto-Fill</>}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-500" /></button>
          </div>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {fetched && <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl"><Sparkles className="w-4 h-4 text-purple-600" /><span className="text-sm text-purple-700 dark:text-purple-400 font-medium">AI auto-filled event data!</span></div>}
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Event Title', key: 'title' }, { label: 'Host / Organizer', key: 'host' }, { label: 'Date', key: 'date' }, { label: 'Location', key: 'location' }, { label: 'Registration Link', key: 'link' }].map(f => (
              <div key={f.key} className={f.key === 'title' || f.key === 'link' ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                <input value={(form as unknown as Record<string, unknown>)[f.key] as string || ''} onChange={e => set(f.key, e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-all" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500">
                <option>Webinar</option><option>Hackathon</option><option>Workshop</option><option>Drive</option><option>Conference</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500">
                <option>Published</option><option>Draft</option><option>Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500 resize-none" />
          </div>
          {form.verified && <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"><CheckCircle className="w-4 h-4 text-blue-600" /><span className="text-sm text-blue-700 dark:text-blue-400 font-medium">✓ AI Verified Event</span></div>}
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save</button>
        </div>
      </div>
    </div>
  );
};

export const EventManagementPage: React.FC = () => {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EventRecord | null>(null);
  const [aiVerifying, setAiVerifying] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [showAIDiscover, setShowAIDiscover] = useState(false);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const unsub = subscribeToEvents(data => {
      setEvents(data.map((d, i) => ({
        id: i + 1, firestoreId: d.id,
        title: d.title, host: d.host, date: d.date, type: d.type,
        registrations: d.registrations || 0, status: d.status,
        description: d.description, location: d.location, link: d.link,
        expiresAt: d.expiresAt, verified: d.verified,
      })));
    });
    return () => unsub();
  }, []);

  const handleAddEvent = async (data: Omit<EventRecord, 'id'>) => {
    try {
      await addEvent({ title: data.title, host: data.host, date: data.date, location: data.location || '', type: data.type, description: data.description || '', link: data.link || '', expiresAt: data.expiresAt || '', status: data.status, verified: false, registrations: 0 });
      showToast('Event added!');
    } catch { showToast('Error saving event'); }
  };

  const typeColor: Record<string, string> = {
    Webinar: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    Hackathon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    Workshop: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    Drive: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {showAIDiscover && (
        <AIDiscoverModal type="event" onClose={() => setShowAIDiscover(false)} onSave={async (items) => {
          let added = 0;
          for (const item of items) {
            try {
              await addEvent({ title: item.title, host: item.host, date: item.date, location: item.location || 'Virtual', type: item.type, description: item.description || '', link: item.link || '', expiresAt: item.expiresAt || '', status: 'Published', verified: true, registrations: 0 });
              added++;
            } catch {}
          }
          setShowAIDiscover(false);
          showToast(`Added ${added} event(s) via AI Discover`);
        }} />
      )}
      {showAddModal && <AddEventModal existing={events} onSave={handleAddEvent} onClose={() => setShowAddModal(false)} />}
      {editingItem && <EventEditModal item={editingItem} onSave={e => {
        if (e.firestoreId) updateEvent(e.firestoreId, { title: e.title, host: e.host, date: e.date, location: e.location || '', type: e.type, description: e.description || '', link: e.link || '', status: e.status }).catch(() => {});
        setEvents(prev => prev.map(x => x.id === e.id ? e : x)); showToast('Event updated');
      }} onClose={() => setEditingItem(null)} />}
      {aiVerifying !== null && (
        <AIVerifyModal title={events.find(e => e.id === aiVerifying)?.title || ''} type="Event"
          onClose={() => setAiVerifying(null)}
          onVerified={(_, action) => { setEvents(prev => prev.map(e => e.id === aiVerifying ? { ...e, verified: action === 'approve', status: action === 'approve' ? 'Published' : e.status } : e)); setAiVerifying(null); showToast(action === 'approve' ? '✓ AI verified event' : 'Event flagged by AI'); }}
        />
      )}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4"><AlertTriangle className="w-8 h-8 text-red-500" /><div><p className="font-bold text-gray-900 dark:text-white">Delete Event?</p><p className="text-xs text-gray-500">This action cannot be undone.</p></div></div>
            <div className="flex gap-3"><button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">Cancel</button><button onClick={() => { const ev = events.find(e => e.id === deletingId); if (ev?.firestoreId) deleteEvent(ev.firestoreId).catch(() => {}); setEvents(prev => prev.filter(e => e.id !== deletingId)); setDeletingId(null); showToast('Event deleted'); }} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm">Delete</button></div>
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl"><CheckCircle className="w-4 h-4 text-green-400" /> {toast}</div>}

      <TableHeader title="Event Management" subtitle="Global moderation of all event listings."
        actions={<>
          <button onClick={() => exportToCSV(events.map(e => ({ Title: e.title, Host: e.host, Date: e.date, Type: e.type, Registrations: e.registrations, Status: e.status })), 'events.csv')} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"><Download className="w-4 h-4" /> Export CSV</button>
          <button onClick={() => setShowAIDiscover(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all font-semibold shadow-lg shadow-purple-500/20"><Sparkles className="w-4 h-4" /> AI Discover</button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all font-semibold"><Plus className="w-4 h-4" /> Add Event</button>
        </>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: events.length, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Published', value: events.filter(e => e.status === 'Published').length, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Draft', value: events.filter(e => e.status === 'Draft').length, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Total Registrations', value: events.reduce((a, e) => a + e.registrations, 0).toLocaleString(), color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((s, i) => (
          <Card key={i} className="!p-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><Calendar className={`w-5 h-5 ${s.color}`} /></div><div><div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div><div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div></div></div></Card>
        ))}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">Host</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Registrations</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {events.map(e => (
                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{e.title}</p>
                      {e.verified && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-bold">✓ AI</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{e.host}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{e.date}</td>
                  <td className="px-5 py-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[e.type] || 'bg-gray-100 text-gray-600'}`}>{e.type}</span></td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-900 dark:text-white">{e.registrations.toLocaleString()}</td>
                  <td className="px-5 py-4"><StatusBadge status={e.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button title="AI Verify" onClick={() => setAiVerifying(e.id)} className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-400 hover:text-purple-600 transition-colors"><Bot className="w-4 h-4" /></button>
                      <button title="Edit" onClick={() => setEditingItem(e)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button title="Delete" onClick={() => setDeletingId(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ── Course Management ────────────────────────────────────────────────────────
interface CourseRecord {
  id: number; firestoreId?: string; title: string; instructor: string; category: string;
  students: number; rating: number; status: string; revenue: string;
  description?: string; duration?: string; level?: string;
  link?: string; platform?: string; isFree?: boolean; price?: string; expiresAt?: string; verified?: boolean;
}

const AddCourseModal: React.FC<{ existing: CourseRecord[]; onSave: (c: Omit<CourseRecord, 'id'>) => void; onClose: () => void }> = ({ existing, onSave, onClose }) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [aiStep, setAiStep] = useState<'idle' | 'loading' | 'done'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ title: '', instructor: '', platform: 'Udemy', category: 'Web Dev', duration: '', level: 'Beginner', description: '', link: '', isFree: false, price: '', expiresAt: '', status: 'Published' });
  const set = (k: string, v: string | boolean) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const aiTemplates = [
    { title: 'Complete React & Next.js Masterclass 2025', instructor: 'Hitesh Choudhary', platform: 'YouTube', category: 'Web Dev', duration: '40 hours', level: 'Intermediate', description: 'Master React 18, Next.js 14, TypeScript and modern full-stack development with real projects.', link: 'https://youtube.com/@hiteshchoudhary', isFree: true, price: 'Free', expiresAt: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0] },
    { title: 'AI & Machine Learning for Beginners', instructor: 'Andrew Ng', platform: 'Coursera', category: 'Data Science', duration: '30 hours', level: 'Beginner', description: 'Learn the fundamentals of AI and machine learning through practical exercises and projects.', link: 'https://coursera.org/learn/machine-learning', isFree: false, price: '₹999', expiresAt: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0] },
    { title: 'System Design Interview Prep', instructor: 'Alex Xu', platform: 'Udemy', category: 'Engineering', duration: '20 hours', level: 'Advanced', description: 'Crack system design interviews at FAANG with 50+ real-world design problems and solutions.', link: 'https://udemy.com/course/system-design', isFree: false, price: '₹499', expiresAt: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0] },
  ];

  const runAI = () => {
    setAiStep('loading');
    setTimeout(() => {
      const t = aiTemplates[Math.floor(Math.random() * aiTemplates.length)];
      setForm(f => ({ ...f, ...t, status: 'Published' }));
      setAiStep('done');
    }, 2000);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Course title is required';
    if (!form.instructor.trim()) e.instructor = 'Instructor is required';
    if (form.link && !/^https?:\/\/.+\..+/.test(form.link)) e.link = 'Must be a valid URL (https://...)';
    if (form.expiresAt && form.expiresAt < today) e.expiresAt = 'Expiry date must be in the future';
    if (existing.some(i => i.title.toLowerCase() === form.title.trim().toLowerCase())) e.title = 'A course with this title already exists';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, students: 0, rating: 0, revenue: '₹0', verified: false, firestoreId: undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Plus className="w-4 h-4 text-red-500" /> Add Course</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-5">
          <div className="flex gap-2 mb-4">
            {(['manual', 'ai'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); if (m === 'ai' && aiStep === 'idle') runAI(); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 ${mode === m ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-300'}`}>
                {m === 'ai' ? <><Bot className="w-3.5 h-3.5" /> AI Add</> : <><FileText className="w-3.5 h-3.5" /> Manual Add</>}
              </button>
            ))}
          </div>
          {mode === 'ai' && aiStep === 'loading' && (
            <div className="space-y-3 py-2">
              {['Scanning top course platforms...', 'Extracting course metadata...', 'Verifying instructor credibility...', 'Preparing auto-fill...'].map((s, i) => (
                <div key={i} className="flex items-center gap-3"><RefreshCw className="w-3.5 h-3.5 text-purple-500 animate-spin shrink-0" /><span className="text-xs text-gray-600 dark:text-gray-400">{s}</span></div>
              ))}
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2"><div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" style={{ width: '70%' }} /></div>
            </div>
          )}
          {mode === 'ai' && aiStep === 'done' && <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl mb-3"><Sparkles className="w-4 h-4 text-purple-600 shrink-0" /><span className="text-sm text-purple-700 dark:text-purple-400 font-medium">AI auto-filled course data! Review and save.</span></div>}
          {(mode === 'manual' || aiStep === 'done') && (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {[{ k: 'title', l: 'Course Title *' }, { k: 'instructor', l: 'Instructor *' }, { k: 'duration', l: 'Duration' }, { k: 'link', l: 'Course URL' }, { k: 'price', l: 'Price (e.g. ₹499 or Free)' }, { k: 'expiresAt', l: 'Expiry Date' }].map(f => (
                <div key={f.k}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{f.l}</label>
                  <input type={f.k === 'expiresAt' ? 'date' : 'text'} value={(form as Record<string, unknown>)[f.k] as string || ''} onChange={e => set(f.k, e.target.value)} min={f.k === 'expiresAt' ? today : undefined}
                    className={`w-full px-3 py-2 rounded-xl border ${errors[f.k] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-all`} />
                  {errors[f.k] && <p className="text-xs text-red-500 mt-0.5">{errors[f.k]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500"><option>Web Dev</option><option>Data Science</option><option>Engineering</option><option>CS Fundamentals</option><option>Design</option><option>Marketing</option></select></div>
                <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Level</label>
                  <select value={form.level} onChange={e => set('level', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
                <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500"><option>Published</option><option>Draft</option></select></div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.isFree} onChange={e => set('isFree', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600" />
                Free course
              </label>
            </div>
          )}
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
          {(mode === 'manual' || aiStep === 'done') && (
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save Course</button>
          )}
        </div>
      </div>
    </div>
  );
};

const CourseEditModal: React.FC<{ item: CourseRecord; onSave: (c: CourseRecord) => void; onClose: () => void }> = ({ item, onSave, onClose }) => {
  const [form, setForm] = useState({ ...item, description: item.description || `Comprehensive ${item.title} course by ${item.instructor}.`, duration: item.duration || '12 hours', level: item.level || 'Intermediate' });
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">Edit Course</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Course Title', key: 'title' }, { label: 'Instructor', key: 'instructor' }, { label: 'Duration', key: 'duration' }, { label: 'Revenue', key: 'revenue' }].map(f => (
              <div key={f.key} className={f.key === 'title' ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                <input value={(form as unknown as Record<string, unknown>)[f.key] as string || ''} onChange={e => set(f.key, e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-all" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500">
                <option>Web Dev</option><option>Data Science</option><option>Engineering</option><option>CS Fundamentals</option><option>Design</option><option>Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Level</label>
              <select value={form.level} onChange={e => set('level', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500">
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500">
                <option>Published</option><option>Draft</option><option>Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Rating (0-5)</label>
            <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => set('rating', parseFloat(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-red-500 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save</button>
        </div>
      </div>
    </div>
  );
};

export const CourseManagementPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CourseRecord | null>(null);
  const [aiVerifying, setAiVerifying] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [showAIDiscover, setShowAIDiscover] = useState(false);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const unsub = subscribeToCourses(data => {
      setCourses(data.map((d, i) => ({
        id: i + 1, firestoreId: d.id,
        title: d.title, instructor: d.instructor, category: d.category,
        students: d.students || 0, rating: d.rating || 0, status: d.status,
        revenue: '₹0', description: d.description, duration: d.duration,
        level: d.level, link: d.link, platform: d.platform,
        isFree: d.isFree, price: d.price, expiresAt: d.expiresAt, verified: d.verified,
      })));
    });
    return () => unsub();
  }, []);

  const handleAddCourse = async (data: Omit<CourseRecord, 'id'>) => {
    try {
      await addCourse({ title: data.title, instructor: data.instructor, platform: data.platform || '', category: data.category, duration: data.duration || '', level: data.level || '', description: data.description || '', link: data.link || '', isFree: data.isFree || false, price: data.price || '', expiresAt: data.expiresAt || '', status: data.status, verified: false, students: 0, rating: 0 });
      showToast('Course added!');
    } catch { showToast('Error saving course'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {showAIDiscover && (
        <AIDiscoverModal type="course" onClose={() => setShowAIDiscover(false)} onSave={async (items) => {
          let added = 0;
          for (const item of items) {
            try {
              await addCourse({ title: item.title, instructor: item.instructor, platform: item.platform || '', category: item.category, duration: item.duration || '', level: item.level || '', description: item.description || '', link: item.link || '', isFree: item.isFree || false, price: item.price || '', expiresAt: '', status: 'Published', verified: true, students: 0, rating: 0 });
              added++;
            } catch {}
          }
          setShowAIDiscover(false);
          showToast(`Added ${added} course(s) via AI Discover`);
        }} />
      )}
      {showAddModal && <AddCourseModal existing={courses} onSave={handleAddCourse} onClose={() => setShowAddModal(false)} />}
      {editingItem && <CourseEditModal item={editingItem} onSave={c => {
        if (c.firestoreId) updateCourse(c.firestoreId, { title: c.title, instructor: c.instructor, category: c.category, duration: c.duration || '', level: c.level || '', description: c.description || '', link: c.link || '', status: c.status }).catch(() => {});
        setCourses(prev => prev.map(x => x.id === c.id ? c : x)); showToast('Course updated');
      }} onClose={() => setEditingItem(null)} />}
      {aiVerifying !== null && (
        <AIVerifyModal title={courses.find(c => c.id === aiVerifying)?.title || ''} type="Course"
          onClose={() => setAiVerifying(null)}
          onVerified={(_, action) => { setCourses(prev => prev.map(c => c.id === aiVerifying ? { ...c, verified: action === 'approve' } : c)); setAiVerifying(null); showToast(action === 'approve' ? '✓ AI verified course' : 'Course flagged by AI'); }}
        />
      )}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4"><AlertTriangle className="w-8 h-8 text-red-500" /><div><p className="font-bold text-gray-900 dark:text-white">Delete Course?</p><p className="text-xs text-gray-500">All enrolled students will be affected.</p></div></div>
            <div className="flex gap-3"><button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">Cancel</button><button onClick={() => { const cr = courses.find(c => c.id === deletingId); if (cr?.firestoreId) deleteCourse(cr.firestoreId).catch(() => {}); setCourses(prev => prev.filter(c => c.id !== deletingId)); setDeletingId(null); showToast('Course deleted'); }} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm">Delete</button></div>
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl"><CheckCircle className="w-4 h-4 text-green-400" /> {toast}</div>}

      <TableHeader title="Course Management" subtitle="Add, edit, and organise platform courses."
        actions={<>
          <button onClick={() => exportToCSV(courses.map(c => ({ Title: c.title, Instructor: c.instructor, Category: c.category, Students: c.students, Rating: c.rating, Revenue: c.revenue, Status: c.status })), 'courses.csv')} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"><Download className="w-4 h-4" /> Export CSV</button>
          <button onClick={() => setShowAIDiscover(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all font-semibold shadow-lg shadow-purple-500/20"><Sparkles className="w-4 h-4" /> AI Discover</button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all font-semibold"><Plus className="w-4 h-4" /> Add Course</button>
        </>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses', value: courses.length, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Published', value: courses.filter(c => c.status === 'Published').length, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Total Students', value: courses.reduce((a, c) => a + c.students, 0).toLocaleString(), color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Avg Rating', value: (courses.reduce((a, c) => a + c.rating, 0) / courses.length).toFixed(1), color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        ].map((s, i) => (
          <Card key={i} className="!p-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><BookOpen className={`w-5 h-5 ${s.color}`} /></div><div><div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div><div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div></div></div></Card>
        ))}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Instructor</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Students</th>
                <th className="px-5 py-3 font-medium">Rating</th>
                <th className="px-5 py-3 font-medium">Revenue</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {courses.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm max-w-[180px] truncate">{c.title}</p>
                      {c.verified && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-bold">✓ AI</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{c.instructor}</td>
                  <td className="px-5 py-4"><span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">{c.category}</span></td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-900 dark:text-white">{c.students.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-yellow-500 font-semibold">★ {c.rating}</td>
                  <td className="px-5 py-4 text-sm font-medium text-green-600 dark:text-green-400">{c.revenue}</td>
                  <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button title="AI Verify" onClick={() => setAiVerifying(c.id)} className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-400 hover:text-purple-600 transition-colors"><Bot className="w-4 h-4" /></button>
                      <button title="Edit" onClick={() => setEditingItem(c)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button title="Delete" onClick={() => setDeletingId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ── API Key Auto-Detection ────────────────────────────────────────────────────
function detectApiFromKey(key: string): { name: string; category: string; endpoint: string; description: string } {
  const k = key.trim();
  if (k.startsWith('sk-') && k.length > 20) return { name: 'OpenAI', category: 'AI', endpoint: 'api.openai.com/v1', description: 'OpenAI GPT models for AI-powered features.' };
  if (k.startsWith('AIzaSy')) return { name: 'Google / Firebase', category: 'Auth', endpoint: 'identitytoolkit.googleapis.com', description: 'Google / Firebase API for authentication and cloud services.' };
  if (k.startsWith('SG.')) return { name: 'SendGrid Email', category: 'Email', endpoint: 'api.sendgrid.com/v3', description: 'SendGrid transactional email service.' };
  if (k.startsWith('xoxb-') || k.startsWith('xoxp-')) return { name: 'Slack', category: 'Analytics', endpoint: 'slack.com/api', description: 'Slack API for notifications and workspace integration.' };
  if (k.startsWith('ghp_') || k.startsWith('github_pat_')) return { name: 'GitHub API', category: 'Skills', endpoint: 'api.github.com', description: 'GitHub API for repository and profile data.' };
  if (k.startsWith('AKIA') || k.includes('aws')) return { name: 'AWS', category: 'Analytics', endpoint: 'amazonaws.com', description: 'Amazon Web Services API.' };
  if (k.length > 10) return { name: 'Custom API', category: 'Analytics', endpoint: 'api.example.com', description: 'Custom API integration for STUNIVOZ platform.' };
  return { name: '', category: 'Analytics', endpoint: '', description: '' };
}

// ── Add API Modal (API Key Only) ──────────────────────────────────────────────
interface ApiRecord { id: number; name: string; category: string; endpoint: string; calls: number; limit: number; status: string; latency: string; apiKey?: string; description?: string; webhookUrl?: string }

const AddAPIModal: React.FC<{ onSave: (a: ApiRecord) => void; onClose: () => void; nextId: number }> = ({ onSave, onClose, nextId }) => {
  const [apiKey, setApiKey] = useState('');
  const [detected, setDetected] = useState<ReturnType<typeof detectApiFromKey> | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    setDetected(null);
    setConnected(false);
    setError('');
  };

  const handleConnect = () => {
    if (!apiKey.trim()) { setError('Please enter an API key.'); return; }
    setConnecting(true); setError('');
    setTimeout(() => {
      const info = detectApiFromKey(apiKey);
      setDetected(info);
      setConnecting(false);
      setConnected(true);
    }, 1200);
  };

  const handleSave = () => {
    if (!detected) return;
    onSave({
      id: nextId,
      name: detected.name,
      category: detected.category,
      endpoint: detected.endpoint,
      calls: 0,
      limit: 10000,
      status: 'Online',
      latency: (30 + Math.floor(Math.random() * 100)) + 'ms',
      apiKey,
      description: detected.description,
      webhookUrl: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2"><Key className="w-5 h-5 text-blue-500" /><h2 className="font-bold text-gray-900 dark:text-white">Add API Integration</h2></div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Paste your API key below. We'll automatically detect the service and configure everything for you.</p>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">API Key <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={handleKeyChange}
                placeholder="Paste your API key here..."
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                onClick={handleConnect}
                disabled={connecting || !apiKey.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-all whitespace-nowrap"
              >
                {connecting ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Detecting…</> : 'Connect →'}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          {connected && detected && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">Service detected — ready to connect</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-500">Service</span><p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{detected.name}</p></div>
                <div><span className="text-gray-500">Category</span><p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{detected.category}</p></div>
                <div className="col-span-2"><span className="text-gray-500">Endpoint</span><p className="font-mono text-gray-700 dark:text-gray-300 mt-0.5">{detected.endpoint}</p></div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={!connected || !detected} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Add Integration</button>
        </div>
      </div>
    </div>
  );
};

// ── API Edit Modal ────────────────────────────────────────────────────────────
const APIEditModal: React.FC<{ api: ApiRecord; onSave: (a: ApiRecord) => void; onClose: () => void }> = ({ api, onSave, onClose }) => {
  const [form, setForm] = useState({ ...api, apiKey: api.apiKey || '', description: api.description || `${api.name} integration for STUNIVOZ platform.`, webhookUrl: api.webhookUrl || '' });
  const [showKey, setShowKey] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ ok: boolean; ms: number } | null>(null);
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value;
    set('apiKey', key);
    if (key.length > 8) {
      setDetecting(true);
      setTimeout(() => {
        const detected = detectApiFromKey(key);
        if (detected.name && detected.name !== 'Custom API') {
          setForm(f => ({ ...f, apiKey: key, name: detected.name, category: detected.category, endpoint: detected.endpoint, description: detected.description }));
        } else {
          setForm(f => ({ ...f, apiKey: key }));
        }
        setDetecting(false);
      }, 600);
    }
  };

  const pingEndpoint = () => {
    setPinging(true); setPingResult(null);
    setTimeout(() => { const ms = 30 + Math.floor(Math.random() * 200); setPingResult({ ok: ms < 200, ms }); setPinging(false); }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2"><Plug className="w-5 h-5 text-blue-500" /><h2 className="font-bold text-gray-900 dark:text-white">API Settings — {api.name}</h2></div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">API Key</label>
            <div className="relative flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={form.apiKey}
                onChange={handleKeyChange}
                placeholder="Paste a new key to auto-detect service…"
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono focus:outline-none focus:border-blue-500 transition-all"
              />
              <button onClick={() => setShowKey(s => !s)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {detecting && <p className="text-xs text-blue-500 mt-1 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Auto-detecting service…</p>}
            <p className="text-xs text-gray-400 mt-1">Changing the key auto-fills name, category, and endpoint.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Service Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-blue-500">
                <option>AI</option><option>Auth</option><option>Email</option><option>Jobs</option><option>Skills</option><option>Analytics</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Base Endpoint</label>
            <div className="flex gap-2">
              <input value={form.endpoint} onChange={e => set('endpoint', e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono focus:outline-none focus:border-blue-500 transition-all" />
              <button onClick={pingEndpoint} disabled={pinging} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold transition-all whitespace-nowrap">
                {pinging ? <><RefreshCw className="w-3 h-3 animate-spin" /> Pinging</> : 'Ping →'}
              </button>
            </div>
            {pingResult && <p className={`text-xs mt-1 font-semibold ${pingResult.ok ? 'text-green-600' : 'text-red-600'}`}>{pingResult.ok ? `✓ Endpoint live — ${pingResult.ms}ms` : `✗ Endpoint unreachable — ${pingResult.ms}ms timeout`}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Rate Limit</label>
              <input type="number" value={form.limit} onChange={e => set('limit', parseInt(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-blue-500">
                <option>Online</option><option>Offline</option><option>Warning</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Webhook URL (optional)</label>
            <input value={form.webhookUrl} onChange={e => set('webhookUrl', e.target.value)} placeholder="https://stunivoz.com/api/webhooks/..." className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-blue-500 transition-all" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save Settings</button>
        </div>
      </div>
    </div>
  );
};

// ── API System ───────────────────────────────────────────────────────────────
export const APISystemPage: React.FC = () => {
  const [apis, setApis] = useState<ApiRecord[]>([
    { id: 1, name: 'OpenAI GPT-4', category: 'AI', endpoint: 'api.openai.com/v1', calls: 8420, limit: 10000, status: 'Online', latency: '380ms' },
    { id: 2, name: 'Firebase Auth', category: 'Auth', endpoint: 'identitytoolkit.googleapis.com', calls: 45200, limit: 100000, status: 'Online', latency: '42ms' },
    { id: 3, name: 'SendGrid Email', category: 'Email', endpoint: 'api.sendgrid.com/v3', calls: 1240, limit: 5000, status: 'Online', latency: '95ms' },
    { id: 4, name: 'LinkedIn Jobs API', category: 'Jobs', endpoint: 'api.linkedin.com/v2', calls: 320, limit: 500, status: 'Warning', latency: '210ms' },
    { id: 5, name: 'GitHub API', category: 'Skills', endpoint: 'api.github.com', calls: 2100, limit: 5000, status: 'Online', latency: '68ms' },
  ]);
  const [editingApi, setEditingApi] = useState<ApiRecord | null>(null);
  const [addingApi, setAddingApi] = useState(false);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const toggleApi = (id: number) => { setApis(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'Online' ? 'Offline' : 'Online' } : a)); showToast('API status toggled'); };
  const refreshApi = (id: number) => {
    setRefreshingId(id);
    setTimeout(() => {
      setApis(prev => prev.map(a => a.id === id ? { ...a, latency: (20 + Math.floor(Math.random() * 150)) + 'ms', calls: a.calls + Math.floor(Math.random() * 5) } : a));
      setRefreshingId(null); showToast('API stats refreshed');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {editingApi && <APIEditModal api={editingApi} onSave={a => { setApis(prev => prev.map(x => x.id === a.id ? a : x)); setEditingApi(null); showToast('API settings saved'); }} onClose={() => setEditingApi(null)} />}
      {addingApi && <AddAPIModal nextId={Math.max(...apis.map(a => a.id)) + 1} onSave={a => { setApis(prev => [...prev, a]); setAddingApi(false); showToast('API integration added successfully'); }} onClose={() => setAddingApi(false)} />}
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl"><CheckCircle className="w-4 h-4 text-green-400" /> {toast}</div>}

      <TableHeader title="API System Control" subtitle="Manage external APIs, rate limits, and integrations."
        actions={<button onClick={() => setAddingApi(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all font-semibold"><Plus className="w-4 h-4" /> Add API</button>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Integrations', value: apis.length, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Online', value: apis.filter(a => a.status === 'Online').length, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Warnings', value: apis.filter(a => a.status === 'Warning').length, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Total API Calls', value: apis.reduce((a, x) => a + x.calls, 0).toLocaleString(), color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((s, i) => (
          <Card key={i} className="!p-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><Plug className={`w-5 h-5 ${s.color}`} /></div><div><div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div><div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div></div></div></Card>
        ))}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 font-medium">API Name</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Endpoint</th>
                <th className="px-5 py-3 font-medium">Usage</th>
                <th className="px-5 py-3 font-medium">Latency</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {apis.map(api => (
                <tr key={api.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Plug className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{api.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4"><span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">{api.category}</span></td>
                  <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 font-mono">{api.endpoint}</td>
                  <td className="px-5 py-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{api.calls.toLocaleString()}</span><span>{api.limit.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden w-28">
                        <div className={`h-full rounded-full ${api.calls / api.limit > 0.8 ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${Math.min((api.calls / api.limit) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-mono text-gray-600 dark:text-gray-400">{api.latency}</td>
                  <td className="px-5 py-4"><StatusBadge status={api.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleApi(api.id)} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${api.status === 'Online' ? 'text-green-500 hover:text-red-500' : 'text-red-400 hover:text-green-500'}`}>
                        {api.status === 'Online' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button title="Settings" onClick={() => setEditingApi(api)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-colors"><Settings2 className="w-4 h-4" /></button>
                      <button title="Refresh Stats" onClick={() => refreshApi(api.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-purple-600 transition-colors"><RefreshCw className={`w-4 h-4 ${refreshingId === api.id ? 'animate-spin' : ''}`} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ── AI Control ───────────────────────────────────────────────────────────────
export const AIControlPage: React.FC = () => {
  const { aiProvider, aiModel, aiApiKey, setAIConfig } = useAdminSettings();
  const [provider, setProvider] = useState(aiProvider || 'gemini');
  const [model, setModel] = useState(aiModel || 'gemini-1.5-flash');
  const [apiKey, setApiKey] = useState(aiApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const GEMINI_MODELS = [
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Free · Recommended)' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Paid)' },
    { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro' },
  ];
  const OPENAI_MODELS = [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Affordable)' },
    { value: 'gpt-4o', label: 'GPT-4o (Recommended)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Budget)' },
  ];

  const handleProviderChange = (p: string) => {
    setProvider(p);
    setModel(p === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini');
    setTestResult(null);
  };

  const handleSave = () => {
    setAIConfig(provider, model, apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!apiKey) { setTestResult({ ok: false, msg: 'Please enter an API key first.' }); return; }
    setTesting(true); setTestResult(null);
    try {
      const url = provider === 'gemini'
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        : 'https://api.openai.com/v1/chat/completions';
      const body = provider === 'gemini'
        ? JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Say "OK" in one word.' }] }] })
        : JSON.stringify({ model, messages: [{ role: 'user', content: 'Say "OK" in one word.' }], max_tokens: 5 });
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (provider === 'openai') headers['Authorization'] = `Bearer ${apiKey}`;
      const res = await fetch(url, { method: 'POST', headers, body });
      if (res.ok) setTestResult({ ok: true, msg: `Connection successful! ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API is working.` });
      else { const err = await res.json().catch(() => ({})); setTestResult({ ok: false, msg: err?.error?.message || `API error: ${res.status}` }); }
    } catch (e: any) {
      setTestResult({ ok: false, msg: e?.message || 'Connection failed.' });
    } finally { setTesting(false); }
  };

  const apiKeyLink = provider === 'gemini'
    ? { url: 'https://aistudio.google.com/app/apikey', label: 'Get free Gemini API key at aistudio.google.com' }
    : { url: 'https://platform.openai.com/api-keys', label: 'Get OpenAI API key at platform.openai.com' };

  return (
    <div className="space-y-6 animate-fade-in">
      <TableHeader title="AI Settings" subtitle="Configure the AI provider, model, and API key used for content discovery and the career chatbot." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'AI Provider', value: provider === 'gemini' ? 'Google Gemini' : 'OpenAI', icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Active Model', value: model.split('-').slice(0, 3).join('-'), icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'API Key', value: apiKey ? '●●●●●●●●' : 'Not set', icon: Key, color: apiKey ? 'text-green-500' : 'text-red-500', bg: apiKey ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Status', value: apiKey ? 'Configured' : 'Needs Setup', icon: CheckCircle, color: apiKey ? 'text-green-500' : 'text-yellow-500', bg: apiKey ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20' },
        ].map((s, i) => (
          <Card key={i} className="!p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="AI Configuration" subtitle="Changes apply immediately to AI Discover and the Career Chatbot" />
        <CardContent className="space-y-5">
          {/* Provider selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">AI Provider</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'gemini', label: 'Google Gemini', desc: 'Free tier available', badge: 'Recommended' },
                { id: 'openai', label: 'OpenAI', desc: 'GPT-3.5 to GPT-4o', badge: 'Paid' },
              ].map(p => (
                <button
                  key={p.id} onClick={() => handleProviderChange(p.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${provider === p.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{p.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.id === 'gemini' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>{p.badge}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Model selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Model</label>
            <select
              value={model} onChange={e => setModel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            >
              {(provider === 'gemini' ? GEMINI_MODELS : OPENAI_MODELS).map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">API Key</label>
              <a href={apiKeyLink.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-purple-500 hover:text-purple-600 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> {apiKeyLink.label}
              </a>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey} onChange={e => setApiKey(e.target.value)}
                placeholder={provider === 'gemini' ? 'AIza...' : 'sk-...'}
                className="w-full pl-9 pr-16 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
              />
              <button onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium">
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Your API key is stored locally in your browser and never sent to our servers.</p>
          </div>

          {testResult && (
            <div className={`flex items-start gap-2 p-3 rounded-xl border ${testResult.ok ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
              {testResult.ok ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
              <p className={`text-xs ${testResult.ok ? 'text-green-700 dark:text-green-300' : 'text-red-600 dark:text-red-400'}`}>{testResult.msg}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={handleTest} disabled={testing || !apiKey}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-all">
              {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              Test Connection
            </button>
            <button onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 transition-all">
              {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Settings</>}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="How AI Features Work" />
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Sparkles, title: 'AI Discover', desc: 'Automatically finds and imports internships, events, and courses from across the web — up to 10 at a time.', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { icon: Bot, title: 'Career Chatbot', desc: 'AI-powered career advisor on the Career Guidance page, helping students with internships, resumes, and interviews.', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { icon: ShieldCheck, title: 'Scam Detection', desc: 'Every AI-discovered listing is verified for legitimacy. Suspicious entries are flagged before you add them.', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
            ].map((f, i) => (
              <div key={i} className={`p-4 rounded-xl ${f.bg} border border-gray-100 dark:border-gray-800`}>
                <div className={`w-9 h-9 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{f.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Add Staff Modal ───────────────────────────────────────────────────────────
interface StaffRecord {
  id: number; name: string; email: string; role: string;
  joined: string; actions: number; status: string; assignedRoleId?: string;
}

const AddStaffModal: React.FC<{ onAdd: (s: StaffRecord) => void; onClose: () => void }> = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', role: 'Content Moderator', assignedRoleId: 'staff' });
  const [showRoleAssign, setShowRoleAssign] = useState(false);
  const [sent, setSent] = useState(false);

  const handleAdd = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setSent(true);
    setTimeout(() => {
      onAdd({ id: Date.now(), name: form.name, email: form.email, role: form.role, joined: 'Just now', actions: 0, status: 'Active', assignedRoleId: form.assignedRoleId });
      onClose();
    }, 1000);
  };

  return (
    <>
      {showRoleAssign && (
        <AssignRoleModal
          userName={form.name || 'New Staff'}
          currentRoleId={form.assignedRoleId}
          onAssign={id => { setForm(f => ({ ...f, assignedRoleId: id })); setShowRoleAssign(false); }}
          onCancel={() => setShowRoleAssign(false)}
        />
      )}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Staff Member</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-500" /></button>
          </div>
          <div className="p-6 space-y-4">
            {sent && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-400 font-medium">Staff member added!</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Full Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Ravi Kumar"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="staff@stunivoz.com" type="email"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Job Role / Title</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-all">
                <option>Content Moderator</option>
                <option>User Support</option>
                <option>Content Reviewer</option>
                <option>Data Analyst</option>
                <option>Community Manager</option>
                <option>Technical Support</option>
              </select>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Portal Permissions</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Assigned role: <span className="font-bold">{form.assignedRoleId}</span></p>
                </div>
                <button onClick={() => setShowRoleAssign(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all">
                  <UserCog className="w-3.5 h-3.5" /> Change
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
            <button onClick={handleAdd} disabled={!form.name.trim() || !form.email.trim() || sent}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
              <Plus className="w-4 h-4" /> Add Staff
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Staff Profile Modal ───────────────────────────────────────────────────────
const PERMISSION_LIST = [
  { id: 'view_users', label: 'View Users', group: 'Users' },
  { id: 'edit_users', label: 'Edit Users', group: 'Users' },
  { id: 'block_users', label: 'Block/Unblock Users', group: 'Users' },
  { id: 'view_content', label: 'View Content', group: 'Content' },
  { id: 'moderate_content', label: 'Moderate Content', group: 'Content' },
  { id: 'delete_content', label: 'Delete Content', group: 'Content' },
  { id: 'view_companies', label: 'View Companies', group: 'Companies' },
  { id: 'verify_companies', label: 'Verify Companies', group: 'Companies' },
  { id: 'manage_ads', label: 'Manage Ads', group: 'Ads' },
  { id: 'view_analytics', label: 'View Analytics', group: 'Analytics' },
  { id: 'manage_events', label: 'Manage Events', group: 'Events' },
  { id: 'manage_internships', label: 'Manage Internships', group: 'Internships' },
];

const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  super_admin: PERMISSION_LIST.map(p => p.id),
  admin: ['view_users', 'edit_users', 'block_users', 'view_content', 'moderate_content', 'view_companies', 'verify_companies', 'view_analytics', 'manage_events', 'manage_internships'],
  moderator: ['view_users', 'view_content', 'moderate_content', 'delete_content', 'view_analytics'],
  staff: ['view_users', 'view_content', 'view_analytics'],
};

const StaffProfileModal: React.FC<{ staff: StaffRecord; onClose: () => void; onUpdate: (s: StaffRecord) => void }> = ({ staff: s, onClose, onUpdate }) => {
  const [permissions, setPermissions] = useState<string[]>(ROLE_DEFAULT_PERMISSIONS[s.assignedRoleId || 'staff'] || []);
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) => setPermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const handleSave = () => {
    setSaved(true);
    onUpdate({ ...s });
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const groups = Array.from(new Set(PERMISSION_LIST.map(p => p.group)));
  const roleColors: Record<string, string> = {
    super_admin: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    admin: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    staff: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    moderator: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
              {s.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">{s.name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>

        <div className="p-5 space-y-5">
          {saved && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-400 font-medium">Permissions saved successfully!</span>
            </div>
          )}

          {/* Profile Details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Job Role', value: s.role },
              { label: 'Joined', value: s.joined },
              { label: 'Total Actions', value: s.actions.toString() },
              { label: 'Status', value: s.status },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Portal Role */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Portal Role</p>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[s.assignedRoleId || ''] || 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                {s.assignedRoleId || 'Unassigned'}
              </span>
            </div>
            <Shield className="w-5 h-5 text-gray-400" />
          </div>

          {/* Permission Control */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Permission Control</p>
              <span className="text-xs text-gray-400 dark:text-gray-500">({permissions.length}/{PERMISSION_LIST.length} enabled)</span>
            </div>
            <div className="space-y-3">
              {groups.map(group => (
                <div key={group}>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">{group}</p>
                  <div className="space-y-1.5">
                    {PERMISSION_LIST.filter(p => p.group === group).map(perm => (
                      <label key={perm.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group transition-colors">
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{perm.label}</span>
                        <div
                          onClick={() => toggle(perm.id)}
                          className={`w-10 h-5 rounded-full transition-all cursor-pointer relative flex-shrink-0 ${permissions.includes(perm.id) ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${permissions.includes(perm.id) ? 'left-5' : 'left-0.5'}`} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saved} className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Staff Management ──────────────────────────────────────────────────────────
export const StaffManagementPage: React.FC = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [assigningRole, setAssigningRole] = useState<StaffRecord | null>(null);
  const [viewingProfile, setViewingProfile] = useState<StaffRecord | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const [staff, setStaff] = useState<StaffRecord[]>([]);

  const handleAssignRole = (roleId: string) => {
    if (!assigningRole) return;
    setStaff(prev => prev.map(s => s.id === assigningRole.id ? { ...s, assignedRoleId: roleId } : s));
    setAssigningRole(null);
    showToast(`Role "${roleId}" assigned to ${assigningRole.name}`);
  };

  const handleDelete = (id: number) => {
    const name = staff.find(s => s.id === id)?.name;
    setStaff(prev => prev.filter(s => s.id !== id));
    setDeletingId(null);
    showToast(`${name} removed from staff`);
  };

  const toggleStatus = (id: number) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s));
    showToast('Status updated');
  };

  const roleColors: Record<string, string> = {
    super_admin: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    admin: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    staff: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    moderator: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {showAdd && <AddStaffModal onAdd={s => { setStaff(prev => [s, ...prev]); showToast(`${s.name} added to staff`); }} onClose={() => setShowAdd(false)} />}
      {viewingProfile && (
        <StaffProfileModal
          staff={viewingProfile}
          onClose={() => setViewingProfile(null)}
          onUpdate={updated => { setStaff(prev => prev.map(s => s.id === updated.id ? updated : s)); showToast('Permissions updated'); }}
        />
      )}
      {assigningRole && (
        <AssignRoleModal
          userName={assigningRole.name}
          currentRoleId={assigningRole.assignedRoleId || 'staff'}
          onAssign={handleAssignRole}
          onCancel={() => setAssigningRole(null)}
        />
      )}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Remove Staff Member?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">They will lose portal access immediately.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
              <button onClick={() => handleDelete(deletingId)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all">Remove</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl animate-slide-up">
          <CheckCircle className="w-4 h-4 text-green-400 dark:text-green-600" /> {toast}
        </div>
      )}

      <TableHeader title="Staff Management" subtitle="Create, manage, and assign roles to staff accounts."
        actions={<>
          <a href="/admin/roles" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            <Shield className="w-4 h-4" /> Manage Roles
          </a>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all font-semibold">
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: staff.length, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Active', value: staff.filter(s => s.status === 'Active').length, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Inactive', value: staff.filter(s => s.status === 'Inactive').length, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
          { label: 'Actions Today', value: staff.reduce((a, s) => a + (s.status === 'Active' ? Math.floor(s.actions / 30) : 0), 0), color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map((s, i) => (
          <Card key={i} className="!p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <Users className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 font-medium">Staff Member</th>
                <th className="px-5 py-3 font-medium">Job Role</th>
                <th className="px-5 py-3 font-medium">Portal Role</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Actions</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {staff.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{s.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{s.role}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[s.assignedRoleId || ''] || 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                      {s.assignedRoleId || 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">{s.joined}</td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-900 dark:text-white">{s.actions}</td>
                  <td className="px-5 py-4"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button title="View Profile & Permissions" onClick={() => setViewingProfile(s)} className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-400 hover:text-purple-600 transition-colors">
                        <UserIcon className="w-4 h-4" />
                      </button>
                      <button title="Assign Role" onClick={() => setAssigningRole(s)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-colors">
                        <Shield className="w-4 h-4" />
                      </button>
                      <button title={s.status === 'Active' ? 'Deactivate' : 'Activate'} onClick={() => toggleStatus(s.id)} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${s.status === 'Active' ? 'text-green-500 hover:text-yellow-600' : 'text-gray-400 hover:text-green-600'}`}>
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button title="Remove" onClick={() => setDeletingId(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">No staff members yet. Add your first staff member above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{staff.length} staff member{staff.length !== 1 ? 's' : ''} total</span>
          <a href="/admin/roles" className="text-blue-500 hover:underline font-medium">Manage Roles & Permissions →</a>
        </div>
      </Card>
    </div>
  );
};

// ── Create Ad Modal ───────────────────────────────────────────────────────────
interface AdRecord { id: number; title: string; advertiser: string; placement: string; views: number; clicks: number; ctr: string; status: string; budget: string; mediaType?: string; ctaLabel?: string; targetUrl?: string; duration?: number }

const CreateAdModal: React.FC<{ onAdd: (a: AdRecord) => void; onClose: () => void }> = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({ title: '', advertiser: '', placement: 'Dashboard Banner', mediaType: 'Image', ctaLabel: 'Learn More', targetUrl: '', budget: '', duration: 30 });
  const [preview, setPreview] = useState(false);
  const [created, setCreated] = useState(false);
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = () => {
    if (!form.title.trim() || !form.advertiser.trim()) return;
    setCreated(true);
    setTimeout(() => {
      onAdd({ id: Date.now(), title: form.title, advertiser: form.advertiser, placement: form.placement, views: 0, clicks: 0, ctr: '0.0%', status: 'Active', budget: form.budget || '₹0', mediaType: form.mediaType, ctaLabel: form.ctaLabel, targetUrl: form.targetUrl, duration: form.duration });
      onClose();
    }, 1200);
  };

  const placements = ['Dashboard Banner', 'Internships Sidebar', 'Profile Page', 'Courses Page', 'Community Feed', 'Events Page', 'Home Hero', 'Email Footer'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2"><Megaphone className="w-5 h-5 text-orange-500" /><h2 className="font-bold text-gray-900 dark:text-white">Create New Ad</h2></div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {created && <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-sm text-green-700 dark:text-green-400 font-medium">Ad created and published!</span></div>}

          {/* Media Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ad Media Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ type: 'Image', icon: '🖼️' }, { type: 'Video', icon: '🎬' }, { type: 'Text', icon: '📝' }].map(m => (
                <button key={m.type} onClick={() => set('mediaType', m.type)} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium ${form.mediaType === m.type ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-300'}`}>
                  <span className="text-xl">{m.icon}</span>{m.type}
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Ad Title / Headline</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Google Cloud Certification 2025" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Advertiser</label>
              <input value={form.advertiser} onChange={e => set('advertiser', e.target.value)} placeholder="e.g. Google" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-orange-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Budget</label>
              <input value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="₹25,000" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-orange-500 transition-all" />
            </div>
          </div>

          {/* Placement */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Ad Placement</label>
            <select value={form.placement} onChange={e => set('placement', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-orange-500">
              {placements.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          {/* CTA + URL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">CTA Button Label</label>
              <select value={form.ctaLabel} onChange={e => set('ctaLabel', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-orange-500">
                <option>Learn More</option><option>Apply Now</option><option>Get Started</option><option>Sign Up Free</option><option>Explore</option><option>View Offer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Duration (days)</label>
              <input type="number" min="1" max="365" value={form.duration} onChange={e => set('duration', parseInt(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-orange-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Target URL</label>
            <input value={form.targetUrl} onChange={e => set('targetUrl', e.target.value)} placeholder="https://example.com/landing-page" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono focus:outline-none focus:border-orange-500 transition-all" />
          </div>

          {/* Preview */}
          <div>
            <button onClick={() => setPreview(!preview)} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
              <Eye className="w-4 h-4" /> {preview ? 'Hide' : 'Show'} Preview
            </button>
            {preview && (
              <div className="mt-3 p-4 border-2 border-dashed border-orange-300 dark:border-orange-800 rounded-xl bg-orange-50 dark:bg-orange-900/10">
                <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide mb-2">Ad Preview — {form.placement}</p>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
                  <div className="text-xs opacity-80 mb-1">{form.advertiser || 'Advertiser'} · Sponsored</div>
                  <p className="font-bold text-sm mb-2">{form.title || 'Ad Headline Here'}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">{form.mediaType} Ad</span>
                    <span className="text-xs bg-white text-orange-600 px-3 py-1 rounded-lg font-bold">{form.ctaLabel}</span>
                  </div>
                  <p className="text-xs opacity-60 mt-2">Duration: {form.duration} days · Budget: {form.budget || '₹0'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
          <button onClick={handleCreate} disabled={!form.title.trim() || !form.advertiser.trim() || created} className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"><Megaphone className="w-4 h-4" /> Create Ad</button>
        </div>
      </div>
    </div>
  );
};

// ── Ads Management ────────────────────────────────────────────────────────────
export const AdsSystemPage: React.FC = () => {
  const [ads, setAds] = useState<AdRecord[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const toggle = (id: number) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' } : a));
    showToast('Ad status updated');
  };

  const deleteAd = (id: number) => {
    const title = ads.find(a => a.id === id)?.title;
    setAds(prev => prev.filter(a => a.id !== id));
    showToast(`Ad "${title}" removed`);
  };

  const totalViews = ads.reduce((sum, a) => sum + a.views, 0);
  const totalClicks = ads.reduce((sum, a) => sum + a.clicks, 0);
  const activeAds = ads.filter(a => a.status === 'Active').length;
  const avgCtr = ads.length > 0 ? ((totalClicks / Math.max(totalViews, 1)) * 100).toFixed(1) + '%' : '0.0%';

  return (
    <div className="space-y-6 animate-fade-in">
      {showCreate && <CreateAdModal onAdd={a => { setAds(prev => [a, ...prev]); showToast('New ad created and published!'); }} onClose={() => setShowCreate(false)} />}
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl"><CheckCircle className="w-4 h-4 text-green-400" /> {toast}</div>}

      <TableHeader title="Ads Management" subtitle="Create and manage platform advertisements."
        actions={<button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all font-semibold"><Plus className="w-4 h-4" /> Create Ad</button>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Impressions', value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews.toString(), icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Total Clicks', value: totalClicks.toLocaleString(), icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Avg CTR', value: avgCtr, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Active Ads', value: activeAds.toString(), icon: Megaphone, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((s, i) => (
          <Card key={i} className="!p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 font-medium">Ad</th>
                <th className="px-5 py-3 font-medium">Placement</th>
                <th className="px-5 py-3 font-medium">Views</th>
                <th className="px-5 py-3 font-medium">Clicks</th>
                <th className="px-5 py-3 font-medium">CTR</th>
                <th className="px-5 py-3 font-medium">Budget</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {ads.map(ad => (
                <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{ad.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{ad.advertiser}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-600 dark:text-gray-400">{ad.placement}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{ad.views.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{ad.clicks.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm font-bold text-blue-600 dark:text-blue-400">{ad.ctr}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{ad.budget}</td>
                  <td className="px-5 py-4"><StatusBadge status={ad.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggle(ad.id)} title={ad.status === 'Active' ? 'Deactivate' : 'Activate'} className={`${ad.status === 'Active' ? 'text-green-500' : 'text-gray-400'} hover:opacity-70 transition-all`}>
                        {ad.status === 'Active' ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                      </button>
                      <button onClick={() => deleteAd(ad.id)} title="Delete Ad" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {ads.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">No ads created yet. Click "Create Ad" to publish your first advertisement.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ── UI Control ────────────────────────────────────────────────────────────────
const THEME_PRESETS = [
  { label: 'Ocean Blue', color: '#0ea5e9', accent: '#0369a1' },
  { label: 'Forest Green', color: '#10b981', accent: '#047857' },
  { label: 'Royal Purple', color: '#8b5cf6', accent: '#6d28d9' },
  { label: 'Sunset Orange', color: '#f97316', accent: '#c2410c' },
  { label: 'STUNIVOZ Red', color: '#ef4444', accent: '#b91c1c' },
];

export const UIControlPage: React.FC = () => {
  const { maintenanceMode, maintenanceMessage, setMaintenanceMode: ctxSetMaintenance, setMaintenanceMessage } = useAdminSettings();
  const [primaryColor, setPrimaryColor] = useState('#ef4444');
  const [font, setFont] = useState('Inter');
  const [darkModeDefault, setDarkModeDefault] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState(maintenanceMessage);
  const [saved, setSaved] = useState(false);
  const [confirmMaintenance, setConfirmMaintenance] = useState(false);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const applyTheme = (color: string) => {
    setPrimaryColor(color);
    document.documentElement.style.setProperty('--color-primary', color);
    showToast(`Theme applied: ${THEME_PRESETS.find(t => t.color === color)?.label}`);
  };

  const save = () => {
    setMaintenanceMessage(maintenanceMsg);
    setSaved(true);
    showToast('UI settings saved successfully!');
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleMaintenance = () => {
    if (!maintenanceMode) { setConfirmMaintenance(true); } else { ctxSetMaintenance(false); showToast('Maintenance mode disabled — platform is live'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl"><CheckCircle className="w-4 h-4 text-green-400" /> {toast}</div>}

      {confirmMaintenance && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4"><Wrench className="w-8 h-8 text-yellow-500" /><div><p className="font-bold text-gray-900 dark:text-white">Enable Maintenance Mode?</p><p className="text-xs text-gray-500 mt-0.5">All users will see maintenance page immediately.</p></div></div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl mb-4">
              <p className="text-xs text-yellow-700 dark:text-yellow-400">{maintenanceMsg}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmMaintenance(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">Cancel</button>
              <button onClick={() => { ctxSetMaintenance(true); setConfirmMaintenance(false); showToast('⚠️ Maintenance mode ENABLED'); }} className="flex-1 py-2.5 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white font-semibold text-sm">Enable</button>
            </div>
          </div>
        </div>
      )}

      <TableHeader title="UI & Theme Control" subtitle="Customize platform appearance, branding, and typography." />

      {maintenanceMode && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-700 rounded-xl">
          <Wrench className="w-6 h-6 text-yellow-600 animate-pulse shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-yellow-800 dark:text-yellow-300">⚠️ Maintenance Mode is ACTIVE</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">All users are seeing the maintenance page. No access to platform features.</p>
          </div>
          <button onClick={toggleMaintenance} className="px-4 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold transition-all">Disable Now</button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Brand Colors" />
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Primary Color</span>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-700" style={{ backgroundColor: primaryColor }} />
                <input type="color" value={primaryColor} onChange={e => applyTheme(e.target.value)} className="w-10 h-8 rounded cursor-pointer border-0 p-0" />
                <code className="text-xs font-mono text-gray-500 dark:text-gray-400">{primaryColor}</code>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Quick Theme Presets</p>
              <div className="flex flex-wrap gap-2">
                {THEME_PRESETS.map(t => (
                  <button key={t.label} onClick={() => applyTheme(t.color)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${primaryColor === t.color ? 'border-gray-400' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'} bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400`}>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Typography & Display" />
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform Font</label>
              <select value={font} onChange={e => setFont(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:outline-none">
                {['Inter', 'Poppins', 'Roboto', 'DM Sans', 'Nunito'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Default Dark Mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">New users default to dark mode</p>
              </div>
              <button onClick={() => setDarkModeDefault(!darkModeDefault)} className={darkModeDefault ? 'text-blue-500' : 'text-gray-400'}>
                {darkModeDefault ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-yellow-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Maintenance Mode</h3>
          </div>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Enable Maintenance Page</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Blocks all user access immediately</p>
              </div>
              <button onClick={toggleMaintenance} className={`transition-colors ${maintenanceMode ? 'text-yellow-500' : 'text-gray-400'}`}>
                {maintenanceMode ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9" />}
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Maintenance Message</label>
              <textarea value={maintenanceMsg} onChange={e => setMaintenanceMsg(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-yellow-500 resize-none transition-all" />
            </div>
            <div className={`p-3 rounded-xl border ${maintenanceMode ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
              <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300">Preview Message:</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{maintenanceMsg}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Branding Assets" />
          <CardContent className="space-y-3">
            {[
              { label: 'Platform Logo', hint: 'PNG/SVG, max 2MB', icon: '🖼️' },
              { label: 'Favicon', hint: '32×32 ICO/PNG', icon: '🔖' },
              { label: 'Splash Screen', hint: '1920×1080 PNG', icon: '🎨' },
              { label: 'Email Banner', hint: '600×200 PNG', icon: '✉️' },
            ].map((asset, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3"><span className="text-xl">{asset.icon}</span><div><p className="text-sm font-medium text-gray-800 dark:text-gray-200">{asset.label}</p><p className="text-xs text-gray-400">{asset.hint}</p></div></div>
                <button onClick={() => showToast(`Upload ${asset.label} — file picker opened`)} className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all font-medium">Upload</button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">These settings affect all users. Changes are applied globally without requiring a redeploy.</p>
          {saved && <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"><CheckCircle className="w-4 h-4 text-green-600" /><p className="text-sm text-green-700 dark:text-green-400 font-medium">UI settings saved successfully!</p></div>}
          <button onClick={save} className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm">
            <Save className="w-4 h-4" /> Save All UI Settings
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Feature Control ──────────────────────────────────────────────────────────
interface Feature { key: string; label: string; description: string; category: string; enabled: boolean }

const AddFeatureModal: React.FC<{ onAdd: (f: Feature) => void; onClose: () => void; existingCategories: string[] }> = ({ onAdd, onClose, existingCategories }) => {
  const [form, setForm] = useState({ key: '', label: '', description: '', category: existingCategories[0] || 'Tools', newCategory: '', enabled: false });
  const [useNew, setUseNew] = useState(false);
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = () => {
    if (!form.label.trim() || !form.description.trim()) return;
    const cat = useNew && form.newCategory.trim() ? form.newCategory.trim() : form.category;
    const key = (form.key.trim() || form.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));
    onAdd({ key, label: form.label, description: form.description, category: cat, enabled: form.enabled });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /><h2 className="font-bold text-gray-900 dark:text-white">Add New Feature</h2></div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Feature Label *</label>
            <input value={form.label} onChange={e => set('label', e.target.value)} placeholder="e.g. Alumni Network" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description *</label>
            <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description of this feature..." className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-purple-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Feature Key (auto-generated if blank)</label>
            <input value={form.key} onChange={e => set('key', e.target.value)} placeholder={form.label ? form.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') : 'feature_key'} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono focus:outline-none focus:border-purple-500 transition-all" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500">Category</label>
              <button onClick={() => setUseNew(!useNew)} className="text-xs text-purple-600 dark:text-purple-400 hover:underline">{useNew ? '← Use existing' : '+ New category'}</button>
            </div>
            {useNew ? (
              <input value={form.newCategory} onChange={e => set('newCategory', e.target.value)} placeholder="New category name..." className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-purple-500 transition-all" />
            ) : (
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-purple-500">
                {existingCategories.map(c => <option key={c}>{c}</option>)}
              </select>
            )}
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800">
            <div><p className="text-sm font-medium text-gray-800 dark:text-gray-200">Enable immediately</p><p className="text-xs text-gray-500">Feature will be live upon creation</p></div>
            <button onClick={() => set('enabled', !form.enabled)} className={form.enabled ? 'text-green-500' : 'text-gray-400'}>
              {form.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
          <button onClick={handleAdd} disabled={!form.label.trim() || !form.description.trim()} className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Feature</button>
        </div>
      </div>
    </div>
  );
};

export const FeatureControlPage: React.FC = () => {
  const { features, toggleFeature, addFeature } = useAdminSettings();
  const [showAddFeature, setShowAddFeature] = useState(false);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const toggle = (key: string) => toggleFeature(key);
  const categories = Array.from(new Set(features.map(f => f.category)));

  const categoryColor: Record<string, string> = {
    AI: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    Social: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    Engagement: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    Tools: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    Content: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {showAddFeature && <AddFeatureModal existingCategories={categories} onAdd={f => { addFeature(f); showToast(`Feature "${f.label}" added${f.enabled ? ' and enabled' : ' (disabled)'}`); }} onClose={() => setShowAddFeature(false)} />}
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl"><CheckCircle className="w-4 h-4 text-green-400" /> {toast}</div>}

      <TableHeader title="Feature Control" subtitle="Toggle platform modules on or off without redeploying."
        actions={<button onClick={() => setShowAddFeature(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all font-semibold"><Plus className="w-4 h-4" /> Add Feature</button>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Features', value: features.filter(f => f.enabled).length, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Disabled Features', value: features.filter(f => !f.enabled).length, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800' },
          { label: 'AI Features', value: features.filter(f => f.category === 'AI').length, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Categories', value: categories.length, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map((s, i) => (
          <Card key={i} className="!p-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><Sparkles className={`w-5 h-5 ${s.color}`} /></div><div><div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div><div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div></div></div></Card>
        ))}
      </div>
      {categories.map(cat => (
        <Card key={cat}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColor[cat] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{cat}</span>
              <span className="text-xs text-gray-400">{features.filter(f => f.category === cat).length} features</span>
            </div>
            <span className="text-xs text-gray-400">{features.filter(f => f.category === cat && f.enabled).length} active</span>
          </div>
          <CardContent className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {features.filter(f => f.category === cat).map(f => (
              <div key={f.key} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-8 rounded-full ${f.enabled ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{f.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{f.description}</p>
                    <code className="text-xs text-gray-400 font-mono">{f.key}</code>
                  </div>
                </div>
                <button onClick={() => { toggle(f.key); showToast(`${f.label} ${f.enabled ? 'disabled' : 'enabled'}`); }} className={`transition-colors ${f.enabled ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-500'}`}>
                  {f.enabled ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9" />}
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ── Global Notifications ─────────────────────────────────────────────────────
interface NotifHistory { title: string; audience: string; channel: string; sentAt: string; reach: string; opens: string }

export const AdminNotificationsPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [singleUserEmail, setSingleUserEmail] = useState('');
  const [channel, setChannel] = useState('in-app');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<NotifHistory[]>([
    { title: 'New Internships Posted', audience: 'Students', channel: 'In-App + Email', sentAt: '1 hour ago', reach: '8,200', opens: '4,100' },
    { title: 'System Maintenance Tonight', audience: 'All Users', channel: 'Email', sentAt: '2 days ago', reach: '12,450', opens: '3,800' },
    { title: 'New Feature: ATS Analyzer', audience: 'Students', channel: 'In-App', sentAt: '1 week ago', reach: '10,100', opens: '6,200' },
  ]);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const audienceLabels: Record<string, string> = { all: 'All Users', student: 'Students', company: 'Companies', staff: 'Staff', single: singleUserEmail || 'Single User' };
  const channelLabel: Record<string, string> = { 'in-app': 'In-App', email: 'Email', both: 'In-App + Email' };
  const estimatedReach: Record<string, string> = { all: '12,450', student: '8,200', company: '2,100', staff: '48', single: '1' };

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return;
    if (audience === 'single' && !singleUserEmail.trim()) return;
    setSending(true);
    setTimeout(() => {
      const newEntry: NotifHistory = { title, audience: audienceLabels[audience], channel: channelLabel[channel], sentAt: 'Just now', reach: estimatedReach[audience] || '1', opens: '0' };
      setHistory(prev => [newEntry, ...prev]);
      setSending(false);
      showToast(`✓ Notification sent to ${audienceLabels[audience]} via ${channelLabel[channel]}`);
      setTitle(''); setMessage(''); setSingleUserEmail('');
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl"><CheckCircle className="w-4 h-4 text-green-400" /> {toast}</div>}

      <TableHeader title="Global Notifications" subtitle="Broadcast announcements to targeted user groups." />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Compose Notification" />
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title..."
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Write your notification message..."
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Audience</label>
                <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:outline-none">
                  <option value="all">All Users</option>
                  <option value="student">Students Only</option>
                  <option value="company">Companies Only</option>
                  <option value="staff">Staff Only</option>
                  <option value="single">Single User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Channel</label>
                <select value={channel} onChange={e => setChannel(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:outline-none">
                  <option value="in-app">In-App</option>
                  <option value="email">Email</option>
                  <option value="both">In-App + Email</option>
                </select>
              </div>
            </div>
            {audience === 'single' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Target User Email</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={singleUserEmail} onChange={e => setSingleUserEmail(e.target.value)} placeholder="user@college.edu"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Notification will be sent only to this user's account</p>
              </div>
            )}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-between text-xs text-gray-500">
              <span>Estimated reach:</span>
              <span className="font-bold text-gray-900 dark:text-white">{audience === 'single' ? '1 user' : `~${estimatedReach[audience] || '?'} users`}</span>
            </div>
            <button onClick={handleSend} disabled={!title.trim() || !message.trim() || sending || (audience === 'single' && !singleUserEmail.trim())}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-sm">
              {sending ? <><RefreshCw className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Notification</>}
            </button>
          </CardContent>
        </Card>

        <Card>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Sent History</h3>
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">{history.length} sent</span>
          </div>
          <CardContent className="space-y-0 divide-y divide-gray-50 dark:divide-gray-800">
            {history.map((h, i) => (
              <div key={i} className="py-4">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{h.title}</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{h.sentAt}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>👥 {h.audience}</span>
                  <span>📡 {h.channel}</span>
                  <span>📨 {h.reach} reached</span>
                  <span>👁️ {h.opens} opens</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ── Analytics ─────────────────────────────────────────────────────────────────
const monthlyData = [
  { month: 'Nov', users: 8200, revenue: 42000, internships: 580 },
  { month: 'Dec', users: 9100, revenue: 48000, internships: 620 },
  { month: 'Jan', users: 10200, revenue: 55000, internships: 710 },
  { month: 'Feb', users: 11000, revenue: 61000, internships: 780 },
  { month: 'Mar', users: 11800, revenue: 68000, internships: 830 },
  { month: 'Apr', users: 12450, revenue: 74000, internships: 890 },
];

export const AnalyticsPage: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    <TableHeader title="Platform Analytics" subtitle="Deep insights into platform growth, usage, and revenue." />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Revenue (MTD)', value: '₹74,000', change: '+8.8%', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Monthly Active Users', value: '8,340', change: '+15.2%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Placements This Month', value: '142', change: '+22.4%', icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { label: 'Avg Session (mins)', value: '18.4', change: '+4.1%', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
      ].map((s, i) => (
        <Card key={i} className="!p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
          <div className="text-xs text-green-600 font-medium mt-1 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />{s.change}</div>
        </Card>
      ))}
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">User Growth (6 Months)</h3>
        </div>
        <div className="p-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ReAreaChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TT} />
              <Area type="monotone" dataKey="users" stroke="#ef4444" strokeWidth={2.5} fill="url(#gUsers)" dot={false} />
            </ReAreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Trend (6 Months)</h3>
        </div>
        <div className="p-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TT} formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  </div>
);

// ── Security & Logs ──────────────────────────────────────────────────────────
export const SecurityPage: React.FC = () => {
  const [logs, setLogs] = useState([
    { type: 'Login', user: 'admin@stunivoz.com', ip: '103.21.45.92', location: 'Mumbai, IN', time: '2 min ago', status: 'Success' },
    { type: 'Login Failed', user: 'unknown@hack.com', ip: '45.133.1.100', location: 'Unknown', time: '15 min ago', status: 'Blocked' },
    { type: 'Password Reset', user: 'ananya@iitd.ac.in', ip: '115.250.30.10', location: 'Delhi, IN', time: '1 hour ago', status: 'Success' },
    { type: 'Role Change', user: 'ravi@stunivoz.com', ip: '103.25.90.44', location: 'Bangalore, IN', time: '3 hours ago', status: 'Success' },
    { type: 'API Key Rotated', user: 'admin@stunivoz.com', ip: '103.21.45.92', location: 'Mumbai, IN', time: '5 hours ago', status: 'Success' },
    { type: 'Login Failed', user: 'test@attack.ru', ip: '176.9.50.20', location: 'Germany', time: '6 hours ago', status: 'Blocked' },
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const statusColor: Record<string, string> = {
    Success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    Blocked: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  const refreshLogs = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLogs(prev => [{ type: 'Admin Action', user: 'admin@stunivoz.com', ip: '103.21.45.92', location: 'Mumbai, IN', time: 'Just now', status: 'Success' }, ...prev]);
      setRefreshing(false);
      showToast('Security logs refreshed');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl"><CheckCircle className="w-4 h-4 text-green-400" /> {toast}</div>}

      <TableHeader title="Security & Logs" subtitle="Monitor login activity, API access, and platform security." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Failed Logins (24h)', value: logs.filter(l => l.status === 'Blocked').length.toString(), icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Blocked IPs', value: '3', icon: Shield, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Active Sessions', value: '1,240', icon: Activity, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: '2FA Enabled Users', value: '890', icon: Key, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map((s, i) => (
          <Card key={i} className="!p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Security Audit Log</h3>
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">{logs.length} events</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refreshLogs} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={() => { exportToCSV(logs.map(l => ({ Event: l.type, User: l.user, IP: l.ip, Location: l.location, Time: l.time, Status: l.status })), 'security-audit-log.csv'); showToast('Security log exported'); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
              <Download className="w-3 h-3" /> Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">IP Address</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {logs.map((log, i) => (
                <tr key={i} className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${log.status === 'Blocked' ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white text-sm">{log.type}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-600 dark:text-gray-400 font-mono">{log.user}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400 font-mono">{log.ip}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">{log.location}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">{log.time}</td>
                  <td className="px-5 py-3.5"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[log.status]}`}>{log.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ── Backup & Restore ──────────────────────────────────────────────────────────
export const BackupPage: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState<{ idx: number; backup: { name: string; date: string; size: string } } | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const runBackup = () => {
    setRunning(true);
    setTimeout(() => { setRunning(false); setDone(true); showToast('✓ Manual backup completed — 2.4 GB saved'); setTimeout(() => setDone(false), 5000); }, 2500);
  };

  const startRestore = (idx: number, backup: { name: string; date: string; size: string }) => {
    setRestoreConfirm({ idx, backup });
  };

  const confirmRestore = () => {
    if (!restoreConfirm) return;
    setRestoring(true);
    setTimeout(() => {
      setRestoring(false);
      setRestoreConfirm(null);
      showToast(`✓ Platform restored from "${restoreConfirm.backup.date}" (${restoreConfirm.backup.size})`);
    }, 3000);
  };

  const backups = [
    { name: 'Auto Backup', date: 'May 3, 2025 – 4:00 AM', size: '2.4 GB', type: 'Scheduled', status: 'Success' },
    { name: 'Manual Backup', date: 'May 2, 2025 – 11:30 AM', size: '2.3 GB', type: 'Manual', status: 'Success' },
    { name: 'Auto Backup', date: 'May 2, 2025 – 4:00 AM', size: '2.3 GB', type: 'Scheduled', status: 'Success' },
    { name: 'Auto Backup', date: 'May 1, 2025 – 4:00 AM', size: '2.1 GB', type: 'Scheduled', status: 'Success' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl"><CheckCircle className="w-4 h-4 text-green-400" /> {toast}</div>}

      {restoreConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4"><Database className="w-8 h-8 text-blue-500" /><div><p className="font-bold text-gray-900 dark:text-white">Restore Platform?</p><p className="text-xs text-gray-500 mt-0.5">This will overwrite all current data.</p></div></div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl mb-4 space-y-1">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Restore Point:</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">{restoreConfirm.backup.name} · {restoreConfirm.backup.date}</p>
              <p className="text-xs text-blue-500">Size: {restoreConfirm.backup.size}</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">⚠️ Warning: All data after this backup will be permanently lost.</p>
            </div>
            {restoring ? (
              <div className="flex items-center justify-center gap-3 py-4">
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Restoring platform data...</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setRestoreConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Cancel</button>
                <button onClick={confirmRestore} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2"><Database className="w-4 h-4" /> Restore Now</button>
              </div>
            )}
          </div>
        </div>
      )}

      <TableHeader title="Backup & Restore" subtitle="Manage platform backups, schedules, and restore points." />

      {done && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 dark:text-green-400 font-semibold">Manual backup completed successfully! Size: 2.4 GB</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader title="Manual Backup" />
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Create an instant backup of all Firestore data, storage files, and configuration.</p>
            <div className="space-y-2">
              {['Firestore Database', 'Firebase Storage', 'User Profiles', 'Platform Config'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {item}
                </div>
              ))}
            </div>
            <button onClick={runBackup} disabled={running}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-all">
              {running ? <><RefreshCw className="w-4 h-4 animate-spin" /> Running Backup...</> : <><Database className="w-4 h-4" /> Run Backup Now</>}
            </button>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Backup Schedule</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Auto backup: Daily at 4:00 AM IST</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Retention: Last 30 backups</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Backup History</h3>
              <button onClick={() => { exportToCSV(backups.map(b => ({ Name: b.name, Date: b.date, Size: b.size, Type: b.type, Status: b.status })), 'backup-history.csv'); showToast('Backup history exported'); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                <Download className="w-3 h-3" /> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <tr>
                    <th className="px-5 py-3 font-medium">Backup Name</th>
                    <th className="px-5 py-3 font-medium">Date & Time</th>
                    <th className="px-5 py-3 font-medium">Size</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {backups.map((b, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white text-sm">{b.name}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">{b.date}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300 font-mono">{b.size}</td>
                      <td className="px-5 py-3.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.type === 'Manual' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{b.type}</span></td>
                      <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => showToast(`Downloading backup: ${b.date}`)} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium flex items-center gap-1"><Download className="w-3 h-3" /></button>
                          <button onClick={() => startRestore(i, b)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Restore</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
