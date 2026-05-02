import React from 'react';
import { Card, CardContent } from '../../components/common';
import { Bell, Briefcase, Calendar, CheckCircle } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">Stay updated with your career progress</p>
        </div>
        <button className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {/* Unread Notification */}
        <Card className="border-l-4 border-l-primary-500 bg-primary-50/30">
          <CardContent className="p-4 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-semibold text-gray-900">Application Shortlisted!</h4>
                <span className="text-xs font-medium text-primary-600">Just now</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Your application for Frontend Developer Intern at Google has been shortlisted for the next round.</p>
            </div>
          </CardContent>
        </Card>

        {/* Read Notification */}
        <Card>
          <CardContent className="p-4 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-semibold text-gray-700">Event Reminder</h4>
                <span className="text-xs text-gray-400">2 hours ago</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">The AWS Cloud Workshop starts in 1 hour. Click here to join the meeting.</p>
            </div>
          </CardContent>
        </Card>

        {/* Read Notification */}
        <Card>
          <CardContent className="p-4 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-semibold text-gray-700">New Matches Found</h4>
                <span className="text-xs text-gray-400">Yesterday</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">We found 5 new internships that match your React and Node.js skills.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
