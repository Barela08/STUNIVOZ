import React, { useMemo, useState } from 'react';
import {
  Activity,
  Ban,
  Bell,
  Bot,
  Building2,
  CheckCircle2,
  Database,
  DollarSign,
  Download,
  Eye,
  Flag,
  LayoutGrid,
  Link as LinkIcon,
  Lock,
  Megaphone,
  Palette,
  Plug,
  RefreshCw,
  Save,
  Search,
  Shield,
  SlidersHorizontal,
  Upload,
  Users,
  Wrench,
  ZapOff,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';

type SystemMode = 'production' | 'staging' | 'development';
type RestrictionTarget = 'user' | 'company';

const modules = [
  'System Core Config',
  'Super Admin Control',
  'Role & Staff Management',
  'User Management',
  'API & Platform Control',
  'Agent Auto-Integration',
  'CMS & Page Builder',
  'UI / Theme Control',
  'Ads Management',
  'Feature Control',
  'Special User Control',
  'Maintenance Mode',
  'Notification Control',
  'Data Control',
  'Analytics Dashboard',
  'Security & Logs',
  'Backup & Restore',
  'Monetization Control',
  'Global Settings',
  'System Automation',
  'Error Handling',
  'Search & Filter',
  'Performance',
  'Community Features',
  'Future Scalability',
  'Dev / Testing Mode',
  'Export / Import',
  'AI Smart System',
  'Branding & Media',
  'Restrictions',
  'Dynamic Buttons',
  'Category Customization',
  'Announcements',
  'Report & Abuse',
  'Access Levels',
];

const metricCards = [
  { label: 'Total Users', value: '1,245', detail: '+84 this week', icon: Users, color: 'bg-sky-500' },
  { label: 'Active Today', value: '187', detail: 'Live sessions', icon: Activity, color: 'bg-emerald-500' },
  { label: 'Revenue', value: 'Rs. 24,567', detail: 'Monthly tracked', icon: DollarSign, color: 'bg-violet-500' },
  { label: 'Open Reports', value: '23', detail: '6 urgent reviews', icon: Flag, color: 'bg-rose-500' },
];

const quickLinks = [
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'Companies', href: '/admin/companies', icon: Building2 },
  { title: 'API System', href: '/admin/api', icon: Plug },
  { title: 'Features', href: '/admin/features', icon: SlidersHorizontal },
  { title: 'Notifications', href: '/admin/notifications', icon: Bell },
  { title: 'Analytics', href: '/admin/analytics', icon: Activity },
  { title: 'Security', href: '/admin/security', icon: Shield },
  { title: 'Backup', href: '/admin/backup', icon: Database },
];

const featureNames = [
  'Internships',
  'Jobs',
  'Courses',
  'Events',
  'Community',
  'AI Recommendations',
  'Ads',
  'Payments',
  'Mobile App Control',
  'Multi-language',
];

const systemModules = [
  { title: 'API & Agent Sync', text: 'Field mapping, cron refresh, webhooks, smart merge, duplicate removal.', icon: Plug },
  { title: 'CMS & SEO', text: 'Homepage banners, sections, page builder, meta tags, and publish flow.', icon: LayoutGrid },
  { title: 'Data Control', text: 'Duplicate detection, manual overrides, import/export, cleanup jobs.', icon: Database },
  { title: 'Security & Logs', text: 'Admin logs, staff activity, login history, 2FA, IP controls.', icon: Shield },
  { title: 'Monetization', text: 'Featured listings, paid promos, plans, Razorpay, Stripe, PayPal.', icon: DollarSign },
  { title: 'AI Smart System', text: 'Recommendations, behavior analysis, chatbot support, AI cleanup.', icon: Bot },
];

