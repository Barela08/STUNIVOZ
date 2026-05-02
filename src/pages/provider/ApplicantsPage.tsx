import React, { useState } from 'react';
import { Card, CardContent, Button } from '../../components/common';
import { Search, Download, ExternalLink } from 'lucide-react';

export const ApplicantsPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('all');

  const applicants = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Frontend Intern', date: '2024-12-01', status: 'Pending', score: 85 },
    { id: 2, name: 'Sarah Chen', email: 'sarah@example.com', role: 'UX Design Intern', date: '2024-12-02', status: 'Shortlisted', score: 92 },
    { id: 3, name: 'Mike Smith', email: 'mike@example.com', role: 'Backend Intern', date: '2024-11-28', status: 'Rejected', score: 45 },
    { id: 4, name: 'Priya Patel', email: 'priya@example.com', role: 'Frontend Intern', date: '2024-12-03', status: 'Pending', score: 78 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Shortlisted': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Manage Applicants</h1>
          <p className="text-gray-500">Review and shortlist candidates for your listings</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export to CSV</Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or role..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-sm text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Applicant Info</th>
                  <th className="px-6 py-4 font-medium">Applied For</th>
                  <th className="px-6 py-4 font-medium">ATS Score</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applicants.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                          {app.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{app.name}</div>
                          <div className="text-xs text-gray-500">{app.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{app.role}</div>
                      <div className="text-xs text-gray-500">{app.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${app.score >= 80 ? 'text-green-600' : app.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {app.score}/100
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 p-2">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <select className="px-2 py-1.5 text-xs bg-white border border-gray-200 rounded cursor-pointer hover:border-gray-300">
                          <option>Action...</option>
                          <option value="shortlist">Shortlist</option>
                          <option value="reject">Reject</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
