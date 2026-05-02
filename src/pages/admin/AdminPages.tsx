import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button, EmptyState, Input, Loading, Textarea } from '../../components/common';
import { addDocument, deleteDocument, updateDocument } from '../../services/firebase';
import { useCollection } from '../../hooks/useCollection';
import type { Course, Event, Internship, Profile } from '../../types';
import { Bell, Briefcase, Calendar, Database, KeyRound, Settings, Shield, Trash2, Users } from 'lucide-react';

type Row = { id: string } & Record<string, unknown>;

const toText = (value: unknown) => (value === undefined || value === null || value === '' ? '-' : String(value));

const AdminTable: React.FC<{
  title: string;
  subtitle?: string;
  rows: Row[];
  loading: boolean;
  columns: { key: string; label: string }[];
  emptyTitle: string;
  emptyDescription: string;
  actions?: (row: Row) => React.ReactNode;
}> = ({ title, subtitle, rows, loading, columns, emptyTitle, emptyDescription, actions }) => (
  <Card>
    <CardHeader title={title} subtitle={subtitle} />
    <CardContent className="p-0">
      {loading ? (
        <Loading text="Loading records..." />
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 font-medium">{column.label}</th>
                ))}
                {actions && <th className="px-4 py-3 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm text-gray-700">{toText(row[column.key])}</td>
                  ))}
                  {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardContent>
  </Card>
);

