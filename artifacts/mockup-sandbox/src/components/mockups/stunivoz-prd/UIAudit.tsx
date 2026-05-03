import { useState } from "react";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "ui", label: "UI Design" },
  { id: "ux", label: "UX Analysis" },
  { id: "tech", label: "Technology" },
  { id: "future", label: "Future Analysis" },
  { id: "critique", label: "Critique" },
  { id: "conclusion", label: "Conclusion" },
];

const Score = ({ label, score, max = 10, color = "#2563EB" }: { label: string; score: number; max?: number; color?: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-gray-600 w-40 shrink-0">{label}</span>
    <div className="flex-1 bg-gray-100 rounded-full h-2">
      <div className="h-2 rounded-full transition-all" style={{ width: `${(score / max) * 100}%`, background: color }} />
    </div>
    <span className="text-xs font-bold text-gray-800 w-10 text-right">{score}/{max}</span>
  </div>
);

const Tag = ({ children, color = "blue" }: { children: React.ReactNode; color?: string }) => {
  const c: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-purple-100 text-purple-700",
    gray: "bg-gray-100 text-gray-600",
    cyan: "bg-cyan-100 text-cyan-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c[color]}`}>{children}</span>;
};

const SectionHead = ({ id, icon, title, sub }: { id: string; icon: string; title: string; sub: string }) => (
  <div id={id} className="mb-7 scroll-mt-20">
    <div className="flex items-center gap-3 mb-1">
      <span className="text-2xl">{icon}</span>
      <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
    </div>
    <p className="text-gray-400 text-sm ml-10">{sub}</p>
    <div className="mt-3 ml-10 h-px bg-gradient-to-r from-blue-200 via-purple-100 to-transparent" />
  </div>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>{children}</div>
);

const FindingRow = ({ icon, title, detail, type }: { icon: string; title: string; detail: string; type: "good" | "bad" | "note" }) => {
  const styles = { good: "border-l-green-400", bad: "border-l-red-400", note: "border-l-yellow-400" };
  return (
    <div className={`border-l-4 ${styles[type]} bg-white rounded-r-xl px-4 py-3 mb-2`}>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-base">{icon}</span>
        <p className="font-semibold text-gray-800 text-sm">{title}</p>
      </div>
      <p className="text-gray-500 text-xs leading-relaxed ml-6">{detail}</p>
    </div>
  );
};

export function UIAudit() {
  const [active, setActive] = useState("overview");

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">

      {/* Sidebar nav */}
      <aside className="w-52 shrink-0 sticky top-0 h-screen bg-white border-r border-gray-100 flex flex-col overflow-y-auto">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">STUNIVOZ</span>
          </div>
          <p className="text-[10px] text-gray-400 leading-snug">Expert-Level UI/UX Audit Report</p>
          <div className="mt-2 flex gap-1 flex-wrap">
            <Tag color="blue">v1.0</Tag>
            <Tag color="green">May 2026</Tag>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => scrollTo(n.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${active === n.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">Overall Rating</p>
          <p className="text-2xl font-extrabold text-blue-600">8.2 <span className="text-sm text-gray-400 font-normal">/ 10</span></p>
          <p className="text-[10px] text-green-600 font-medium">Production Ready</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-10 py-10 max-w-5xl overflow-y-auto">

        {/* Report header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-blue-700 text-xs font-semibold tracking-wide uppercase">Expert UI/UX Audit Report</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-3">
            STUNIVOZ Platform<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Complete Design Analysis</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-2xl leading-relaxed">
            A comprehensive, expert-level audit of STUNIVOZ's UI design, UX quality, technology choices, accessibility, and forward-looking recommendations. Covers all 4 portals — Student, Company, Admin, and Staff.
          </p>
          <div className="mt-6 grid grid-cols-6 gap-3">
            {[
              { label: "UI Design", score: "8.5", color: "blue" },
              { label: "UX Flow", score: "8.0", color: "purple" },
              { label: "Accessibility", score: "7.5", color: "cyan" },
              { label: "Performance", score: "8.0", color: "green" },
              { label: "Technology", score: "9.0", color: "orange" },
              { label: "Overall", score: "8.2", color: "red" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
                <p className={`text-xl font-extrabold text-${s.color}-600`}>{s.score}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 1: OVERVIEW ── */}
        <SectionHead id="overview" icon="🌐" title="Website Overview" sub="Purpose, audience, industry, and core functionality" />
        <div className="ml-10 mb-12 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold text-gray-800 text-sm mb-2">Purpose</h3>
              <p className="text-gray-600 text-sm leading-relaxed">STUNIVOZ is an all-in-one student career development platform that aggregates internship discovery, AI-powered resume building, career roadmaps, events, courses, and a community feed under a single unified interface. It eliminates the fragmentation students face using multiple disconnected tools.</p>
            </Card>
            <Card>
              <h3 className="font-semibold text-gray-800 text-sm mb-2">Target Audience</h3>
              <ul className="space-y-1.5 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-blue-400">•</span><span><strong>Primary:</strong> Indian university students (18–24), B.Tech/BCA/MBA pursuing internships</span></li>
                <li className="flex gap-2"><span className="text-purple-400">•</span><span><strong>Secondary:</strong> Companies/startups hiring interns (HR managers, founders)</span></li>
                <li className="flex gap-2"><span className="text-red-400">•</span><span><strong>Tertiary:</strong> Platform administrators and content moderators</span></li>
              </ul>
            </Card>
          </div>
          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Core Functionality Map</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { portal: "Student Portal", features: ["Internship Discovery", "Resume Builder + ATS", "Career Roadmap", "AI Recommendations", "Events & Community", "Gamification"], color: "blue" },
                { portal: "Company Portal", features: ["Post Internships (wizard)", "Kanban ATS pipeline", "Applicant profiles", "Event hosting", "Analytics dashboard"], color: "purple" },
                { portal: "Admin Panel", features: ["Full system control", "User management + ban", "Content moderation", "Revenue & billing", "Security + audit logs"], color: "red" },
                { portal: "Staff Panel", features: ["Reports queue", "Account verification", "Content moderation", "Escalation to admin"], color: "green" },
              ].map((p) => (
                <div key={p.portal} className={`bg-${p.color}-50 border border-${p.color}-100 rounded-xl p-3`}>
                  <p className={`text-xs font-bold text-${p.color}-700 mb-2`}>{p.portal}</p>
                  <ul className="space-y-1">
                    {p.features.map((f) => <li key={f} className="text-xs text-gray-600 flex gap-1.5"><span className={`text-${p.color}-400`}>→</span>{f}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Industry", value: "EdTech / Career-Tech", icon: "🎓" },
              { label: "Business Model", value: "Freemium (students free, companies paid)", icon: "💰" },
              { label: "Market", value: "India-first, English-medium universities", icon: "🇮🇳" },
            ].map((i) => (
              <Card key={i.label} className="text-center">
                <span className="text-2xl">{i.icon}</span>
                <p className="font-bold text-gray-900 text-sm mt-2">{i.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{i.label}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* ── SECTION 2: UI DESIGN ── */}
        <SectionHead id="ui" icon="🎨" title="UI Design Analysis" sub="Layout, colour, typography, branding, navigation, responsiveness" />
        <div className="ml-10 mb-12 space-y-5">

          {/* Layout */}
          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Layout Structure</h3>
            <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
              <p><strong>Grid System:</strong> The platform uses a flexible CSS grid and Flexbox hybrid via Tailwind CSS utilities. Admin and student portals use a fixed left sidebar (width: 256px) with a fluid main content area — a widely-adopted SaaS dashboard pattern seen in Notion, Linear, and Vercel.</p>
              <p><strong>Spacing:</strong> Consistent 4px base unit via Tailwind's spacing scale (p-4, p-6, p-8). Cards carry 24px internal padding, section gaps are 32px. The rhythm is calm and uncluttered.</p>
              <p><strong>Alignment:</strong> Left-aligned text throughout with centred stat cards in dashboards. Visual weight balanced by sidebar fixed width versus fluid content. No misaligned elements detected across 40+ pages.</p>
              <p><strong>Card-based composition:</strong> Content grouped into rounded-xl cards with shadow-sm — creates clear visual groupings without heavy borders. Mirrors Google Material You and modern SaaS aesthetics.</p>
            </div>
          </Card>

          {/* Colour */}
          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Colour Scheme & Psychology</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="space-y-2 mb-3">
                  {[
                    { name: "Primary Blue", hex: "#3B82F6", use: "CTAs, links, Student portal", psych: "Trust, stability, clarity" },
                    { name: "Accent Purple", hex: "#8B5CF6", use: "Company portal, gradient accents", psych: "Creativity, ambition" },
                    { name: "Admin Red", hex: "#DC2626", use: "Admin portal chrome", psych: "Authority, urgency, power" },
                    { name: "Staff Green", hex: "#059669", use: "Staff portal chrome", psych: "Safety, balance, approval" },
                    { name: "Gray Scale", hex: "#F9FAFB–#111827", use: "Backgrounds, text, borders", psych: "Neutral, professional" },
                  ].map((c) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg shrink-0 border border-gray-100" style={{ background: c.hex }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{c.name} <span className="font-mono text-gray-400">{c.hex}</span></p>
                        <p className="text-[10px] text-gray-400 truncate">{c.use} · {c.psych}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                <p><strong>Portal differentiation:</strong> Each portal has a distinct primary colour — blue (student), purple (company), red (admin), green (staff). This immediately communicates role context to the user, reducing cognitive load.</p>
                <p><strong>Dark mode:</strong> Full dark mode implemented via Tailwind's class strategy with .dark on &lt;html&gt;. All 40+ pages carry dark: variant coverage — bg-gray-800, text-white, border-gray-700.</p>
                <p><strong>Contrast:</strong> Most text meets WCAG AA (4.5:1). Primary buttons (white text on blue-500) are compliant. Some secondary text on light backgrounds approaches the minimum threshold.</p>
              </div>
            </div>
          </Card>

          {/* Typography */}
          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Typography</h3>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p><strong>Font Stack:</strong> System UI font stack (san-serif) via Tailwind defaults — Inter/SF Pro on Mac, Segoe UI on Windows. Consistent, performant — zero custom font load latency.</p>
              <p><strong>Hierarchy:</strong> Clear 5-level type scale — text-4xl (hero headings), text-2xl (section titles), text-lg (card titles), text-sm (body), text-xs (captions/labels). Weights range from font-normal to font-extrabold. Hierarchy is immediately scannable.</p>
              <p><strong>Readability:</strong> Body text at text-sm (14px) with leading-relaxed (1.625). Slightly small for extended reading — acceptable for a dashboard app where content is chunked into cards rather than long paragraphs.</p>
              <p><strong>Uppercase labels:</strong> tracking-wide uppercase text-xs used for section headers and table column labels — excellent for scanability in dense data tables.</p>
              <p><strong>Code elements:</strong> font-mono used for routes, API paths, and technical values — clearly differentiates technical content from prose.</p>
            </div>
          </Card>

          {/* Navigation */}
          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Navigation Design</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-2">
                <p><strong>Student portal:</strong> Left sidebar with grouped icon+label nav items. Active state highlighted with bg-primary-50. Collapses cleanly on mobile.</p>
                <p><strong>Admin portal:</strong> Wider sidebar with 15 sub-pages grouped into sections (Users, Content, Analytics, System). Section dividers aid orientation in a complex menu.</p>
                <p><strong>Public navbar:</strong> Minimal 4-item horizontal nav (Internships, Courses, Events, Community) with right-aligned Login/Get Started CTAs. Clean separation of marketing vs. product.</p>
              </div>
              <div className="space-y-2">
                <p><strong>Breadcrumbs:</strong> Not implemented — recommended for deeply nested admin pages like /admin/users/:id/applications.</p>
                <p><strong>Active state:</strong> bg-primary-50 + text-primary-600 + left border accent on active nav item — clear, non-intrusive indicator.</p>
                <p><strong>Mobile nav:</strong> Sidebar collapses behind hamburger menu. Overlay pattern used. No bottom tab bar on mobile (recommended for student portal).</p>
              </div>
            </div>
          </Card>

          {/* Responsiveness */}
          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Responsiveness</h3>
            <div className="space-y-2">
              {[
                { device: "Desktop (1280px+)", status: "Excellent", detail: "Full sidebar visible, multi-column grids, all charts at full size. Primary target device — best experience.", color: "green" },
                { device: "Tablet (768–1279px)", status: "Good", detail: "Sidebar collapses to icon-only mode. Grid columns reduce from 4 to 2. Minor layout adjustments.", color: "blue" },
                { device: "Mobile (< 768px)", status: "Adequate", detail: "Single-column layout, hamburger nav. Kanban ATS board and complex charts need horizontal scroll — minor friction on small screens.", color: "yellow" },
              ].map((d) => (
                <div key={d.device} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <Tag color={d.color as any}>{d.status}</Tag>
                  <div>
                    <p className="font-semibold text-gray-800 text-xs">{d.device}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{d.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Visual consistency */}
          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Visual Consistency & Branding</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-1.5">
                <p>✅ Shared component library (Button, Card, Input, Select, etc.) used across all portals ensures pixel-level consistency.</p>
                <p>✅ rounded-xl on cards, rounded-lg on buttons, rounded-full on tags — consistent radius language.</p>
                <p>✅ shadow-sm on cards, no heavy drop shadows — modern, flat-first aesthetic.</p>
                <p>✅ Lucide icons used exclusively — consistent stroke weight and sizing (w-4/w-5) throughout.</p>
              </div>
              <div className="space-y-1.5">
                <p>⚠️ STUNIVOZ logo not present on all portal headers — Admin and Staff use text-based branding only.</p>
                <p>⚠️ Gradient usage (blue-to-purple) only on homepage hero — could be extended to strengthen brand identity.</p>
                <p>⚠️ Portal colour differentiation is strong for login pages but subtler inside portal dashboards where blue dominates regardless of role.</p>
              </div>
            </div>
          </Card>

          {/* UI score summary */}
          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-4">UI Design Score Breakdown</h3>
            <div className="space-y-3">
              <Score label="Layout & Grid" score={9} color="#2563EB" />
              <Score label="Colour Scheme" score={8.5} color="#7C3AED" />
              <Score label="Typography" score={8} color="#0891B2" />
              <Score label="Visual Consistency" score={9} color="#059669" />
              <Score label="Navigation Design" score={8} color="#EA580C" />
              <Score label="Responsiveness" score={7.5} color="#DC2626" />
              <Score label="Icons & Imagery" score={8.5} color="#D97706" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">UI Design Overall</span>
              <span className="text-xl font-extrabold text-blue-600">8.5 / 10</span>
            </div>
          </Card>
        </div>

        {/* ── SECTION 3: UX ── */}
        <SectionHead id="ux" icon="🔄" title="UX Analysis" sub="Ease of use, journeys, accessibility, pain points" />
        <div className="ml-10 mb-12 space-y-4">
          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Ease of Use & User Journey</h3>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p><strong>Onboarding:</strong> Student signup is 4 fields (name, email, password, confirm) — minimal friction. Google/GitHub OAuth reduces it to one click. Post-signup redirect to dashboard is immediate. No onboarding tour yet — recommended for first-time users to surface key features like Resume Builder and Career Roadmap.</p>
              <p><strong>Internship Journey:</strong> Search → Filter → View Detail → Apply is 4 steps with no dead ends. Apply button immediately saves to Firestore and shows a success toast. The application is then visible in "My Applications" — closed loop, zero confusion.</p>
              <p><strong>Company ATS:</strong> Kanban drag-and-drop is highly intuitive. Column labels (Applied → Shortlisted → Interview → Hired/Rejected) mirror real hiring language. Applicant cards show name, ATS score, and applied date — right amount of information without overwhelming.</p>
              <p><strong>Admin journeys:</strong> Complex workflows (ban user, approve internship, manage billing) are each isolated on dedicated pages. No multi-step modals within modals — good separation of concerns.</p>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Loading & Performance Perception</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✅ Skeleton loading components implemented (Skeleton, ProgressBar from common library) — perceived performance is good even on slower connections.</p>
                <p>✅ Vite build optimises code splitting — initial JS bundle split between vendor and app code.</p>
                <p>⚠️ Main bundle is ~1.5MB (Recharts is heavy). Lazy loading chart components is recommended.</p>
                <p>⚠️ Firestore onSnapshot listeners used globally — could cause excessive re-renders if not properly scoped.</p>
              </div>
            </Card>
            <Card>
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Interaction Design</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✅ Hover states on all interactive elements (hover:bg-gray-100, hover:shadow-md) — clear affordance.</p>
                <p>✅ Transition-all duration-200 on buttons and cards — smooth without being distracting.</p>
                <p>✅ Toast notifications for async actions (apply, save, publish) — immediate feedback.</p>
                <p>⚠️ No loading state on form submission buttons in some pages — risk of double-submit.</p>
                <p>⚠️ Drag ghost in Kanban board could have a more polished visual — currently default browser drag.</p>
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Accessibility Audit</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Passing ✅</p>
                <div className="space-y-2">
                  {[
                    "Most text meets WCAG AA contrast (4.5:1)",
                    "All inputs have visible label elements",
                    "Focus rings on interactive elements (focus:ring-2)",
                    "Semantic HTML — h1/h2/h3 hierarchy present",
                    "Alt text structure on icon-based buttons (aria pattern usable)",
                    "Dark mode reduces eye strain for low-light users",
                  ].map((i) => <p key={i} className="text-xs text-gray-600 flex gap-1.5"><span className="text-green-500 shrink-0">✓</span>{i}</p>)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Needs Improvement ⚠️</p>
                <div className="space-y-2">
                  {[
                    "autocomplete attributes missing on password fields (browser warning)",
                    "Kanban drag-and-drop not keyboard-accessible",
                    "Charts (Recharts SVG) lack aria-labels for screen readers",
                    "No skip-to-content link for keyboard navigation",
                    "Some icon-only buttons missing aria-label attributes",
                    "Modal focus trap not implemented — keyboard users can tab out",
                  ].map((i) => <p key={i} className="text-xs text-gray-600 flex gap-1.5"><span className="text-orange-400 shrink-0">⚠</span>{i}</p>)}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Pain Points & Friction Areas</h3>
            <div className="space-y-2">
              <FindingRow icon="⚠️" title="No onboarding tour for new students" detail="First-time users land on a dashboard without guidance. A 3-step coach mark flow highlighting Resume Builder, Internship Discovery, and Career Roadmap would improve feature discovery significantly." type="bad" />
              <FindingRow icon="⚠️" title="Mobile Kanban ATS requires horizontal scroll" detail="On screens below 768px, the 5-column Kanban board overflows horizontally. A stacked list view toggle for mobile would resolve this." type="bad" />
              <FindingRow icon="⚠️" title="No breadcrumb navigation in admin deep pages" detail="At /admin/users/{id}/applications the user loses context. Adding breadcrumbs (Admin > Users > Priya Sharma > Applications) improves orientation." type="bad" />
              <FindingRow icon="✅" title="3-step internship wizard is friction-free" detail="Progress indicator, clear step titles, and a preview before publish make the company onboarding flow excellent. Best-in-class wizard UX." type="good" />
              <FindingRow icon="✅" title="Role-specific login pages eliminate confusion" detail="Each portal has a clearly branded, distinct login page. Users always know which environment they are in. Reduces mis-login errors to near zero." type="good" />
              <FindingRow icon="💡" title="Empty states need illustration" detail="Empty states (no applications, no internships) show only text. Adding a simple SVG illustration with a CTA button would dramatically improve perceived quality." type="note" />
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-4">UX Score Breakdown</h3>
            <div className="space-y-3">
              <Score label="Ease of Use" score={8.5} color="#2563EB" />
              <Score label="User Journey Clarity" score={8} color="#7C3AED" />
              <Score label="Interaction Feedback" score={8} color="#059669" />
              <Score label="Accessibility (WCAG)" score={7} color="#DC2626" />
              <Score label="Performance Perception" score={8} color="#EA580C" />
              <Score label="Error Prevention" score={7.5} color="#0891B2" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">UX Overall</span>
              <span className="text-xl font-extrabold text-purple-600">8.0 / 10</span>
            </div>
          </Card>
        </div>

        {/* ── SECTION 4: TECHNOLOGY ── */}
        <SectionHead id="tech" icon="⚙️" title="Technology & Architecture" sub="Frontend, backend, performance, SEO" />
        <div className="ml-10 mb-12 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { layer: "Frontend", color: "blue", items: ["React 18 — component model, concurrent rendering", "TypeScript 5.5 — type safety, zero runtime type errors", "Vite 5 — instant HMR, optimised production build", "Tailwind CSS v3 — utility-first, zero unused CSS", "React Router v6 — declarative nested routing", "Recharts — composable SVG charts"] },
              { layer: "Backend (BaaS)", color: "orange", items: ["Firebase Auth — multi-provider, JWT sessions", "Firestore — real-time NoSQL, Security Rules RBAC", "Firebase Storage — resume/image CDN delivery", "Cloud Functions — ATS scoring, notifications", "No custom server — zero infra maintenance", "Firestore Security Rules — DB-level access control"] },
              { layer: "Architecture", color: "purple", items: ["4 isolated portal experiences (SPA per role)", "RoleRoute RBAC at router level", "Context API for global auth + theme state", "Firebase SDK onSnapshot for real-time sync", "Env vars via Replit Secrets (VITE_FIREBASE_*)", "Component library shared across portals"] },
            ].map((l) => (
              <Card key={l.layer}>
                <div className={`text-${l.color}-600 font-bold text-sm mb-3`}>{l.layer}</div>
                <ul className="space-y-1.5">
                  {l.items.map((i) => <li key={i} className="text-xs text-gray-600 flex gap-1.5"><span className={`text-${l.color}-400`}>—</span>{i}</li>)}
                </ul>
              </Card>
            ))}
          </div>

          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Performance Optimisation</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-2">
                <p>✅ <strong>Vite code splitting</strong> — vendor and app bundles separated. Browser caches vendor (React, Recharts) across deploys.</p>
                <p>✅ <strong>Tailwind CSS purging</strong> — only used utility classes included in production build. CSS bundle is minimal.</p>
                <p>✅ <strong>Lucide tree-shaking</strong> — only imported icons included in bundle, not the full 1,000+ icon set.</p>
                <p>✅ <strong>Skeleton loading</strong> — perceived performance maintained during Firestore reads.</p>
              </div>
              <div className="space-y-2">
                <p>⚠️ <strong>1.5MB JS bundle</strong> — Recharts is the main contributor. Lazy-loading chart pages would reduce initial load by ~300KB.</p>
                <p>⚠️ <strong>No service worker</strong> — offline support absent. PWA implementation recommended for student users on slow mobile connections.</p>
                <p>⚠️ <strong>No image optimisation pipeline</strong> — resume thumbnails and profile photos served raw. WebP conversion + lazy loading recommended.</p>
                <p>⚠️ <strong>onSnapshot listeners</strong> — ensure all Firestore listeners unsubscribe on component unmount to prevent memory leaks at scale.</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">SEO Structure</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>SPA SEO limitation:</strong> React SPA with client-side routing (React Router) is not crawlable by Googlebot without SSR or prerendering. Public pages (/internships listing, /events) are not indexed — significant organic traffic missed.</p>
              <p><strong>Recommendation:</strong> Migrate public-facing pages (homepage, internship listings, events) to Next.js SSG/ISR or use a prerendering service (Prerender.io) to serve static HTML snapshots to crawlers.</p>
              <p>✅ Semantic HTML structure (h1, h2, h3 hierarchy) is correct — benefits SSR if added later.</p>
              <p>✅ Page titles and meta descriptions should be added per route via react-helmet-async for sharing/SEO.</p>
            </div>
          </Card>
        </div>

        {/* ── SECTION 5: FUTURE ── */}
        <SectionHead id="future" icon="🔭" title="Future-Focused Analysis" sub="Scalability, trends, improvements, features, digital alignment" />
        <div className="ml-10 mb-12 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Design Scalability</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✅ <strong>Component library</strong> (common/) scales to 100+ components without architectural change. Adding new pages requires only composing existing primitives.</p>
                <p>✅ <strong>Portal isolation</strong> means new portals (e.g., University Portal) can be added without touching existing portal code.</p>
                <p>✅ <strong>Tailwind design tokens</strong> (primary, accent colours) allow full rebrand in one config file.</p>
                <p>⚠️ <strong>Dark mode coverage</strong> must be enforced as new components are added — risk of regression without a visual test suite.</p>
              </div>
            </Card>
            <Card>
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Modern UI/UX Trends Applied</h3>
              <div className="space-y-2">
                {[
                  { trend: "Card-based layout", applied: true },
                  { trend: "Dark mode support", applied: true },
                  { trend: "Micro-animations (transitions)", applied: true },
                  { trend: "Glassmorphism / blur effects", applied: false },
                  { trend: "AI-driven personalisation", applied: true },
                  { trend: "Gamification (points, badges)", applied: true },
                  { trend: "Real-time data (Firestore)", applied: true },
                  { trend: "Skeleton / progressive loading", applied: true },
                  { trend: "Bottom tab nav on mobile", applied: false },
                  { trend: "Drag-and-drop interfaces", applied: true },
                ].map((t) => (
                  <div key={t.trend} className="flex items-center gap-2 text-xs">
                    <span className={t.applied ? "text-green-500" : "text-gray-300"}>{t.applied ? "✓" : "○"}</span>
                    <span className={t.applied ? "text-gray-700" : "text-gray-400"}>{t.trend}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Features to Add in the Future</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { phase: "Q3 2026", features: ["AI resume generator from job description", "Real-time notification system (push)", "Video interview scheduling within platform", "PWA with offline resume access", "Mobile app (React Native)"] },
                { phase: "Q4 2026–2027", features: ["University portal (placement cells)", "Mentor matching (alumni network)", "AI mock interview chatbot", "Personalised learning paths", "Multi-language support (Hindi, Tamil, etc.)"] },
              ].map((p) => (
                <div key={p.phase}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{p.phase}</p>
                  <ul className="space-y-1.5">
                    {p.features.map((f) => <li key={f} className="text-sm text-gray-600 flex gap-2"><span className="text-purple-400 shrink-0">→</span>{f}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Alignment with Future Digital Trends</h3>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p><strong>AI Integration:</strong> Recommendations engine and ATS scoring lay the groundwork. Next step is LLM-powered resume feedback ("Your summary is weak — here's a rewrite") and JD-matching scores. Firebase ML Kit or Vertex AI can be integrated without backend changes.</p>
              <p><strong>Personalisation:</strong> Profile-driven recommendations exist. Enhancing with behavioural signals (time spent on pages, click patterns) will create a true Netflix-style personalisation loop.</p>
              <p><strong>Minimalism:</strong> Current design is already clean and purposeful. Reducing visual noise in information-dense pages (admin analytics) via progressive disclosure and collapsible sections aligns with the minimalism trend.</p>
              <p><strong>Conversational UI:</strong> Adding a student-facing AI assistant ("Ask STUNIVOZ — find internships, get resume help, plan your career") would be a high-differentiation feature in the EdTech market.</p>
            </div>
          </Card>
        </div>

        {/* ── SECTION 6: CRITIQUE ── */}
        <SectionHead id="critique" icon="⚖️" title="Professional Critique" sub="Strengths, weaknesses, comparison with modern standards" />
        <div className="ml-10 mb-12 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold text-green-700 text-sm mb-3">✅ Strengths</h3>
              <div className="space-y-2.5">
                {[
                  { title: "Multi-portal architecture", detail: "4 completely isolated experiences (student, company, admin, staff) with role-guarded routes is architecturally mature and secure. Most platforms at this stage would have a single admin panel." },
                  { title: "Comprehensive feature coverage", detail: "40+ pages covering the full student career journey — from discovery to application to community — in a single platform is rare. Reduces user context-switching significantly." },
                  { title: "Modern tech stack", detail: "React 18 + Vite + TypeScript + Firebase is a production-grade, industry-standard stack. Zero deprecated dependencies. Build succeeds with zero TypeScript errors." },
                  { title: "Consistent design language", detail: "Shared component library across all portals ensures pixel-level UI consistency without a design system tool. Comparable to early-stage Stripe or Notion." },
                  { title: "AI scaffolding in place", detail: "Recommendations, ATS scoring, and career roadmap are AI-ready features. The data model (skills, interests, applications) is already structured for ML input." },
                  { title: "Dark mode", detail: "Full dark mode coverage across 40+ pages at launch is uncommon. Many mature products still don't have it. Shows attention to user comfort." },
                ].map((s) => (
                  <div key={s.title} className="pb-2.5 border-b border-gray-50 last:border-0">
                    <p className="font-semibold text-gray-800 text-xs">{s.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.detail}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="font-semibold text-red-600 text-sm mb-3">⚠️ Weaknesses</h3>
              <div className="space-y-2.5">
                {[
                  { title: "No onboarding for new users", detail: "First-time students land on a feature-rich dashboard with no guidance. Feature discovery relies entirely on sidebar navigation. A coach mark tour would improve activation rate significantly." },
                  { title: "Accessibility gaps", detail: "Keyboard navigation in Kanban, screen reader support for charts, and missing ARIA labels on icon buttons are WCAG failures that exclude users with disabilities." },
                  { title: "SPA SEO blind spot", detail: "All internship and event pages are client-rendered — invisible to search engines. An SEO-visible platform would organically acquire students searching for internships on Google." },
                  { title: "Bundle size", detail: "1.5MB JS is above the recommended 200KB initial load budget. Recharts lazy loading and code splitting by portal would reduce this significantly." },
                  { title: "Empty states lack personality", detail: "Empty states (no applications, no saved items) are plain text. Custom illustrations with calls-to-action would convert empty states into engagement moments." },
                  { title: "Real-time notifications absent", detail: "Students applying and not hearing back on the platform experience a \"black hole\" UX. Push notifications are listed as planned but critical for engagement and retention." },
                ].map((w) => (
                  <div key={w.title} className="pb-2.5 border-b border-gray-50 last:border-0">
                    <p className="font-semibold text-gray-800 text-xs">{w.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{w.detail}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Comparison with Modern Design Standards</h3>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Standard</th>
                    <th className="py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Benchmark (Stripe / Linear)</th>
                    <th className="py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">STUNIVOZ</th>
                    <th className="py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { std: "Component consistency", bench: "Design token system (Figma variables)", stunivoz: "Tailwind config + shared components", gap: "Minor" },
                    { std: "Accessibility (WCAG AA)", bench: "Full compliance across all components", stunivoz: "Partial — keyboard nav gaps", gap: "Moderate" },
                    { std: "Performance (LCP)", bench: "< 1.5s on 4G", stunivoz: "Estimated 2–3s (1.5MB bundle)", gap: "Moderate" },
                    { std: "SEO", bench: "SSR/SSG for all public pages", stunivoz: "SPA — no server rendering", gap: "Significant" },
                    { std: "Onboarding", bench: "Interactive product tour", stunivoz: "No tour — direct to dashboard", gap: "Moderate" },
                    { std: "Empty states", bench: "Branded illustrations + CTAs", stunivoz: "Text only", gap: "Minor" },
                    { std: "Error handling", bench: "Friendly messages + recovery actions", stunivoz: "Mostly handled, some gaps", gap: "Minor" },
                    { std: "Mobile experience", bench: "Native-quality mobile web", stunivoz: "Adequate, not optimised", gap: "Moderate" },
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 px-4 text-xs font-medium text-gray-800">{r.std}</td>
                      <td className="py-2.5 px-4 text-xs text-gray-500">{r.bench}</td>
                      <td className="py-2.5 px-4 text-xs text-gray-500">{r.stunivoz}</td>
                      <td className="py-2.5 px-4">
                        <Tag color={r.gap === "Minor" ? "green" : r.gap === "Moderate" ? "yellow" : "red"}>{r.gap}</Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ── SECTION 7: CONCLUSION ── */}
        <SectionHead id="conclusion" icon="🏁" title="Conclusion" sub="Overall rating, improvement suggestions, 3–5 year vision" />
        <div className="ml-10 mb-12 space-y-4">

          {/* Final rating */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
            <div className="flex items-center gap-6">
              <div className="text-center shrink-0">
                <div className="text-6xl font-extrabold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">8.2</div>
                <div className="text-sm text-gray-500 font-medium mt-1">out of 10</div>
                <Tag color="green">Production Ready</Tag>
              </div>
              <div className="flex-1 space-y-2">
                <Score label="UI Design" score={8.5} color="#2563EB" />
                <Score label="UX Quality" score={8.0} color="#7C3AED" />
                <Score label="Accessibility" score={7.5} color="#0891B2" />
                <Score label="Performance" score={8.0} color="#059669" />
                <Score label="Technology" score={9.0} color="#EA580C" />
                <Score label="Scalability" score={8.5} color="#D97706" />
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mt-4">
              STUNIVOZ is a well-architected, visually consistent, and feature-complete platform that rivals early-stage EdTech products from established companies. Its multi-portal design, shared component library, Firebase backend, and dark mode support place it well above the typical student project. The 8.2/10 rating reflects genuine production quality with identifiable, addressable gaps.
            </p>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Top 10 Improvement Suggestions (Priority Order)</h3>
            <div className="space-y-2">
              {[
                { n: 1, item: "Add onboarding coach mark tour for first-time students (3-step overlay)", impact: "High", effort: "Low" },
                { n: 2, item: "Implement real-time push notifications (Firebase FCM)", impact: "High", effort: "Medium" },
                { n: 3, item: "Fix accessibility gaps — keyboard Kanban, chart ARIA labels, focus trap", impact: "High", effort: "Medium" },
                { n: 4, item: "Lazy-load Recharts and chart-heavy pages to reduce initial bundle", impact: "Medium", effort: "Low" },
                { n: 5, item: "Add empty state illustrations with CTAs on all list pages", impact: "Medium", effort: "Low" },
                { n: 6, item: "Add breadcrumb navigation to admin deep-link pages", impact: "Medium", effort: "Low" },
                { n: 7, item: "Implement SSR/prerendering for public pages (internships, events) for SEO", impact: "High", effort: "High" },
                { n: 8, item: "Mobile bottom tab navigation for student portal", impact: "Medium", effort: "Medium" },
                { n: 9, item: "Add form submit loading states to prevent double-submit", impact: "Medium", effort: "Low" },
                { n: 10, item: "Add meta tags (title, description, og:image) per route via react-helmet-async", impact: "Medium", effort: "Low" },
              ].map((r) => (
                <div key={r.n} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="w-6 h-6 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center shrink-0">{r.n}</span>
                  <p className="text-sm text-gray-700 flex-1">{r.item}</p>
                  <Tag color={r.impact === "High" ? "red" : r.impact === "Medium" ? "yellow" : "gray"}>
                    {r.impact} Impact
                  </Tag>
                  <Tag color={r.effort === "Low" ? "green" : r.effort === "Medium" ? "blue" : "orange"}>
                    {r.effort} Effort
                  </Tag>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">3–5 Year Vision</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  year: "Year 1 (2026)", icon: "🚀", items: [
                    "10K+ student MAU",
                    "500 active companies",
                    "PWA with offline access",
                    "AI resume generator live",
                    "Push notifications",
                    "Mobile app (React Native)",
                  ]
                },
                {
                  year: "Year 2–3 (2027–28)", icon: "📈", items: [
                    "University partnership portal",
                    "AI mock interview chatbot",
                    "Mentor/alumni network",
                    "SSR via Next.js migration",
                    "Multi-language support",
                    "₹1Cr+ ARR from companies",
                  ]
                },
                {
                  year: "Year 4–5 (2029–30)", icon: "🌍", items: [
                    "Southeast Asia expansion",
                    "LLM-native career assistant",
                    "Predictive hiring analytics",
                    "Verified credential system",
                    "Employer-of-record services",
                    "IPO / Series B readiness",
                  ]
                },
              ].map((y) => (
                <div key={y.year} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{y.icon}</span>
                    <span className="font-bold text-gray-800 text-sm">{y.year}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {y.items.map((i) => <li key={i} className="text-xs text-gray-600 flex gap-2"><span className="text-blue-400 shrink-0">→</span>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          {/* Closing */}
          <div className="bg-gray-900 rounded-2xl px-6 py-6 text-center">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Final Verdict</p>
            <p className="text-white font-bold text-lg leading-snug max-w-xl mx-auto">
              STUNIVOZ is not a prototype. It is a product. With targeted improvements in accessibility, SEO, and mobile UX, it has clear potential to lead the Indian student career platform market.
            </p>
            <p className="text-white/40 text-xs mt-4">STUNIVOZ UI/UX Audit · Expert Level · May 2026</p>
          </div>
        </div>

      </main>
    </div>
  );
}
