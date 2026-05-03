const flows = [
  {
    portal: "Student Portal",
    emoji: "🎓",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    loginMethod: "Google OAuth / GitHub OAuth / Email+Password",
    loginUrl: "/login",
    journeys: [
      {
        title: "Onboarding",
        icon: "1",
        steps: [
          "User opens STUNIVOZ homepage ( / )",
          "Clicks "Get Started" → routed to /signup",
          "Fills name, email, password → account created in Firebase Auth",
          "Profile document created in Firestore under users/{uid}",
          "Redirected to /dashboard (first login shows welcome tour)",
        ],
      },
      {
        title: "Internship Discovery & Apply",
        icon: "2",
        steps: [
          "From Dashboard, clicks "Find Internships" → /internships",
          "Searches by keyword; filters by domain, location, stipend, remote",
          "Clicks internship card → detail modal opens",
          "Clicks "Apply Now" → application saved to applications/{id} in Firestore",
          "Status set to applied; confirmation toast shown",
          "Returns to /dashboard → "My Applications" section updates",
        ],
      },
      {
        title: "Resume Builder & ATS Score",
        icon: "3",
        steps: [
          "Navigates to /resume from sidebar",
          "Option A — Upload PDF: file stored in Firebase Storage",
          "Option B — Build from scratch: fills personal info, education, skills, projects",
          "Clicks "Analyze Resume" → Cloud Function runs ATS scoring",
          "Receives score (0–100), keyword matches, and improvement suggestions",
          "Downloads polished PDF or shares public link",
        ],
      },
      {
        title: "Career Roadmap",
        icon: "4",
        steps: [
          "Navigates to /career from sidebar",
          "Selects career path (e.g., Full Stack Developer, Data Scientist)",
          "Platform shows step-by-step roadmap with skills, resources, timeline",
          "Marks steps as complete → progress saved in Firestore",
          "Earns XP points and badges for completed milestones",
          "Leaderboard updates with new rank",
        ],
      },
      {
        title: "AI Recommendations",
        icon: "5",
        steps: [
          "Navigates to /recommendations",
          "Platform reads profile: skills, career interest, past applications",
          "AI engine returns ranked internship + course suggestions",
          "User saves or applies directly from recommendation card",
          "Feedback loop: "Not Relevant" button improves future suggestions",
        ],
      },
      {
        title: "Events & Community",
        icon: "6",
        steps: [
          "Events: /events → filter by type (hackathon/webinar/workshop)",
          "Clicks "Register" → EventRegistration document created in Firestore",
          "Community: /community → sees post feed from all students",
          "Writes a post, adds image, publishes → visible to all",
          "Likes/comments on others' posts in real time",
        ],
      },
    ],
  },
  {
    portal: "Company Portal",
    emoji: "🏢",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    loginMethod: "Email + Password only (no social login)",
    loginUrl: "/provider/login",
    journeys: [
      {
        title: "Company Onboarding",
        icon: "1",
        steps: [
          "Company representative opens /provider/login",
          "Enters registered company email + password",
          "Firebase Auth verifies; role checked → must be provider",
          "RoleRoute confirms access → redirected to /provider/dashboard",
          "Dashboard shows KPI summary: posted internships, total applicants, hired count",
        ],
      },
      {
        title: "Post an Internship (3-Step Wizard)",
        icon: "2",
        steps: [
          "Clicks "Post New Internship" → /provider/post-internship",
          "Step 1 — Basic Info: role title, domain, stipend, duration, remote toggle",
          "Step 2 — Requirements: skills required, description, responsibilities",
          "Step 3 — Preview: full preview of listing before publish",
          "Clicks "Publish" → internship document created in Firestore",
          "Internship appears on student portal immediately",
        ],
      },
      {
        title: "Applicant Management (Kanban ATS)",
        icon: "3",
        steps: [
          "Navigates to /provider/applicants",
          "Sees Kanban board with columns: Applied → Shortlisted → Interview → Hired / Rejected",
          "Clicks applicant card → sees student profile, resume, ATS score",
          "Drags card to next stage → application.status updated in Firestore",
          "Student receives notification of status change",
          "Final decision: Hired or Rejected → pipeline complete",
        ],
      },
      {
        title: "Post an Event",
        icon: "4",
        steps: [
          "Navigates to /provider/post-event",
          "Fills event title, type, date, location, virtual toggle, registration link",
          "Clicks "Publish" → event document added to Firestore",
          "Event appears in student /events feed",
        ],
      },
    ],
  },
  {
    portal: "Admin Panel",
    emoji: "🛡️",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    loginMethod: "Email + Password only — no public registration",
    loginUrl: "/admin/login",
    journeys: [
      {
        title: "Admin Login",
        icon: "1",
        steps: [
          "Admin navigates to /admin/login",
          "Enters admin credentials (created manually in Firebase)",
          "Firebase Auth verifies; role must be admin",
          "RoleRoute confirms → redirected to /admin/dashboard",
          "Dashboard shows live stats: total users, internships, revenue, activity feed",
        ],
      },
      {
        title: "User Management",
        icon: "2",
        steps: [
          "Opens /admin/users → paginated list of all users with filters",
          "Searches by name, email, role, or college",
          "Clicks user row → full profile modal with activity history",
          "Actions available: Verify Account, Ban User, Reset Password, Export",
          "Ban action sets user.status = banned → user immediately logged out",
          "All actions written to audit_logs collection in Firestore",
        ],
      },
      {
        title: "Internship & Content Moderation",
        icon: "3",
        steps: [
          "Opens /admin/internships → all company postings with status filter",
          "Reviews pending postings (requires_review flag)",
          "Approves → status = active; company notified",
          "Rejects with reason → status = rejected; company notified",
          "Can edit or permanently remove any listing",
        ],
      },
      {
        title: "Analytics & Reports",
        icon: "4",
        steps: [
          "Opens /admin/analytics → full platform metrics dashboard",
          "Views charts: DAU/MAU, signups over time, application funnel, revenue",
          "Applies date range filter to narrow data",
          "Exports CSV report for any metric",
          "Opens /admin/reports → user-submitted reports queue",
          "Reviews each report, takes action (warn/ban/dismiss), closes ticket",
        ],
      },
      {
        title: "Security & Configuration",
        icon: "5",
        steps: [
          "Opens /admin/security → IP whitelist, login attempt logs, 2FA settings",
          "Opens /admin/api-keys → generate, revoke third-party API keys",
          "Opens /admin/billing → subscription plans, invoices, revenue tracking",
          "Opens /admin/announcements → broadcast message to all users or specific roles",
          "Opens /admin/settings → platform-wide configuration (maintenance mode, etc.)",
        ],
      },
      {
        title: "Staff Management",
        icon: "6",
        steps: [
          "Opens /admin/staff → list of all staff members",
          "Creates new staff account (email-only, no self-registration)",
          "Assigns moderation scope and permissions",
          "Reviews staff activity and moderation history",
        ],
      },
    ],
  },
  {
    portal: "Staff Panel",
    emoji: "👥",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    loginMethod: "Email + Password only — accounts created by Admin",
    loginUrl: "/staff/login",
    journeys: [
      {
        title: "Staff Login",
        icon: "1",
        steps: [
          "Staff member opens /staff/login",
          "Enters credentials assigned by Admin",
          "Role verified as staff → redirected to /staff/dashboard",
          "Dashboard shows moderation queue size, pending verifications, flagged content count",
        ],
      },
      {
        title: "Reports Queue",
        icon: "2",
        steps: [
          "Opens /staff/reports → sorted by severity (High → Low)",
          "Clicks report → full context: reporter info, reported content, history",
          "Options: Dismiss (no action), Warn User, Remove Content, Escalate to Admin",
          "Resolution saved to Firestore; reporter notified of outcome",
          "Escalated reports appear in Admin panel automatically",
        ],
      },
      {
        title: "Account Verification",
        icon: "3",
        steps: [
          "Opens /staff/verification → pending student and company accounts",
          "Checks submitted documents (college ID, company registration, etc.)",
          "Clicks "Verify" → user.verified = true; verified badge shown on profile",
          "Clicks "Reject" with reason → user notified to resubmit",
        ],
      },
      {
        title: "Content Moderation",
        icon: "4",
        steps: [
          "Opens /staff/content → flagged posts and comments queue",
          "Reviews each item for policy violations",
          "Actions: Keep (clear flag), Edit, Remove, Ban Author",
          "Bulk actions available for spam cleanup",
          "Content removal triggers user notification with policy reference",
        ],
      },
    ],
  },
];

