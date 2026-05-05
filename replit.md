# STUNIVOZ

An all-in-one student career platform — helps students find internships, courses, events, build resumes, and connect with a community, with portals for students, companies, staff, and admins.

## Run & Operate

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite frontend (port 5000) |
| `npm run server` | Start Express API server (port 3001) |
| `npm run build` | Build frontend for production |

**Required env vars / secrets:**
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID` — Firebase client config (set as shared env vars)
- `FIREBASE_SERVICE_ACCOUNT_JSON` — Firebase Admin SDK service account JSON (secret)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary file/media uploads (secrets)
- `EMAIL_USER`, `EMAIL_PASS` — Gmail SMTP for password reset emails (secrets)
- `ADMIN_SETUP_KEY` — One-time key for provisioning admin accounts (shared env var)

## Stack

- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **Backend**: Node.js + Express 5 (port 3001, ESM)
- **Styling**: Tailwind CSS + PostCSS
- **Auth**: Firebase Auth (email/password, Google, GitHub)
- **Database**: Firestore (via Firebase)
- **Storage**: Firebase Storage (client) + Cloudinary (server-side uploads via API)
- **Email**: Nodemailer + Gmail SMTP

## Where things live

- `src/` — React frontend
  - `src/pages/` — Route-based pages (auth, student, provider, staff, admin)
  - `src/components/` — Shared UI components and layout wrappers
  - `src/contexts/` — Auth, Theme, Permissions, AdminSettings context providers
  - `src/services/` — Firebase client, upload, AI, password reset services
- `server/` — Express API backend
  - `server/routes/` — `/api/auth` and `/api/upload` routes
  - `server/lib/` — Firebase Admin, Cloudinary, Nodemailer helpers
  - `server/middleware/requireAuth.js` — Firebase token verification middleware
- `src/App.tsx` — All client-side routes and route guards
- `vite.config.ts` — Vite config (proxies `/api` → port 3001)

## Architecture decisions

- **Two-server setup**: Vite dev server (5000) proxies `/api/*` to Express (3001) — keep both workflows running in dev.
- **Firebase for auth + Firestore**: The entire user identity, profiles, and content live in the user's own Firebase project (`stunivoz`). Firebase config values are inlined as fallbacks in `src/services/firebase.ts` so the app works without env vars set.
- **Cloudinary for ALL uploads**: PDFs, images, and branding assets all go through `uploadService.ts` → Express `/api/upload/file` → Cloudinary. Firebase Storage is no longer used for uploads.
- **Maintenance mode via Firestore**: `AdminSettingsContext` writes maintenance state to `system_config/site_settings` and all clients listen via `onSnapshot` — cross-device real-time without refresh.
- **Dynamic logo via Firestore**: Logo URL stored in `system_config/branding`, synced to all layouts in real-time via `AdminSettingsContext.logoUrl`.
- **Role-based routing**: Four roles — `student`, `company`, `staff`, `admin` — each with dedicated layouts and protected routes in `src/App.tsx`.
- **AI keys stored by admin**: AI API keys (Gemini, OpenAI, Claude) are stored by the admin in Firestore/localStorage via the Admin UI, not hardcoded.
- **AI Help page**: Uses `callAI` from `aiService.ts` directly (not an iframe) — chatgpt.com refused iframe embedding.

## Product

- Student portal: internships, courses, events, resume builder, AI career advisor, ATS analyzer, skills, community, gamification
- Company (provider) portal: post internships/events, manage applicants
- Staff portal: moderate content, verify users, handle reports
- Admin portal: full platform control — users, content, AI settings, feature flags, UI control, analytics, security

## User preferences

_Populate as you build_

## Gotchas

- Both `Start application` (Vite) and `API Server` (Express) workflows must be running for the full app to work.
- Firebase config is hardcoded as fallbacks in `src/services/firebase.ts` — env vars override them but are not strictly required for the frontend to boot.
- The `FIREBASE_SERVICE_ACCOUNT_JSON` secret must be valid JSON (the entire service account key file content on one line); server will throw on startup if missing or malformed.
- Password reset tokens are stored in-memory in the Express process — they reset on server restart.

## Pointers

- Firebase project: https://console.firebase.google.com/project/stunivoz
- Cloudinary: https://cloudinary.com/console
- Firestore rules: `firestore.rules`
