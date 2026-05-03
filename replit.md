# STUNIVOZ — Student Career Development Platform

## Overview
STUNIVOZ is a full-stack student career development platform that helps students build profiles, create resumes, find internships, track career progress, and connect with a community.

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite (port 5000, host 0.0.0.0, allowedHosts: true)
- **Styling**: Tailwind CSS + PostCSS
- **Backend/Auth/DB**: Firebase (Auth, Firestore, Storage)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Charts**: Recharts

## Firebase Config
All credentials are set as environment variables:
- `VITE_FIREBASE_API_KEY` — Replit Secret
- `VITE_FIREBASE_AUTH_DOMAIN=stunivoz.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID=stunivoz`
- `VITE_FIREBASE_STORAGE_BUCKET=stunivoz.firebasestorage.app`
- `VITE_FIREBASE_MESSAGING_SENDER_ID=758018830397`
- `VITE_FIREBASE_APP_ID=1:758018830397:web:2a0d13fa90ed60e0bdfa54`
- `VITE_FIREBASE_MEASUREMENT_ID=G-W4X81X98JJ`

Firebase Console requirements:
- Enable **Email/Password** and **Google** auth providers
- Add dev domain to **Authorized Domains** (Firebase Auth → Settings)
- Firestore Database must be initialized (default region)

## Project Structure
```
src/
  App.tsx              — Root with all routes (student, provider, staff, admin)
  main.tsx             — Entry point
  contexts/
    AuthContext.tsx    — Firebase auth (signIn, signUp, signOut, signInWithGoogle, updateProfile)
                         Uses setDocument (merge:true) for safe profile upsert
                         Uses getDocument to fetch single profile by UID
  services/
    firebase.ts        — Firebase config + helpers: addDocument, getDocument, setDocument,
                         getCollection, updateDocument, deleteDocument, uploadFile, resetPassword
  components/
    common/            — Button, Input, Textarea, Select, Checkbox, Card, ProgressBar, Loading
    Layout/            — Layout (student), AdminLayout, ProviderLayout, StaffLayout
  pages/
    admin/             — AdminDashboardPage + AdminPages (UserMgmt, CompanyMgmt, InternshipMgmt,
                         EventMgmt, CourseMgmt, FeatureControl, AdminNotifications, + stubs)
    auth/              — LoginPage, SignupPage, ForgotPasswordPage
    provider/          — ProviderDashboardPage, PostInternshipPage (Firebase submit),
                         PostEventPage (Firebase submit), ApplicantsPage
    staff/             — Staff moderation pages
    ats/               — ATSPage (resume analysis UI)
    career/            — CareerPage
    community/         — CommunityPage (working post feed, like/unlike)
    courses/           — CoursesPage
    dashboard/         — DashboardPage
    events/            — EventsPage
    gamification/      — GamificationPage (badges, leaderboard)
    internships/       — InternshipsPage (search, filter, save)
    planner/           — PlannerPage
    practice/          — PracticePage
    profile/           — ProfilePage (full edit + Firebase save)
    resume/            — ResumePage
    settings/          — SettingsPage (real auth data, password reset, sign out)
    skills/            — SkillsPage
  types/index.ts       — Shared TypeScript interfaces
public/
  logo.png             — STUNIVOZ logo (shown in navbar and sidebar)
```

## Key Fixes Applied
1. **AuthContext** — `fetchProfile` now uses `getDocument(uid)` instead of fetching all profiles.
   `updateProfile` uses `setDocument` with `merge:true` so it works even if doc doesn't exist yet.
2. **ProfilePage** — Full edit mode with `handleSave` calling `updateProfile`, Cancel button, success/error feedback.
3. **CommunityPage** — Post button actually adds new posts to state, likes work, user avatar from auth.
4. **SettingsPage** — Real user data, working password reset (sends email), working Sign Out buttons.
5. **PostInternshipPage** — Form state + Firebase `addDocument` submission with success/error feedback.
6. **PostEventPage** — Form state + Firebase `addDocument` submission with success/error feedback.
7. **AdminPages** — UserMgmt, CompanyMgmt, InternshipMgmt, EventMgmt, CourseMgmt with real data tables.
   FeatureControl with live toggles. AdminNotifications with compose + history. 8 stubs with proper icons.
8. **firebase.ts** — Added `getDocument` (single doc by ID) and `setDocument` (upsert with merge).

## Development
```bash
npm install
npm run dev    # Starts on http://0.0.0.0:5000
```

## Deployment
Configured as a **static** deployment:
- Build command: `npm run build`
- Public directory: `dist`

## Known Non-Breaking Warnings
- Vite HMR: "useAuth export is incompatible" — triggers full-tree reload on AuthContext changes, harmless in production.
- React Router v6 future flag warnings — non-breaking, will be resolved in v7 upgrade.
- Firestore WebChannelConnection transport warning — expected in dev; retries automatically.