export const UserManagementPage = () => {
  const { data, loading, refresh } = useCollection<Profile>('profiles');

  const setRole = async (profile: Profile, role: Profile['role']) => {
    await updateDocument('profiles', profile.id, { role });
    refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-gray-900">User Management</h1>
      <AdminTable
        title="Accounts"
        subtitle="Manage user roles and access."
        rows={data as unknown as Row[]}
        loading={loading}
        columns={[
          { key: 'full_name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'is_verified', label: 'Verified' },
        ]}
        emptyTitle="No users found"
        emptyDescription="Users will appear here after registration."
        actions={(row) => (
          <div className="flex justify-end gap-2">
            <select
              className="px-2 py-1.5 text-xs border border-gray-200 rounded"
              value={String(row.role || 'student')}
              onChange={(event) => setRole(row as unknown as Profile, event.target.value as Profile['role'])}
            >
              <option value="student">Student</option>
              <option value="provider">Provider</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}
      />
    </div>
  );
};

export const CompanyManagementPage = () => {
  const { data, loading, refresh } = useCollection<Profile>('profiles');
  const companies = data.filter((profile) => profile.role === 'provider');

  const verifyCompany = async (profile: Profile, verified: boolean) => {
    await updateDocument('profiles', profile.id, { is_verified: verified });
    refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-gray-900">Company Management</h1>
      <AdminTable
        title="Company Profiles"
        subtitle="Approve and monitor provider accounts."
        rows={companies as unknown as Row[]}
        loading={loading}
        columns={[
          { key: 'company_name', label: 'Company' },
          { key: 'company_domain', label: 'Domain' },
          { key: 'email', label: 'Contact' },
          { key: 'is_verified', label: 'Verified' },
        ]}
        emptyTitle="No companies registered"
        emptyDescription="Company accounts created from signup will appear here."
        actions={(row) => (
          <Button size="sm" variant={row.is_verified ? 'secondary' : 'primary'} onClick={() => verifyCompany(row as unknown as Profile, !row.is_verified)}>
            {row.is_verified ? 'Unverify' : 'Verify'}
          </Button>
        )}
      />
    </div>
  );
};

const ListingModerationPage: React.FC<{ type: 'internships' | 'events' | 'courses' }> = ({ type }) => {
  const collection = useCollection<Row>(type);

  const closeRecord = async (row: Row) => {
    await updateDocument(type, row.id, { status: row.status === 'closed' ? 'active' : 'closed' });
    collection.refresh();
  };

  const removeRecord = async (row: Row) => {
    await deleteDocument(type, row.id);
    collection.refresh();
  };

  const columns = type === 'internships'
    ? [{ key: 'role', label: 'Role' }, { key: 'company_name', label: 'Company' }, { key: 'location', label: 'Location' }, { key: 'status', label: 'Status' }]
    : type === 'events'
      ? [{ key: 'title', label: 'Title' }, { key: 'type', label: 'Type' }, { key: 'date', label: 'Date' }, { key: 'location', label: 'Location' }]
      : [{ key: 'title', label: 'Title' }, { key: 'platform', label: 'Platform' }, { key: 'difficulty', label: 'Level' }, { key: 'is_free', label: 'Free' }];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-gray-900 capitalize">{type} Management</h1>
      <AdminTable
        title="Records"
        rows={collection.data}
        loading={collection.loading}
        columns={columns}
        emptyTitle={`No ${type} found`}
        emptyDescription={`Create real ${type} records to manage them here.`}
        actions={(row) => (
          <div className="flex justify-end gap-2">
            {type !== 'courses' && (
              <Button size="sm" variant="secondary" onClick={() => closeRecord(row)}>
                {row.status === 'closed' ? 'Reopen' : 'Close'}
              </Button>
            )}
            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => removeRecord(row)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
};

export const InternshipManagementPage = () => <ListingModerationPage type="internships" />;
export const EventManagementPage = () => <ListingModerationPage type="events" />;
export const CourseManagementPage = () => <ListingModerationPage type="courses" />;

const SettingsPanel: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <Card>
    <CardHeader title={title} action={icon} />
    <CardContent>{children}</CardContent>
  </Card>
);

export const APISystemPage = () => (
  <SettingsPanel title="API System" icon={<KeyRound className="w-5 h-5 text-primary-500" />}>
    <p className="text-sm text-gray-600">External integrations should be configured through environment variables and Firebase security rules. No API secrets are stored in the browser.</p>
  </SettingsPanel>
);

export const AIControlPage = () => (
  <SettingsPanel title="AI Controls" icon={<Settings className="w-5 h-5 text-primary-500" />}>
    <div className="space-y-3">
      {['Recommendations', 'ATS Analyzer', 'Practice Generator'].map((feature) => (
        <label key={feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">{feature}</span>
          <input type="checkbox" className="w-4 h-4" />
        </label>
      ))}
    </div>
  </SettingsPanel>
);

export const StaffManagementPage = () => <UserManagementPage />;

export const AdsSystemPage = () => (
  <SettingsPanel title="Ads System" icon={<Briefcase className="w-5 h-5 text-primary-500" />}>
    <EmptyState title="No ad campaigns" description="Create campaign documents in the ads collection when paid placements are ready." />
  </SettingsPanel>
);

export const UIControlPage = () => (
  <SettingsPanel title="UI Control" icon={<Settings className="w-5 h-5 text-primary-500" />}>
    <p className="text-sm text-gray-600">Theme and content settings can be stored in the app_settings collection and read at startup.</p>
  </SettingsPanel>
);

export const FeatureControlPage = () => (
  <SettingsPanel title="Feature Control" icon={<Shield className="w-5 h-5 text-primary-500" />}>
    <div className="grid sm:grid-cols-2 gap-3">
      {['Student Dashboard', 'Provider Posting', 'Community', 'Notifications'].map((feature) => (
        <label key={feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">{feature}</span>
          <input type="checkbox" defaultChecked className="w-4 h-4" />
        </label>
      ))}
    </div>
  </SettingsPanel>
);

export const AdminNotificationsPage = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) return;
    await addDocument('notifications', {
      title,
      message,
      type: 'system',
      is_read: false,
      user_id: 'broadcast'
    });
    setTitle('');
    setMessage('');
    setSent(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-gray-900">Global Notifications</h1>
      <Card>
        <CardHeader title="Broadcast Message" subtitle="Stores a broadcast notification in Firestore." />
        <CardContent className="space-y-4">
          <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Textarea label="Message" rows={4} value={message} onChange={(event) => setMessage(event.target.value)} />
          {sent && <p className="text-sm text-green-600">Notification saved.</p>}
          <Button onClick={sendNotification}><Bell className="w-4 h-4" /> Send</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export const AnalyticsPage = () => {
  const users = useCollection<Profile>('profiles');
  const internships = useCollection<Internship>('internships');
  const events = useCollection<Event>('events');
  const courses = useCollection<Course>('courses');

  const metrics = [
    { label: 'Profiles', value: users.data.length, icon: Users },
    { label: 'Internships', value: internships.data.length, icon: Briefcase },
    { label: 'Events', value: events.data.length, icon: Calendar },
    { label: 'Courses', value: courses.data.length, icon: Database },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-gray-900">Platform Analytics</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <metric.icon className="w-5 h-5 text-primary-500 mb-3" />
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            <div className="text-sm text-gray-500">{metric.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const SecurityPage = () => (
  <SettingsPanel title="Security & Logs" icon={<Shield className="w-5 h-5 text-primary-500" />}>
    <p className="text-sm text-gray-600">Admin, staff, and provider pages now enforce role-based route guards from the profile document.</p>
  </SettingsPanel>
);

export const BackupPage = () => (
  <SettingsPanel title="System Backup" icon={<Database className="w-5 h-5 text-primary-500" />}>
    <p className="text-sm text-gray-600">Use Firebase scheduled exports for production backups. This client app does not expose destructive backup credentials.</p>
  </SettingsPanel>
);
