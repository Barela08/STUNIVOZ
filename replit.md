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
    AdminSettingsContext.tsx — Feature flags, maintenance mode, AI config (provider/model/apiKey)
                               Stored in localStorage key 'stunivoz_admin_settings'
  services/
    firebase.ts        — Firebase config + helpers: addDocument, getDocument, setDocument,
                         getCollection, updateDocument, deleteDocument, uploadFile,
                         signInWithGoogle, signInWithGitHub (GithubAuthProvider)
    contentService.ts  — Firestore CRUD for internships/events/courses + real-time subscriptions
    aiService.ts       — Gemini/OpenAI API integration; discoverInternships/Events/Courses();
                         careerChatReply(); reads config from localStorage 'stunivoz_admin_settings'
  components/
    common/            — Button, Input, Card (dark: variants), Loading
    Layout/            — Layout (student), AdminLayout, ProviderLayout, StaffLayout
                         All layouts have dark mode + theme toggle button
  pages/
    admin/             — AdminDashboardPage + AdminPages (UserMgmt, CompanyMgmt,
                         InternshipMgmt [AI Discover], EventMgmt [AI Discover],
                         CourseMgmt [AI Discover], AIControlPage [real settings], etc.)
    auth/              — LoginPage (Email+Google+GitHub), SignupPage (Email+Google+GitHub),
                         ForgotPasswordPage, ProviderLoginPage, ProviderRegisterPage,
                         AdminLoginPage, StaffLoginPage
    provider/          — ProviderDashboardPage, PostInternshipPage, PostEventPage, ApplicantsPage
    staff/             — StaffDashboardPage, StaffPages
    career/            — CareerPage with AI-powered career chatbot (real Gemini/OpenAI)
    (other student pages) — dashboard, profile, internships, events, courses, resume,
                            skills, practice, community, planner, settings, ats, gamification, etc.
  types/index.ts       — Shared TypeScript interfaces
public/
  logo.png             — STUNIVOZ logo
```

## Key Features Implemented
1. **GitHub Login** — GithubAuthProvider from firebase/auth; students only; role check enforced
2. **Google Login** — Students only; same role check
3. **GitHub + Google on Signup** — SignupPage now has Google and GitHub OAuth buttons
4. **Dark/Light Mode** — ThemeContext with localStorage persistence + OS preference detection
5. **Separate Portal Logins** — /provider/login (blue), /admin/login (red), /staff/login (emerald)
6. **Company Registration** — /provider/register: full form (company name, contact, industry, size, email, phone, website, password); creates Firestore profile with role='company'; success redirect
7. **AI Discovery (Admin)** — "AI Discover" button in Internship/Event/Course admin pages opens a modal where admin enters a search topic. AI generates up to 10 realistic listings, scam-verifies them, and admin selects which to bulk-import to Firestore.
8. **AI Settings (Admin → AI)** — AIControlPage fully rebuilt: provider selection (Gemini/OpenAI), model dropdown, API key input with show/hide, test connection button, save button. Stored in localStorage.
9. **AI Career Chatbot** — CareerPage chatbot uses real Gemini/OpenAI via aiService.careerChatReply(). Falls back to built-in responses if no API key configured, shows a gentle notice.
10. **Role-Based Routing** — RoleRoute component checks Firebase profile.role
11. **Content Management** — Firestore CRUD for internships/events/courses with real-time subscriptions
12. **Admin Feature Flags** — FeatureControlPage with toggles for 12 platform features
13. **AdminPages** — 5 expanded tables + AI discovery + AI control + feature flags + notifications

## AI Service Configuration
The AI service reads from localStorage key `stunivoz_admin_settings`:
- `aiProvider`: 'gemini' | 'openai' (default: 'gemini')
- `aiModel`: model name (default: 'gemini-1.5-flash')
- `aiApiKey`: API key string

### Getting a free Gemini API key:
1. Go to https://aistudio.google.com/app/apikey
2. Create a free API key
3. In Admin Panel → AI Settings → paste the key → Save

### AI Discover prompts:
- Internships: generates realistic Indian job market listings (company, role, stipend, skills, apply URL)
- Events: generates hackathons, webinars, workshops with dates in 2025-2026
- Courses: generates real course recommendations from Udemy, Coursera, NPTEL, etc.
- Each item includes `isScam: boolean` field — flagged items are shown with a warning and cannot be selected

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
