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

// Protected Route wrapper
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
      
      {/* Provider Routes (Would normally have a separate Auth guard checking role) */}
      <Route
        path="/provider"
        element={
          <ProtectedRoute>
            <ProviderLayout>
              <ProviderDashboardPage />
            </ProviderLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/internships/new"
        element={
          <ProtectedRoute>
            <ProviderLayout>
              <PostInternshipPage />
            </ProviderLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/events/new"
        element={
          <ProtectedRoute>
            <ProviderLayout>
              <PostEventPage />
            </ProviderLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/applicants"
        element={
          <ProtectedRoute>
            <ProviderLayout>
              <ApplicantsPage />
            </ProviderLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <StaffLayout>
              <StaffDashboardPage />
            </StaffLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/users"
        element={
          <ProtectedRoute>
            <StaffLayout>
              <ManageUsersPage />
            </StaffLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/verify"
        element={
          <ProtectedRoute>
            <StaffLayout>
              <VerifyContentPage />
            </StaffLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/moderation"
        element={
          <ProtectedRoute>
            <StaffLayout>
              <ModerationPage />
            </StaffLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/staff/reports" element={<ProtectedRoute><StaffLayout><ReportsPage /></StaffLayout></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute><AdminLayout><AdminDashboardPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><AdminLayout><UserManagementPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/companies" element={<ProtectedRoute><AdminLayout><CompanyManagementPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/internships" element={<ProtectedRoute><AdminLayout><InternshipManagementPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/events" element={<ProtectedRoute><AdminLayout><EventManagementPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute><AdminLayout><CourseManagementPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/api" element={<ProtectedRoute><AdminLayout><APISystemPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/ai" element={<ProtectedRoute><AdminLayout><AIControlPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute><AdminLayout><StaffManagementPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/ads" element={<ProtectedRoute><AdminLayout><AdsSystemPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/ui" element={<ProtectedRoute><AdminLayout><UIControlPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/features" element={<ProtectedRoute><AdminLayout><FeatureControlPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute><AdminLayout><AdminNotificationsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute><AdminLayout><AnalyticsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/security" element={<ProtectedRoute><AdminLayout><SecurityPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/backup" element={<ProtectedRoute><AdminLayout><BackupPage /></AdminLayout></ProtectedRoute>} />

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
