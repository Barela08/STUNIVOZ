import React from 'react';
import { Card, CardHeader, CardContent } from '../../components/common';
import { Users, Building2, Briefcase, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const stats = [
    { label: 'Total Users', value: '12,450', icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
    { label: 'Active Companies', value: '245', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-100' },
    { label: 'Live Internships', value: '890', icon: Briefcase, color: 'text-green-500', bg: 'bg-green-100' },
    { label: 'Platform Views (Today)', value: '45.2k', icon: Eye, color: 'text-red-500', bg: 'bg-red-100' },
  ];

  const chartData = [
    { name: 'Mon', users: 4000, active: 2400 },
    { name: 'Tue', users: 4500, active: 2800 },
    { name: 'Wed', users: 5000, active: 3200 },
    { name: 'Thu', users: 6200, active: 4000 },
    { name: 'Fri', users: 6800, active: 4500 },
    { name: 'Sat', users: 7000, active: 4800 },
    { name: 'Sun', users: 7500, active: 5200 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Global overview of platform metrics and health.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="!p-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[400px]">
            <CardHeader title="User Growth (This Week)" />
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader title="System Status" />
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database Engine</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Recommendation API</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage Service</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">92% Full</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Backup</span>
                  <span className="text-xs text-gray-500 font-medium">2 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
