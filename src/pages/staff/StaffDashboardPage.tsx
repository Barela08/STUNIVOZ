import React from 'react';
import { Card, CardContent } from '../../components/common';
import { Users, FileCheck, Flag, AlertTriangle } from 'lucide-react';

export const StaffDashboardPage: React.FC = () => {
  const stats = [
    { label: 'Pending Verifications', value: 24, icon: FileCheck, color: 'text-blue-500', bg: 'bg-blue-100' },
    { label: 'Flagged Posts', value: 8, icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { label: 'Unresolved Reports', value: 12, icon: Flag, color: 'text-red-500', bg: 'bg-red-100' },
    { label: 'New Users (Today)', value: 145, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Staff Overview</h1>
        <p className="text-gray-500">Monitor platform health and pending tasks.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="!p-4 border-l-4" style={{ borderLeftColor: stat.bg.replace('bg-', 'var(--tw-colors-').replace('-100', '-500)') }}>
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
    </div>
  );
};
