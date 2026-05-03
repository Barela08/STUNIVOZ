import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button, Input } from '../../components/common';
import {
  Search, Plus, Edit, Trash2, CheckCircle, XCircle, MoreVertical,
  Users, Building2, Briefcase, Calendar, BookOpen, Bell, Shield,
  Database, Cpu, Megaphone, Palette, Settings2, LineChart, UserCog,
  Plug, AlertTriangle, Download, ToggleLeft, ToggleRight
} from 'lucide-react';

// ── Shared helpers ──────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    Active: 'bg-green-100 text-green-700',
    Inactive: 'bg-gray-100 text-gray-600',
    Blocked: 'bg-red-100 text-red-700',
    Verified: 'bg-blue-100 text-blue-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Published: 'bg-green-100 text-green-700',
    Draft: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

// ── User Management ─────────────────────────────────────────────────────────
export const UserManagementPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const users = [
    { id: 1, name: 'Ananya Sharma', email: 'ananya@example.com', role: 'Student', college: 'IIT Delhi', joined: 'Jan 12, 2025', status: 'Active' },
    { id: 2, name: 'Rahul Mehta', email: 'rahul@example.com', role: 'Student', college: 'NIT Trichy', joined: 'Feb 3, 2025', status: 'Active' },
    { id: 3, name: 'Priya Patel', email: 'priya@example.com', role: 'Provider', college: 'TechCorp HR', joined: 'Nov 20, 2024', status: 'Verified' },
    { id: 4, name: 'Suresh Kumar', email: 'suresh@example.com', role: 'Student', college: 'VIT Vellore', joined: 'Mar 1, 2025', status: 'Blocked' },
    { id: 5, name: 'Meera Nair', email: 'meera@example.com', role: 'Staff', college: 'STUNIVOZ HQ', joined: 'Dec 5, 2024', status: 'Active' },
  ].filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">View, edit, block, and manage all platform users.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
          <Button variant="primary"><Plus className="w-4 h-4 mr-2" />Invite User</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: '12,450', icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
          { label: 'Active Today', value: '3,210', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
          { label: 'Blocked', value: '42', icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
        ].map((s, i) => (
          <Card key={i} className="!p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">College / Org</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.college}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.joined}</td>
                  <td className="px-6 py-4"><StatusBadge status={u.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
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

// ── Company Management ───────────────────────────────────────────────────────
export const CompanyManagementPage: React.FC = () => {
  const companies = [
    { name: 'TechCorp India', type: 'Technology', listings: 5, applicants: 156, status: 'Verified' },
    { name: 'StartupHub', type: 'Startup', listings: 2, applicants: 43, status: 'Pending' },
    { name: 'Infosys Ltd.', type: 'IT Services', listings: 12, applicants: 890, status: 'Verified' },
    { name: 'CreativeAgency', type: 'Design', listings: 1, applicants: 28, status: 'Active' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Company Management</h1>
          <p className="text-gray-500">Manage and verify company profiles.</p>
        </div>
        <Button variant="primary"><Plus className="w-4 h-4 mr-2" />Add Company</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Company</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Active Listings</th>
                <th className="px-6 py-3 font-medium">Total Applicants</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companies.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-purple-500" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.type}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.listings}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.applicants}</td>
                  <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600"><CheckCircle className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"><XCircle className="w-4 h-4" /></button>
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
  const listings = [
    { title: 'Frontend Developer Intern', company: 'Google', location: 'Bangalore', posted: 'May 1', applicants: 156, status: 'Published' },
    { title: 'Data Science Intern', company: 'Netflix', location: 'Mumbai', posted: 'Apr 28', applicants: 89, status: 'Published' },
    { title: 'SDE Intern', company: 'Amazon', location: 'Bangalore', posted: 'Apr 25', applicants: 234, status: 'Draft' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Internship Management</h1>
          <p className="text-gray-500">Global moderation of all internship listings.</p>
        </div>
        <Button variant="primary"><Plus className="w-4 h-4 mr-2" />Add Listing</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Company</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium">Posted</th>
                <th className="px-6 py-3 font-medium">Applicants</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listings.map((l, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 text-sm">{l.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{l.company}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{l.location}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{l.posted}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{l.applicants}</td>
                  <td className="px-6 py-4"><StatusBadge status={l.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-500">Global moderation of all event listings.</p>
        </div>
        <Button variant="primary"><Plus className="w-4 h-4 mr-2" />Add Event</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Event</th>
                <th className="px-6 py-3 font-medium">Host</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Registrations</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((e, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 text-sm">{e.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{e.host}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{e.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{e.type}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.registrations}</td>
                  <td className="px-6 py-4"><StatusBadge status={e.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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
    { title: 'Full Stack Web Development', instructor: 'John Smith', category: 'Web Dev', students: 1200, rating: 4.8, status: 'Published' },
    { title: 'Data Science Fundamentals', instructor: 'Dr. Priya', category: 'Data Science', students: 980, rating: 4.6, status: 'Published' },
    { title: 'System Design Masterclass', instructor: 'Rajesh Kumar', category: 'Engineering', students: 450, rating: 4.9, status: 'Draft' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-500">Add, edit, and organise platform courses.</p>
        </div>
        <Button variant="primary"><Plus className="w-4 h-4 mr-2" />Add Course</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Course</th>
                <th className="px-6 py-3 font-medium">Instructor</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Students</th>
                <th className="px-6 py-3 font-medium">Rating</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 text-sm">{c.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.instructor}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.category}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.students.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-yellow-600 font-medium">★ {c.rating}</td>
                  <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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

// ── Feature Control ──────────────────────────────────────────────────────────
interface Feature { key: string; label: string; description: string; enabled: boolean }

export const FeatureControlPage: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([
    { key: 'community', label: 'Community Feed', description: 'Social feed for students', enabled: true },
    { key: 'gamification', label: 'Gamification', description: 'Points, badges, and leaderboard', enabled: true },
    { key: 'ats', label: 'ATS Analyzer', description: 'AI resume analysis tool', enabled: true },
    { key: 'ai_recommend', label: 'AI Recommendations', description: 'Personalised internship suggestions', enabled: false },
    { key: 'qna', label: 'Q&A Forum', description: 'Student question & answer board', enabled: true },
    { key: 'planner', label: 'Career Planner', description: 'Goal-setting and roadmap tool', enabled: true },
    { key: 'content_hub', label: 'Content Hub', description: 'Blogs, tips, and resource articles', enabled: false },
  ]);

  const toggle = (key: string) => {
    setFeatures(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Feature Control</h1>
        <p className="text-gray-500">Toggle platform modules on or off without redeploying.</p>
      </div>
      <Card>
        <CardContent>
          <div className="divide-y divide-gray-100">
            {features.map(f => (
              <div key={f.key} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-8 rounded-full ${f.enabled ? 'bg-green-400' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-medium text-gray-900">{f.label}</p>
                    <p className="text-sm text-gray-500">{f.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(f.key)}
                  className={`transition-colors ${f.enabled ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {f.enabled
                    ? <ToggleRight className="w-8 h-8" />
                    : <ToggleLeft className="w-8 h-8" />
                  }
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Global Notifications ─────────────────────────────────────────────────────
export const AdminNotificationsPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return;
    setSent(true);
    setTitle('');
    setMessage('');
    setTimeout(() => setSent(false), 4000);
  };

  const history = [
    { title: 'New Internships Posted', audience: 'Students', sentAt: '1 hour ago', reach: '8,200' },
    { title: 'System Maintenance Tonight', audience: 'All Users', sentAt: '2 days ago', reach: '12,450' },
    { title: 'New Feature: ATS Analyzer', audience: 'Students', sentAt: '1 week ago', reach: '10,100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Global Notifications</h1>
        <p className="text-gray-500">Broadcast announcements to targeted user groups.</p>
      </div>

      {sent && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 font-medium">Notification sent successfully!</p>
        </div>
      )}

      <Card>
        <CardHeader title="Compose Notification" />
        <CardContent className="space-y-4">
          <Input
            label="Title"
            placeholder="Notification title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-500 text-sm"
              placeholder="Write your message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <select
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-primary-500 text-sm"
              value={audience}
              onChange={e => setAudience(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="students">Students Only</option>
              <option value="providers">Providers Only</option>
              <option value="staff">Staff Only</option>
            </select>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSend} disabled={!title.trim() || !message.trim()}>
              <Bell className="w-4 h-4 mr-2" />Send Notification
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Recent Notifications" />
        <CardContent>
          <div className="divide-y divide-gray-100">
            {history.map((n, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">To: {n.audience} · {n.sentAt} · {n.reach} reached</p>
                </div>
                <StatusBadge status="Active" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Simple stubs for less-critical admin pages ───────────────────────────────
const AdminPageStub: React.FC<{ title: string; description: string; icon: React.ElementType }> = ({ title, description, icon: Icon }) => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-500">{description}</p>
    </div>
    <Card>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-500 max-w-sm">{description}</p>
          <Button variant="primary" className="mt-6">Get Started</Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const APISystemPage = () => <AdminPageStub title="API System" description="Manage external API sources, field mapping, and sync schedules." icon={Plug} />;
export const AIControlPage = () => <AdminPageStub title="AI Control" description="Toggle AI features, configure prompt rules, and monitor AI usage costs." icon={Cpu} />;
export const StaffManagementPage = () => <AdminPageStub title="Staff Management" description="Add staff members, assign roles, and review activity logs." icon={UserCog} />;
export const AdsSystemPage = () => <AdminPageStub title="Ads System" description="Create and place ad campaigns across the platform for revenue." icon={Megaphone} />;
export const UIControlPage = () => <AdminPageStub title="UI Control" description="Change themes, typography, accent colors, and site-wide copy." icon={Palette} />;
export const AnalyticsPage = () => <AdminPageStub title="Platform Analytics" description="Deep-dive into growth, engagement, retention, and revenue metrics." icon={LineChart} />;
export const SecurityPage = () => <AdminPageStub title="Security & Logs" description="Review admin audit logs, failed login attempts, and IP bans." icon={Shield} />;
export const BackupPage = () => <AdminPageStub title="System Backup" description="Configure automated backups, schedule exports, and restore from points." icon={Database} />;
