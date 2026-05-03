import React, { useState } from 'react';
import { Card, CardContent } from '../../components/common';
import {
  Users, Building2, Briefcase, Eye, TrendingUp, ShieldAlert,
  AlertTriangle, Cpu, Database,
  Globe, Zap, ArrowUpRight, ArrowDownRight,
  Bell, RefreshCw, Calendar, BarChart2, UserPlus
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const weekData = [
  { name: 'Mon', users: 4200, active: 2400, signups: 120 },
  { name: 'Tue', users: 4800, active: 2900, signups: 145 },
  { name: 'Wed', users: 5300, active: 3400, signups: 189 },
  { name: 'Thu', users: 6100, active: 4000, signups: 210 },
  { name: 'Fri', users: 6700, active: 4500, signups: 175 },
  { name: 'Sat', users: 7200, active: 4900, signups: 140 },
  { name: 'Sun', users: 7800, active: 5300, signups: 230 },
];

const trafficData = [
  { name: 'Students', value: 68, color: '#3b82f6' },
  { name: 'Companies', value: 18, color: '#8b5cf6' },
  { name: 'Staff', value: 14, color: '#10b981' },
];

const featureUsage = [
  { name: 'Resume', uses: 4200 },
  { name: 'Internships', uses: 3800 },
  { name: 'Community', uses: 3100 },
  { name: 'Courses', uses: 2800 },
  { name: 'Practice', uses: 2400 },
  { name: 'Career', uses: 1900 },
];

const recentActivity = [
  { type: 'signup', user: 'Ananya Sharma', detail: 'New student joined from IIT Delhi', time: '2 min ago', icon: UserPlus, color: 'text-blue-500 bg-blue-50' },
  { type: 'company', user: 'Infosys Ltd.', detail: 'Posted 3 new internship listings', time: '15 min ago', icon: Briefcase, color: 'text-purple-500 bg-purple-50' },
  { type: 'alert', user: 'System', detail: 'Storage usage crossed 90% threshold', time: '1 hour ago', icon: AlertTriangle, color: 'text-yellow-500 bg-yellow-50' },
  { type: 'report', user: 'Staff Team', detail: '5 community posts flagged for review', time: '2 hours ago', icon: ShieldAlert, color: 'text-red-500 bg-red-50' },
  { type: 'backup', user: 'Auto Backup', detail: 'Daily backup completed successfully', time: '4 hours ago', icon: Database, color: 'text-green-500 bg-green-50' },
  { type: 'event', user: 'AWS Team', detail: 'New event: Cloud Masterclass registered', time: '5 hours ago', icon: Calendar, color: 'text-indigo-500 bg-indigo-50' },
];

const systemServices = [
  { name: 'Firebase Auth', status: 'Operational', uptime: '99.98%', latency: '42ms', color: 'green' },
  { name: 'Firestore DB', status: 'Operational', uptime: '99.95%', latency: '68ms', color: 'green' },
  { name: 'Storage', status: 'Warning', uptime: '99.80%', latency: '112ms', color: 'yellow' },
  { name: 'AI Engine', status: 'Operational', uptime: '99.50%', latency: '380ms', color: 'green' },
  { name: 'Email Service', status: 'Operational', uptime: '99.99%', latency: '25ms', color: 'green' },
];

const topStats = [
  { label: 'Total Users', value: '12,450', change: '+8.2%', up: true, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800' },
  { label: 'Active Companies', value: '245', change: '+12.5%', up: true, icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-100 dark:border-purple-800' },
  { label: 'Live Internships', value: '890', change: '+5.1%', up: true, icon: Briefcase, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-100 dark:border-green-800' },
  { label: 'Platform Views', value: '45.2k', change: '-2.3%', up: false, icon: Eye, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-100 dark:border-orange-800' },
  { label: 'AI Requests Today', value: '8,340', change: '+18.7%', up: true, icon: Cpu, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-800' },
  { label: 'New Signups (Today)', value: '230', change: '+31.4%', up: true, icon: TrendingUp, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-100 dark:border-teal-800' },
];

const CUSTOM_TOOLTIP_STYLE = {
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
  fontSize: '12px',
};

export const AdminDashboardPage: React.FC = () => {
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">Full system overview — STUNIVOZ Platform</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-sm">
            <Bell className="w-4 h-4" /> Alerts (3)
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Storage Warning</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">Storage service is at 92% capacity. Consider expanding or cleaning up old files.</p>
        </div>
        <button className="text-xs text-yellow-700 dark:text-yellow-300 font-medium hover:underline">Manage</button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {topStats.map((stat, i) => (
          <Card key={i} className={`!p-4 border ${stat.border}`}>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">{stat.label}</div>
            <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-green-600' : 'text-red-500'}`}>
              {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {stat.change}
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">User Growth & Activity</h3>
                <p className="text-xs text-gray-400 mt-0.5">Total users vs active sessions</p>
              </div>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {(['7d', '30d', '90d'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setChartPeriod(p)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      chartPeriod === p
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >{p}</button>
                ))}
              </div>
            </div>
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorUsers)" dot={false} />
                  <Area type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2.5} fill="url(#colorActive)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Pie Chart */}
        <div>
          <Card className="h-full">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">User Type Breakdown</h3>
              <p className="text-xs text-gray-400 mt-0.5">Active user distribution</p>
            </div>
            <div className="p-4 h-64 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={trafficData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {trafficData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-0">
                {trafficData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{d.name} ({d.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Feature Usage + System Status */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Feature Usage (This Week)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Most used modules across platform</p>
            </div>
            <div className="p-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureUsage} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                  <Bar dataKey="uses" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* System Status */}
        <div>
          <Card className="h-full">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">System Status</h3>
              <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>
            <CardContent className="space-y-3">
              {systemServices.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.uptime} uptime · {s.latency}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    s.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>{s.status}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 flex items-center justify-between">
                <span>Last backup: 2 hours ago</span>
                <button className="text-blue-500 hover:underline text-xs">View logs</button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <button className="text-xs text-blue-500 hover:underline">View all</button>
            </div>
            <CardContent className="space-y-0 divide-y divide-gray-50 dark:divide-gray-800">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-3.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.user}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.detail}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="h-full">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            </div>
            <CardContent className="space-y-2">
              {[
                { label: 'Send Global Notification', icon: Bell, to: '/admin/notifications', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100' },
                { label: 'Review Flagged Content', icon: ShieldAlert, to: '/admin/security', color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100' },
                { label: 'Toggle Features', icon: Zap, to: '/admin/features', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100' },
                { label: 'Platform Analytics', icon: BarChart2, to: '/admin/analytics', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100' },
                { label: 'Manage API Systems', icon: Globe, to: '/admin/api', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100' },
                { label: 'Run Manual Backup', icon: Database, to: '/admin/backup', color: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100' },
              ].map((action, i) => (
                <a
                  key={i}
                  href={action.to}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${action.color}`}
                >
                  <action.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{action.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-60" />
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
