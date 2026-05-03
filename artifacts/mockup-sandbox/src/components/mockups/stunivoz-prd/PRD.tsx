import { useState } from "react";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "goals", label: "Goals & KPIs" },
  { id: "users", label: "User Personas" },
  { id: "features", label: "Feature Specs" },
  { id: "architecture", label: "Architecture" },
  { id: "screens", label: "Screen Map" },
  { id: "data", label: "Data Models" },
  { id: "auth", label: "Auth & Access" },
  { id: "api", label: "API Design" },
  { id: "timeline", label: "Roadmap" },
  { id: "risks", label: "Risks" },
  { id: "metrics", label: "Success Metrics" },
];

const Tag = ({ children, color = "blue" }: { children: React.ReactNode; color?: string }) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-600",
    cyan: "bg-cyan-100 text-cyan-700",
    pink: "bg-pink-100 text-pink-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

const SectionTitle = ({ id, icon, title, subtitle }: { id: string; icon: string; title: string; subtitle?: string }) => (
  <div id={id} className="mb-8 scroll-mt-24">
    <div className="flex items-center gap-3 mb-1">
      <span className="text-2xl">{icon}</span>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
    {subtitle && <p className="text-gray-500 ml-10 text-sm">{subtitle}</p>}
    <div className="mt-3 ml-10 h-px bg-gradient-to-r from-blue-200 via-purple-100 to-transparent" />
  </div>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>{children}</div>
);

const FeatureRow = ({ name, desc, priority, status, portal }: {
  name: string; desc: string; priority: string; status: string; portal: string;
}) => {
  const pColors: Record<string, string> = { P0: "red", P1: "orange", P2: "blue", P3: "gray" };
  const sColors: Record<string, string> = { Done: "green", "In Progress": "blue", Planned: "gray", Backlog: "gray" };
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
      <td className="py-3 px-4 font-medium text-gray-800 text-sm">{name}</td>
      <td className="py-3 px-4 text-gray-500 text-sm">{desc}</td>
      <td className="py-3 px-4"><Tag color={pColors[priority]}>{priority}</Tag></td>
      <td className="py-3 px-4"><Tag color={sColors[status]}>{status}</Tag></td>
      <td className="py-3 px-4"><Tag color="purple">{portal}</Tag></td>
    </tr>
  );
};

const ApiEndpoint = ({ method, path, desc, auth }: { method: string; path: string; desc: string; auth: string }) => {
  const mc: Record<string, string> = {
    GET: "bg-green-100 text-green-700",
    POST: "bg-blue-100 text-blue-700",
    PUT: "bg-yellow-100 text-yellow-700",
    DELETE: "bg-red-100 text-red-700",
    PATCH: "bg-purple-100 text-purple-700",
  };
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className={`font-mono text-xs font-bold px-2 py-1 rounded ${mc[method]} w-14 text-center shrink-0`}>{method}</span>
      <code className="text-xs text-gray-700 font-mono flex-1 truncate">{path}</code>
      <span className="text-xs text-gray-400 flex-1">{desc}</span>
      <Tag color={auth === "Public" ? "green" : auth === "Admin" ? "red" : "blue"}>{auth}</Tag>
    </div>
  );
};

