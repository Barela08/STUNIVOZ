const stack = [
  {
    category: "Frontend",
    icon: "⚛️",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    items: [
      {
        name: "React 18",
        role: "UI Framework",
        why: "Component-based architecture, concurrent rendering, Suspense for async data. Industry standard for SPAs with large ecosystem support.",
        version: "18.3.1",
        docs: "react.dev",
      },
      {
        name: "TypeScript",
        role: "Language",
        why: "Static typing prevents runtime errors, improves IDE autocompletion, enforces interfaces across all components and Firebase data models.",
        version: "5.5.3",
        docs: "typescriptlang.org",
      },
      {
        name: "Vite",
        role: "Build Tool",
        why: "10× faster HMR than CRA, native ESM, tree-shaking, and optimized production builds. No config overhead.",
        version: "5.4.2",
        docs: "vitejs.dev",
      },
      {
        name: "React Router v6",
        role: "Client Routing",
        why: "Declarative nested routes, loader/action APIs, RoleRoute wrapper for RBAC-guarded portals. Future flags set for v7 migration.",
        version: "6.26.2",
        docs: "reactrouter.com",
      },
      {
        name: "Tailwind CSS v3",
        role: "Styling",
        why: "Utility-first CSS, dark mode via class strategy, consistent design tokens, purged bundle — no unused CSS shipped.",
        version: "3.4.10",
        docs: "tailwindcss.com",
      },
      {
        name: "Recharts",
        role: "Data Visualisation",
        why: "SVG-based, composable chart API built on top of D3. Used across Admin Dashboard and Company Portal for bar, line, pie, and area charts.",
        version: "2.12.7",
        docs: "recharts.org",
      },
      {
        name: "Lucide React",
        role: "Icon Library",
        why: "1,000+ consistent stroke icons, tree-shakeable, TypeScript-native. Used across all 40+ pages for UI clarity.",
        version: "0.441.0",
        docs: "lucide.dev",
      },
      {
        name: "React DnD / @dnd-kit",
        role: "Drag & Drop",
        why: "Powers the Kanban ATS board in the Company Portal. Accessible, performant, works with mouse and touch.",
        version: "latest",
        docs: "dndkit.com",
      },
    ],
  },
  {
    category: "Backend & BaaS",
    icon: "🔥",
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FED7AA",
    items: [
      {
        name: "Firebase Auth",
        role: "Authentication",
        why: "Handles Google OAuth, GitHub OAuth, and Email/Password across 4 separate portals. JWT-based sessions, secure token refresh, social login restricted to student portal only.",
        version: "10.x",
        docs: "firebase.google.com/auth",
      },
      {
        name: "Firestore",
        role: "NoSQL Database",
        why: "Real-time document syncing, offline support, sub-collections for nested data (e.g., applications under internships). Security Rules enforce RBAC at DB level.",
        version: "10.x",
        docs: "firebase.google.com/firestore",
      },
      {
        name: "Firebase Storage",
        role: "File Storage",
        why: "Stores student resume PDFs and profile photos. 5 MB file size limit enforced client-side. Files accessed via signed URLs.",
        version: "10.x",
        docs: "firebase.google.com/storage",
      },
      {
        name: "Cloud Functions",
        role: "Serverless Logic",
        why: "Handles ATS resume scoring, sending notifications, scheduled jobs (expiring internships), and admin-only operations that cannot run client-side.",
        version: "2nd gen",
        docs: "firebase.google.com/functions",
      },
      {
        name: "Firestore Security Rules",
        role: "Database Security",
        why: "Fine-grained read/write rules per collection and role. Defense-in-depth — even if frontend RoleRoute is bypassed, DB access is denied.",
        version: "—",
        docs: "firebase.google.com/rules",
      },
    ],
  },
  {
    category: "State & Data Management",
    icon: "🧠",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    items: [
      {
        name: "React Context API",
        role: "Global State",
        why: "AuthContext holds the current Firebase user and profile. ThemeContext manages dark/light mode toggle. No Redux needed — app state is shallow and Firebase handles server state.",
        version: "built-in",
        docs: "react.dev/reference/react/createContext",
      },
      {
        name: "Firebase SDK (onSnapshot)",
        role: "Real-time Data",
        why: "Used for live notifications, application status updates, and community feed. Listeners unsubscribe on component unmount to prevent memory leaks.",
        version: "10.x",
        docs: "firebase.google.com",
      },
      {
        name: "Local Storage",
        role: "Persistence",
        why: "Persists theme preference (dark/light) and onboarding completion flag across sessions.",
        version: "browser native",
        docs: "—",
      },
    ],
  },
  {
    category: "Auth & Security",
    icon: "🔐",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    items: [
      {
        name: "RoleRoute Component",
        role: "Frontend Access Control",
        why: "Custom wrapper around React Router's <Route>. Reads profile.role from AuthContext and hard-redirects unauthorized users to their portal's login — no content flash.",
        version: "custom",
        docs: "src/App.tsx",
      },
      {
        name: "Portal Isolation",
        role: "Login Separation",
        why: "4 separate login pages (/login, /provider/login, /admin/login, /staff/login). Social OAuth buttons rendered only on student login. Admin accounts are manually provisioned — no public registration endpoint.",
        version: "custom",
        docs: "src/pages/*/LoginPage.tsx",
      },
      {
        name: "Firebase JWT",
        role: "Session Tokens",
        why: "All auth state backed by Firebase-issued JWTs. Token auto-refreshes every 1 hour. Cloud Functions verify tokens server-side via Firebase Admin SDK before any privileged operation.",
        version: "10.x",
        docs: "firebase.google.com/auth",
      },
      {
        name: "Environment Variables",
        role: "Config & Secrets",
        why: "Firebase API keys stored as VITE_FIREBASE_* env vars in Replit Secrets. Never committed to git. Accessed via import.meta.env at build time.",
        version: "Vite native",
        docs: "vitejs.dev/guide/env-and-mode",
      },
    ],
  },
  {
    category: "UI & Design System",
    icon: "🎨",
    color: "#0891B2",
    bg: "#ECFEFF",
    border: "#A5F3FC",
    items: [
      {
        name: "Dark Mode",
        role: "Theme System",
        why: "Tailwind darkMode: 'class' strategy. ThemeContext toggles .dark on <html>. All 40+ pages have full dark: variant coverage.",
        version: "Tailwind native",
        docs: "tailwindcss.com/docs/dark-mode",
      },
      {
        name: "Custom Design Tokens",
        role: "Brand Colours",
        why: "primary (blue-500), accent (purple-500), and semantic colour scale defined in tailwind.config.js. Consistent across all 4 portals.",
        version: "custom",
        docs: "tailwind.config.js",
      },
      {
        name: "Common Component Library",
        role: "Shared UI",
        why: "src/components/common exports Button, Input, Textarea, Select, Checkbox, Card, CardHeader, Loading, Skeleton, ProgressBar, Spinner. Used across all portals to maintain visual consistency.",
        version: "custom",
        docs: "src/components/common/",
      },
      {
        name: "Layout Components",
        role: "Page Shells",
        why: "Separate Sidebar + Topbar shells per portal — StudentLayout, AdminLayout, ProviderLayout, StaffLayout. Each has its own nav structure, colour scheme, and role-aware menu items.",
        version: "custom",
        docs: "src/components/Layout/",
      },
    ],
  },
  {
    category: "Development Tooling",
    icon: "🛠️",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    items: [
      {
        name: "ESLint",
        role: "Linting",
        why: "Enforces code style, catches unused variables, and flags React hooks violations. Configured with typescript-eslint plugin.",
        version: "9.x",
        docs: "eslint.org",
      },
      {
        name: "tsconfig.json",
        role: "TypeScript Config",
        why: "Strict mode enabled. types: [\"vite/client\"] resolves import.meta.env types. noUnusedLocals: false to avoid blocking unused-but-planned variables during active development.",
        version: "TypeScript 5.5",
        docs: "typescriptlang.org/tsconfig",
      },
      {
        name: "Replit",
        role: "Dev Environment",
        why: "Cloud-hosted dev environment with Nix package management, instant workflow restart, preview pane, and built-in Secrets management for env vars.",
        version: "—",
        docs: "replit.com",
      },
      {
        name: "npm",
        role: "Package Manager",
        why: "Standard Node.js package manager. Lock file committed to ensure reproducible installs across environments.",
        version: "10.x",
        docs: "npmjs.com",
      },
    ],
  },
  {
    category: "Infrastructure & Hosting",
    icon: "☁️",
    color: "#4F46E5",
    bg: "#EEF2FF",
    border: "#C7D2FE",
    items: [
      {
        name: "Firebase Hosting",
        role: "Production Hosting",
        why: "Global CDN, HTTPS by default, single-page app rewrites configured, custom domain support. Deploys in under 60 seconds via firebase deploy.",
        version: "—",
        docs: "firebase.google.com/hosting",
      },
      {
        name: "Vite Build Output",
        role: "Production Bundle",
        why: "npm run build outputs optimised static assets to dist/. Bundle ~1.5MB (JS + CSS). Chunking strategy splits vendor libs from app code for better caching.",
        version: "Vite 5",
        docs: "vitejs.dev",
      },
      {
        name: "GitHub Actions (planned)",
        role: "CI/CD",
        why: "Automated pipeline: lint → tsc --noEmit → build → firebase deploy on every push to main. Zero manual deployment steps.",
        version: "—",
        docs: "github.com/features/actions",
      },
      {
        name: "Sentry (planned)",
        role: "Error Monitoring",
        why: "Captures unhandled exceptions in production with full stack traces, user context, and release tracking.",
        version: "—",
        docs: "sentry.io",
      },
      {
        name: "Google Analytics 4",
        role: "Usage Analytics",
        why: "Page views, session duration, and custom events (apply_click, resume_upload, internship_view) for product and growth decisions.",
        version: "GA4",
        docs: "analytics.google.com",
      },
    ],
  },
];

