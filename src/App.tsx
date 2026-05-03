import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminSettingsProvider, useAdminSettings } from './contexts/AdminSettingsContext';
import { Layout } from './components/Layout/Layout';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ProviderLoginPage } from './pages/auth/ProviderLoginPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { StaffLoginPage } from './pages/auth/StaffLoginPage';
import { HomePage } from './pages/home/HomePage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { InternshipsPage } from './pages/internships/InternshipsPage';
import { EventsPage } from './pages/events/EventsPage';
import { CoursesPage } from './pages/courses/CoursesPage';
import { ResumePage } from './pages/resume/ResumePage';
import { CareerPage } from './pages/career/CareerPage';
import { SkillsPage } from './pages/skills/SkillsPage';
import { PracticePage } from './pages/practice/PracticePage';
import { CommunityPage } from './pages/community/CommunityPage';
import { PlannerPage } from './pages/planner/PlannerPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { ATSPage } from './pages/ats/ATSPage';
import { RecommendationsPage } from './pages/recommendations/RecommendationsPage';
import { ReviewsPage } from './pages/reviews/ReviewsPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { GamificationPage } from './pages/gamification/GamificationPage';
import { ContentHubPage } from './pages/content/ContentHubPage';

// Provider Pages
import { ProviderLayout } from './components/Layout/ProviderLayout';
import { ProviderDashboardPage } from './pages/provider/ProviderDashboardPage';
import { PostInternshipPage } from './pages/provider/PostInternshipPage';
import { PostEventPage } from './pages/provider/PostEventPage';
import { ApplicantsPage } from './pages/provider/ApplicantsPage';

// Staff Pages
import { StaffLayout } from './components/Layout/StaffLayout';
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { ManageUsersPage, VerifyContentPage, ModerationPage, ReportsPage } from './pages/staff/StaffPages';

// Admin Pages
import { AdminLayout } from './components/Layout/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import {
  UserManagementPage, CompanyManagementPage, InternshipManagementPage,
  EventManagementPage, CourseManagementPage, APISystemPage,
  AIControlPage, StaffManagementPage, AdsSystemPage,
  UIControlPage, FeatureControlPage, AdminNotificationsPage,
  AnalyticsPage, SecurityPage, BackupPage
} from './pages/admin/AdminPages';
import { RolesPage } from './pages/admin/RolesPage';

import { Loading } from './components/common';
import type { UserRole } from './contexts/AuthContext';

// ── Maintenance Page ──────────────────────────────────────────────────────────
const MaintenancePage: React.FC<{ message: string }> = ({ message }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
    <div className="text-center max-w-md">
      <div className="w-20 h-20 rounded-2xl bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">🔧</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-3">Under Maintenance</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">{message}</p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        We'll be back soon
      </div>
      <p className="text-gray-600 text-xs mt-6">
        If you're an admin,{' '}
        <a href="/admin" className="text-yellow-500 underline hover:text-yellow-400 transition-colors">
          sign in here
        </a>
      </p>
    </div>
  </div>
);

// ── Feature Disabled Page ─────────────────────────────────────────────────────
const FeatureDisabledPage: React.FC<{ name: string }> = ({ name }) => (
  <div className="min-h-[60vh] flex items-center justify-center p-6">
    <div className="text-center max-w-sm">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-5">
        <span className="text-3xl">🚫</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{name} is Disabled</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm">This feature has been temporarily turned off by the admin. Please check back later.</p>
    </div>
  </div>
);

// ── Route Guards ──────────────────────────────────────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { maintenanceMode, maintenanceMessage, isFeatureEnabled } = useAdminSettings();
  void isFeatureEnabled;
  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-950"><Loading size="lg" text="Loading..." /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (maintenanceMode) return <MaintenancePage message={maintenanceMessage} />;
  return <>{children}</>;
};

const FeatureRoute: React.FC<{ children: React.ReactNode; featureKey: string; featureName: string }> = ({ children, featureKey, featureName }) => {
  const { isFeatureEnabled } = useAdminSettings();
  if (!isFeatureEnabled(featureKey)) return <FeatureDisabledPage name={featureName} />;
  return <>{children}</>;
};

