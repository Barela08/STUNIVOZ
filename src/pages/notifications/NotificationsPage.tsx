import React from 'react';
import { Card, CardContent, EmptyState, Loading } from '../../components/common';
import { Bell, Briefcase, Calendar, CheckCircle } from 'lucide-react';
import { updateDocument } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import type { Notification } from '../../types';

const iconByType = {
  internship: Briefcase,
  event: Calendar,
  application: CheckCircle,
  system: Bell,
};

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const notifications = useCollection<Notification>('notifications');
  const visibleNotifications = notifications.data.filter((notification) =>
    notification.user_id === user?.uid || notification.user_id === 'broadcast'
  );

  const markAllRead = async () => {
    await Promise.all(
      visibleNotifications
        .filter((notification) => !notification.is_read)
        .map((notification) => updateDocument('notifications', notification.id, { is_read: true }))
    );
    notifications.refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">Real updates for your account and platform broadcasts.</p>
        </div>
        <button onClick={markAllRead} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      {notifications.loading ? (
        <Loading text="Loading notifications..." />
      ) : visibleNotifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bell className="w-6 h-6" />}
            title="No notifications"
            description="Application updates, event reminders, and admin broadcasts will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleNotifications.map((notification) => {
            const Icon = iconByType[notification.type] || Bell;
            return (
              <Card key={notification.id} className={!notification.is_read ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''}>
                <CardContent className="p-4 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between gap-4">
                      <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                      <span className="text-xs text-gray-400">{notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