const decisions = [
  {
    decision: "Firebase over Supabase",
    rationale: "Google OAuth + Firebase Auth integrate natively. Firestore real-time listeners suit the live Kanban ATS and notification use cases. Team was already familiar.",
    tradeoff: "Firestore queries are less flexible than SQL — complex aggregations require denormalised data or Cloud Functions.",
  },
  {
    decision: "Vite over Create React App",
    rationale: "HMR is 10× faster. Native ESM support. No Webpack config debt. Smaller build output with better tree-shaking.",
    tradeoff: "Slightly more manual setup for edge cases (e.g., CommonJS interop). Not an issue for this project.",
  },
  {
    decision: "Tailwind CSS over CSS Modules",
    rationale: "Faster iteration — styles co-located with JSX. Dark mode via class strategy. Design token consistency enforced by config.",
    tradeoff: "Verbose class strings on complex components. Mitigated by extracting reusable common components.",
  },
  {
    decision: "React Context over Redux / Zustand",
    rationale: "App state is shallow — only auth and theme are global. Firebase SDK handles server/async state. No need for a heavyweight state manager.",
    tradeoff: "Would need Zustand or similar if offline support or complex client-side caching is added later.",
  },
  {
    decision: "Recharts over Chart.js",
    rationale: "React-first API — charts are composable JSX. Full TypeScript support. Lighter than Chart.js for the specific chart types used.",
    tradeoff: "Less suited for canvas-heavy or animated 3D visualisations — not needed here.",
  },
  {
    decision: "Separate login pages per portal",
    rationale: "Eliminates privilege escalation risk. Each portal URL is role-specific, making auth UX explicit. Social OAuth only on student login reduces attack surface.",
    tradeoff: "4 login pages to maintain instead of 1. Shared LoginLayout component keeps duplication minimal.",
  },
];

