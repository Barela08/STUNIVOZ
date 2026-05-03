# STUNIVOZ — Student Career Development Platform

## Overview
STUNIVOZ is a full-stack student career development platform that helps students build profiles, create resumes, find internships, track career progress, and connect with a community.

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite (port 5000)
- **Styling**: Tailwind CSS + PostCSS
- **Backend/Auth/DB**: Firebase (Auth, Firestore, Storage)
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Charts**: Recharts

## Project Structure
```
src/
  App.tsx              — Root component with all routes
  main.tsx             — Entry point
  contexts/
    AuthContext.tsx    — Firebase auth context (signIn, signUp, signOut, signInWithGoogle, updateProfile)
  services/
    firebase.ts        — Firebase config + helper functions (CRUD, auth, storage)
    supabase.ts        — Legacy Supabase types (not in active use)
  components/
    common/            — Button, Input, Card, Loading reusable components
    Layout/            — Layout, AdminLayout, ProviderLayout, StaffLayout
  pages/               — Feature pages organized by role/function
    admin/             — Admin dashboard + management pages
    auth/              — Login, Signup, ForgotPassword
    provider/          — Recruiter-facing pages
    staff/             — Moderation pages
    (feature pages)    — internships, events, courses, resume, career, skills, etc.
  types/index.ts       — Shared TypeScript interfaces
dataconnect/           — Firebase Data Connect / PostgreSQL schema (optional)
```

## Key Notes
- Firebase config in `src/services/firebase.ts` uses placeholder values — user must replace with their own Firebase project credentials
- `AuthContext.tsx` was reconstructed from a truncated import; it provides: `user`, `profile`, `loading`, `signIn`, `signUp`, `signInWithGoogle`, `signOut`, `updateProfile`
- Google Sign-In requires Firebase project to have Google auth provider enabled
- The app uses role-based layouts (student, provider, staff, admin)

## Development
```bash
npm install
npm run dev    # Starts on http://localhost:5000
```

## Deployment
Configured as a **static** deployment:
- Build: `npm run build`
- Public dir: `dist`