const Section = ({
  number,
  title,
  steps,
  accentColor,
  bg,
  border,
}: {
  number: string;
  title: string;
  steps: string[];
  accentColor: string;
  bg: string;
  border: string;
}) => (
  <div className="mb-5">
    <div className="flex items-center gap-2.5 mb-2.5">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ background: accentColor }}
      >
        {number}
      </div>
      <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
    </div>
    <div
      className="rounded-xl border ml-8 overflow-hidden"
      style={{ borderColor: border, background: bg }}
    >
      {steps.map((step, i) => (
        <div
          key={i}
          className="flex gap-3 px-4 py-2.5 border-b last:border-0"
          style={{ borderColor: border }}
        >
          <span className="text-xs font-mono shrink-0 mt-0.5" style={{ color: accentColor, opacity: 0.6 }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <p className="text-sm text-gray-700 leading-snug">{step}</p>
        </div>
      ))}
    </div>
  </div>
);

export function WrittenFlow() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold">S</span>
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 leading-tight">STUNIVOZ — Complete App Flow</h1>
            <p className="text-xs text-gray-400 leading-tight">Step-by-step user journey across all 4 portals</p>
          </div>
          <div className="ml-auto flex gap-2">
            <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">4 Portals</span>
            <span className="bg-purple-50 text-purple-600 text-xs font-semibold px-3 py-1 rounded-full border border-purple-100">19 Journeys</span>
            <span className="bg-green-50 text-green-600 text-xs font-semibold px-3 py-1 rounded-full border border-green-100">80+ Steps</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-4xl mx-auto space-y-10">
        {flows.map((portal) => (
          <div key={portal.portal}>
            {/* Portal header */}
            <div
              className="rounded-2xl px-6 py-5 mb-6 flex items-start gap-4"
              style={{ background: portal.color }}
            >
              <span className="text-3xl shrink-0">{portal.emoji}</span>
              <div className="flex-1">
                <h2 className="text-xl font-extrabold text-white leading-tight">{portal.portal}</h2>
                <div className="flex flex-wrap gap-3 mt-2">
                  <div className="bg-white/15 rounded-lg px-3 py-1.5">
                    <p className="text-white/60 text-[10px] font-medium uppercase tracking-wide">Login URL</p>
                    <p className="text-white font-mono text-xs">{portal.loginUrl}</p>
                  </div>
                  <div className="bg-white/15 rounded-lg px-3 py-1.5">
                    <p className="text-white/60 text-[10px] font-medium uppercase tracking-wide">Auth Method</p>
                    <p className="text-white text-xs">{portal.loginMethod}</p>
                  </div>
                  <div className="bg-white/15 rounded-lg px-3 py-1.5">
                    <p className="text-white/60 text-[10px] font-medium uppercase tracking-wide">Journeys</p>
                    <p className="text-white text-xs font-bold">{portal.journeys.length} user flows</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Journeys */}
            <div className="space-y-2">
              {portal.journeys.map((journey) => (
                <Section
                  key={journey.title}
                  number={journey.icon}
                  title={journey.title}
                  steps={journey.steps}
                  accentColor={portal.color}
                  bg={portal.bg}
                  border={portal.border}
                />
              ))}
            </div>

            {/* Divider */}
            <div className="mt-8 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          </div>
        ))}

        {/* Cross-portal interactions */}
        <div>
          <div className="rounded-2xl bg-gray-900 px-6 py-5 mb-6">
            <h2 className="text-xl font-extrabold text-white">🔗 Cross-Portal Interactions</h2>
            <p className="text-white/50 text-sm mt-1">How different portals trigger actions in each other</p>
          </div>
          <div className="space-y-3">
            {[
              {
                from: "🏢 Company",
                action: "publishes internship",
                to: "🎓 Student",
                result: "Internship appears in /internships feed immediately",
                color: "#7C3AED",
              },
              {
                from: "🎓 Student",
                action: "submits application",
                to: "🏢 Company",
                result: "Applicant card appears in company Kanban board under "Applied"",
                color: "#2563EB",
              },
              {
                from: "🏢 Company",
                action: "moves applicant to Shortlisted",
                to: "🎓 Student",
                result: "Student receives real-time notification: "You've been shortlisted!"",
                color: "#7C3AED",
              },
              {
                from: "🎓 Student",
                action: "files a report",
                to: "👥 Staff",
                result: "Report appears in /staff/reports queue sorted by severity",
                color: "#2563EB",
              },
              {
                from: "👥 Staff",
                action: "escalates report",
                to: "🛡️ Admin",
                result: "Escalated report appears in /admin/reports with ESCALATED tag",
                color: "#059669",
              },
              {
                from: "🛡️ Admin",
                action: "bans a user",
                to: "All Portals",
                result: "User session invalidated; login blocked; content hidden platform-wide",
                color: "#DC2626",
              },
              {
                from: "🛡️ Admin",
                action: "sends announcement",
                to: "🎓 Student",
                result: "Notification banner appears on student dashboard immediately",
                color: "#DC2626",
              },
              {
                from: "🏢 Company",
                action: "posts event",
                to: "🎓 Student",
                result: "Event appears in /events feed with company branding",
                color: "#7C3AED",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 px-5 py-3.5 flex items-center gap-3">
                <span className="text-sm font-semibold" style={{ color: item.color }}>{item.from}</span>
                <span className="text-gray-400 text-xs bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">{item.action}</span>
                <span className="text-gray-400 text-xs">→</span>
                <span className="text-sm font-semibold text-gray-700">{item.to}</span>
                <span className="text-gray-300 mx-1">|</span>
                <span className="text-sm text-gray-500 flex-1">{item.result}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-gray-400">STUNIVOZ App Flow · v1.0 · May 2026</p>
          <p className="text-xs text-gray-300 mt-1">4 portals · 19 journeys · 80+ documented steps</p>
        </div>
      </div>
    </div>
  );
}
