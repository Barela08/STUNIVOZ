import React, { useState } from 'react';
import { Card } from '../../components/common';
import {
  Search, Download, ExternalLink, Star, MessageSquare, Phone,
  Mail, ChevronDown, LayoutGrid, List, Brain,
  XCircle, ArrowRight, FileText, GraduationCap, MapPin, Calendar
} from 'lucide-react';

type Stage = 'Applied' | 'Screening' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';

interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  college: string;
  location: string;
  degree: string;
  appliedDate: string;
  skills: string[];
  ats: number;
  stage: Stage;
  starred: boolean;
  note?: string;
  experience?: string;
}

const initialApplicants: Applicant[] = [
  { id: 1, name: 'Ananya Sharma', email: 'ananya@iitd.ac.in', phone: '+91 98765 43210', role: 'Frontend Developer Intern', college: 'IIT Delhi', location: 'Delhi', degree: 'B.Tech CSE', appliedDate: 'May 1, 2025', skills: ['React', 'TypeScript', 'Tailwind'], ats: 94, stage: 'Shortlisted', starred: true, experience: 'Fresher' },
  { id: 2, name: 'Rahul Mehta', email: 'rahul@nitt.edu', phone: '+91 87654 32109', role: 'Backend Developer Intern', college: 'NIT Trichy', location: 'Chennai', degree: 'B.Tech IT', appliedDate: 'Apr 30, 2025', skills: ['Node.js', 'PostgreSQL', 'Docker'], ats: 87, stage: 'Screening', starred: false, experience: '6 months' },
  { id: 3, name: 'Priya Patel', email: 'priya@bits.ac.in', phone: '+91 76543 21098', role: 'UX Design Intern', college: 'BITS Pilani', location: 'Goa', degree: 'B.E. CS', appliedDate: 'Apr 29, 2025', skills: ['Figma', 'Adobe XD', 'Prototyping'], ats: 81, stage: 'Applied', starred: false, experience: 'Fresher' },
  { id: 4, name: 'Arjun Singh', email: 'arjun@vit.ac.in', phone: '+91 65432 10987', role: 'Frontend Developer Intern', college: 'VIT Vellore', location: 'Vellore', degree: 'B.Tech CSE', appliedDate: 'May 2, 2025', skills: ['Vue.js', 'CSS', 'JavaScript'], ats: 72, stage: 'Applied', starred: false, experience: 'Fresher' },
  { id: 5, name: 'Sneha Reddy', email: 'sneha@iiit.ac.in', phone: '+91 54321 09876', role: 'Backend Developer Intern', college: 'IIIT Hyderabad', location: 'Hyderabad', degree: 'B.Tech CSE', appliedDate: 'Apr 28, 2025', skills: ['Python', 'Django', 'Redis'], ats: 91, stage: 'Interview', starred: true, experience: '1 year', note: 'Strong Python background, schedule technical round' },
  { id: 6, name: 'Vikram Nair', email: 'vikram@manit.ac.in', phone: '+91 43210 98765', role: 'Frontend Developer Intern', college: 'MANIT Bhopal', location: 'Bhopal', degree: 'B.Tech CSE', appliedDate: 'Apr 27, 2025', skills: ['React', 'Redux', 'SCSS'], ats: 68, stage: 'Rejected', starred: false, experience: 'Fresher' },
  { id: 7, name: 'Kavya Menon', email: 'kavya@nit.ac.in', phone: '+91 32109 87654', role: 'UX Design Intern', college: 'NIT Calicut', location: 'Calicut', degree: 'B.Tech EC', appliedDate: 'May 3, 2025', skills: ['Figma', 'Sketch', 'User Research'], ats: 88, stage: 'Screening', starred: true, experience: '3 months' },
  { id: 8, name: 'Rohan Das', email: 'rohan@jadavpur.edu', phone: '+91 21098 76543', role: 'Backend Developer Intern', college: 'Jadavpur University', location: 'Kolkata', degree: 'B.E. IT', appliedDate: 'Apr 26, 2025', skills: ['Java', 'Spring Boot', 'MongoDB'], ats: 76, stage: 'Selected', starred: false, experience: '6 months', note: 'Offer sent via email' },
];

