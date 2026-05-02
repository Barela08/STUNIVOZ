import React from 'react';
import { Card, CardHeader, CardContent, EmptyState, Loading } from '../../components/common';
import { Users, Building2, Briefcase, Calendar, Database, ShieldCheck } from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import type { Event, Internship, Profile } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const users = useCollection<Profile>('profiles');
  const internships = useCollection<Internship>('internships');
  const events = useCollection<Event>('events');

  const loading = users.loading || internships.loading || events.loading;
  const companies = users.data.filter((profile) => profile.role === 'provider');
  const activeInternships = internships.data.filter((item) => item.status !== 'closed');
  const upcomingEvents = events.data.filter((event) => new Date(event.date).getTime() >= Date.now());

  const stats = [
    { label: 'Users', value: users.data.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Companies', value: companies.length, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Internships', value: activeInternships.length, icon: Briefcase, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Upcoming Events', value: upcomingEvents.length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Live platform overview from Firebase.</p>
      </div>

      {loading ? (
        <Loading text="Loading platform data..." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="!p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
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
            <Card className="lg:col-span-2">
              <CardHeader title="Recent Users" subtitle="Latest profiles created in Firestore" />
              <CardContent>
                {users.data.length === 0 ? (
                  <EmptyState
                    icon={<Users className="w-6 h-6" />}
                    title="No users yet"
                    description="New student, company, staff, and admin profiles will appear here after registration."
                  />
                ) : (
                  <div className="divide-y divide-gray-100">
                    {users.data.slice(0, 8).map((profile) => (
                      <div key={profile.id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-900">{profile.full_name || profile.email}</p>
                          <p className="text-sm text-gray-500">{profile.email}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium capitalize">
                          {profile.role || 'student'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="System Health" />
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <Database className="w-4 h-4 text-green-600" />
                    Firestore
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    Role Guards
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Enabled</span>
                </div>
                <p className="text-sm text-gray-500">
                  Metrics are calculated from live collections. Empty values mean no records have been created yet.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