export function PRD() {
  const [active, setActive] = useState("overview");

  const handleNav = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 sticky top-0 h-screen overflow-y-auto bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm leading-tight">STUNIVOZ</div>
              <div className="text-[10px] text-gray-400 leading-tight">Product Requirements</div>
            </div>
          </div>
          <div className="mt-3 flex gap-1.5">
            <Tag color="blue">v1.0</Tag>
            <Tag color="green">Live</Tag>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => handleNav(s.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                active === s.id
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">Last updated</p>
          <p className="text-xs text-gray-600 font-medium">May 3, 2026</p>
          <p className="text-[10px] text-gray-400 mt-1">Owner: Product Team</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-10 py-10 max-w-5xl">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-blue-700 text-xs font-semibold tracking-wide uppercase">Product Requirements Document</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-3">
            STUNIVOZ — Student Career<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Development Platform</span>
          </h1>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed">
            A full-stack, AI-powered career launchpad for university students — connecting them with internships, events, courses, resume building tools, and company portals through a unified platform.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Tag color="blue">React 18 + Vite</Tag>
            <Tag color="purple">TypeScript</Tag>
            <Tag color="cyan">Firebase</Tag>
            <Tag color="green">Tailwind CSS</Tag>
            <Tag color="orange">Recharts</Tag>
            <Tag color="pink">Role-Based Access</Tag>
          </div>
          {/* Stat bar */}
          <div className="mt-8 grid grid-cols-5 gap-4">
            {[
              { label: "Portals", value: "4", sub: "Student · Admin · Company · Staff" },
              { label: "Pages", value: "40+", sub: "Fully implemented" },
              { label: "User Roles", value: "5", sub: "Granular RBAC" },
              { label: "Features", value: "60+", sub: "Core + Admin" },
              { label: "Status", value: "Live", sub: "0 build errors" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                <div className="text-xs font-semibold text-gray-700 mt-0.5">{s.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SECTION: OVERVIEW ─── */}
        <SectionTitle id="overview" icon="🎯" title="Product Overview" subtitle="What STUNIVOZ is and why it exists" />
        <div className="ml-10 space-y-5 mb-14">
          <Card>
            <h3 className="font-semibold text-gray-800 mb-2">Problem Statement</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Students in India lack a unified platform to discover internships, build professional resumes, track career progress, and connect with companies. Existing solutions are fragmented — students use LinkedIn for networking, Internshala for internships, separate apps for resume building, and nothing for community. STUNIVOZ solves this by bringing all career touchpoints under one AI-assisted platform.
            </p>
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-800 mb-2">Solution</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              A multi-portal SaaS platform with separate experiences for Students, Companies (Providers), Platform Admins, and Staff moderators. Each portal is purpose-built, role-guarded, and shares a common Firebase backend.
            </p>
          </Card>
          <div className="grid grid-cols-2 gap-5">
            {[
              { title: "🎓 Student Portal", desc: "Dashboard, internship discovery, resume builder, events, courses, community, career roadmap, gamification", color: "border-l-blue-400" },
              { title: "🏢 Company Portal", desc: "Post internships, manage applications via Kanban ATS, post events, view analytics, manage company profile", color: "border-l-purple-400" },
              { title: "🛡️ Admin Panel", desc: "Full system control — users, content, reports, announcements, API keys, analytics, billing, security", color: "border-l-red-400" },
              { title: "👥 Staff Panel", desc: "Content moderation, report handling, account verification, platform monitoring, limited admin access", color: "border-l-green-400" },
            ].map((p) => (
              <Card key={p.title} className={`border-l-4 ${p.color}`}>
                <div className="font-semibold text-gray-800 text-sm mb-1">{p.title}</div>
                <p className="text-gray-500 text-xs leading-relaxed">{p.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* ─── SECTION: GOALS ─── */}
        <SectionTitle id="goals" icon="📈" title="Goals & KPIs" subtitle="What success looks like" />
        <div className="ml-10 mb-14 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { kpi: "10,000+", label: "Student Signups", period: "Month 3", trend: "↑" },
              { kpi: "500+", label: "Companies Onboarded", period: "Month 6", trend: "↑" },
              { kpi: "50,000+", label: "Internship Applications", period: "Month 6", trend: "↑" },
              { kpi: "< 2s", label: "Page Load Time", period: "P95", trend: "↓" },
              { kpi: "4.5+", label: "App Rating", period: "Target", trend: "↑" },
              { kpi: "99.9%", label: "Uptime SLA", period: "Monthly", trend: "→" },
            ].map((k) => (
              <Card key={k.label} className="text-center">
                <div className="text-3xl font-extrabold text-gray-900">{k.kpi}</div>
                <div className="text-xs font-semibold text-gray-700 mt-1">{k.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{k.period}</div>
              </Card>
            ))}
          </div>
          <Card>
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Business Objectives (OKRs)</h3>
            <div className="space-y-3">
              {[
                { obj: "Grow student user base to 10K MAU within 90 days of launch", progress: 0 },
                { obj: "Achieve 200+ active company partnerships by Q3 2026", progress: 0 },
                { obj: "Maintain zero critical security vulnerabilities (monthly audit)", progress: 100 },
                { obj: "Reach ₹10L MRR from company subscriptions by Q4 2026", progress: 0 },
                { obj: "Student placement rate improvement of 40% vs. control group", progress: 0 },
              ].map((o, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${o.progress === 100 ? "bg-green-400" : "bg-gray-200"}`} />
                  <p className="text-sm text-gray-600 flex-1">{o.obj}</p>
                  <Tag color={o.progress === 100 ? "green" : "gray"}>{o.progress === 100 ? "Done" : "Planned"}</Tag>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ─── SECTION: USERS ─── */}
        <SectionTitle id="users" icon="👤" title="User Personas" subtitle="Who uses STUNIVOZ and what they need" />
        <div className="ml-10 mb-14 grid grid-cols-2 gap-5">
          {[
            {
              avatar: "🎓", name: "Priya Sharma", role: "B.Tech Student — 3rd Year", portal: "Student",
              pColor: "blue",
              needs: ["Find relevant internships by domain & location", "Build ATS-optimized resume with AI help", "Track applications and get status updates", "Discover hackathons and career events"],
              pains: ["Can't find internships matching her skills", "Resume rejected by ATS systems", "Misses event deadlines", "No personalized guidance"],
            },
            {
              avatar: "🏢", name: "Rahul Mehta", role: "HR Manager, TechCorp", portal: "Company",
              pColor: "purple",
              needs: ["Post internship roles and manage pipeline", "Screen applicants with ATS Kanban board", "Host company events and webinars", "Access student talent pool analytics"],
              pains: ["Manual resume screening takes hours", "No centralized ATS for intern hiring", "Low quality applicant pool", "No campus presence tool"],
            },
            {
              avatar: "🛡️", name: "Arun Kumar", role: "Platform Super Admin", portal: "Admin",
              pColor: "red",
              needs: ["Full system visibility and control", "User management and ban/suspend tools", "Revenue and analytics overview", "Security and audit logs"],
              pains: ["No centralized control panel", "Blind to platform abuse/spam", "Manual report resolution", "No billing oversight"],
            },
            {
              avatar: "👥", name: "Sneha Patel", role: "Content Moderator, Staff", portal: "Staff",
              pColor: "green",
              needs: ["Review flagged posts and comments", "Verify company/student accounts", "Handle abuse reports quickly", "Monitor platform health"],
              pains: ["Report queue is manual and unstructured", "No context for moderation decisions", "Overwhelmed by volume", "Limited tooling"],
            },
          ].map((p) => (
            <Card key={p.name}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">{p.avatar}</div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.role}</div>
                  <Tag color={p.pColor as any}>{p.portal} Portal</Tag>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">✅ Needs</p>
                  <ul className="space-y-1">
                    {p.needs.map((n) => <li key={n} className="text-xs text-gray-600 flex gap-2"><span className="text-green-400 shrink-0">•</span>{n}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">❌ Pain Points</p>
                  <ul className="space-y-1">
                    {p.pains.map((n) => <li key={n} className="text-xs text-gray-600 flex gap-2"><span className="text-red-400 shrink-0">•</span>{n}</li>)}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ─── SECTION: FEATURES ─── */}
        <SectionTitle id="features" icon="⚙️" title="Feature Specifications" subtitle="Complete feature inventory with priority and status" />
        <div className="ml-10 mb-14">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Feature</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Portal</th>
                </tr>
              </thead>
              <tbody>
                <FeatureRow name="Auth — Google / GitHub OAuth" desc="Social login for students only" priority="P0" status="Done" portal="Student" />
                <FeatureRow name="Auth — Email / Password" desc="Admin, Staff, Company portals only" priority="P0" status="Done" portal="All" />
                <FeatureRow name="Role-Based Route Guards" desc="RoleRoute component per portal" priority="P0" status="Done" portal="All" />
                <FeatureRow name="Student Dashboard" desc="Stats, recommended internships, events, tasks" priority="P0" status="Done" portal="Student" />
                <FeatureRow name="Internship Discovery" desc="Search, filter, save, apply with ATS tagging" priority="P0" status="Done" portal="Student" />
                <FeatureRow name="Resume Builder" desc="Upload, score, AI suggestions, ATS analyzer" priority="P0" status="Done" portal="Student" />
                <FeatureRow name="Career Roadmap" desc="Role-based paths with step-by-step progress" priority="P1" status="Done" portal="Student" />
                <FeatureRow name="AI Recommendations" desc="Personalized internship + course suggestions" priority="P1" status="Done" portal="Student" />
                <FeatureRow name="Events & Hackathons" desc="Discover, register, calendar view" priority="P1" status="Done" portal="Student" />
                <FeatureRow name="Community Feed" desc="Posts, likes, comments, follow users" priority="P1" status="Done" portal="Student" />
                <FeatureRow name="Gamification" desc="Points, badges, leaderboard" priority="P2" status="Done" portal="Student" />
                <FeatureRow name="Admin Dashboard" desc="Live charts — users, apps, revenue, activity" priority="P0" status="Done" portal="Admin" />
                <FeatureRow name="User Management" desc="View, filter, ban, verify, export users" priority="P0" status="Done" portal="Admin" />
                <FeatureRow name="Internship Moderation" desc="Approve/reject company postings" priority="P0" status="Done" portal="Admin" />
                <FeatureRow name="Analytics Suite" desc="Funnel, retention, heatmaps, exports" priority="P1" status="Done" portal="Admin" />
                <FeatureRow name="Security Settings" desc="IP whitelist, 2FA, audit log, rate limits" priority="P1" status="Done" portal="Admin" />
                <FeatureRow name="Billing & Plans" desc="Plan management, invoices, revenue tracking" priority="P1" status="Done" portal="Admin" />
                <FeatureRow name="Company Dashboard" desc="KPI cards, pipeline chart, applicant trends" priority="P0" status="Done" portal="Company" />
                <FeatureRow name="Kanban ATS" desc="Drag & drop applicant pipeline by stage" priority="P0" status="Done" portal="Company" />
                <FeatureRow name="Post Internship Wizard" desc="3-step form with preview and publish" priority="P0" status="Done" portal="Company" />
                <FeatureRow name="Staff Moderation Queue" desc="Report review, content flags, actions" priority="P1" status="Done" portal="Staff" />
                <FeatureRow name="Notifications System" desc="Real-time notifications per role" priority="P1" status="Planned" portal="All" />
                <FeatureRow name="Mobile App (React Native)" desc="iOS + Android student app" priority="P2" status="Backlog" portal="Student" />
                <FeatureRow name="AI Resume Generator" desc="Auto-generate from profile + JD" priority="P2" status="Backlog" portal="Student" />
                <FeatureRow name="Video Interviews" desc="In-platform video interview scheduling" priority="P3" status="Backlog" portal="Company" />
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── SECTION: ARCHITECTURE ─── */}
        <SectionTitle id="architecture" icon="🏗️" title="System Architecture" subtitle="Tech stack and infrastructure decisions" />
        <div className="ml-10 mb-14 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                layer: "Frontend", icon: "⚛️", items: [
                  "React 18 + TypeScript", "Vite (build tool)", "React Router v6", "Tailwind CSS v3",
                  "Recharts (charts)", "Lucide Icons", "React DnD (Kanban)",
                ]
              },
              {
                layer: "Backend / BaaS", icon: "🔥", items: [
                  "Firebase Auth (OAuth + Email)", "Firestore (NoSQL DB)", "Firebase Storage (files)",
                  "Firebase Functions (serverless)", "Firebase Hosting", "Firebase Security Rules",
                ]
              },
              {
                layer: "Infrastructure", icon: "☁️", items: [
                  "Replit (dev environment)", "Firebase Hosting (CDN)", "GitHub Actions (CI/CD)",
                  "Sentry (error tracking)", "Google Analytics 4", "Vercel (staging env)",
                ]
              },
            ].map((l) => (
              <Card key={l.layer}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{l.icon}</span>
                  <span className="font-semibold text-gray-800 text-sm">{l.layer}</span>
                </div>
                <ul className="space-y-1.5">
                  {l.items.map((i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />{i}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
          <Card>
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Architecture Decision Records (ADRs)</h3>
            <div className="space-y-3">
              {[
                { decision: "Firebase over Supabase", rationale: "Better Google OAuth integration, Firestore real-time capabilities, simpler serverless functions via Cloud Functions, and existing team familiarity." },
                { decision: "Vite over Create React App", rationale: "10x faster HMR, native ESM support, leaner build output, and built-in TypeScript support without additional config." },
                { decision: "Role-based portals over feature flags", rationale: "Separate login pages per role (student / company / admin / staff) prevents privilege escalation and creates cleaner UX for each user type." },
                { decision: "Recharts over Chart.js", rationale: "Better React integration, TypeScript support, composable API, and lighter bundle size for the admin dashboard use case." },
                { decision: "Tailwind over CSS Modules", rationale: "Faster iteration, consistent design tokens, dark mode support via class strategy, and reduced context switching." },
              ].map((a) => (
                <div key={a.decision} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.decision}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ─── SECTION: SCREEN MAP ─── */}
        <SectionTitle id="screens" icon="🗺️" title="Screen Map & Navigation" subtitle="All routes and pages across portals" />
        <div className="ml-10 mb-14 grid grid-cols-2 gap-5">
          {[
            {
              portal: "🎓 Student Portal", color: "border-t-blue-400", routes: [
                "/", "/login", "/signup", "/dashboard", "/internships", "/internships/:id",
                "/resume", "/profile", "/events", "/courses", "/recommendations",
                "/community", "/career", "/tasks", "/notifications", "/settings",
              ]
            },
            {
              portal: "🏢 Company Portal", color: "border-t-purple-400", routes: [
                "/provider/login", "/provider/dashboard", "/provider/applicants",
                "/provider/post-internship", "/provider/post-event",
                "/provider/analytics", "/provider/profile", "/provider/settings",
              ]
            },
            {
              portal: "🛡️ Admin Panel", color: "border-t-red-400", routes: [
                "/admin/login", "/admin/dashboard", "/admin/users", "/admin/companies",
                "/admin/internships", "/admin/events", "/admin/courses",
                "/admin/reports", "/admin/announcements", "/admin/analytics",
                "/admin/api-keys", "/admin/billing", "/admin/security",
                "/admin/settings", "/admin/staff",
              ]
            },
            {
              portal: "👥 Staff Panel", color: "border-t-green-400", routes: [
                "/staff/login", "/staff/dashboard", "/staff/reports",
                "/staff/verification", "/staff/content", "/staff/settings",
              ]
            },
          ].map((p) => (
            <Card key={p.portal} className={`border-t-4 ${p.color}`}>
              <p className="font-semibold text-gray-800 text-sm mb-3">{p.portal}</p>
              <div className="space-y-1">
                {p.routes.map((r) => (
                  <div key={r} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                    <code className="text-xs text-gray-600 font-mono">{r}</code>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50">
                <Tag color="gray">{p.routes.length} routes</Tag>
              </div>
            </Card>
          ))}
        </div>

        {/* ─── SECTION: DATA MODELS ─── */}
        <SectionTitle id="data" icon="🗄️" title="Data Models" subtitle="Firestore collections and key fields" />
        <div className="ml-10 mb-14 grid grid-cols-2 gap-5">
          {[
            {
              collection: "users / profiles", icon: "👤", fields: [
                "id: string", "email: string", "full_name: string", "role: student|admin|staff|provider",
                "college_name?: string", "degree?: string", "skills?: string[]",
                "github?: string", "linkedin?: string", "created_at: timestamp",
              ]
            },
            {
              collection: "internships", icon: "💼", fields: [
                "id: string", "company_name: string", "role: string", "description: string",
                "stipend: number", "duration: string", "remote: boolean",
                "skills_required: string[]", "status: active|closed", "posted_by: userId",
                "created_at: timestamp",
              ]
            },
            {
              collection: "applications", icon: "📋", fields: [
                "id: string", "user_id: string", "internship_id: string",
                "status: applied|shortlisted|rejected|accepted",
                "resume_url?: string", "cover_letter?: string",
                "stage: string (Kanban column)", "applied_at: timestamp",
              ]
            },
            {
              collection: "events", icon: "📅", fields: [
                "id: string", "title: string", "type: hackathon|webinar|workshop",
                "date: timestamp", "location: string", "virtual: boolean",
                "organized_by: string", "registration_link?: string",
                "created_at: timestamp",
              ]
            },
            {
              collection: "resumes", icon: "📄", fields: [
                "id: string", "user_id: string", "title: string",
                "file_url?: string", "ats_score?: number",
                "ats_keywords?: string[]", "ats_suggestions?: string[]",
                "is_default: boolean", "updated_at: timestamp",
              ]
            },
            {
              collection: "notifications", icon: "🔔", fields: [
                "id: string", "user_id: string", "title: string",
                "message: string", "type: internship|event|application|system",
                "is_read: boolean", "created_at: timestamp",
              ]
            },
          ].map((m) => (
            <Card key={m.collection}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{m.icon}</span>
                <code className="text-xs font-semibold text-gray-800 bg-gray-50 px-2 py-0.5 rounded">{m.collection}</code>
              </div>
              <ul className="space-y-1">
                {m.fields.map((f) => (
                  <li key={f} className="text-xs font-mono text-gray-500 flex gap-1">
                    <span className="text-blue-400 shrink-0">—</span>{f}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* ─── SECTION: AUTH ─── */}
        <SectionTitle id="auth" icon="🔐" title="Auth & Access Control" subtitle="Role enforcement and login rules" />
        <div className="ml-10 mb-14 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { role: "Student", login: "/login", methods: ["Google OAuth", "GitHub OAuth", "Email/Password"], color: "blue" },
              { role: "Company / Provider", login: "/provider/login", methods: ["Email/Password only"], color: "purple" },
              { role: "Admin", login: "/admin/login", methods: ["Email/Password only"], color: "red" },
              { role: "Staff", login: "/staff/login", methods: ["Email/Password only"], color: "green" },
            ].map((r) => (
              <Card key={r.role} className={`border-l-4 border-l-${r.color}-300`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800 text-sm">{r.role}</span>
                  <code className="text-xs text-gray-400 font-mono">{r.login}</code>
                </div>
                <div className="space-y-1.5">
                  {r.methods.map((m) => (
                    <div key={m} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="text-green-400">✓</span> {m}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          <Card>
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">RBAC Rules</h3>
            <div className="space-y-2">
              {[
                { rule: "Social login (Google/GitHub) is blocked for Admin, Staff, and Company portals at the AuthContext level — not just UI" },
                { rule: "RoleRoute component wraps every protected route and redirects unauthorized roles to their respective portal login" },
                { rule: "Firebase Security Rules enforce read/write permissions at the database level (defense in depth)" },
                { rule: "Admin accounts are created manually — no public admin registration endpoint exists" },
                { rule: "Session tokens are Firebase JWT — verified server-side via Firebase Admin SDK in Cloud Functions" },
                { rule: "Staff role has read-mostly access; write access limited to moderation actions only" },
              ].map((r, i) => (
                <div key={i} className="flex gap-3 text-sm text-gray-600 py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-blue-400 shrink-0 mt-0.5">🔒</span> {r.rule}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ─── SECTION: API ─── */}
        <SectionTitle id="api" icon="🔌" title="API Design" subtitle="Firebase + Cloud Functions API surface" />
        <div className="ml-10 mb-14">
          <Card>
            <h3 className="font-semibold text-gray-800 mb-4 text-sm">Key Firestore + Cloud Function Endpoints</h3>
            <ApiEndpoint method="GET" path="/api/internships?page=1&domain=tech&remote=true" desc="List internships with filters" auth="Public" />
            <ApiEndpoint method="GET" path="/api/internships/:id" desc="Get internship detail" auth="Public" />
            <ApiEndpoint method="POST" path="/api/internships" desc="Create new internship posting" auth="Company" />
            <ApiEndpoint method="PUT" path="/api/internships/:id" desc="Update internship" auth="Company" />
            <ApiEndpoint method="DELETE" path="/api/internships/:id" desc="Delete internship" auth="Admin" />
            <ApiEndpoint method="POST" path="/api/applications" desc="Submit application" auth="Student" />
            <ApiEndpoint method="PATCH" path="/api/applications/:id/status" desc="Update application status" auth="Company" />
            <ApiEndpoint method="GET" path="/api/users/:id/profile" desc="Get user profile" auth="Student" />
            <ApiEndpoint method="PUT" path="/api/users/:id/profile" desc="Update user profile" auth="Student" />
            <ApiEndpoint method="GET" path="/api/admin/users?page=1&role=student" desc="List all users (admin)" auth="Admin" />
            <ApiEndpoint method="POST" path="/api/admin/users/:id/ban" desc="Ban user account" auth="Admin" />
            <ApiEndpoint method="GET" path="/api/admin/analytics/overview" desc="Platform-wide KPI metrics" auth="Admin" />
            <ApiEndpoint method="POST" path="/api/resumes/analyze" desc="AI ATS score + suggestions" auth="Student" />
            <ApiEndpoint method="GET" path="/api/events?type=hackathon" desc="List events with type filter" auth="Public" />
            <ApiEndpoint method="POST" path="/api/notifications/send" desc="Send notification to user(s)" auth="Admin" />
          </Card>
        </div>

        {/* ─── SECTION: TIMELINE ─── */}
        <SectionTitle id="timeline" icon="🗓️" title="Product Roadmap" subtitle="Release plan across 4 phases" />
        <div className="ml-10 mb-14 space-y-4">
          {[
            {
              phase: "Phase 1", title: "Foundation & Core", period: "Jan – Feb 2026", status: "Done",
              items: ["Multi-portal auth system", "Student dashboard + internship listing", "Basic profile builder", "Admin panel structure", "Firebase integration"],
            },
            {
              phase: "Phase 2", title: "Feature Completion", period: "Mar – Apr 2026", status: "Done",
              items: ["Resume builder + ATS analyzer", "Company portal + Kanban ATS", "Career roadmap + gamification", "Events + community feed", "Admin: all 15 sub-pages"],
            },
            {
              phase: "Phase 3", title: "AI & Analytics", period: "May – Jun 2026", status: "In Progress",
              items: ["AI-powered recommendations engine", "Advanced analytics dashboards", "Real-time notifications", "Performance optimization", "Security hardening"],
            },
            {
              phase: "Phase 4", title: "Scale & Mobile", period: "Jul – Sep 2026", status: "Planned",
              items: ["React Native mobile app (iOS + Android)", "Payment integration (Razorpay)", "AI resume generator", "Video interview scheduling", "Multi-university partnerships"],
            },
          ].map((p, i) => (
            <div key={p.phase} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  p.status === "Done" ? "bg-green-100 text-green-700" :
                  p.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                }`}>{i + 1}</div>
                {i < 3 && <div className="w-px flex-1 bg-gray-200 mt-2" />}
              </div>
              <Card className="flex-1 mb-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs text-gray-400 font-medium">{p.phase} · {p.period}</span>
                    <h4 className="font-bold text-gray-900 text-sm">{p.title}</h4>
                  </div>
                  <Tag color={p.status === "Done" ? "green" : p.status === "In Progress" ? "blue" : "gray"}>{p.status}</Tag>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.items.map((item) => (
                    <span key={item} className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2 py-1 rounded-lg">{item}</span>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* ─── SECTION: RISKS ─── */}
        <SectionTitle id="risks" icon="⚠️" title="Risk Register" subtitle="Identified risks and mitigation strategies" />
        <div className="ml-10 mb-14">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Impact</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Likelihood</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mitigation</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { risk: "Firebase free tier limits exceeded", impact: "High", prob: "Medium", mit: "Monitor usage; upgrade to Blaze plan at 5K+ DAU" },
                  { risk: "Data breach / PII exposure", impact: "Critical", prob: "Low", mit: "Security Rules, encrypted fields, audit logs, periodic pen testing" },
                  { risk: "Low company adoption", impact: "High", prob: "Medium", mit: "Free tier for first 50 companies; dedicated onboarding support" },
                  { risk: "ATS spam from fake students", impact: "Medium", prob: "High", mit: "Email verification, rate limiting, Staff moderation queue" },
                  { risk: "Resume file storage costs", impact: "Medium", prob: "Medium", mit: "PDF compression + 5MB limit enforced client-side" },
                  { risk: "React Router v7 upgrade breaking changes", impact: "Low", prob: "High", mit: "Future flags already set; phased migration plan ready" },
                  { risk: "AI recommendation quality poor", impact: "Medium", prob: "Medium", mit: "Rule-based fallback + iterative model fine-tuning" },
                ].map((r, i) => {
                  const ic: Record<string, string> = { Critical: "red", High: "orange", Medium: "blue", Low: "gray" };
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-800">{r.risk}</td>
                      <td className="py-3 px-4"><Tag color={ic[r.impact]}>{r.impact}</Tag></td>
                      <td className="py-3 px-4"><Tag color={ic[r.prob]}>{r.prob}</Tag></td>
                      <td className="py-3 px-4 text-xs text-gray-500">{r.mit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── SECTION: METRICS ─── */}
        <SectionTitle id="metrics" icon="📊" title="Success Metrics" subtitle="How we measure platform health and growth" />
        <div className="ml-10 mb-14 grid grid-cols-2 gap-5">
          {[
            {
              cat: "Acquisition", icon: "📣", metrics: [
                "Daily New Student Signups (target: 200/day by M3)",
                "Company Registration Rate (target: 20/week by M3)",
                "Organic vs Paid Traffic Split",
                "Referral Rate from existing users",
              ]
            },
            {
              cat: "Engagement", icon: "🔄", metrics: [
                "DAU / MAU Ratio (target: > 0.4)",
                "Avg Sessions per User per Week (target: 3+)",
                "Internship Apply Click Rate (target: 15%)",
                "Resume Builder Completion Rate (target: 60%)",
              ]
            },
            {
              cat: "Conversion", icon: "🎯", metrics: [
                "Application → Shortlist Rate (company-side)",
                "Resume Upload → ATS Score Rate",
                "Event Registration Conversion",
                "Free → Premium Conversion (companies)",
              ]
            },
            {
              cat: "Retention", icon: "💎", metrics: [
                "D1 / D7 / D30 Retention (target: 60/40/25%)",
                "Monthly Churn Rate for Companies (target < 5%)",
                "Support Ticket Volume per 1K users",
                "NPS Score (target: > 50)",
              ]
            },
          ].map((c) => (
            <Card key={c.cat}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{c.icon}</span>
                <span className="font-semibold text-gray-800 text-sm">{c.cat}</span>
              </div>
              <ul className="space-y-2">
                {c.metrics.map((m) => (
                  <li key={m} className="text-xs text-gray-600 flex gap-2">
                    <span className="text-purple-400 shrink-0 mt-0.5">→</span>{m}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="font-bold text-gray-700">STUNIVOZ</span>
          </div>
          <p className="text-xs text-gray-400">Product Requirements Document · v1.0 · Confidential</p>
          <p className="text-xs text-gray-400 mt-1">© 2026 STUNIVOZ. All rights reserved.</p>
        </div>

      </main>
    </div>
  );
}