const stages: Stage[] = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

const stageConfig: Record<Stage, { bg: string; text: string; border: string; dot: string; count_bg: string }> = {
  Applied:    { bg: 'bg-gray-50 dark:bg-gray-900/50', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700', dot: 'bg-gray-400', count_bg: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
  Screening:  { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500', count_bg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' },
  Shortlisted:{ bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-500', count_bg: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' },
  Interview:  { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800', dot: 'bg-yellow-500', count_bg: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' },
  Selected:   { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800', dot: 'bg-green-500', count_bg: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' },
  Rejected:   { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-400', count_bg: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' },
};

const atsColor = (score: number) =>
  score >= 85 ? 'text-green-600 dark:text-green-400' :
  score >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
  'text-red-500 dark:text-red-400';

const atsBar = (score: number) =>
  score >= 85 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-400';

export const ApplicantsPage: React.FC = () => {
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const roles = ['all', ...Array.from(new Set(initialApplicants.map(a => a.role)))];

  const filtered = applicants.filter(a =>
    (filterRole === 'all' || a.role === filterRole) &&
    (search === '' || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()))
  );

  const byStage = (stage: Stage) => filtered.filter(a => a.stage === stage);

  const moveStage = (id: number, newStage: Stage) => {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, stage: newStage } : a));
  };

  const toggleStar = (id: number) => {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, starred: !a.starred } : a));
  };

  const selectedApplicant = applicants.find(a => a.id === selectedId);

  const nextStage = (current: Stage): Stage | null => {
    const idx = stages.indexOf(current);
    if (idx < 0 || idx >= stages.length - 2) return null;
    return stages[idx + 1];
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Applicant Tracking System</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">{filtered.length} candidates across all roles</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button onClick={() => setView('kanban')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'kanban' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button onClick={() => setView('table')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'table' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>
              <List className="w-3.5 h-3.5" /> Table
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="pl-4 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
          >
            {roles.map(r => <option key={r} value={r}>{r === 'all' ? 'All Roles' : r}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5">
          <Brain className="w-4 h-4 text-purple-500" />
          AI Score: <span className="font-semibold text-purple-600 dark:text-purple-400">Enabled</span>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {view === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {stages.map(stage => {
              const cfg = stageConfig[stage];
              const items = byStage(stage);
              return (
                <div key={stage} className="w-72 flex-shrink-0">
                  {/* Column Header */}
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 border ${cfg.border} ${cfg.bg}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className={`text-sm font-semibold ${cfg.text}`}>{stage}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.count_bg}`}>{items.length}</span>
                  </div>
                  {/* Cards */}
                  <div className="space-y-3">
                    {items.length === 0 && (
                      <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                        No candidates
                      </div>
                    )}
                    {items.map(app => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedId(selectedId === app.id ? null : app.id)}
                        className={`bg-white dark:bg-gray-900 border rounded-xl p-3.5 cursor-pointer transition-all hover:shadow-md ${
                          selectedId === app.id ? 'border-blue-400 dark:border-blue-600 shadow-md shadow-blue-100 dark:shadow-blue-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {app.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-xs">{app.name}</p>
                              <p className="text-xs text-gray-400">{app.college}</p>
                            </div>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); toggleStar(app.id); }}
                            className={`${app.starred ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'} transition-colors`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{app.role}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {app.skills.slice(0, 2).map(s => (
                            <span key={s} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md">{s}</span>
                          ))}
                          {app.skills.length > 2 && <span className="text-xs text-gray-400">+{app.skills.length - 2}</span>}
                        </div>
                        {/* ATS Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-400">ATS Score</span>
                            <span className={`font-bold ${atsColor(app.ats)}`}>{app.ats}/100</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${atsBar(app.ats)} transition-all`} style={{ width: `${app.ats}%` }} />
                          </div>
                        </div>
                        {/* Note */}
                        {app.note && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 italic mb-2 truncate">"{app.note}"</p>
                        )}
                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                          <span className="text-xs text-gray-400">{app.appliedDate}</span>
                          {nextStage(app.stage) && (
                            <button
                              onClick={e => { e.stopPropagation(); moveStage(app.id, nextStage(app.stage)!); }}
                              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                            >
                              Move <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {view === 'table' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5 text-left font-medium">Candidate</th>
                  <th className="px-5 py-3.5 text-left font-medium">Role</th>
                  <th className="px-5 py-3.5 text-left font-medium">College</th>
                  <th className="px-5 py-3.5 text-center font-medium">ATS Score</th>
                  <th className="px-5 py-3.5 text-left font-medium">Stage</th>
                  <th className="px-5 py-3.5 text-left font-medium">Applied</th>
                  <th className="px-5 py-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(app => {
                  const cfg = stageConfig[app.stage];
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {app.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{app.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{app.email}</p>
                          </div>
                          {app.starred && <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{app.role}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{app.college}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-sm font-bold ${atsColor(app.ats)}`}>{app.ats}</span>
                          <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full ${atsBar(app.ats)} rounded-full`} style={{ width: `${app.ats}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.count_bg}`}>{app.stage}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">{app.appliedDate}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => toggleStar(app.id)} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${app.starred ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}>
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                          <select
                            value={app.stage}
                            onChange={e => moveStage(app.id, e.target.value as Stage)}
                            onClick={e => e.stopPropagation()}
                            className="px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer text-gray-700 dark:text-gray-200 focus:outline-none"
                          >
                            {stages.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Candidate Detail Panel */}
      {selectedApplicant && view === 'kanban' && (
        <Card>
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                {selectedApplicant.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg">{selectedApplicant.name}</h3>
                  {selectedApplicant.starred && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedApplicant.role}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stageConfig[selectedApplicant.stage].count_bg}`}>{selectedApplicant.stage}</span>
                  <span className="text-xs text-gray-400">{selectedApplicant.experience}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 text-xl font-light">×</button>
          </div>
          <div className="p-5 grid md:grid-cols-3 gap-6">
            {/* Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Contact Info</h4>
              <div className="space-y-2">
                {[
                  { icon: Mail, text: selectedApplicant.email },
                  { icon: Phone, text: selectedApplicant.phone },
                  { icon: GraduationCap, text: `${selectedApplicant.college} — ${selectedApplicant.degree}` },
                  { icon: MapPin, text: selectedApplicant.location },
                  { icon: Calendar, text: `Applied: ${selectedApplicant.appliedDate}` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <item.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* ATS + Skills */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">ATS Score</h4>
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-black ${atsColor(selectedApplicant.ats)}`}>{selectedApplicant.ats}</div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${atsBar(selectedApplicant.ats)} rounded-full transition-all`} style={{ width: `${selectedApplicant.ats}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{selectedApplicant.ats >= 85 ? 'Excellent match' : selectedApplicant.ats >= 70 ? 'Good match' : 'Partial match'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApplicant.skills.map(s => (
                    <span key={s} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg font-medium">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</h4>
              <div className="space-y-2">
                {nextStage(selectedApplicant.stage) && (
                  <button
                    onClick={() => moveStage(selectedApplicant.id, nextStage(selectedApplicant.stage)!)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Move to {nextStage(selectedApplicant.stage)} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => moveStage(selectedApplicant.id, 'Rejected')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <FileText className="w-4 h-4" /> View Resume
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <MessageSquare className="w-4 h-4" /> Send Message
                </button>
              </div>
              {/* Note */}
              {selectedApplicant.note && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 italic">{selectedApplicant.note}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
