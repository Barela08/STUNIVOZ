import React from 'react';
import { Card, CardHeader, CardContent, Button, EmptyState, Loading } from '../../components/common';
import { Users, Eye, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import type { Internship, InternshipApplication } from '../../types';

export const ProviderDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const internships = useCollection<Internship>('internships');
  const applications = useCollection<InternshipApplication>('internship_applications');
  const myListings = internships.data.filter((item) => item.posted_by === user?.uid);
  const myApplications = applications.data.filter((application) =>
    myListings.some((listing) => listing.id === application.internship_id)
  );

  const stats = [
    { label: 'Active Listings', value: myListings.filter((item) => item.status !== 'closed').length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
    { label: 'Total Applicants', value: myApplications.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
    { label: 'Pending Review', value: myApplications.filter((item) => item.status === 'pending').length, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { label: 'Profile Views', value: 0, icon: Eye, color: 'text-purple-500', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Welcome, {profile?.company_name || profile?.full_name || 'Company'}</h1>
          <p className="text-gray-500">Manage real listings and applicants.</p>
        </div>
        <Link to="/provider/internships/new"><Button variant="primary">Post Internship</Button></Link>
      </div>

      {internships.loading || applications.loading ? (
        <Loading text="Loading provider dashboard..." />
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
              <CardHeader title="Recent Applications" action={<Link to="/provider/applicants"><Button variant="ghost" size="sm">View All</Button></Link>} />
              <CardContent>
                {myApplications.length === 0 ? (
                  <EmptyState title="No applicants yet" description="Applications will appear when students apply to your listings." />
                ) : (
                  <div className="divide-y divide-gray-100">
                    {myApplications.slice(0, 6).map((application) => (
                      <div key={application.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{application.user_id}</p>
                          <p className="text-sm text-gray-500">{application.applied_at}</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 capitalize">
                          {application.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Your Active Listings" />
              <CardContent>
                {myListings.length === 0 ? (
                  <EmptyState title="No listings" description="Post your first internship to start receiving applicants." />
                ) : (
                  <div className="space-y-3">
                    {myListings.map((listing) => (
                      <div key={listing.id} className="p-3 border border-gray-100 rounded-lg">
                        <h4 className="font-semibold text-gray-900 text-sm">{listing.role}</h4>
                        <p className="text-xs text-gray-500 mt-1">{listing.location}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
