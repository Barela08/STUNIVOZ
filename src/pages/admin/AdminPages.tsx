import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../components/common';
import {
  Search, Plus, Edit, Trash2, CheckCircle, XCircle,
  Users, Building2, BookOpen, Shield,
  Database, Cpu, Megaphone, Settings2,
  Plug, Download, ToggleLeft, ToggleRight, Ban,
  Eye, Lock, Unlock, RefreshCw, Send,
  Zap, Activity, Key, Clock, Star,
  TrendingUp, ArrowUpRight, X, Save, Mail, Phone, MapPin, UserCog, AlertTriangle
} from 'lucide-react';
import { AssignRoleModal } from './RolesPage';
import {
  AreaChart as ReAreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

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

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const [users, setUsers] = useState<UserRecord[]>([
    { id: 1, name: 'Ananya Sharma', email: 'ananya@iitd.ac.in', role: 'Student', college: 'IIT Delhi', joined: 'Jan 12, 2025', status: 'Active', ats: 94, logins: 48 },
    { id: 2, name: 'Rahul Mehta', email: 'rahul@nitt.edu', role: 'Student', college: 'NIT Trichy', joined: 'Feb 3, 2025', status: 'Active', ats: 87, logins: 32 },
    { id: 3, name: 'Priya Patel', email: 'priya@techcorp.com', role: 'company', college: 'TechCorp HR', joined: 'Nov 20, 2024', status: 'Verified', ats: null, logins: 112 },
    { id: 4, name: 'Suresh Kumar', email: 'suresh@vit.ac.in', role: 'Student', college: 'VIT Vellore', joined: 'Mar 1, 2025', status: 'Blocked', ats: 55, logins: 3 },
    { id: 5, name: 'Meera Nair', email: 'meera@stunivoz.com', role: 'staff', college: 'STUNIVOZ HQ', joined: 'Dec 5, 2024', status: 'Active', ats: null, logins: 280, assignedRoleId: 'staff' },
    { id: 6, name: 'Arjun Singh', email: 'arjun@bits.ac.in', role: 'Student', college: 'BITS Pilani', joined: 'Apr 15, 2025', status: 'Active', ats: 81, logins: 19 },
    { id: 7, name: 'Kavya Menon', email: 'kavya@iiit.ac.in', role: 'Student', college: 'IIIT Hyderabad', joined: 'Apr 20, 2025', status: 'Active', ats: 91, logins: 27 },
  ]);

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
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">No users match your search or filters.</td></tr>
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
export const CompanyManagementPage: React.FC = () => {
  const [companies, setCompanies] = useState([
    { id: 1, name: 'TechCorp India', type: 'Technology', listings: 5, applicants: 156, verified: true, status: 'Verified', plan: 'Premium', joined: 'Jan 2025' },
    { id: 2, name: 'StartupHub', type: 'Startup', listings: 2, applicants: 43, verified: false, status: 'Pending', plan: 'Free', joined: 'Mar 2025' },
    { id: 3, name: 'Infosys Ltd.', type: 'IT Services', listings: 12, applicants: 890, verified: true, status: 'Verified', plan: 'Enterprise', joined: 'Oct 2024' },
    { id: 4, name: 'CreativeAgency', type: 'Design', listings: 1, applicants: 28, verified: false, status: 'Active', plan: 'Free', joined: 'Apr 2025' },
    { id: 5, name: 'FinTech Solutions', type: 'Finance', listings: 7, applicants: 312, verified: true, status: 'Verified', plan: 'Premium', joined: 'Nov 2024' },
  ]);

  const verify = (id: number) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, verified: true, status: 'Verified' } : c));
  };
  const block = (id: number) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'Blocked' ? 'Verified' : 'Blocked' } : c));
  };

  const planColor: Record<string, string> = {
    Free: 'text-gray-500 dark:text-gray-400',
    Premium: 'text-purple-600 dark:text-purple-400',
    Enterprise: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <TableHeader title="Company Management" subtitle="Verify, manage, and monitor company accounts."
        actions={<>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all">
            <Plus className="w-4 h-4" /> Add Company
          </button>
        </>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Companies', value: '245', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Verified', value: '189', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Pending Review', value: '28', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Premium Plans', value: '92', icon: Star, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
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
                      {!c.verified && <button title="Verify" onClick={() => verify(c.id)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 transition-colors"><CheckCircle className="w-4 h-4" /></button>}
                      <button title="Edit" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-green-600 transition-colors"><Edit className="w-4 h-4" /></button>
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

// ── Internship Management ────────────────────────────────────────────────────
export const InternshipManagementPage: React.FC = () => {
  const [listings, setListings] = useState([
    { id: 1, title: 'Frontend Developer Intern', company: 'Google', location: 'Bangalore', type: 'Remote', posted: 'May 1', applicants: 156, status: 'Published' },
    { id: 2, title: 'Data Science Intern', company: 'Netflix', location: 'Mumbai', type: 'On-site', posted: 'Apr 28', applicants: 89, status: 'Published' },
    { id: 3, title: 'SDE Intern', company: 'Amazon', location: 'Bangalore', type: 'Hybrid', posted: 'Apr 25', applicants: 234, status: 'Draft' },
    { id: 4, title: 'ML Research Intern', company: 'OpenAI', location: 'Remote', type: 'Remote', posted: 'May 2', applicants: 412, status: 'Published' },
    { id: 5, title: 'UI/UX Design Intern', company: 'Figma', location: 'San Francisco', type: 'Remote', posted: 'Apr 30', applicants: 98, status: 'Draft' },
  ]);

  const toggleStatus = (id: number) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: l.status === 'Published' ? 'Draft' : 'Published' } : l));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <TableHeader title="Internship Management" subtitle="Global moderation of all internship listings."
        actions={<>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-all"><Download className="w-4 h-4" /> Export</button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all"><Plus className="w-4 h-4" /> Add Listing</button>
        </>}
      />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Posted</th>
                <th className="px-5 py-3 font-medium">Applicants</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {listings.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white text-sm">{l.title}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{l.company}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{l.location}</td>
                  <td className="px-5 py-4"><span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">{l.type}</span></td>
                  <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">{l.posted}</td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-900 dark:text-white">{l.applicants}</td>
                  <td className="px-5 py-4"><StatusBadge status={l.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleStatus(l.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-green-600 transition-colors" title="Toggle Status"><CheckCircle className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
export const EventManagementPage: React.FC = () => {
  const events = [
    { title: 'AWS Cloud Masterclass', host: 'Amazon', date: 'May 10, 2025', type: 'Webinar', registrations: 320, status: 'Published' },
    { title: 'React Hackathon 2025', host: 'Meta', date: 'May 20, 2025', type: 'Hackathon', registrations: 540, status: 'Published' },
    { title: 'AI Workshop', host: 'Google', date: 'Jun 1, 2025', type: 'Workshop', registrations: 210, status: 'Draft' },
    { title: 'Campus Drive — Infosys', host: 'Infosys', date: 'Jun 15, 2025', type: 'Drive', registrations: 890, status: 'Published' },
  ];

  const typeColor: Record<string, string> = {
    Webinar: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    Hackathon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    Workshop: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    Drive: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <TableHeader title="Event Management" subtitle="Global moderation of all event listings."
        actions={<button className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all"><Plus className="w-4 h-4" /> Add Event</button>}
      />
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
              {events.map((e, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white text-sm">{e.title}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{e.host}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{e.date}</td>
                  <td className="px-5 py-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[e.type] || 'bg-gray-100 text-gray-600'}`}>{e.type}</span></td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-900 dark:text-white">{e.registrations.toLocaleString()}</td>
                  <td className="px-5 py-4"><StatusBadge status={e.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
export const CourseManagementPage: React.FC = () => {
  const courses = [
    { title: 'Full Stack Web Development', instructor: 'John Smith', category: 'Web Dev', students: 1200, rating: 4.8, status: 'Published', revenue: '₹2.4L' },
    { title: 'Data Science Fundamentals', instructor: 'Dr. Priya Sharma', category: 'Data Science', students: 980, rating: 4.6, status: 'Published', revenue: '₹1.9L' },
    { title: 'System Design Masterclass', instructor: 'Rajesh Kumar', category: 'Engineering', students: 450, rating: 4.9, status: 'Draft', revenue: '₹0.9L' },
    { title: 'DSA for Placements', instructor: 'Anand Verma', category: 'CS Fundamentals', students: 2800, rating: 4.7, status: 'Published', revenue: '₹5.6L' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <TableHeader title="Course Management" subtitle="Add, edit, and organise platform courses."
        actions={<button className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all"><Plus className="w-4 h-4" /> Add Course</button>}
      />
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
              {courses.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white text-sm max-w-[200px] truncate">{c.title}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{c.instructor}</td>
                  <td className="px-5 py-4"><span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">{c.category}</span></td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-900 dark:text-white">{c.students.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-yellow-500 font-semibold">★ {c.rating}</td>
                  <td className="px-5 py-4 text-sm font-medium text-green-600 dark:text-green-400">{c.revenue}</td>
                  <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
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

// ── API System ───────────────────────────────────────────────────────────────
export const APISystemPage: React.FC = () => {
  const [apis, setApis] = useState([
    { id: 1, name: 'OpenAI GPT-4', category: 'AI', endpoint: 'api.openai.com/v1', calls: 8420, limit: 10000, status: 'Online', latency: '380ms' },
    { id: 2, name: 'Firebase Auth', category: 'Auth', endpoint: 'identitytoolkit.googleapis.com', calls: 45200, limit: 100000, status: 'Online', latency: '42ms' },
    { id: 3, name: 'SendGrid Email', category: 'Email', endpoint: 'api.sendgrid.com/v3', calls: 1240, limit: 5000, status: 'Online', latency: '95ms' },
    { id: 4, name: 'LinkedIn Jobs API', category: 'Jobs', endpoint: 'api.linkedin.com/v2', calls: 320, limit: 500, status: 'Warning', latency: '210ms' },
    { id: 5, name: 'GitHub API', category: 'Skills', endpoint: 'api.github.com', calls: 2100, limit: 5000, status: 'Online', latency: '68ms' },
  ]);

  const toggleApi = (id: number) => {
    setApis(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'Online' ? 'Offline' : 'Online' } : a));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <TableHeader title="API System Control" subtitle="Manage external APIs, rate limits, and integrations."
        actions={<button className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all"><Plus className="w-4 h-4" /> Add API</button>}
      />
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
                        <div className={`h-full rounded-full ${api.calls / api.limit > 0.8 ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${(api.calls / api.limit) * 100}%` }} />
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
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-colors"><Settings2 className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-purple-600 transition-colors"><RefreshCw className="w-4 h-4" /></button>
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
  const [models, setModels] = useState([
    { id: 1, name: 'Resume AI Generator', model: 'GPT-4o', requests: 2840, success: 98.2, enabled: true },
    { id: 2, name: 'ATS Analyzer', model: 'GPT-4', requests: 5120, success: 99.1, enabled: true },
    { id: 3, name: 'Career Chatbot', model: 'GPT-3.5-turbo', requests: 12400, success: 97.8, enabled: true },
    { id: 4, name: 'Mock Interview AI', model: 'GPT-4o', requests: 980, success: 96.5, enabled: false },
    { id: 5, name: 'Skill Gap Analyzer', model: 'GPT-4', requests: 1640, success: 98.9, enabled: true },
    { id: 6, name: 'Cover Letter Gen', model: 'GPT-4o', requests: 3200, success: 99.4, enabled: true },
  ]);

  const toggle = (id: number) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <TableHeader title="AI System Control" subtitle="Manage AI models, usage limits, and feature availability." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total AI Requests', value: '26.2k', icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Active Models', value: '5', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Success Rate', value: '98.3%', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Avg Latency', value: '380ms', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
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
        <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
          {models.map(m => (
            <div key={m.id} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-10 rounded-full ${m.enabled ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{m.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{m.model} · {m.requests.toLocaleString()} requests · {m.success}% success</p>
                </div>
              </div>
              <button onClick={() => toggle(m.id)} className={`transition-colors ${m.enabled ? 'text-purple-500 hover:text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
                {m.enabled ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9" />}
              </button>
            </div>
          ))}
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

// ── Staff Management ──────────────────────────────────────────────────────────
export const StaffManagementPage: React.FC = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [assigningRole, setAssigningRole] = useState<StaffRecord | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const [staff, setStaff] = useState<StaffRecord[]>([
    { id: 1, name: 'Meera Nair', email: 'meera@stunivoz.com', role: 'Content Moderator', joined: 'Dec 2024', actions: 342, status: 'Active', assignedRoleId: 'moderator' },
    { id: 2, name: 'Ravi Kumar', email: 'ravi@stunivoz.com', role: 'User Support', joined: 'Jan 2025', actions: 189, status: 'Active', assignedRoleId: 'staff' },
    { id: 3, name: 'Sita Verma', email: 'sita@stunivoz.com', role: 'Content Reviewer', joined: 'Feb 2025', actions: 98, status: 'Active', assignedRoleId: 'moderator' },
    { id: 4, name: 'Arun Bose', email: 'arun@stunivoz.com', role: 'Data Analyst', joined: 'Mar 2025', actions: 56, status: 'Inactive', assignedRoleId: 'staff' },
  ]);

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
                      <button title="Assign Role" onClick={() => setAssigningRole(s)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-purple-600 transition-colors">
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

// ── Ads Management ────────────────────────────────────────────────────────────
export const AdsSystemPage: React.FC = () => {
  const [ads, setAds] = useState([
    { id: 1, title: 'Google Cloud Certification', advertiser: 'Google', placement: 'Dashboard Banner', views: 12400, clicks: 840, ctr: '6.8%', status: 'Active', budget: '₹25,000' },
    { id: 2, title: 'AWS Internship Program', advertiser: 'Amazon', placement: 'Internships Sidebar', views: 8900, clicks: 420, ctr: '4.7%', status: 'Active', budget: '₹18,000' },
    { id: 3, title: 'LinkedIn Premium Offer', advertiser: 'LinkedIn', placement: 'Profile Page', views: 5600, clicks: 190, ctr: '3.4%', status: 'Inactive', budget: '₹10,000' },
    { id: 4, title: 'Coursera Plus Sale', advertiser: 'Coursera', placement: 'Courses Page', views: 7200, clicks: 380, ctr: '5.3%', status: 'Active', budget: '₹15,000' },
  ]);

  const toggle = (id: number) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' } : a));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <TableHeader title="Ads Management" subtitle="Create and manage platform advertisements."
        actions={<button className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all"><Plus className="w-4 h-4" /> Create Ad</button>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Impressions', value: '34.1k', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Total Clicks', value: '1,830', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Avg CTR', value: '5.1%', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Active Ads', value: '3', icon: Megaphone, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
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
                <th className="px-5 py-3 font-medium text-right">Toggle</th>
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
                    <button onClick={() => toggle(ad.id)} className={`${ad.status === 'Active' ? 'text-green-500' : 'text-gray-400'} hover:opacity-80 transition-all`}>
                      {ad.status === 'Active' ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                    </button>
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

// ── UI Control ────────────────────────────────────────────────────────────────
export const UIControlPage: React.FC = () => {
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9');
  const [font, setFont] = useState('Inter');
  const [darkModeDefault, setDarkModeDefault] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="space-y-6 animate-fade-in">
      <TableHeader title="UI & Theme Control" subtitle="Customize platform appearance, branding, and typography." />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Brand Colors" />
          <CardContent className="space-y-4">
            {[
              { label: 'Primary Color', value: primaryColor, set: setPrimaryColor },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer" style={{ backgroundColor: item.value }} />
                  <input type="color" value={item.value} onChange={e => item.set(e.target.value)} className="w-10 h-8 rounded cursor-pointer border-0 p-0" />
                  <code className="text-xs font-mono text-gray-500 dark:text-gray-400">{item.value}</code>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              {['Ocean Blue', 'Forest Green', 'Royal Purple', 'Sunset Orange'].map((theme, i) => (
                <button key={i} className="mr-2 mb-2 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-medium">
                  {theme}
                </button>
              ))}
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
            <div className="flex items-center justify-between py-2">
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
          <CardHeader title="Branding Assets" />
          <CardContent className="space-y-4">
            {[
              { label: 'Platform Logo', hint: 'PNG/SVG, max 2MB', icon: '🖼️' },
              { label: 'Favicon', hint: '32×32 ICO/PNG', icon: '🔖' },
              { label: 'Splash Screen', hint: '1920×1080 PNG', icon: '🎨' },
              { label: 'Email Banner', hint: '600×200 PNG', icon: '✉️' },
            ].map((asset, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{asset.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{asset.label}</p>
                    <p className="text-xs text-gray-400">{asset.hint}</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all font-medium">
                  Upload
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Save Changes" />
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">These settings affect all users. Changes are applied globally without requiring a redeploy.</p>
            {saved && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">UI settings saved successfully!</p>
              </div>
            )}
            <button onClick={save} className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm">
              <CheckCircle className="w-4 h-4" /> Save All Changes
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ── Feature Control ──────────────────────────────────────────────────────────
interface Feature { key: string; label: string; description: string; category: string; enabled: boolean }

export const FeatureControlPage: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([
    { key: 'community', label: 'Community Feed', description: 'Social feed for students', category: 'Social', enabled: true },
    { key: 'gamification', label: 'Gamification', description: 'Points, badges, and leaderboard', category: 'Engagement', enabled: true },
    { key: 'ats', label: 'ATS Analyzer', description: 'AI resume analysis tool', category: 'AI', enabled: true },
    { key: 'ai_recommend', label: 'AI Recommendations', description: 'Personalised internship suggestions', category: 'AI', enabled: false },
    { key: 'ai_interview', label: 'AI Mock Interview', description: 'AI-powered interview simulator', category: 'AI', enabled: false },
    { key: 'ai_chatbot', label: 'Career Chatbot', description: 'AI career guidance assistant', category: 'AI', enabled: true },
    { key: 'qna', label: 'Q&A Forum', description: 'Student question & answer board', category: 'Social', enabled: true },
    { key: 'planner', label: 'Career Planner', description: 'Goal-setting and roadmap tool', category: 'Tools', enabled: true },
    { key: 'content_hub', label: 'Content Hub', description: 'Blogs, tips, and resource articles', category: 'Content', enabled: false },
    { key: 'referral', label: 'Referral System', description: 'User referral and rewards', category: 'Engagement', enabled: false },
    { key: 'multilang', label: 'Multilingual', description: 'Hindi, Tamil, Telugu language support', category: 'Tools', enabled: false },
    { key: 'reviews', label: 'Company Reviews', description: 'Student reviews for companies', category: 'Content', enabled: true },
  ]);

  const toggle = (key: string) => setFeatures(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
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
      <TableHeader title="Feature Control" subtitle="Toggle platform modules on or off without redeploying." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{features.filter(f => f.enabled).length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Active Features</div>
        </Card>
        <Card className="!p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{features.filter(f => !f.enabled).length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Disabled Features</div>
        </Card>
        <Card className="!p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{features.filter(f => f.category === 'AI').length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">AI Features</div>
        </Card>
        <Card className="!p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Categories</div>
        </Card>
      </div>
      {categories.map(cat => (
        <Card key={cat}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColor[cat]}`}>{cat}</span>
            <span className="text-xs text-gray-400">{features.filter(f => f.category === cat).length} features</span>
          </div>
          <CardContent className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {features.filter(f => f.category === cat).map(f => (
              <div key={f.key} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-8 rounded-full ${f.enabled ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{f.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{f.description}</p>
                  </div>
                </div>
                <button onClick={() => toggle(f.key)} className={`transition-colors ${f.enabled ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-500'}`}>
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
export const AdminNotificationsPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [channel, setChannel] = useState('in-app');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return;
    setSent(true);
    setTitle(''); setMessage('');
    setTimeout(() => setSent(false), 4000);
  };

  const history = [
    { title: 'New Internships Posted', audience: 'Students', channel: 'In-App + Email', sentAt: '1 hour ago', reach: '8,200', opens: '4,100' },
    { title: 'System Maintenance Tonight', audience: 'All Users', channel: 'Email', sentAt: '2 days ago', reach: '12,450', opens: '3,800' },
    { title: 'New Feature: ATS Analyzer', audience: 'Students', channel: 'In-App', sentAt: '1 week ago', reach: '10,100', opens: '6,200' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <TableHeader title="Global Notifications" subtitle="Broadcast announcements to targeted user groups." />
      {sent && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 dark:text-green-400 font-semibold">Notification sent successfully to {audience === 'all' ? 'all users' : `${audience}s`}!</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Compose Notification" />
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title..."
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Write your notification message..."
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Audience</label>
                <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:outline-none">
                  <option value="all">All Users</option>
                  <option value="student">Students Only</option>
                  <option value="company">Companies Only</option>
                  <option value="staff">Staff Only</option>
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
            <button onClick={handleSend} disabled={!title.trim() || !message.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-sm">
              <Send className="w-4 h-4" /> Send Notification
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Sent History" />
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
  const logs = [
    { type: 'Login', user: 'admin@stunivoz.com', ip: '103.21.45.92', location: 'Mumbai, IN', time: '2 min ago', status: 'Success' },
    { type: 'Login Failed', user: 'unknown@hack.com', ip: '45.133.1.100', location: 'Unknown', time: '15 min ago', status: 'Blocked' },
    { type: 'Password Reset', user: 'ananya@iitd.ac.in', ip: '115.250.30.10', location: 'Delhi, IN', time: '1 hour ago', status: 'Success' },
    { type: 'Role Change', user: 'ravi@stunivoz.com', ip: '103.25.90.44', location: 'Bangalore, IN', time: '3 hours ago', status: 'Success' },
    { type: 'API Key Rotated', user: 'admin@stunivoz.com', ip: '103.21.45.92', location: 'Mumbai, IN', time: '5 hours ago', status: 'Success' },
    { type: 'Login Failed', user: 'test@attack.ru', ip: '176.9.50.20', location: 'Germany', time: '6 hours ago', status: 'Blocked' },
  ];

  const statusColor: Record<string, string> = {
    Success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    Blocked: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <TableHeader title="Security & Logs" subtitle="Monitor login activity, API access, and platform security." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Failed Logins (24h)', value: '8', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
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
          <h3 className="font-semibold text-gray-900 dark:text-white">Security Audit Log</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-all">
            <Download className="w-3 h-3" /> Export
          </button>
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
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
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

  const runBackup = () => {
    setRunning(true);
    setTimeout(() => { setRunning(false); setDone(true); setTimeout(() => setDone(false), 4000); }, 2500);
  };

  const backups = [
    { name: 'Auto Backup', date: 'May 3, 2025 – 4:00 AM', size: '2.4 GB', type: 'Scheduled', status: 'Success' },
    { name: 'Manual Backup', date: 'May 2, 2025 – 11:30 AM', size: '2.3 GB', type: 'Manual', status: 'Success' },
    { name: 'Auto Backup', date: 'May 2, 2025 – 4:00 AM', size: '2.3 GB', type: 'Scheduled', status: 'Success' },
    { name: 'Auto Backup', date: 'May 1, 2025 – 4:00 AM', size: '2.1 GB', type: 'Scheduled', status: 'Success' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
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
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Backup History</h3>
              <span className="text-xs text-gray-400">Auto backup: Daily at 4:00 AM</span>
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
                    <th className="px-5 py-3 font-medium text-right">Restore</th>
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
                        <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Restore</button>
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
