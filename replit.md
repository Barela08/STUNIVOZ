# STUNIVOZ — Student Career Development Platform

## Overview
STUNIVOZ is a full-stack student career development platform that helps students build profiles, create resumes, find internships, track career progress, and connect with a community.

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite (port 5000, host 0.0.0.0, allowedHosts: true)
- **Styling**: Tailwind CSS (darkMode: 'class') + PostCSS
- **Backend/Auth/DB**: Firebase (Auth, Firestore, Storage)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Charts**: Recharts

## Firebase Config
All credentials are environment variables:
- `VITE_FIREBASE_API_KEY` — Replit Secret
- `VITE_FIREBASE_AUTH_DOMAIN=stunivoz.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID=stunivoz`
- `VITE_FIREBASE_STORAGE_BUCKET=stunivoz.firebasestorage.app`
- `VITE_FIREBASE_MESSAGING_SENDER_ID=758018830397`
- `VITE_FIREBASE_APP_ID=1:758018830397:web:2a0d13fa90ed60e0bdfa54`

Firebase Console requirements:
- Enable **Email/Password**, **Google**, and **GitHub** auth providers
- For GitHub: create OAuth App at github.com/settings/developers, add Client ID + Secret in Firebase Console
- Add dev domain to **Authorized Domains** (Firebase Auth → Settings)
- Firestore Database must be initialized (default region)

## Role System
Roles are stored in the Firestore `profiles` collection as `role` field:
| Role | Value | Login URL | OAuth Allowed |
|------|-------|-----------|---------------|
| Student | `student` | `/login` | Google ✅ GitHub ✅ |
| Company | `company` | `/provider/login` | Email only ❌ |
| Admin | `admin` | `/admin/login` | Email only ❌ |
| Staff | `staff` | `/staff/login` | Email only ❌ |

**Security rules:**
- Google/GitHub OAuth → after login, if profile.role is NOT 'student' → auto sign-out + error
- Portal login pages check role after auth → if mismatch → auto sign-out + error
- Route guards: `/provider/*` requires `role=company`, `/admin/*` requires `role=admin`, `/staff/*` requires `role=staff`

## Project Structure
```
src/
  App.tsx              — Root with all routes + ThemeProvider + AuthProvider
                         ProtectedRoute (student), RoleRoute (portal), PublicRoute (auth pages)
  main.tsx             — Entry point
  contexts/
    AuthContext.tsx    — Firebase auth: signIn, signUp, signOut, signInWithGoogleOAuth,
                         signInWithGitHubOAuth, updateProfile, fetchProfile
                         Profile interface includes role?: UserRole
    ThemeContext.tsx   — Dark/Light mode (localStorage + OS preference, sets .dark on <html>)
  services/
    firebase.ts        — Firebase config + helpers: addDocument, getDocument, setDocument,
                         getCollection, updateDocument, deleteDocument, uploadFile,
                         signInWithGoogle, signInWithGitHub (GithubAuthProvider)
  components/
    common/            — Button, Input, Card (dark: variants), Loading
    Layout/            — Layout (student), AdminLayout, ProviderLayout, StaffLayout
                         All layouts have dark mode + theme toggle button
  pages/
    admin/             — AdminDashboardPage + AdminPages (UserMgmt, CompanyMgmt,
                         InternshipMgmt, EventMgmt, CourseMgmt, FeatureControl, etc.)
    auth/              — LoginPage (Email+Google+GitHub), SignupPage, ForgotPasswordPage,
                         ProviderLoginPage, AdminLoginPage, StaffLoginPage
    provider/          — ProviderDashboardPage, PostInternshipPage, PostEventPage, ApplicantsPage
    staff/             — StaffDashboardPage, StaffPages
    (student pages)    — dashboard, profile, internships, events, courses, resume, career,
                         skills, practice, community, planner, settings, ats, gamification, etc.
  types/index.ts       — Shared TypeScript interfaces
public/
  logo.png             — STUNIVOZ logo
```

## Key Features Implemented
1. **GitHub Login** — GithubAuthProvider from firebase/auth; students only; if non-student role tries GitHub → auto sign-out + error
2. **Google Login** — Students only; same role check
3. **Dark/Light Mode** — ThemeContext with localStorage persistence + OS preference detection; toggle in all layouts and auth pages; Tailwind `darkMode: 'class'`
4. **Separate Portal Logins** — /provider/login (blue), /admin/login (red), /staff/login (emerald); email only; distinct branding per portal
5. **Role-Based Routing** — RoleRoute component checks Firebase profile.role; mismatched role → redirect to portal login
6. **Premium UI** — Glassmorphism right panels on all auth pages, gradient buttons, rounded cards, smooth transitions
7. **Card dark mode** — `dark:bg-gray-800 dark:border-gray-700` via Tailwind class
8. **AuthContext** — fetchProfile returns Profile (can be used externally by portal login pages)
9. **ProfilePage** — Full edit mode with Firebase save
10. **CommunityPage** — Working post feed + likes
11. **SettingsPage** — Real auth data, password reset, sign out
12. **PostInternshipPage / PostEventPage** — Firebase submission with success/error feedback
13. **AdminPages** — 5 expanded tables + FeatureControl toggles + AdminNotifications compose

## Development
```bash
npm install
npm run dev    # Starts on http://0.0.0.0:5000
```

## Deployment
- Build: `npm run build`
- Public dir: `dist`

## Known Non-Breaking Warnings
- Vite HMR: "useAuth export is incompatible" — full-tree reload on AuthContext HMR, harmless in production
- React Router v6 future flag warnings — non-breaking
- Firestore WebChannelConnection transport — auto-retries in dev
