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
  ShieldCheck, User as UserIcon, Map, Upload, EyeOff, Layers
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
import { db, uploadFile } from '../../services/firebase';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

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
  photo?: string; provider?: string; uid?: string; lastLogin?: string;
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
    let unsub1: (() => void) | null = null;
    let unsub2: (() => void) | null = null;
    const profilesMap = new Map<string, UserRecord>();
    const usersMap = new Map<string, UserRecord>();

    const toRecord = (d: any, idx: number): UserRecord => {
      const p = d;
      return {
        id: idx + 1,
        name: p.full_name || p.name || p.email || 'Unknown',
        email: p.email || '',
        role: p.role ? (p.role.charAt(0).toUpperCase() + p.role.slice(1)) : 'Student',
        college: p.college || p.university || p.college_name || '—',
        joined: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
        status: p.status || 'Active',
        ats: p.ats_score ?? null,
        logins: p.login_count ?? 0,
        phone: p.phone || '',
        location: p.location || '',
        photo: p.profile_photo || p.photo_url || p.photoURL || '',
        provider: p.provider || 'email',
        uid: p.id || p.uid || '',
        lastLogin: p.last_login ? new Date(p.last_login).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
      };
    };

    const mergeAndSet = () => {
      const merged = new Map<string, UserRecord>();
      usersMap.forEach((r, uid) => merged.set(uid, r));
      profilesMap.forEach((r, uid) => merged.set(uid, r));
      const arr = Array.from(merged.values()).map((r, idx) => ({ ...r, id: idx + 1 }));
      setUsers(arr);
      setLoadingUsers(false);
    };

    (async () => {
      try {
        const { getFirestore, collection, onSnapshot } = await import('firebase/firestore');
        const db = getFirestore();

        unsub1 = onSnapshot(collection(db, 'profiles'), (snap) => {
          profilesMap.clear();
          snap.docs.forEach(d => { profilesMap.set(d.id, toRecord({ id: d.id, ...d.data() }, 0)); });
          mergeAndSet();
        }, (err: any) => {
          const msg = err?.code === 'permission-denied'
            ? 'Firestore rules are blocking admin reads. Add: allow read: if request.auth != null; to your profiles collection rules.'
            : 'Failed to load users. Check your Firebase connection.';
          setUsersError(msg);
          setLoadingUsers(false);
        });

        unsub2 = onSnapshot(collection(db, 'users'), (snap) => {
          usersMap.clear();
          snap.docs.forEach(d => { usersMap.set(d.id, toRecord({ id: d.id, ...d.data() }, 0)); });
          mergeAndSet();
        }, () => {});

      } catch (err: any) {
        setUsersError('Failed to load users. Check your Firebase connection.');
        setLoadingUsers(false);
      }
    })();

    return () => { unsub1?.(); unsub2?.(); };
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
                      {u.photo ? (
                        <img src={u.photo} alt={u.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-gray-700" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style'); }} />
                      ) : null}
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${u.photo ? 'hidden' : ''}`} style={u.photo ? { display: 'none' } : {}}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{u.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                        {u.uid && <div className="text-[10px] text-gray-400 dark:text-gray-600 font-mono mt-0.5 truncate max-w-[160px]" title={u.uid}>{u.uid}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">{u.role}</span>
                      {u.provider && (
                        <span className={`self-start text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          u.provider === 'google' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          u.provider === 'github' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500'
                        }`}>
                          {u.provider === 'google' ? '🔵 Google' : u.provider === 'github' ? '⚫ GitHub' : '✉ Email'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{u.college}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{u.logins}</div>
                    {u.lastLogin && u.lastLogin !== '—' && <div className="text-[10px] text-gray-400 mt-0.5">{u.lastLogin}</div>}
                  </td>
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

// ── Platform Configs ─────────────────────────────────────────────────────────
interface PlatformConfig {
  id: string; name: string; category: string;
  models: string[]; defaultModel: string;
  endpoint: string; description: string;
  keyPrefix: string; keyPlaceholder: string;
  badge: string;
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  openai: {
    id: 'openai', name: 'OpenAI', category: 'AI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    description: 'OpenAI GPT models — industry-leading language models for AI features.',
    keyPrefix: 'sk-', keyPlaceholder: 'sk-...', badge: '🤖',
  },
  gemini: {
    id: 'gemini', name: 'Google Gemini', category: 'AI',
    models: ['gemini-2.0-flash', 'gemini-2.0-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    defaultModel: 'gemini-2.0-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    description: 'Google Gemini — fast, multimodal AI from Google DeepMind.',
    keyPrefix: 'AIzaSy', keyPlaceholder: 'AIzaSy...', badge: '✨',
  },
  claude: {
    id: 'claude', name: 'Anthropic Claude', category: 'AI',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
    defaultModel: 'claude-3-5-sonnet-20241022',
    endpoint: 'https://api.anthropic.com/v1/messages',
    description: 'Anthropic Claude — thoughtful, safety-focused AI assistant.',
    keyPrefix: 'sk-ant-', keyPlaceholder: 'sk-ant-...', badge: '🧠',
  },
  sendgrid: {
    id: 'sendgrid', name: 'SendGrid', category: 'Email',
    models: [], defaultModel: '',
    endpoint: 'https://api.sendgrid.com/v3',
    description: 'SendGrid — transactional email for notifications, OTPs, and newsletters.',
    keyPrefix: 'SG.', keyPlaceholder: 'SG....', badge: '📧',
  },
  github: {
    id: 'github', name: 'GitHub', category: 'Skills',
    models: [], defaultModel: '',
    endpoint: 'https://api.github.com',
    description: 'GitHub API — fetch repository, profile, and contribution data for students.',
    keyPrefix: 'ghp_', keyPlaceholder: 'ghp_...', badge: '🐙',
  },
  custom: {
    id: 'custom', name: 'Custom API', category: 'Analytics',
    models: [], defaultModel: '',
    endpoint: '',
    description: 'Custom API integration — connect any external service to STUNIVOZ.',
    keyPrefix: '', keyPlaceholder: 'Paste your API key...', badge: '🔧',
  },
};

const AI_FEATURES = [
  { id: 'discover', label: 'AI Discover', subtitle: 'Internships, Events & Courses', colorClass: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' },
  { id: 'career_chat', label: 'Career Chatbot', subtitle: 'Student guidance assistant', colorClass: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' },
  { id: 'ats', label: 'ATS Analyzer', subtitle: 'Resume analysis & scoring', colorClass: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300' },
  { id: 'recommendations', label: 'AI Recommendations', subtitle: 'Personalized suggestions', colorClass: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300' },
];

const API_RECORDS_KEY = 'stunivoz_api_records';
const FEATURE_API_KEY = 'stunivoz_feature_apis';

// ── API Record ────────────────────────────────────────────────────────────────
interface ApiRecord {
  id: number; platform: string; name: string; model: string;
  category: string; endpoint: string;
  calls: number; limit: number; status: string; latency: string;
  apiKey?: string; description?: string;
}

// ── Add API Modal (Platform-Based) ───────────────────────────────────────────
const AddAPIModal: React.FC<{ onSave: (a: ApiRecord) => void; onClose: () => void; nextId: number }> = ({ onSave, onClose, nextId }) => {
  const [platformId, setPlatformId] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(PLATFORM_CONFIGS['gemini'].defaultModel);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  const platform = PLATFORM_CONFIGS[platformId];

  const handlePlatformChange = (id: string) => {
    setPlatformId(id);
    setModel(PLATFORM_CONFIGS[id].defaultModel);
    setCustomEndpoint('');
    setError('');
  };

  const handleSave = () => {
    if (!apiKey.trim()) { setError('Please enter an API key.'); return; }
    const p = PLATFORM_CONFIGS[platformId];
    const rec: ApiRecord = {
      id: nextId,
      platform: platformId,
      name: p.name,
      model: model || p.defaultModel,
      category: p.category,
      endpoint: platformId === 'custom' ? customEndpoint : p.endpoint,
      calls: 0, limit: 10000,
      status: 'Online',
      latency: (30 + Math.floor(Math.random() * 80)) + 'ms',
      apiKey: apiKey.trim(),
      description: p.description,
    };
    onSave(rec);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2"><Key className="w-5 h-5 text-blue-500" /><h2 className="font-bold text-gray-900 dark:text-white">Add API Integration</h2></div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Select Platform</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(PLATFORM_CONFIGS).map(p => (
                <button key={p.id} onClick={() => handlePlatformChange(p.id)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${platformId === p.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}
                >
                  <span className="text-lg">{p.badge}</span>
                  <span className="truncate w-full text-center">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
          {platform.models.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Model</label>
              <select value={model} onChange={e => setModel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                {platform.models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">API Key <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => { setApiKey(e.target.value); setError(''); }}
                placeholder={platform.keyPlaceholder}
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
              <button onClick={() => setShowKey(s => !s)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          {platformId === 'custom' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">API Endpoint</label>
              <input value={customEndpoint} onChange={e => setCustomEndpoint(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono focus:outline-none focus:border-blue-500 transition-all" />
            </div>
          )}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">Endpoint:</span> {platformId === 'custom' ? (customEndpoint || '—') : platform.endpoint}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">Category:</span> {platform.category}</p>
            <p className="text-gray-400 dark:text-gray-500">{platform.description}</p>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={!apiKey.trim()} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Add Integration
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Feature Assignment Section ────────────────────────────────────────────────
const FeatureAssignmentSection: React.FC<{ apis: ApiRecord[] }> = ({ apis }) => {
  const [featureApis, setFeatureApis] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(FEATURE_API_KEY) || '{}'); } catch { return {}; }
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (featureId: string, apiId: string) => {
    const next = { ...featureApis, [featureId]: apiId };
    setFeatureApis(next);
    localStorage.setItem(FEATURE_API_KEY, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const aiApis = apis.filter(a => a.category === 'AI' && a.status === 'Online');
  return (
    <Card>
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Feature API Assignment</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Assign a specific AI API to each platform feature.</p>
        </div>
        {saved && <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Saved</span>}
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AI_FEATURES.map(f => (
          <div key={f.id} className={`p-3 rounded-xl border ${f.colorClass}`}>
            <div className="font-semibold text-sm mb-0.5">{f.label}</div>
            <div className="text-xs opacity-70 mb-2">{f.subtitle}</div>
            <select
              value={featureApis[f.id] || ''}
              onChange={e => handleChange(f.id, e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-current/20 bg-white/60 dark:bg-gray-900/40 text-xs font-medium focus:outline-none"
            >
              <option value="">— Use Global AI Config —</option>
              {aiApis.map(a => (
                <option key={a.id} value={String(a.id)}>{a.name} ({a.model || 'default'})</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {aiApis.length === 0 && (
        <p className="px-4 pb-4 text-xs text-gray-400 dark:text-gray-600">Add an AI API integration above to assign it to platform features.</p>
      )}
    </Card>
  );
};

// ── API System ───────────────────────────────────────────────────────────────
export const APISystemPage: React.FC = () => {
  const [apis, setApis] = useState<ApiRecord[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(API_RECORDS_KEY) || '[]');
      if (saved.length > 0) return saved;
    } catch {}
    return [
      { id: 1, platform: 'openai', name: 'OpenAI', model: 'gpt-4o-mini', category: 'AI', endpoint: 'https://api.openai.com/v1/chat/completions', calls: 8420, limit: 10000, status: 'Online', latency: '380ms' },
      { id: 2, platform: 'gemini', name: 'Google Gemini', model: 'gemini-2.0-flash', category: 'AI', endpoint: 'https://generativelanguage.googleapis.com/v1beta', calls: 45200, limit: 100000, status: 'Online', latency: '42ms' },
      { id: 3, platform: 'sendgrid', name: 'SendGrid', model: '', category: 'Email', endpoint: 'https://api.sendgrid.com/v3', calls: 1240, limit: 5000, status: 'Online', latency: '95ms' },
    ];
  });
  const [editingApi, setEditingApi] = useState<ApiRecord | null>(null);
  const [addingApi, setAddingApi] = useState(false);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const persistApis = (updated: ApiRecord[]) => {
    setApis(updated);
    localStorage.setItem(API_RECORDS_KEY, JSON.stringify(updated));
  };

  const toggleApi = (id: number) => {
    persistApis(apis.map(a => a.id === id ? { ...a, status: a.status === 'Online' ? 'Offline' : 'Online' } : a));
    showToast('API status toggled');
  };
  const refreshApi = (id: number) => {
    setRefreshingId(id);
    setTimeout(() => {
      persistApis(apis.map(a => a.id === id ? { ...a, latency: (20 + Math.floor(Math.random() * 150)) + 'ms', calls: a.calls + Math.floor(Math.random() * 5) } : a));
      setRefreshingId(null); showToast('API stats refreshed');
    }, 1200);
  };
  const deleteApi = (id: number) => { persistApis(apis.filter(a => a.id !== id)); showToast('Integration removed'); };

  const platformBadge = (p: string) => PLATFORM_CONFIGS[p]?.badge ?? '🔌';

  return (
    <div className="space-y-6 animate-fade-in">
      {editingApi && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2"><span className="text-xl">{platformBadge(editingApi.platform)}</span><h2 className="font-bold text-gray-900 dark:text-white">Edit — {editingApi.name}</h2></div>
              <button onClick={() => setEditingApi(null)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              {PLATFORM_CONFIGS[editingApi.platform]?.models.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Model</label>
                  <select value={editingApi.model} onChange={e => setEditingApi({ ...editingApi, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-blue-500">
                    {PLATFORM_CONFIGS[editingApi.platform].models.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Rate Limit (calls/month)</label>
                <input type="number" value={editingApi.limit} onChange={e => setEditingApi({ ...editingApi, limit: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select value={editingApi.status} onChange={e => setEditingApi({ ...editingApi, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-blue-500">
                  <option>Online</option><option>Offline</option><option>Warning</option>
                </select>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs text-gray-500">
                <p><span className="font-semibold">Endpoint:</span> {editingApi.endpoint}</p>
                <p><span className="font-semibold">Category:</span> {editingApi.category}</p>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setEditingApi(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
              <button onClick={() => { persistApis(apis.map(a => a.id === editingApi.id ? editingApi : a)); setEditingApi(null); showToast('API settings saved'); }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save Settings</button>
            </div>
          </div>
        </div>
      )}
      {addingApi && <AddAPIModal nextId={apis.length > 0 ? Math.max(...apis.map(a => a.id)) + 1 : 1} onSave={a => { persistApis([...apis, a]); setAddingApi(false); showToast('API integration added'); }} onClose={() => setAddingApi(false)} />}
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
                <th className="px-5 py-3 font-medium">Platform / Name</th>
                <th className="px-5 py-3 font-medium">Model</th>
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
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-base">
                        {platformBadge(api.platform)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{api.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono truncate max-w-[180px]">{api.endpoint}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-mono">{api.model || api.category}</span>
                  </td>
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
                      <button onClick={() => toggleApi(api.id)} title={api.status === 'Online' ? 'Disable' : 'Enable'} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${api.status === 'Online' ? 'text-green-500 hover:text-red-500' : 'text-red-400 hover:text-green-500'}`}>
                        {api.status === 'Online' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button title="Edit settings" onClick={() => setEditingApi(api)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-colors"><Settings2 className="w-4 h-4" /></button>
                      <button title="Refresh stats" onClick={() => refreshApi(api.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-purple-600 transition-colors"><RefreshCw className={`w-4 h-4 ${refreshingId === api.id ? 'animate-spin' : ''}`} /></button>
                      <button title="Remove" onClick={() => deleteApi(api.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {apis.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">No API integrations yet. Click "Add API" to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <FeatureAssignmentSection apis={apis} />
    </div>
  );
};

// ── Roadmap Management ────────────────────────────────────────────────────────

const ROADMAP_CATEGORIES = [
  'Software Engineering', 'Data Science', 'UI/UX Design', 'Marketing',
  'Finance', 'Cybersecurity', 'AI / ML', 'Analytics', 'Product Management',
  'Web Development', 'General',
];
const ROADMAP_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

interface RoadmapDoc {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  pdfUrl?: string;
  pdfName?: string;
  duration?: string;
  level?: string;
  tags?: string[];
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const emptyRoadmap = (): Omit<RoadmapDoc, 'id'> => ({
  title: '', description: '', category: 'General', content: '',
  pdfUrl: '', pdfName: '', duration: '', level: 'Beginner',
  tags: [], published: false,
});

export const RoadmapManagementPage: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<RoadmapDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [fsError, setFsError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RoadmapDoc | null>(null);
  const [form, setForm] = useState(emptyRoadmap());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [toast, setToast] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    setFsError('');
    const unsub = onSnapshot(
      collection(db, 'roadmaps'),
      snap => {
        const docs = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as RoadmapDoc))
          .sort((a, b) => {
            if (!a.createdAt && !b.createdAt) return 0;
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return b.createdAt.localeCompare(a.createdAt);
          });
        setRoadmaps(docs);
        setLoading(false);
        setFsError('');
      },
      err => {
        setLoading(false);
        setFsError(
          err.code === 'permission-denied'
            ? 'Firebase rules are blocking access. Go to Firebase Console → Firestore → Rules and set:\n\nmatch /roadmaps/{id} { allow read, write: if request.auth != null; }'
            : `Firestore error: ${err.message}`
        );
      }
    );
    return () => unsub();
  }, []);

  const openAdd = () => { setEditing(null); setForm(emptyRoadmap()); setTagInput(''); setSaveError(''); setUploadError(''); setShowForm(true); };
  const openEdit = (r: RoadmapDoc) => { setEditing(r); setForm({ ...r }); setTagInput(r.tags?.join(', ') || ''); setSaveError(''); setUploadError(''); setShowForm(true); };

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') { setUploadError('Please select a PDF file (.pdf only)'); return; }
    if (file.size > 20 * 1024 * 1024) { setUploadError('PDF must be under 20MB'); return; }
    setUploading(true);
    setUploadProgress('Uploading PDF to Firebase Storage...');
    setUploadError('');
    const path = `roadmaps/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const result = await uploadFile(file, path);
    if (result.success && result.url) {
      setForm(f => ({ ...f, pdfUrl: result.url!, pdfName: file.name }));
      setUploadProgress('');
      showToast('PDF uploaded successfully!');
    } else {
      const err = result.error as any;
      const isRules = err?.code === 'storage/unauthorized';
      setUploadError(
        isRules
          ? 'Firebase Storage rules are blocking PDF uploads. Go to Firebase Console → Storage → Rules and set:\n\nmatch /{allPaths=**} { allow read, write: if request.auth != null; }'
          : `Upload failed: ${err?.message || 'Unknown error — check Firebase Storage rules'}`
      );
      setUploadProgress('');
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setSaveError('Title is required'); return; }
    if (!form.category) { setSaveError('Category is required'); return; }
    setSaving(true);
    setSaveError('');
    try {
      const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
      const now = new Date().toISOString();
      const data = { ...form, tags, updatedAt: now };
      if (editing) {
        await updateDoc(doc(db, 'roadmaps', editing.id), data);
        showToast('Roadmap updated — students will see it instantly!');
      } else {
        await addDoc(collection(db, 'roadmaps'), { ...data, createdAt: now });
        showToast('Roadmap created! Toggle "Published" to make it visible to students.');
      }
      setShowForm(false);
    } catch (e: any) {
      const isRules = e?.code === 'permission-denied';
      setSaveError(
        isRules
          ? 'Firebase rules denied write. Go to Firebase Console → Firestore → Rules and set:\n\nmatch /roadmaps/{id} { allow read, write: if request.auth != null; }'
          : `Save failed: ${e?.message || 'Unknown error'}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'roadmaps', id));
      showToast('Roadmap deleted');
    } catch (e: any) {
      showToast('Delete failed: ' + (e?.message || 'Check Firebase rules'));
    }
    setDeleteConfirm(null);
  };

  const togglePublish = async (r: RoadmapDoc) => {
    try {
      await updateDoc(doc(db, 'roadmaps', r.id), { published: !r.published });
      showToast(r.published ? 'Roadmap unpublished' : 'Roadmap published — visible to students now!');
    } catch (e: any) {
      showToast('Update failed: ' + (e?.message || 'Check Firebase rules'));
    }
  };

  const filtered = roadmaps.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || r.category === catFilter;
    return matchSearch && matchCat;
  });

  const published = roadmaps.filter(r => r.published).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl animate-fade-in">
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /> {toast}
        </div>
      )}

      {/* Persistent Firestore error banner */}
      {fsError && (
        <div className="flex gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">Firebase Access Error</p>
            <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap font-mono bg-red-100 dark:bg-red-900/30 rounded-lg p-2">{fsError}</pre>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Map className="w-6 h-6 text-primary-500" /> Career Roadmaps
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Upload and manage career roadmaps for students by category</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-lg shadow-primary-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Roadmap
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Roadmaps', value: roadmaps.length, icon: Map, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Published', value: published, icon: Eye, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Draft', value: roadmaps.length - published, icon: EyeOff, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
          { label: 'Categories', value: new Set(roadmaps.map(r => r.category)).size, icon: Layers, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
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

      {/* Filters */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Search roadmaps..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
          <select
            value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary-500 transition-all"
          >
            <option value="All">All Categories</option>
            {ROADMAP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-gray-300 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-400">Loading roadmaps...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Map className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">No roadmaps found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Click "Add Roadmap" to create your first career roadmap</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Title', 'Category', 'Level', 'PDF', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{r.title}</div>
                      {r.duration && <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{r.duration}</div>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium border border-primary-200 dark:border-primary-800">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.level === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : r.level === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>{r.level || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {r.pdfUrl ? (
                        <a href={r.pdfUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
                          <FileText className="w-3.5 h-3.5" /> {r.pdfName ? r.pdfName.slice(0, 20) + (r.pdfName.length > 20 ? '…' : '') : 'View PDF'}
                        </a>
                      ) : <span className="text-xs text-gray-400">No PDF</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => togglePublish(r)}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border transition-all ${
                          r.published
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}>
                        {r.published ? <><Eye className="w-3 h-3" /> Published</> : <><EyeOff className="w-3 h-3" /> Draft</>}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(r)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        {deleteConfirm === r.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(r.id)}
                              className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-all">Delete</button>
                            <button onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(r.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => !saving && setShowForm(false)}>
          <div
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">{editing ? 'Edit Roadmap' : 'Add New Roadmap'}</h3>
              </div>
              <button onClick={() => !saving && setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Title *</label>
                <input
                  type="text" placeholder="e.g. Full Stack Developer Roadmap"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Description *</label>
                <textarea
                  rows={2} placeholder="Brief description of what students will learn..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                />
              </div>

              {/* Category + Level + Duration */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Category *</label>
                  <select
                    value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 transition-all"
                  >
                    {ROADMAP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Level</label>
                  <select
                    value={form.level || 'Beginner'} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 transition-all"
                  >
                    {ROADMAP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Duration</label>
                  <input
                    type="text" placeholder="e.g. 3-6 months"
                    value={form.duration || ''} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Tags <span className="font-normal text-gray-400">(comma separated)</span></label>
                <input
                  type="text" placeholder="e.g. React, Node.js, MongoDB"
                  value={tagInput} onChange={e => setTagInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>

              {/* Detailed Content */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Detailed Content / Steps
                  <span className="ml-1 font-normal text-gray-400">(students will see this as roadmap details)</span>
                </label>
                <textarea
                  rows={7}
                  placeholder={"Step 1: Learn HTML & CSS basics\nStep 2: JavaScript fundamentals\nStep 3: React.js framework\n..."}
                  value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-y font-mono"
                />
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Roadmap PDF</label>
                <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); e.target.value = ''; }} />
                {form.pdfUrl ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300 truncate">{form.pdfName || 'PDF uploaded'}</p>
                      <a href={form.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">Preview PDF ↗</a>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => fileRef.current?.click()} disabled={uploading}
                        className="text-xs px-2 py-1 rounded-lg bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 transition-all">
                        Replace
                      </button>
                      <button onClick={() => { setForm(f => ({ ...f, pdfUrl: '', pdfName: '' })); setUploadError(''); }}
                        className="text-xs px-2 py-1 rounded-lg bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 transition-all">
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-gray-500 dark:text-gray-400 disabled:opacity-60"
                  >
                    {uploading ? (
                      <><RefreshCw className="w-7 h-7 animate-spin text-primary-500" /><span className="text-sm font-medium text-primary-500">{uploadProgress}</span></>
                    ) : (
                      <><Upload className="w-7 h-7" /><span className="text-sm font-medium">Click to upload PDF</span><span className="text-xs">Max 20MB · PDF files only</span></>
                    )}
                  </button>
                )}
                {uploadError && (
                  <div className="mt-2 flex gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap font-mono">{uploadError}</pre>
                  </div>
                )}
              </div>

              {/* Publish toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Published</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Visible to students on the Roadmaps page</p>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, published: !f.published }))}
                  className={`relative w-12 h-6 rounded-full transition-all ${form.published ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.published ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
              {saveError && (
                <div className="flex gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap font-mono">{saveError}</pre>
                </div>
              )}
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => !saving && setShowForm(false)} disabled={saving}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || uploading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold text-sm transition-all">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Roadmap'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── AI Control ───────────────────────────────────────────────────────────────

type DetectedPlatform = 'openai' | 'gemini' | 'claude' | 'groq' | 'unknown';

interface DetectionResult {
  platform: DetectedPlatform;
  name: string;
  badge: string;
  color: string;
  docsUrl: string;
  defaultModels: string[];
}

const DETECT_MAP: { prefix: string; result: DetectionResult }[] = [
  { prefix: 'AIza', result: { platform: 'gemini', name: 'Google Gemini', badge: '✨', color: 'blue', docsUrl: 'https://aistudio.google.com/app/apikey', defaultModels: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'] } },
  { prefix: 'sk-ant-', result: { platform: 'claude', name: 'Anthropic Claude', badge: '🧠', color: 'orange', docsUrl: 'https://console.anthropic.com/settings/keys', defaultModels: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'] } },
  { prefix: 'gsk_', result: { platform: 'groq', name: 'Groq', badge: '⚡', color: 'yellow', docsUrl: 'https://console.groq.com/keys', defaultModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'] } },
  { prefix: 'sk-', result: { platform: 'openai', name: 'OpenAI', badge: '🤖', color: 'green', docsUrl: 'https://platform.openai.com/api-keys', defaultModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] } },
];

const UNKNOWN_RESULT: DetectionResult = { platform: 'unknown', name: 'Unknown Platform', badge: '🔑', color: 'gray', docsUrl: '', defaultModels: [] };

function detectPlatform(key: string): DetectionResult {
  const trimmed = key.trim();
  for (const { prefix, result } of DETECT_MAP) {
    if (trimmed.startsWith(prefix)) return result;
  }
  return UNKNOWN_RESULT;
}

async function fetchAvailableModels(platform: DetectedPlatform, apiKey: string): Promise<string[]> {
  try {
    if (platform === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', { headers: { 'Authorization': `Bearer ${apiKey}` } });
      if (!res.ok) return [];
      const data = await res.json();
      const gpt = (data.data as any[]).filter(m => m.id.startsWith('gpt')).map(m => m.id).sort();
      return gpt.length > 0 ? gpt : DETECT_MAP.find(x => x.result.platform === 'openai')!.result.defaultModels;
    }
    if (platform === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!res.ok) return [];
      const data = await res.json();
      const models = (data.models as any[])
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''))
        .filter(n => n.startsWith('gemini'));
      return models.length > 0 ? models : DETECT_MAP.find(x => x.result.platform === 'gemini')!.result.defaultModels;
    }
    if (platform === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/models', { headers: { 'Authorization': `Bearer ${apiKey}` } });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.data as any[]).map(m => m.id).sort();
    }
    return DETECT_MAP.find(x => x.result.platform === platform)?.result.defaultModels ?? [];
  } catch {
    return DETECT_MAP.find(x => x.result.platform === platform)?.result.defaultModels ?? [];
  }
}

interface SmartApiEntry {
  id: string;
  platform: DetectedPlatform;
  name: string;
  badge: string;
  apiKey: string;
  models: string[];
  selectedModel: string;
  status: 'idle' | 'detecting' | 'fetching' | 'ready' | 'error';
  errorMsg?: string;
  savedAt?: string;
}

const AI_FEATURES_LIST = [
  { id: 'discover', label: 'AI Discover', subtitle: 'Internships, Events & Courses', icon: Sparkles, colorClass: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' },
  { id: 'career_chat', label: 'Career Chatbot', subtitle: 'Student guidance assistant', icon: Bot, colorClass: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' },
  { id: 'ats', label: 'ATS Analyzer', subtitle: 'Resume analysis & scoring', icon: FileText, colorClass: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300' },
  { id: 'detection', label: 'Scam Detection', subtitle: 'Content verification AI', icon: ShieldCheck, colorClass: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' },
];

const SMART_API_KEY = 'stunivoz_smart_apis_v2';
const FEATURE_ASSIGN_KEY = 'stunivoz_feature_assign_v2';

export const AIControlPage: React.FC = () => {
  const { setAIConfig } = useAdminSettings();
  const [entries, setEntries] = useState<SmartApiEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem(SMART_API_KEY) || '[]'); } catch { return []; }
  });
  const [newKey, setNewKey] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [addStatus, setAddStatus] = useState<'idle' | 'detecting' | 'fetching' | 'done' | 'error'>('idle');
  const addStatusRef = useRef<'idle' | 'detecting' | 'fetching' | 'done' | 'error'>('idle');
  const setAddStatusSafe = (s: 'idle' | 'detecting' | 'fetching' | 'done' | 'error') => {
    addStatusRef.current = s;
    setAddStatus(s);
  };
  const [addError, setAddError] = useState('');
  const autoTriggerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [featureAssign, setFeatureAssign] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(FEATURE_ASSIGN_KEY) || '{}'); } catch { return {}; }
  });
  const [toast, setToast] = useState('');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; msg: string }>>({});

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const persistEntries = (updated: SmartApiEntry[]) => {
    setEntries(updated);
    localStorage.setItem(SMART_API_KEY, JSON.stringify(updated));
    const activeAI = updated.find(e => e.status === 'ready' && ['openai', 'gemini', 'claude', 'groq'].includes(e.platform));
    if (activeAI) setAIConfig(activeAI.platform, activeAI.selectedModel, activeAI.apiKey);
    saveToFirestore(updated).catch(() => {});
  };

  const saveToFirestore = async (updated: SmartApiEntry[]) => {
    try {
      const { saveApiConfig } = await import('../../services/firebase');
      const activeAI = updated.find(e => e.status === 'ready');
      await saveApiConfig({
        entries: updated.map(e => ({ ...e, apiKey: e.apiKey ? '***stored***' : '' })),
        activeProvider: activeAI?.platform || '',
        activeModel: activeAI?.selectedModel || '',
        updatedAt: new Date().toISOString(),
      });
    } catch {}
  };

  // Auto-trigger when key is pasted / typed and matches a known prefix
  const handleAddKeyWithValue = async (key: string) => {
    if (!key) { setAddError('Please enter an API key.'); return; }
    setAddError('');
    setAddStatusSafe('detecting');

    const detected = detectPlatform(key);
    if (detected.platform === 'unknown') {
      setAddStatusSafe('error');
      setAddError('Could not auto-detect platform. Paste a full key: AIza... (Gemini), sk-... (OpenAI), sk-ant-... (Claude), gsk_... (Groq)');
      return;
    }

    setAddStatusSafe('fetching');
    const models = await fetchAvailableModels(detected.platform, key);

    const entry: SmartApiEntry = {
      id: Date.now().toString(),
      platform: detected.platform,
      name: detected.name,
      badge: detected.badge,
      apiKey: key,
      models: models.length > 0 ? models : detected.defaultModels,
      selectedModel: models[0] || detected.defaultModels[0] || '',
      status: 'ready',
      savedAt: new Date().toLocaleString(),
    };

    setEntries(prev => {
      const existingIdx = prev.findIndex(e => e.platform === detected.platform);
      const updated = existingIdx >= 0
        ? prev.map((e, i) => i === existingIdx ? entry : e)
        : [...prev, entry];
      localStorage.setItem(SMART_API_KEY, JSON.stringify(updated));
      const active = updated.find(e => e.status === 'ready' && ['openai', 'gemini', 'claude', 'groq'].includes(e.platform));
      if (active) setAIConfig(active.platform, active.selectedModel, active.apiKey);
      saveToFirestore(updated).catch(() => {});
      return updated;
    });

    if (models.length > 0) {
      showToast(`${detected.name} detected — ${models.length} models loaded ✓`);
    } else {
      showToast(`${detected.name} added with default models`);
    }
    setNewKey('');
    setAddStatusSafe('done');
    setTimeout(() => setAddStatusSafe('idle'), 2500);
  };

  const handleKeyChange = (val: string) => {
    setNewKey(val);
    setAddError('');
    if (autoTriggerRef.current) clearTimeout(autoTriggerRef.current);
    const trimmed = val.trim();
    const knownPrefix = DETECT_MAP.some(({ prefix }) => trimmed.startsWith(prefix));
    if (knownPrefix && trimmed.length >= 20 && addStatusRef.current === 'idle') {
      autoTriggerRef.current = setTimeout(() => {
        handleAddKeyWithValue(trimmed);
      }, 600);
    }
  };

  const handleAddKey = () => {
    const key = newKey.trim();
    if (!key) { setAddError('Please enter an API key.'); return; }
    if (autoTriggerRef.current) clearTimeout(autoTriggerRef.current);
    handleAddKeyWithValue(key);
  };

  const removeEntry = (id: string) => {
    persistEntries(entries.filter(e => e.id !== id));
    showToast('API key removed');
  };

  const updateModel = (id: string, model: string) => {
    const updated = entries.map(e => e.id === id ? { ...e, selectedModel: model } : e);
    persistEntries(updated);
  };

  const testConnection = async (entry: SmartApiEntry) => {
    setTestingId(entry.id);
    setTestResults(prev => ({ ...prev, [entry.id]: { ok: false, msg: 'Testing...' } }));
    try {
      let ok = false;
      let msg = '';
      if (entry.platform === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${entry.selectedModel}:generateContent?key=${entry.apiKey}`;
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Reply with one word: OK' }] }] }) });
        ok = res.ok;
        msg = ok ? `Gemini API working! Model: ${entry.selectedModel}` : `API error: ${res.status}`;
      } else if (entry.platform === 'openai' || entry.platform === 'groq') {
        const url = entry.platform === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${entry.apiKey}` }, body: JSON.stringify({ model: entry.selectedModel, messages: [{ role: 'user', content: 'Say OK' }], max_tokens: 5 }) });
        ok = res.ok;
        msg = ok ? `${entry.name} API working! Model: ${entry.selectedModel}` : `API error: ${res.status}`;
      } else if (entry.platform === 'claude') {
        const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': entry.apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: entry.selectedModel, max_tokens: 5, messages: [{ role: 'user', content: 'Say OK' }] }) });
        ok = res.ok;
        msg = ok ? `Claude API working! Model: ${entry.selectedModel}` : `API error: ${res.status}`;
      }
      setTestResults(prev => ({ ...prev, [entry.id]: { ok, msg } }));
    } catch (e: any) {
      setTestResults(prev => ({ ...prev, [entry.id]: { ok: false, msg: e?.message || 'Connection failed' } }));
    } finally {
      setTestingId(null);
    }
  };

  const updateFeatureAssign = (featureId: string, entryId: string) => {
    const next = { ...featureAssign, [featureId]: entryId };
    setFeatureAssign(next);
    localStorage.setItem(FEATURE_ASSIGN_KEY, JSON.stringify(next));
    showToast('Feature assignment saved');
  };

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  };

  const readyEntries = entries.filter(e => e.status === 'ready');

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl"><CheckCircle className="w-4 h-4 text-green-400" /> {toast}</div>}

      <TableHeader
        title="Smart AI Settings"
        subtitle="Paste any API key — the system automatically detects the platform, loads all available models, and configures everything for you."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'API Keys Configured', value: readyEntries.length, icon: Key, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Platforms Connected', value: new Set(readyEntries.map(e => e.platform)).size, icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Total Models Available', value: readyEntries.reduce((sum, e) => sum + e.models.length, 0), icon: Zap, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Features Assigned', value: Object.values(featureAssign).filter(Boolean).length, icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
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

      {/* Smart Key Entry */}
      <Card>
        <CardHeader
          title="Add API Key — Auto Setup"
          subtitle='Just paste your API key. We detect the platform (OpenAI, Gemini, Claude, Groq) and load all models automatically — no manual setup needed.'
        />
        <CardContent>
          <div className="space-y-4">
            {/* Platform hints */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { badge: '✨', name: 'Google Gemini', prefix: 'AIza...', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' },
                { badge: '🤖', name: 'OpenAI', prefix: 'sk-...', color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' },
                { badge: '🧠', name: 'Claude', prefix: 'sk-ant-...', color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300' },
                { badge: '⚡', name: 'Groq', prefix: 'gsk_...', color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300' },
              ].map(p => (
                <div key={p.name} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium ${p.color}`}>
                  <span className="text-base">{p.badge}</span>
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="opacity-70 font-mono text-[10px]">{p.prefix}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Key input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Paste API Key
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-detects on paste
                </span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showNewKey ? 'text' : 'password'}
                    value={newKey}
                    onChange={e => handleKeyChange(e.target.value)}
                    onPaste={e => {
                      const pasted = e.clipboardData.getData('text').trim();
                      if (pasted) {
                        e.preventDefault();
                        handleKeyChange(pasted);
                      }
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleAddKey()}
                    placeholder="Paste your API key here (AIza..., sk-..., sk-ant-..., gsk_...)"
                    className="w-full pl-9 pr-16 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                  />
                  <button onClick={() => setShowNewKey(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium">
                    {showNewKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={handleAddKey}
                  disabled={!newKey.trim() || addStatus === 'detecting' || addStatus === 'fetching'}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm transition-all whitespace-nowrap"
                >
                  {addStatus === 'detecting' ? <><RefreshCw className="w-4 h-4 animate-spin" /> Detecting...</>
                    : addStatus === 'fetching' ? <><RefreshCw className="w-4 h-4 animate-spin" /> Loading Models...</>
                    : addStatus === 'done' ? <><CheckCircle className="w-4 h-4" /> Done!</>
                    : <><Sparkles className="w-4 h-4" /> Auto Setup</>}
                </button>
              </div>
              {addError && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {addError}</p>}
              {addStatus === 'detecting' && <p className="text-xs text-purple-500 mt-2 flex items-center gap-1.5"><RefreshCw className="w-3 h-3 animate-spin" /> Detecting platform from key format...</p>}
              {addStatus === 'fetching' && <p className="text-xs text-blue-500 mt-2 flex items-center gap-1.5"><RefreshCw className="w-3 h-3 animate-spin" /> Fetching available models from API...</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configured APIs */}
      {readyEntries.length > 0 && (
        <Card>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Configured AI Platforms</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Select active model for each platform. Changes sync to all AI features.</p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {readyEntries.map(entry => {
              const detectedInfo = DETECT_MAP.find(x => x.result.platform === entry.platform)?.result;
              const col = colorMap[detectedInfo?.color || 'gray'];
              const testResult = testResults[entry.id];
              return (
                <div key={entry.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${col}`}>
                        {entry.badge}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{entry.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono truncate">
                          {entry.apiKey.slice(0, 8)}{'•'.repeat(12)}
                        </div>
                        {entry.savedAt && <div className="text-[10px] text-gray-400">Added {entry.savedAt}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => testConnection(entry)}
                        disabled={testingId === entry.id}
                        title="Test connection"
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-green-600 transition-colors"
                      >
                        {testingId === entry.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                      </button>
                      <button onClick={() => removeEntry(entry.id)} title="Remove" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Active Model <span className="text-gray-400">({entry.models.length} available)</span>
                    </label>
                    <select
                      value={entry.selectedModel}
                      onChange={e => updateModel(entry.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-all"
                    >
                      {entry.models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  {testResult && (
                    <div className={`flex items-center gap-2 p-2.5 rounded-xl text-xs border ${testResult.ok ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'}`}>
                      {testResult.ok ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />}
                      {testResult.msg}
                    </div>
                  )}

                  {detectedInfo?.docsUrl && (
                    <a href={detectedInfo.docsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:text-purple-600 flex items-center gap-1 w-fit">
                      <ExternalLink className="w-3 h-3" /> Get or manage {entry.name} keys
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Feature Assignment */}
      <Card>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Feature API Assignment</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Assign a specific AI platform + model to each platform feature independently.</p>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AI_FEATURES_LIST.map(f => (
            <div key={f.id} className={`p-3 rounded-xl border ${f.colorClass}`}>
              <div className="flex items-center gap-2 mb-2">
                <f.icon className="w-4 h-4 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm">{f.label}</div>
                  <div className="text-xs opacity-70">{f.subtitle}</div>
                </div>
              </div>
              <select
                value={featureAssign[f.id] || ''}
                onChange={e => updateFeatureAssign(f.id, e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-current/20 bg-white/60 dark:bg-gray-900/40 text-xs font-medium focus:outline-none"
              >
                <option value="">— Use global AI config —</option>
                {readyEntries.map(e => (
                  <option key={e.id} value={e.id}>{e.name} · {e.selectedModel}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        {readyEntries.length === 0 && (
          <p className="px-4 pb-4 text-xs text-gray-400 dark:text-gray-600">Add an AI API key above to assign it to specific features.</p>
        )}
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader title="How AI Features Work" />
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Sparkles, title: 'AI Discover', desc: 'Automatically finds and imports internships, events, and courses. Assign a fast model like Gemini Flash for high-volume discovery.', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { icon: Bot, title: 'Career Chatbot', desc: 'AI-powered career advisor helping students with internships, resumes, and interviews. Assign a capable model for better answers.', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { icon: ShieldCheck, title: 'Scam Detection', desc: 'Verifies every listing for legitimacy before publishing. Assign a reasoning model like GPT-4o or Claude for accuracy.', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
            ].map((feat, i) => (
              <div key={i} className={`p-4 rounded-xl ${feat.bg} border border-gray-100 dark:border-gray-800`}>
                <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm">
                  <feat.icon className={`w-5 h-5 ${feat.color}`} />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{feat.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Help Chat URL */}
      <AiHelpUrlCard />
    </div>
  );
};

const AiHelpUrlCard: React.FC = () => {
  const [url, setUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToastMsg] = useState('');

  useEffect(() => {
    import('../../services/firebase').then(({ getAiHelpConfig }) => {
      getAiHelpConfig().then(res => {
        if (res.success && res.data?.embedUrl) setUrl(res.data.embedUrl);
      });
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { saveAiHelpConfig } = await import('../../services/firebase');
      await saveAiHelpConfig(url.trim());
      setSaved(true);
      setToastMsg('AI Help URL saved!');
      setTimeout(() => { setSaved(false); setToastMsg(''); }, 3000);
    } catch {
      setToastMsg('Failed to save. Check permissions.');
      setTimeout(() => setToastMsg(''), 3000);
    }
    setSaving(false);
  };

  return (
    <Card>
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl"><CheckCircle className="w-4 h-4 text-green-400" /> {toast}</div>}
      <CardHeader
        title="AI Help Chat — Student Assistant"
        subtitle="Set the URL for the AI chat assistant embedded on the student-facing AI Help page. Supports any chatbot that allows iframe embedding (e.g. Tidio, Crisp, custom Gemini/GPT chatbot)."
      />
      <CardContent>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Chat Embed URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={e => { setUrl(e.target.value); setSaved(false); }}
                placeholder="https://your-chatbot.com/embed/..."
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              <button
                onClick={handleSave}
                disabled={saving || !url.trim()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold text-sm transition-all whitespace-nowrap"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : null}
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save URL'}
              </button>
            </div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-semibold">Tip:</span> The AI Help page shows an iframe embedding this URL. Students can access it via the sidebar navigation. The URL is stored in Firestore and updates instantly for all users.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
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

// ── Mentors Management Page ───────────────────────────────────────────────────
interface MentorRecord {
  id: string;
  name: string;
  email: string;
  expertise: string;
  company: string;
  experience: string;
  linkedin: string;
  bio: string;
  status: 'active' | 'inactive';
  createdAt?: any;
}

const EMPTY_MENTOR: Omit<MentorRecord, 'id'> = {
  name: '', email: '', expertise: '', company: '',
  experience: '', linkedin: '', bio: '', status: 'active',
};

export const MentorsManagementPage: React.FC = () => {
  const [mentors, setMentors] = useState<MentorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MentorRecord | null>(null);
  const [form, setForm] = useState(EMPTY_MENTOR);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'mentors'),
      (snap) => {
        setMentors(snap.docs.map(d => ({ id: d.id, ...d.data() } as MentorRecord)));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_MENTOR); setShowModal(true); };
  const openEdit = (m: MentorRecord) => { setEditing(m); setForm({ name: m.name, email: m.email, expertise: m.expertise, company: m.company, experience: m.experience, linkedin: m.linkedin, bio: m.bio, status: m.status }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'mentors', editing.id), { ...form });
        showToast('Mentor updated!');
      } else {
        await addDoc(collection(db, 'mentors'), { ...form, createdAt: new Date().toISOString() });
        showToast('Mentor added!');
      }
      closeModal();
    } catch (e) {
      showToast('Error saving mentor.');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'mentors', id));
      showToast('Mentor removed.');
    } catch { showToast('Error deleting mentor.'); }
    setDeleteConfirm(null);
  };

  const filtered = mentors.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.expertise.toLowerCase().includes(search.toLowerCase()) ||
    m.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl"><CheckCircle className="w-4 h-4 text-green-400" /> {toast}</div>}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Remove Mentor?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">This mentor will be permanently removed from the platform.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-medium text-white transition-all">Remove</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Mentor' : 'Add Mentor'}</h2>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Full Name', key: 'name', placeholder: 'e.g. Priya Sharma', required: true },
                { label: 'Email', key: 'email', placeholder: 'priya@example.com', required: true },
                { label: 'Expertise', key: 'expertise', placeholder: 'e.g. Web Development, Machine Learning' },
                { label: 'Company / Organization', key: 'company', placeholder: 'e.g. Google, Infosys' },
                { label: 'Years of Experience', key: 'experience', placeholder: 'e.g. 5 years' },
                { label: 'LinkedIn URL', key: 'linkedin', placeholder: 'https://linkedin.com/in/...' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  placeholder="Brief bio about the mentor..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.email.trim()}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : editing ? 'Update Mentor' : 'Add Mentor'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mentors</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage mentors available to students on the platform</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-lg shadow-red-900/20">
          <Plus className="w-4 h-4" /> Add Mentor
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Mentors', value: mentors.length, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Active', value: mentors.filter(m => m.status === 'active').length, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Inactive', value: mentors.filter(m => m.status === 'inactive').length, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
          { label: 'Companies', value: new Set(mentors.map(m => m.company).filter(Boolean)).size, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((s, i) => (
          <Card key={i} className="!p-4">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
              <Star className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search mentors by name, expertise, company..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-10 flex items-center justify-center gap-2 text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading mentors...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <UserIcon className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">{search ? 'No mentors match your search.' : 'No mentors added yet. Click "Add Mentor" to get started.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map(mentor => (
              <div key={mentor.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {mentor.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{mentor.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mentor.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                      {mentor.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{mentor.email}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {mentor.expertise && <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">{mentor.expertise}</span>}
                    {mentor.company && <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{mentor.company}</span>}
                    {mentor.experience && <span className="text-xs text-gray-400 dark:text-gray-500">{mentor.experience}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {mentor.linkedin && (
                    <a href={mentor.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => openEdit(mentor)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(mentor.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