const RoleRoute: React.FC<{ children: React.ReactNode; role: UserRole; loginPath: string }> = ({ children, role, loginPath }) => {
  const { user, profile, loading } = useAuth();
  const { maintenanceMode, maintenanceMessage } = useAdminSettings();
  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-950"><Loading size="lg" text="Loading..." /></div>;
  if (!user) return <Navigate to={loginPath} replace />;
  if (profile && profile.role !== role) return <Navigate to={loginPath} replace />;
  // Admins bypass maintenance
  if (maintenanceMode && role !== 'admin') return <MaintenancePage message={maintenanceMessage} />;
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-950"><Loading size="lg" text="Loading..." /></div>;
  if (user) {
    if (profile?.role === 'company') return <Navigate to="/provider" replace />;
    if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
    if (profile?.role === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Student Auth */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

      {/* Portal Login Pages (no auth redirect — anyone can visit) */}
      <Route path="/provider/login" element={<ProviderLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/staff/login" element={<StaffLoginPage />} />

      {/* Student Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
      <Route path="/internships" element={<ProtectedRoute><Layout><InternshipsPage /></Layout></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Layout><EventsPage /></Layout></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute><Layout><CoursesPage /></Layout></ProtectedRoute>} />
      <Route path="/resume" element={<ProtectedRoute><Layout><ResumePage /></Layout></ProtectedRoute>} />
      <Route path="/career" element={<ProtectedRoute><Layout><CareerPage /></Layout></ProtectedRoute>} />
      <Route path="/skills" element={<ProtectedRoute><Layout><SkillsPage /></Layout></ProtectedRoute>} />
      <Route path="/practice" element={<ProtectedRoute><Layout><PracticePage /></Layout></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Layout><FeatureRoute featureKey="community" featureName="Community Feed"><CommunityPage /></FeatureRoute></Layout></ProtectedRoute>} />
      <Route path="/planner" element={<ProtectedRoute><Layout><FeatureRoute featureKey="planner" featureName="Career Planner"><PlannerPage /></FeatureRoute></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
      <Route path="/ats" element={<ProtectedRoute><Layout><FeatureRoute featureKey="ats" featureName="ATS Analyzer"><ATSPage /></FeatureRoute></Layout></ProtectedRoute>} />
      <Route path="/recommendations" element={<ProtectedRoute><Layout><RecommendationsPage /></Layout></ProtectedRoute>} />
      <Route path="/reviews" element={<ProtectedRoute><Layout><FeatureRoute featureKey="reviews" featureName="Company Reviews"><ReviewsPage /></FeatureRoute></Layout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>} />
      <Route path="/gamification" element={<ProtectedRoute><Layout><FeatureRoute featureKey="gamification" featureName="Gamification"><GamificationPage /></FeatureRoute></Layout></ProtectedRoute>} />
      <Route path="/content" element={<ProtectedRoute><Layout><FeatureRoute featureKey="content_hub" featureName="Content Hub"><ContentHubPage /></FeatureRoute></Layout></ProtectedRoute>} />

      {/* Provider Routes — company role only */}
      <Route path="/provider" element={<RoleRoute role="company" loginPath="/provider/login"><ProviderLayout><ProviderDashboardPage /></ProviderLayout></RoleRoute>} />
      <Route path="/provider/internships/new" element={<RoleRoute role="company" loginPath="/provider/login"><ProviderLayout><PostInternshipPage /></ProviderLayout></RoleRoute>} />
      <Route path="/provider/events/new" element={<RoleRoute role="company" loginPath="/provider/login"><ProviderLayout><PostEventPage /></ProviderLayout></RoleRoute>} />
      <Route path="/provider/applicants" element={<RoleRoute role="company" loginPath="/provider/login"><ProviderLayout><ApplicantsPage /></ProviderLayout></RoleRoute>} />

      {/* Staff Routes — staff role only */}
      <Route path="/staff" element={<RoleRoute role="staff" loginPath="/staff/login"><StaffLayout><StaffDashboardPage /></StaffLayout></RoleRoute>} />
      <Route path="/staff/users" element={<RoleRoute role="staff" loginPath="/staff/login"><StaffLayout><ManageUsersPage /></StaffLayout></RoleRoute>} />
      <Route path="/staff/verify" element={<RoleRoute role="staff" loginPath="/staff/login"><StaffLayout><VerifyContentPage /></StaffLayout></RoleRoute>} />
      <Route path="/staff/moderation" element={<RoleRoute role="staff" loginPath="/staff/login"><StaffLayout><ModerationPage /></StaffLayout></RoleRoute>} />
      <Route path="/staff/reports" element={<RoleRoute role="staff" loginPath="/staff/login"><StaffLayout><ReportsPage /></StaffLayout></RoleRoute>} />

      {/* Admin Routes — admin role only */}
      <Route path="/admin" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><AdminDashboardPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/users" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><UserManagementPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/companies" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><CompanyManagementPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/internships" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><InternshipManagementPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/events" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><EventManagementPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/courses" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><CourseManagementPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/api" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><APISystemPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/ai" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><AIControlPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/staff" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><StaffManagementPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/ads" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><AdsSystemPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/ui" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><UIControlPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/features" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><FeatureControlPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/notifications" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><AdminNotificationsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/analytics" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><AnalyticsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/security" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><SecurityPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/backup" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><BackupPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/roles" element={<RoleRoute role="admin" loginPath="/admin/login"><AdminLayout><RolesPage /></AdminLayout></RoleRoute>} />

      {/* Default */}
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AdminSettingsProvider>
          <AuthProvider>
            <PermissionsProvider>
              <AppRoutes />
            </PermissionsProvider>
          </AuthProvider>
        </AdminSettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
