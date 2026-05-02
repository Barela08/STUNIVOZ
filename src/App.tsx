import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout/Layout';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
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

import { Loading } from './components/common';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const RoleRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route wrapper (redirect if logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Auth Pages
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
};

// App Routes
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <AuthLayout>
              <SignupPage />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <AuthLayout>
              <ForgotPasswordPage />
            </AuthLayout>
          </PublicRoute>
        }
      />
      
{/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/internships"
        element={
          <ProtectedRoute>
            <Layout>
              <InternshipsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Layout>
              <EventsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <Layout>
              <CoursesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume"
        element={
          <ProtectedRoute>
            <Layout>
              <ResumePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/career"
        element={
          <ProtectedRoute>
            <Layout>
              <CareerPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/skills"
        element={
          <ProtectedRoute>
            <Layout>
              <SkillsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice"
        element={
          <ProtectedRoute>
            <Layout>
              <PracticePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <Layout>
              <CommunityPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planner"
        element={
          <ProtectedRoute>
            <Layout>
              <PlannerPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ats"
        element={
          <ProtectedRoute>
            <Layout>
              <ATSPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recommendations"
        element={
          <ProtectedRoute>
            <Layout>
              <RecommendationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <Layout>
              <ReviewsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <NotificationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gamification"
        element={
          <ProtectedRoute>
            <Layout>
              <GamificationPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/content"
        element={
          <ProtectedRoute>
            <Layout>
              <ContentHubPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Provider Routes */}
      <Route
        path="/provider"
        element={
          <RoleRoute allowedRoles={['provider', 'admin']}>
            <ProviderLayout>
              <ProviderDashboardPage />
            </ProviderLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/provider/internships/new"
        element={
          <RoleRoute allowedRoles={['provider', 'admin']}>
            <ProviderLayout>
              <PostInternshipPage />
            </ProviderLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/provider/events/new"
        element={
          <RoleRoute allowedRoles={['provider', 'admin']}>
            <ProviderLayout>
              <PostEventPage />
            </ProviderLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/provider/applicants"
        element={
          <RoleRoute allowedRoles={['provider', 'admin']}>
            <ProviderLayout>
              <ApplicantsPage />
            </ProviderLayout>
          </RoleRoute>
        }
      />
      
      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
          <RoleRoute allowedRoles={['staff', 'admin']}>
            <StaffLayout>
              <StaffDashboardPage />
            </StaffLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/staff/users"
        element={
          <RoleRoute allowedRoles={['staff', 'admin']}>
            <StaffLayout>
              <ManageUsersPage />
            </StaffLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/staff/verify"
        element={
          <RoleRoute allowedRoles={['staff', 'admin']}>
            <StaffLayout>
              <VerifyContentPage />
            </StaffLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/staff/moderation"
        element={
          <RoleRoute allowedRoles={['staff', 'admin']}>
            <StaffLayout>
              <ModerationPage />
            </StaffLayout>
          </RoleRoute>
        }
      />
      <Route path="/staff/reports" element={<RoleRoute allowedRoles={['staff', 'admin']}><StaffLayout><ReportsPage /></StaffLayout></RoleRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><AdminDashboardPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/users" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><UserManagementPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/companies" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><CompanyManagementPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/internships" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><InternshipManagementPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/events" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><EventManagementPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/courses" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><CourseManagementPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/api" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><APISystemPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/ai" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><AIControlPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/staff" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><StaffManagementPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/ads" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><AdsSystemPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/ui" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><UIControlPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/features" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><FeatureControlPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/notifications" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><AdminNotificationsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/analytics" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><AnalyticsPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/security" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><SecurityPage /></AdminLayout></RoleRoute>} />
      <Route path="/admin/backup" element={<RoleRoute allowedRoles={['admin']}><AdminLayout><BackupPage /></AdminLayout></RoleRoute>} />

      {/* Default redirect */}
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
