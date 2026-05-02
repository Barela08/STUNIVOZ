import React, { useMemo, useState } from 'react';
import { Card, CardContent, Button, EmptyState, Loading } from '../../components/common';
import { Search, Download } from 'lucide-react';
import { updateDocument } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import type { Internship, InternshipApplication, Profile } from '../../types';

export const ApplicantsPage: React.FC = () => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const internships = useCollection<Internship>('internships');
  const applications = useCollection<InternshipApplication>('internship_applications');
  const profiles = useCollection<Profile>('profiles');

  const myListings = internships.data.filter((listing) => listing.posted_by === user?.uid);
  const rows = useMemo(() => applications.data
    .filter((application) => myListings.some((listing) => listing.id === application.internship_id))
    .map((application) => ({
      application,
      listing: myListings.find((listing) => listing.id === application.internship_id),
      profile: profiles.data.find((profile) => profile.id === application.user_id)
    }))
    .filter((row) => filterStatus === 'all' || row.application.status === filterStatus)
    .filter((row) => `${row.profile?.full_name || ''} ${row.profile?.email || ''} ${row.listing?.role || ''}`.toLowerCase().includes(search.toLowerCase())),
    [applications.data, myListings, profiles.data, filterStatus, search]
  );

  const setStatus = async (application: InternshipApplication, status: InternshipApplication['status']) => {
    await updateDocument('internship_applications', application.id, { status });
    applications.refresh();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'applied': return 'bg-blue-100 text-blue-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Manage Applicants</h1>
          <p className="text-gray-500">Review and update real candidate applications.</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <CardContent className="p-0">
          {applications.loading || internships.loading || profiles.loading ? (
            <Loading text="Loading applicants..." />
          ) : rows.length === 0 ? (
            <EmptyState title="No applicants" description="Students who apply to your internships will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-sm text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Applicant</th>
                    <th className="px-6 py-4 font-medium">Applied For</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map(({ application, listing, profile }) => (
                    <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{profile?.full_name || application.user_id}</div>
                        <div className="text-xs text-gray-500">{profile?.email || 'No profile email'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{listing?.role || application.internship_id}</div>
                        <div className="text-xs text-gray-500">{application.applied_at}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={application.status}
                          onChange={(event) => setStatus(application, event.target.value as InternshipApplication['status'])}
                          className="px-2 py-1.5 text-xs bg-white border border-gray-200 rounded cursor-pointer hover:border-gray-300"
                        >
                          <option value="pending">Pending</option>
                          <option value="shortlisted">Shortlist</option>
                          <option value="rejected">Reject</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