function CategoryBlock({
  category,
  icon,
  color,
  bg,
  border,
  items,
}: (typeof stack)[0]) {
  return (
    <div className="mb-8">
      {/* Category header */}
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl mb-3"
        style={{ background: color }}
      >
        <span className="text-xl">{icon}</span>
        <h2 className="text-white font-bold text-base">{category}</h2>
        <span className="ml-auto bg-white/20 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
          {items.length} {items.length === 1 ? "technology" : "technologies"}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.name}
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: border, background: "#FFFFFF" }}
          >
            <div className="flex items-start gap-4 px-5 py-4">
              {/* Left: name + role + version */}
              <div className="w-44 shrink-0">
                <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                <p
                  className="text-xs font-medium mt-0.5 px-2 py-0.5 rounded-full inline-block"
                  style={{ background: bg, color: color }}
                >
                  {item.role}
                </p>
                {item.version && (
                  <p className="text-[10px] text-gray-400 mt-1.5 font-mono">
                    v{item.version}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="w-px self-stretch bg-gray-100 shrink-0" />

              {/* Right: why */}
              <p className="text-sm text-gray-600 leading-relaxed flex-1">{item.why}</p>
            </div>
            {item.docs && item.docs !== "—" && (
              <div
                className="px-5 py-1.5 border-t text-[10px] text-gray-400 font-mono"
                style={{ borderColor: border, background: bg }}
              >
                📖 {item.docs}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TechStack() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm px-8 py-4 flex items-center gap-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold">S</span>
        </div>
        <div>
          <h1 className="text-sm font-extrabold text-gray-900 leading-tight">STUNIVOZ — Full Tech Stack</h1>
          <p className="text-xs text-gray-400 leading-tight">Every technology, why it was chosen, and what it does</p>
        </div>
        <div className="ml-auto flex gap-2 flex-wrap">
          {[
            { label: "7 Categories", color: "blue" },
            { label: "30+ Technologies", color: "purple" },
            { label: "6 ADRs", color: "emerald" },
          ].map((t) => (
            <span
              key={t.label}
              className={`bg-${t.color}-50 text-${t.color}-700 border border-${t.color}-100 text-xs font-semibold px-3 py-1 rounded-full`}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>

      <div className="px-8 py-8 max-w-5xl mx-auto">

        {/* Quick summary table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
          <div className="bg-gray-900 px-5 py-4">
            <h2 className="text-white font-bold">⚡ Quick Reference</h2>
            <p className="text-white/40 text-xs mt-0.5">One-line summary of the full stack</p>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { layer: "Language", tech: "TypeScript 5.5" },
              { layer: "Framework", tech: "React 18 + Vite 5" },
              { layer: "Routing", tech: "React Router v6" },
              { layer: "Styling", tech: "Tailwind CSS v3 (dark mode: class)" },
              { layer: "Charts", tech: "Recharts 2" },
              { layer: "Icons", tech: "Lucide React" },
              { layer: "Drag & Drop", tech: "@dnd-kit (Kanban ATS)" },
              { layer: "Auth", tech: "Firebase Auth — Google / GitHub / Email+Password" },
              { layer: "Database", tech: "Firestore (NoSQL, real-time)" },
              { layer: "File Storage", tech: "Firebase Storage" },
              { layer: "Serverless", tech: "Cloud Functions (2nd gen)" },
              { layer: "Global State", tech: "React Context API (AuthContext, ThemeContext)" },
              { layer: "Secrets", tech: "Replit Secrets → VITE_FIREBASE_* env vars" },
              { layer: "Access Control", tech: "RoleRoute component + Firestore Security Rules" },
              { layer: "Linting", tech: "ESLint 9 + typescript-eslint" },
              { layer: "Hosting", tech: "Firebase Hosting (CDN, HTTPS)" },
              { layer: "CI/CD", tech: "GitHub Actions (planned)" },
              { layer: "Error Monitoring", tech: "Sentry (planned)" },
              { layer: "Analytics", tech: "Google Analytics 4" },
            ].map((r) => (
              <div key={r.layer} className="flex items-center gap-0">
                <div className="w-48 px-5 py-2.5 bg-gray-50 shrink-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{r.layer}</p>
                </div>
                <div className="flex-1 px-5 py-2.5">
                  <p className="text-sm text-gray-800 font-medium">{r.tech}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed category blocks */}
        {stack.map((s) => (
          <CategoryBlock key={s.category} {...s} />
        ))}

        {/* Architecture Decision Records */}
        <div className="mt-4">
          <div className="bg-gray-900 rounded-xl px-5 py-4 mb-5">
            <h2 className="text-white font-bold text-base">📋 Architecture Decision Records (ADRs)</h2>
            <p className="text-white/40 text-xs mt-0.5">Why we chose X over Y — with honest trade-offs</p>
          </div>
          <div className="space-y-3">
            {decisions.map((d, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                  <span className="w-6 h-6 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm">{d.decision}</h3>
                </div>
                <div className="grid grid-cols-2 divide-x divide-gray-50">
                  <div className="px-5 py-3">
                    <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide mb-1">✅ Rationale</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{d.rationale}</p>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wide mb-1">⚠️ Trade-off</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{d.tradeoff}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 pt-6 pb-8 border-t border-gray-100">
          <p className="text-xs text-gray-400">STUNIVOZ Tech Stack · v1.0 · May 2026</p>
          <p className="text-xs text-gray-300 mt-1">7 categories · 30+ technologies · 6 ADRs</p>
        </div>

      </div>
    </div>
  );
}