export const AdminDashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const [systemMode, setSystemMode] = useState<SystemMode>('production');
  const [debugMode, setDebugMode] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [topAlertEnabled, setTopAlertEnabled] = useState(true);
  const [selectedModule, setSelectedModule] = useState('Branding & Media');
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>(
    Object.fromEntries(featureNames.map((feature) => [feature, true]))
  );
  const [branding, setBranding] = useState({
    appLogo: '/assets/STUNIVOZlogo.png',
    websiteLogo: '/assets/STUNIVOZlogo.png',
    favicon: '/assets/STUNIVOZlogo.png',
    backgroundScope: 'Global',
    splashTitle: 'STUNIVOZ is loading',
  });
  const [buttonControl, setButtonControl] = useState({
    category: 'internships',
    buttonName: 'Apply now',
    actionType: 'internal',
    redirectLink: '/internships',
    color: '#0ea5e9',
    visibleTo: 'All users',
  });
  const [categoryConfig, setCategoryConfig] = useState({
    category: 'internships',
    layout: 'grid',
    visible: true,
    description: 'Curated opportunities from verified companies.',
  });
  const [restriction, setRestriction] = useState({
    target: 'user' as RestrictionTarget,
    action: 'temporary_ban',
    duration: '7 days',
    reason: 'Policy violation',
  });
  const [announcement, setAnnouncement] = useState({
    type: 'Global banner',
    title: 'New internship batch is live',
    message: 'Featured listings and partner events are now available.',
  });

  const activeFeatures = useMemo(
    () => Object.values(featureFlags).filter(Boolean).length,
    [featureFlags]
  );

  const updateBrandAsset = (key: 'appLogo' | 'websiteLogo' | 'favicon', file?: File) => {
    if (!file) return;
    setBranding((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
  };

  const applyCriticalAction = (message: string) => {
    window.alert(message);
  };

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-700">Access Denied</h1>
          <p className="text-red-600 mt-2">Administrator privileges are required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {topAlertEnabled && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            <span className="font-medium">{announcement.title}</span>
            <span className="hidden sm:inline text-amber-700">{announcement.message}</span>
          </div>
          <button className="text-left font-semibold text-amber-800" onClick={() => setTopAlertEnabled(false)}>
            Hide alert
          </button>
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-3 text-sm font-semibold text-red-600">
              <Shield className="w-5 h-5" />
              Super Admin Control Center
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold text-gray-950 lg:text-4xl">STUNIVOZ Platform Command</h1>
            <p className="mt-2 max-w-3xl text-gray-600">
              Control users, companies, APIs, content, automation, revenue, security, branding, announcements, access levels, and system behavior from one panel.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
              onClick={() => applyCriticalAction('All active sessions have been marked for logout.')}
            >
              <Users className="w-4 h-4" />
              Force Logout
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={() => applyCriticalAction('Emergency shutdown workflow initiated.')}
            >
              <ZapOff className="w-4 h-4" />
              Emergency Shutdown
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ label, value, detail, icon: Icon, color }) => (
          <Card key={label} className="rounded-lg">
            <CardContent className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color} text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-950">{value}</p>
                <p className="text-xs text-gray-500">{detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="rounded-lg">
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-950">System Core Config</h2>
                <p className="text-sm text-gray-500">Mode, debug visibility, feature flags, and maintenance guardrails.</p>
              </div>
              <div className="flex rounded-lg border border-gray-200 p-1">
                {(['production', 'staging', 'development'] as SystemMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSystemMode(mode)}
                    className={`px-3 py-2 text-sm font-semibold capitalize rounded-md ${
                      systemMode === mode ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <ToggleRow label="Debug mode" active={debugMode} onClick={() => setDebugMode((value) => !value)} />
              <ToggleRow label="Maintenance mode" active={maintenanceEnabled} onClick={() => setMaintenanceEnabled((value) => !value)} />
              <ToggleRow label="Top alert bar" active={topAlertEnabled} onClick={() => setTopAlertEnabled((value) => !value)} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {featureNames.map((feature) => (
                <button
                  key={feature}
                  onClick={() => setFeatureFlags((prev) => ({ ...prev, [feature]: !prev[feature] }))}
                  className={`rounded-lg border p-3 text-left transition ${
                    featureFlags[feature] ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{feature}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${featureFlags[feature] ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{featureFlags[feature] ? 'Enabled live' : 'Hidden or locked'}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardContent className="space-y-4">
            <h2 className="text-xl font-bold text-gray-950">Live Health</h2>
            <StatusRow label="Mode" value={systemMode.toUpperCase()} tone="blue" />
            <StatusRow label="Enabled features" value={`${activeFeatures}/${featureNames.length}`} tone="green" />
            <StatusRow label="Maintenance" value={maintenanceEnabled ? 'ACTIVE' : 'OFF'} tone={maintenanceEnabled ? 'red' : 'green'} />
            <StatusRow label="Scheduled backup" value="02:00 IST" tone="gray" />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="secondary" onClick={() => applyCriticalAction('Manual sync started.')}>
                <RefreshCw className="w-4 h-4" />
                Sync
              </Button>
              <Button variant="secondary" onClick={() => applyCriticalAction('Backup job queued.')}>
                <Download className="w-4 h-4" />
                Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ControlPanel title="Branding & Media Control" icon={<Palette className="w-5 h-5 text-sky-600" />}>
          <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
              <img src={branding.appLogo} alt="App logo preview" className="mx-auto h-20 w-20 object-contain" />
              <p className="mt-3 text-xs font-semibold text-gray-600">Live Logo Preview</p>
            </div>
            <div className="space-y-3">
              <AssetUpload label="App logo PNG/SVG" onChange={(file) => updateBrandAsset('appLogo', file)} />
              <AssetUpload label="Website logo" onChange={(file) => updateBrandAsset('websiteLogo', file)} />
              <AssetUpload label="Favicon" onChange={(file) => updateBrandAsset('favicon', file)} />
              <label className="block text-sm font-medium text-gray-700">
                Background scope
                <select
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  value={branding.backgroundScope}
                  onChange={(event) => setBranding((prev) => ({ ...prev, backgroundScope: event.target.value }))}
                >
                  <option>Global</option>
                  <option>Homepage</option>
                  <option>Dashboard</option>
                  <option>Admin only</option>
                </select>
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={branding.splashTitle}
                onChange={(event) => setBranding((prev) => ({ ...prev, splashTitle: event.target.value }))}
                aria-label="Splash screen title"
              />
            </div>
          </div>
        </ControlPanel>

        <ControlPanel title="Maintenance Display" icon={<Wrench className="w-5 h-5 text-orange-600" />}>
          <TextInput label="Title" defaultValue="We'll be back soon" />
          <TextInput label="Description" defaultValue="Scheduled upgrades are in progress. Admin and dev users remain allowed." />
          <div className="grid grid-cols-2 gap-3">
            <TextInput label="Start time" defaultValue="2026-05-03 02:00" />
            <TextInput label="End time" defaultValue="2026-05-03 04:00" />
          </div>
          <ToggleRow label="Allow admin/dev access" active onClick={() => undefined} />
        </ControlPanel>

        <ControlPanel title="Restriction System" icon={<Ban className="w-5 h-5 text-red-600" />}>
          <div className="grid grid-cols-2 gap-3">
            <SelectInput label="Target" value={restriction.target} options={['user', 'company']} onChange={(value) => setRestriction((prev) => ({ ...prev, target: value as RestrictionTarget }))} />
            <SelectInput label="Action" value={restriction.action} options={['temporary_ban', 'permanent_ban', 'suspend_account', 'warning_notice', 'restrict_posting', 'verification_revoke']} onChange={(value) => setRestriction((prev) => ({ ...prev, action: value }))} />
          </div>
          <TextInput label="Duration" value={restriction.duration} onChange={(value) => setRestriction((prev) => ({ ...prev, duration: value }))} />
          <TextInput label="Reason tracking" value={restriction.reason} onChange={(value) => setRestriction((prev) => ({ ...prev, reason: value }))} />
          <Button className="w-full" onClick={() => applyCriticalAction(`${restriction.action} applied to selected ${restriction.target}. Auto-unban is queued when duration ends.`)}>
            <Save className="w-4 h-4" />
            Apply Restriction
          </Button>
        </ControlPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ControlPanel title="Dynamic Button Control" icon={<LinkIcon className="w-5 h-5 text-violet-600" />}>
          <SelectInput label="Category" value={buttonControl.category} options={['internships', 'jobs', 'courses', 'events']} onChange={(value) => setButtonControl((prev) => ({ ...prev, category: value }))} />
          <TextInput label="Button text" value={buttonControl.buttonName} onChange={(value) => setButtonControl((prev) => ({ ...prev, buttonName: value }))} />
          <TextInput label="Redirect link" value={buttonControl.redirectLink} onChange={(value) => setButtonControl((prev) => ({ ...prev, redirectLink: value }))} />
          <div className="grid grid-cols-2 gap-3">
            <SelectInput label="Action type" value={buttonControl.actionType} options={['internal', 'external']} onChange={(value) => setButtonControl((prev) => ({ ...prev, actionType: value }))} />
            <TextInput label="Visible to" value={buttonControl.visibleTo} onChange={(value) => setButtonControl((prev) => ({ ...prev, visibleTo: value }))} />
          </div>
          <button
            className="w-full rounded-lg px-4 py-3 font-semibold text-white"
            style={{ backgroundColor: buttonControl.color }}
          >
            {buttonControl.buttonName}
          </button>
        </ControlPanel>

        <ControlPanel title="Category Customization" icon={<LayoutGrid className="w-5 h-5 text-emerald-600" />}>
          <SelectInput label="Category" value={categoryConfig.category} options={['internships', 'jobs', 'courses', 'events']} onChange={(value) => setCategoryConfig((prev) => ({ ...prev, category: value }))} />
          <SelectInput label="Layout" value={categoryConfig.layout} options={['grid', 'list']} onChange={(value) => setCategoryConfig((prev) => ({ ...prev, layout: value }))} />
          <TextInput label="Description" value={categoryConfig.description} onChange={(value) => setCategoryConfig((prev) => ({ ...prev, description: value }))} />
          <ToggleRow label="Category visibility" active={categoryConfig.visible} onClick={() => setCategoryConfig((prev) => ({ ...prev, visible: !prev.visible }))} />
        </ControlPanel>

        <ControlPanel title="Alerts & Announcements" icon={<Megaphone className="w-5 h-5 text-amber-600" />}>
          <SelectInput label="Type" value={announcement.type} options={['Global banner', 'Popup alert', 'Scrolling text bar']} onChange={(value) => setAnnouncement((prev) => ({ ...prev, type: value }))} />
          <TextInput label="Title" value={announcement.title} onChange={(value) => setAnnouncement((prev) => ({ ...prev, title: value }))} />
          <TextInput label="Message" value={announcement.message} onChange={(value) => setAnnouncement((prev) => ({ ...prev, message: value }))} />
          <Button className="w-full" onClick={() => setTopAlertEnabled(true)}>
            <Bell className="w-4 h-4" />
            Publish
          </Button>
        </ControlPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="rounded-lg">
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-950">Admin Module Map</h2>
                <p className="text-sm text-gray-500">All requested control systems are represented here.</p>
              </div>
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {modules.map((module, index) => (
                <button
                  key={module}
                  onClick={() => setSelectedModule(module)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                    selectedModule === module ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{index}. {module}</span>
                  <Eye className="w-4 h-4" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardContent className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-950">{selectedModule}</h2>
              <p className="text-sm text-gray-500">Workflow: Admin selects settings, previews the change, applies it, and users see the live update through platform config.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {systemModules.map(({ title, text, icon: Icon }) => (
                <div key={title} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <Icon className="mb-3 w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-950">{title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{text}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-semibold text-blue-950">Access Level Control</h3>
              <p className="mt-1 text-sm text-blue-800">Feature access can be locked or unlocked per role and per user. Super admin override remains available for emergency changes.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {['Student', 'Provider', 'Staff'].map((role) => (
                  <ToggleRow key={role} label={role} active={role !== 'Student'} onClick={() => undefined} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardContent>
          <h2 className="text-xl font-bold text-gray-950">Quick Management Routes</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map(({ title, href, icon: Icon }) => (
              <Link key={title} to={href} className="rounded-lg border border-gray-200 p-4 transition hover:border-gray-900 hover:bg-gray-50">
                <Icon className="w-5 h-5 text-gray-700" />
                <p className="mt-3 font-semibold text-gray-950">{title}</p>
                <p className="text-sm text-gray-500">Open management page</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ControlPanel: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <Card className="rounded-lg">
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-950">{title}</h2>
        {icon}
      </div>
      {children}
    </CardContent>
  </Card>
);

const ToggleRow: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
      active ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-gray-50 text-gray-600'
    }`}
  >
    <span className="font-medium">{label}</span>
    {active ? <CheckCircle2 className="w-4 h-4" /> : <span className="h-4 w-4 rounded-full border border-gray-300" />}
  </button>
);

const StatusRow: React.FC<{ label: string; value: string; tone: 'blue' | 'green' | 'red' | 'gray' }> = ({ label, value, tone }) => {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
    gray: 'bg-gray-50 text-gray-700',
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`rounded-md px-2 py-1 text-xs font-bold ${tones[tone]}`}>{value}</span>
    </div>
  );
};

const AssetUpload: React.FC<{ label: string; onChange: (file?: File) => void }> = ({ label, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
    <span className="flex items-center gap-2">
      <Upload className="w-4 h-4" />
      {label}
    </span>
    <input
      type="file"
      accept=".png,.svg,image/png,image/svg+xml"
      className="sr-only"
      onChange={(event) => onChange(event.target.files?.[0])}
    />
  </label>
);

const TextInput: React.FC<{
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}> = ({ label, value, defaultValue, onChange }) => (
  <label className="block text-sm font-medium text-gray-700">
    {label}
    <input
      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
      value={value}
      defaultValue={defaultValue}
      onChange={(event) => onChange?.(event.target.value)}
    />
  </label>
);

const SelectInput: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => (
  <label className="block text-sm font-medium text-gray-700">
    {label}
    <select
      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option.replace(/_/g, ' ')}
        </option>
      ))}
    </select>
  </label>
);

export default AdminDashboardPage;
