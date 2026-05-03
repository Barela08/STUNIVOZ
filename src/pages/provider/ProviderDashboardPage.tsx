import React from 'react';
import { Card, CardContent, Button } from '../../components/common';
import { Link } from 'react-router-dom';
import {
  Users, Eye, CheckCircle, Clock, Briefcase, TrendingUp,
  ArrowUpRight, ArrowDownRight, ChevronRight, Plus, Calendar
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const applicationData = [
  { name: 'W1', applications: 18, shortlisted: 6 },
  { name: 'W2', applications: 32, shortlisted: 11 },
  { name: 'W3', applications: 27, shortlisted: 9 },
  { name: 'W4', applications: 45, shortlisted: 18 },
  { name: 'W5', applications: 38, shortlisted: 14 },
  { name: 'W6', applications: 56, shortlisted: 22 },
];

const pipelineStages = [
  { stage: 'Applied', count: 156, color: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', pct: 100 },
  { stage: 'Screening', count: 89, color: 'bg-blue-200 dark:bg-blue-900/50', text: 'text-blue-700 dark:text-blue-300', pct: 57 },
  { stage: 'Shortlisted', count: 42, color: 'bg-purple-200 dark:bg-purple-900/50', text: 'text-purple-700 dark:text-purple-300', pct: 27 },
  { stage: 'Interview', count: 18, color: 'bg-yellow-200 dark:bg-yellow-900/50', text: 'text-yellow-700 dark:text-yellow-300', pct: 12 },
  { stage: 'Selected', count: 6, color: 'bg-green-200 dark:bg-green-900/50', text: 'text-green-700 dark:text-green-300', pct: 4 },
];

const activeListings = [
  { id: 1, title: 'Frontend Developer Intern', type: 'Remote', applicants: 56, new: 12, daysLeft: 12, score: 92 },
  { id: 2, title: 'UX Design Intern', type: 'On-site', applicants: 39, new: 5, daysLeft: 5, score: 78 },
  { id: 3, title: 'Backend Developer Intern', type: 'Hybrid', applicants: 61, new: 18, daysLeft: 15, score: 88 },
];

const recentApplicants = [
  { name: 'Ananya Sharma', role: 'Frontend Intern', college: 'IIT Delhi', ats: 94, stage: 'Shortlisted', time: '10m ago' },
  { name: 'Rahul Mehta', role: 'Backend Intern', college: 'NIT Trichy', ats: 87, stage: 'Screening', time: '1h ago' },
  { name: 'Priya Patel', role: 'UX Design Intern', college: 'BITS Pilani', ats: 81, stage: 'Applied', time: '3h ago' },
  { name: 'Arjun Singh', role: 'Frontend Intern', college: 'VIT Vellore', ats: 72, stage: 'Applied', time: '5h ago' },
];

const stageColor: Record<string, string> = {
  Applied: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  Screening: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  Shortlisted: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  Interview: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  Selected: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  Rejected: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

const TOOLTIP_STYLE = { borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', fontSize: '12px' };

export const ProviderDashboardPage: React.FC = () => {
  const stats = [
    { label: 'Active Listings', value: '4', change: '+1', up: true, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Applicants', value: '156', change: '+23', up: true, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Shortlisted', value: '42', change: '+8', up: true, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Pending Review', value: '37', change: '-5', up: false, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Profile Views', value: '1.2k', change: '+14%', up: true, icon: Eye, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Conversion Rate', value: '3.8%', change: '+0.4%', up: true, icon: TrendingUp, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Welcome, TechCorp!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">Here's your hiring dashboard for today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/provider/events/new">
            <Button variant="outline"><Calendar className="w-4 h-4 mr-2" />Post Event</Button>
          </Link>
          <Link to="/provider/internships/new">
            <Button variant="primary"><Plus className="w-4 h-4 mr-2" />Post Internship</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="!p-4">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-1.5">{s.label}</div>
            <div className={`flex items-center gap-1 text-xs font-medium ${s.up ? 'text-green-600' : 'text-red-500'}`}>
              {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {s.change} this week
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Application Trend */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Application Trend</h3>
                <p className="text-xs text-gray-400 mt-0.5">Weekly applications vs shortlisted</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> Applied</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-purple-500 inline-block rounded" /> Shortlisted</span>
              </div>
            </div>
            <div className="p-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={applicationData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="applications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shortlisted" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Hiring Pipeline Funnel */}
        <div>
          <Card className="h-full">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Hiring Pipeline</h3>
              <p className="text-xs text-gray-400 mt-0.5">Candidate conversion funnel</p>
            </div>
            <CardContent className="space-y-2.5">
              {pipelineStages.map((stage, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{stage.stage}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{stage.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${stage.color} transition-all`} style={{ width: `${stage.pct}%` }} />
                  </div>
                </div>
              ))}
              <Link to="/provider/applicants">
                <button className="w-full mt-4 text-center text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center justify-center gap-1">
                  Manage Full Pipeline <ChevronRight className="w-3 h-3" />
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Listings + Recent Applicants */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Active Listings */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Active Listings</h3>
              <Link to="/provider/internships/new">
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Post new
                </button>
              </Link>
            </div>
            <CardContent className="space-y-3">
              {activeListings.map((listing, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{listing.title}</h4>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full whitespace-nowrap">{listing.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {listing.applicants}</span>
                      {listing.new > 0 && <span className="text-blue-600 dark:text-blue-400 font-medium">+{listing.new} new</span>}
                    </div>
                    <span className={`text-xs font-medium ${listing.daysLeft <= 7 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      {listing.daysLeft}d left
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Applicants */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Applicants</h3>
              <Link to="/provider/applicants">
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  View all ATS <ChevronRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Candidate</th>
                    <th className="px-4 py-3 text-left font-medium">Role</th>
                    <th className="px-4 py-3 text-center font-medium">ATS</th>
                    <th className="px-4 py-3 text-left font-medium">Stage</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentApplicants.map((app, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {app.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-xs">{app.name}</p>
                            <p className="text-xs text-gray-400">{app.college}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{app.role}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold ${app.ats >= 85 ? 'text-green-600' : app.ats >= 70 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {app.ats}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stageColor[app.stage]}`}>
                          {app.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to="/provider/applicants">
                          <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Review</button>
                        </Link>
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
