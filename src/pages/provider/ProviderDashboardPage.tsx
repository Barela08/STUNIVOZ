import React from 'react';
import { Card, CardHeader, CardContent, Button } from '../../components/common';
import { Users, Eye, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProviderDashboardPage: React.FC = () => {
  const stats = [
    { label: 'Active Listings', value: 4, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
    { label: 'Total Applicants', value: 156, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
    { label: 'Pending Review', value: 42, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { label: 'Profile Views', value: '1.2k', icon: Eye, color: 'text-purple-500', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Welcome, TechCorp!</h1>
          <p className="text-gray-500">Here's what's happening with your listings today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/provider/internships/new">
            <Button variant="primary">Post Internship</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
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
          <Card>
            <CardHeader title="Recent Applications" action={<Button variant="ghost" size="sm">View All</Button>} />
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-sm text-gray-500">
                      <th className="pb-3 font-medium">Applicant</th>
                      <th className="pb-3 font-medium">Applied For</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { name: 'John Doe', role: 'Frontend Intern', date: 'Today', status: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
                      { name: 'Sarah Chen', role: 'UX Design Intern', date: 'Yesterday', status: 'Shortlisted', color: 'bg-green-100 text-green-700' },
                      { name: 'Mike Smith', role: 'Backend Intern', date: '2 days ago', status: 'Rejected', color: 'bg-red-100 text-red-700' },
                    ].map((app, i) => (
                      <tr key={i}>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                              {app.name.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">{app.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-gray-600">{app.role}</td>
                        <td className="py-3 text-sm text-gray-500">{app.date}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${app.color}`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader title="Your Active Listings" />
            <CardContent className="space-y-4">
              {[
                { title: 'Frontend Developer Intern', applicants: 45, daysLeft: 12 },
                { title: 'UX Design Intern', applicants: 32, daysLeft: 5 },
                { title: 'Backend Developer Intern', applicants: 79, daysLeft: 15 },
              ].map((listing, i) => (
                <div key={i} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">{listing.title}</h4>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{listing.applicants} applicants</span>
                    <span className="text-blue-600">{listing.daysLeft} days left</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
