# STUNIVOZ — Student Career Platform

India's #1 All-in-One Student Career Platform. Find internships, master skills, attend events, and build your career with AI-powered tools.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Firebase (Auth + Firestore + Storage)
- **Deployment:** Vercel

## Features

- Student dashboard with ATS resume analyzer
- Internship & job listings
- Events & courses
- Community feed & gamification
- AI recommendations & career chatbot
- Company/Provider portal
- Staff moderation portal
- Full Admin panel (user mgmt, feature flags, maintenance mode, ads, analytics)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Barela08/STUNIVOZ.git
cd STUNIVOZ
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Copy the example file and fill in your Firebase values:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase config from [Firebase Console](https://console.firebase.google.com).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000)

### 5. Build for production

```bash
npm run build
```

## Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password + Google + GitHub providers
3. Add your domain to **Authentication → Settings → Authorized domains**
   - Add `stunivoz.vercel.app` (or your custom domain)
4. Enable **Firestore Database**
5. Enable **Storage**
6. Copy your config values to `.env`

## Deployment (Vercel)

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Add all `VITE_FIREBASE_*` environment variables in Vercel dashboard
4. Deploy — `vercel.json` handles SPA routing automatically

## Project Structure

```
src/
├── components/      # Shared UI components
│   └── Layout/      # Navbar, Sidebar, AdminLayout, etc.
├── contexts/        # React contexts (Auth, Theme, Permissions, AdminSettings)
├── pages/
│   ├── admin/       # Full admin panel
│   ├── auth/        # Login, Signup, etc.
│   ├── dashboard/   # Student dashboard
│   ├── provider/    # Company portal
│   └── staff/       # Staff moderation portal
├── services/        # Firebase config & helpers
└── main.tsx
public/
├── logo-full.jpeg   # Full STUNIVOZ logo
└── logo-icon.jpeg   # STUNIVOZ icon logo
```

## Admin Panel

Access at `/admin/login`

| Module | Features |
|--------|----------|
| Users | View, edit, block/unblock, invite, export CSV |
| Companies | Verify, AI scan, manage listings |
| Internships | Edit, AI verify, publish/draft |
| Events | Create, AI fill, export |
| Courses | Manage, ratings, levels |
| Staff | Roles, assign permissions |
| Ads | Create ads with media picker + preview |
| Features | Toggle features on/off (live, no redeploy) |
| Maintenance | Enable maintenance mode — blocks all users instantly |
| Notifications | Broadcast to all/students/companies/single user |
| Security | Audit logs, export CSV |
| Backup | Backup history, restore with confirmation |

## License

MIT
