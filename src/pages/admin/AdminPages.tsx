import React from 'react';
import { Card, CardContent } from '../../components/common';

// A helper component to quickly stub out all these pages so we don't need 14 files
const AdminPageStub: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="space-y-6 animate-fade-in">
    <h1 className="font-display text-2xl font-bold text-gray-900">{title}</h1>
    <Card>
      <CardContent className="p-0">
        <div className="p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title} Configuration</h3>
          <p className="text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const UserManagementPage = () => <AdminPageStub title="User Management" description="View, edit, block, and delete user accounts." />;
export const CompanyManagementPage = () => <AdminPageStub title="Company Management" description="Manage and verify company profiles." />;
export const InternshipManagementPage = () => <AdminPageStub title="Internship Management" description="Global moderation of all internship listings." />;
export const EventManagementPage = () => <AdminPageStub title="Event Management" description="Global moderation of all event listings." />;
export const CourseManagementPage = () => <AdminPageStub title="Course Management" description="Add, edit, and organize courses." />;
export const APISystemPage = () => <AdminPageStub title="API System" description="Manage external API sources, mapping, and sync status." />;
export const AIControlPage = () => <AdminPageStub title="AI Control" description="Toggle AI features and configure prompt verification rules." />;
export const StaffManagementPage = () => <AdminPageStub title="Staff Management" description="Add staff members and assign permission roles." />;
export const AdsSystemPage = () => <AdminPageStub title="Ads System" description="Create and place ad campaigns across the platform." />;
export const UIControlPage = () => <AdminPageStub title="UI Control" description="Change themes, typography, and site-wide copy." />;
export const FeatureControlPage = () => <AdminPageStub title="Feature Control" description="Killswitches for platform modules." />;
export const AdminNotificationsPage = () => <AdminPageStub title="Global Notifications" description="Broadcast push notifications or emails to targeted groups." />;
export const AnalyticsPage = () => <AdminPageStub title="Platform Analytics" description="Deep dive into growth, engagement, and retention metrics." />;
export const SecurityPage = () => <AdminPageStub title="Security & Logs" description="Review admin audit logs and failed login attempts." />;
export const BackupPage = () => <AdminPageStub title="System Backup" description="Configure automated backups and restore points." />;
