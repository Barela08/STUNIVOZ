import { useState } from "react";

type FlowNode = {
  id: string;
  label: string;
  sublabel?: string;
  type: "entry" | "screen" | "action" | "decision" | "exit";
  col: number;
  row: number;
};

type FlowEdge = {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
};

const PORTALS = ["student", "company", "admin", "staff"] as const;
type Portal = typeof PORTALS[number];

const PORTAL_META: Record<Portal, { label: string; emoji: string; color: string; bg: string; light: string; border: string; text: string }> = {
  student: {
    label: "Student Portal",
    emoji: "🎓",
    color: "#3B82F6",
    bg: "bg-blue-600",
    light: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
  },
  company: {
    label: "Company Portal",
    emoji: "🏢",
    color: "#7C3AED",
    bg: "bg-purple-600",
    light: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
  },
  admin: {
    label: "Admin Panel",
    emoji: "🛡️",
    color: "#DC2626",
    bg: "bg-red-600",
    light: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
  },
  staff: {
    label: "Staff Panel",
    emoji: "👥",
    color: "#059669",
    bg: "bg-emerald-600",
    light: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
};

// ── Flow data per portal ──────────────────────────────────────

const STUDENT_FLOW: { nodes: FlowNode[]; edges: FlowEdge[] } = {
  nodes: [
    { id: "s0", label: "Landing Page", sublabel: "/", type: "entry", col: 0, row: 0 },
    { id: "s1", label: "Login / Signup", sublabel: "/login · /signup", type: "screen", col: 0, row: 1 },
    { id: "s2", label: "Dashboard", sublabel: "/dashboard", type: "screen", col: 0, row: 2 },
    { id: "s3", label: "Internships", sublabel: "/internships", type: "screen", col: -2, row: 3 },
    { id: "s4", label: "Resume Builder", sublabel: "/resume", type: "screen", col: -1, row: 3 },
    { id: "s5", label: "Profile", sublabel: "/profile", type: "screen", col: 0, row: 3 },
    { id: "s6", label: "Events", sublabel: "/events", type: "screen", col: 1, row: 3 },
    { id: "s7", label: "Courses", sublabel: "/courses", type: "screen", col: 2, row: 3 },
    { id: "s8", label: "Apply", sublabel: "Application submitted", type: "action", col: -2, row: 4 },
    { id: "s9", label: "ATS Score", sublabel: "AI analysis", type: "action", col: -1, row: 4 },
    { id: "s10", label: "Career Roadmap", sublabel: "/career", type: "screen", col: 1, row: 4 },
    { id: "s11", label: "Community", sublabel: "/community", type: "screen", col: 2, row: 4 },
    { id: "s12", label: "Track Status", sublabel: "Applied → Shortlisted", type: "action", col: -2, row: 5 },
    { id: "s13", label: "AI Recommendations", sublabel: "/recommendations", type: "screen", col: 0, row: 4 },
    { id: "s14", label: "Notifications", sublabel: "Real-time alerts", type: "action", col: 0, row: 5 },
    { id: "s15", label: "Settings", sublabel: "/settings", type: "screen", col: 2, row: 5 },
  ],
  edges: [
    { from: "s0", to: "s1" },
    { from: "s1", to: "s2", label: "Authenticated" },
    { from: "s2", to: "s3" },
    { from: "s2", to: "s4" },
    { from: "s2", to: "s5" },
    { from: "s2", to: "s6" },
    { from: "s2", to: "s7" },
    { from: "s3", to: "s8" },
    { from: "s4", to: "s9" },
    { from: "s6", to: "s10" },
    { from: "s7", to: "s11" },
    { from: "s8", to: "s12" },
    { from: "s2", to: "s13" },
    { from: "s13", to: "s14" },
    { from: "s11", to: "s15", dashed: true },
  ],
};

const COMPANY_FLOW: { nodes: FlowNode[]; edges: FlowEdge[] } = {
  nodes: [
    { id: "c0", label: "Company Login", sublabel: "/provider/login", type: "entry", col: 0, row: 0 },
    { id: "c1", label: "Provider Dashboard", sublabel: "/provider/dashboard", type: "screen", col: 0, row: 1 },
    { id: "c2", label: "Post Internship", sublabel: "/provider/post-internship", type: "screen", col: -1, row: 2 },
    { id: "c3", label: "Applicants (ATS)", sublabel: "/provider/applicants", type: "screen", col: 0, row: 2 },
    { id: "c4", label: "Post Event", sublabel: "/provider/post-event", type: "screen", col: 1, row: 2 },
    { id: "c5", label: "Step 1: Basic Info", sublabel: "Role, stipend, duration", type: "action", col: -2, row: 3 },
    { id: "c6", label: "Step 2: Requirements", sublabel: "Skills, description", type: "action", col: -1, row: 3 },
    { id: "c7", label: "Step 3: Preview", sublabel: "Review & publish", type: "action", col: 0, row: 3 },
    { id: "c8", label: "Kanban Board", sublabel: "Applied → Shortlisted → Hired", type: "screen", col: 1, row: 3 },
    { id: "c9", label: "Published ✓", sublabel: "Live on platform", type: "exit", col: -1, row: 4 },
    { id: "c10", label: "Move Applicant", sublabel: "Drag & drop stages", type: "action", col: 1, row: 4 },
    { id: "c11", label: "Analytics", sublabel: "/provider/analytics", type: "screen", col: 2, row: 2 },
    { id: "c12", label: "Hired / Rejected", sublabel: "Final decision", type: "exit", col: 1, row: 5 },
  ],
  edges: [
    { from: "c0", to: "c1", label: "Email/password" },
    { from: "c1", to: "c2" },
    { from: "c1", to: "c3" },
    { from: "c1", to: "c4" },
    { from: "c1", to: "c11" },
    { from: "c2", to: "c5" },
    { from: "c5", to: "c6" },
    { from: "c6", to: "c7" },
    { from: "c7", to: "c9" },
    { from: "c3", to: "c8" },
    { from: "c8", to: "c10" },
    { from: "c10", to: "c12" },
  ],
};

const ADMIN_FLOW: { nodes: FlowNode[]; edges: FlowEdge[] } = {
  nodes: [
    { id: "a0", label: "Admin Login", sublabel: "/admin/login", type: "entry", col: 0, row: 0 },
    { id: "a1", label: "Admin Dashboard", sublabel: "/admin/dashboard", type: "screen", col: 0, row: 1 },
    { id: "a2", label: "User Management", sublabel: "/admin/users", type: "screen", col: -2, row: 2 },
    { id: "a3", label: "Internship Control", sublabel: "/admin/internships", type: "screen", col: -1, row: 2 },
    { id: "a4", label: "Analytics", sublabel: "/admin/analytics", type: "screen", col: 0, row: 2 },
    { id: "a5", label: "Security", sublabel: "/admin/security", type: "screen", col: 1, row: 2 },
    { id: "a6", label: "Billing", sublabel: "/admin/billing", type: "screen", col: 2, row: 2 },
    { id: "a7", label: "Ban / Verify User", sublabel: "RBAC action", type: "action", col: -2, row: 3 },
    { id: "a8", label: "Approve / Reject", sublabel: "Internship posting", type: "action", col: -1, row: 3 },
    { id: "a9", label: "Reports & Exports", sublabel: "CSV / PDF download", type: "action", col: 0, row: 3 },
    { id: "a10", label: "API Keys", sublabel: "/admin/api-keys", type: "screen", col: 1, row: 3 },
    { id: "a11", label: "Announcements", sublabel: "/admin/announcements", type: "screen", col: 2, row: 3 },
    { id: "a12", label: "Staff Management", sublabel: "/admin/staff", type: "screen", col: 0, row: 4 },
    { id: "a13", label: "Audit Log", sublabel: "All admin actions", type: "action", col: 1, row: 4 },
  ],
  edges: [
    { from: "a0", to: "a1", label: "Email/password" },
    { from: "a1", to: "a2" },
    { from: "a1", to: "a3" },
    { from: "a1", to: "a4" },
    { from: "a1", to: "a5" },
    { from: "a1", to: "a6" },
    { from: "a2", to: "a7" },
    { from: "a3", to: "a8" },
    { from: "a4", to: "a9" },
    { from: "a5", to: "a10" },
    { from: "a6", to: "a11" },
    { from: "a1", to: "a12" },
    { from: "a7", to: "a13", dashed: true },
    { from: "a8", to: "a13", dashed: true },
  ],
};

const STAFF_FLOW: { nodes: FlowNode[]; edges: FlowEdge[] } = {
  nodes: [
    { id: "st0", label: "Staff Login", sublabel: "/staff/login", type: "entry", col: 0, row: 0 },
    { id: "st1", label: "Staff Dashboard", sublabel: "/staff/dashboard", type: "screen", col: 0, row: 1 },
    { id: "st2", label: "Reports Queue", sublabel: "/staff/reports", type: "screen", col: -1, row: 2 },
    { id: "st3", label: "Verification", sublabel: "/staff/verification", type: "screen", col: 0, row: 2 },
    { id: "st4", label: "Content Mod", sublabel: "/staff/content", type: "screen", col: 1, row: 2 },
    { id: "st5", label: "Review Report", sublabel: "Read context, decide", type: "action", col: -1, row: 3 },
    { id: "st6", label: "Verify Account", sublabel: "Student / Company", type: "action", col: 0, row: 3 },
    { id: "st7", label: "Flag / Remove", sublabel: "Post or comment", type: "action", col: 1, row: 3 },
    { id: "st8", label: "Resolve / Escalate", sublabel: "To Admin if needed", type: "exit", col: -1, row: 4 },
    { id: "st9", label: "Badge Granted", sublabel: "Verified checkmark", type: "exit", col: 0, row: 4 },
    { id: "st10", label: "Content Removed", sublabel: "User notified", type: "exit", col: 1, row: 4 },
  ],
  edges: [
    { from: "st0", to: "st1", label: "Email/password" },
    { from: "st1", to: "st2" },
    { from: "st1", to: "st3" },
    { from: "st1", to: "st4" },
    { from: "st2", to: "st5" },
    { from: "st3", to: "st6" },
    { from: "st4", to: "st7" },
    { from: "st5", to: "st8" },
    { from: "st6", to: "st9" },
    { from: "st7", to: "st10" },
  ],
};

const PORTAL_FLOWS: Record<Portal, { nodes: FlowNode[]; edges: FlowEdge[] }> = {
  student: STUDENT_FLOW,
  company: COMPANY_FLOW,
  admin: ADMIN_FLOW,
  staff: STAFF_FLOW,
};

// ── Node renderer ─────────────────────────────────────────────

function FlowNodeBox({
  node,
  color,
  lightBg,
  border,
  textColor,
  accentColor,
}: {
  node: FlowNode;
  color: string;
  lightBg: string;
  border: string;
  textColor: string;
  accentColor: string;
}) {
  const typeStyle: Record<FlowNode["type"], string> = {
    entry: `text-white font-bold`,
    screen: `text-gray-800 font-medium`,
    action: `text-gray-700`,
    decision: `text-gray-700 font-medium`,
    exit: `text-gray-500`,
  };

  const isEntry = node.type === "entry";
  const isExit = node.type === "exit";
  const isAction = node.type === "action";

  return (
    <div
      className={`relative rounded-xl px-4 py-2.5 text-center select-none shadow-sm
        ${isEntry ? `text-white` : isExit ? `bg-gray-50 border border-gray-200` : isAction ? `${lightBg} border ${border}` : `bg-white border border-gray-200`}
      `}
      style={isEntry ? { background: accentColor } : {}}
    >
      {isEntry && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <div className="w-4 h-4 rounded-full bg-white border-2" style={{ borderColor: accentColor }} />
        </div>
      )}
      {isExit && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="w-4 h-4 rounded-full bg-gray-300" />
        </div>
      )}
      <p className={`text-sm leading-tight ${typeStyle[node.type]} ${isEntry ? "text-white" : isExit ? "text-gray-400" : textColor}`}>
        {node.label}
      </p>
      {node.sublabel && (
        <p className={`text-[10px] mt-0.5 leading-tight ${isEntry ? "text-white/70" : "text-gray-400"}`}>
          {node.sublabel}
        </p>
      )}
    </div>
  );
}

// ── Portal flow diagram ───────────────────────────────────────

function PortalFlowDiagram({ portal }: { portal: Portal }) {
  const meta = PORTAL_META[portal];
  const { nodes, edges } = PORTAL_FLOWS[portal];

  // Compute grid positions
  const colValues = [...new Set(nodes.map((n) => n.col))].sort((a, b) => a - b);
  const rowValues = [...new Set(nodes.map((n) => n.row))].sort((a, b) => a - b);

  const COL_W = 160;
  const ROW_H = 110;
  const PAD_X = 20;
  const PAD_Y = 40;
  const NODE_W = 140;
  const NODE_H = 58;

  const colIndex = (col: number) => colValues.indexOf(col);
  const rowIndex = (row: number) => rowValues.indexOf(row);

  const totalW = colValues.length * COL_W + PAD_X * 2;
  const totalH = rowValues.length * ROW_H + PAD_Y * 2 + 40;

  const nodePos = (n: FlowNode) => ({
    x: PAD_X + colIndex(n.col) * COL_W + (COL_W - NODE_W) / 2,
    y: PAD_Y + 40 + rowIndex(n.row) * ROW_H,
  });

  const getNode = (id: string) => nodes.find((n) => n.id === id)!;

  return (
    <div className={`rounded-2xl border-2 ${meta.border} overflow-hidden`}>
      {/* Header */}
      <div className={`${meta.bg} px-5 py-4 flex items-center gap-3`}>
        <span className="text-2xl">{meta.emoji}</span>
        <div>
          <h3 className="text-white font-bold text-base">{meta.label}</h3>
          <p className="text-white/60 text-xs">{nodes.length} screens · {edges.length} transitions</p>
        </div>
        <div className="ml-auto flex gap-2">
          <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-1 rounded-full">
            {nodes.filter(n => n.type === "entry").length} entry
          </span>
          <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-1 rounded-full">
            {nodes.filter(n => n.type === "screen").length} screens
          </span>
          <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-1 rounded-full">
            {nodes.filter(n => n.type === "action").length} actions
          </span>
        </div>
      </div>

      {/* Flow SVG + nodes */}
      <div className={`${meta.light} relative`} style={{ width: totalW, height: totalH }}>
        {/* SVG edges */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={totalW}
          height={totalH}
          style={{ overflow: "visible" }}
        >
          <defs>
            <marker
              id={`arrow-${portal}`}
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L8,3 z" fill={meta.color} opacity="0.6" />
            </marker>
          </defs>
          {edges.map((edge, i) => {
            const fromNode = getNode(edge.from);
            const toNode = getNode(edge.to);
            if (!fromNode || !toNode) return null;
            const fp = nodePos(fromNode);
            const tp = nodePos(toNode);

            const x1 = fp.x + NODE_W / 2;
            const y1 = fp.y + NODE_H;
            const x2 = tp.x + NODE_W / 2;
            const y2 = tp.y;

            const midY = (y1 + y2) / 2;
            const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

            return (
              <g key={i}>
                <path
                  d={d}
                  fill="none"
                  stroke={meta.color}
                  strokeWidth={edge.dashed ? 1.5 : 1.5}
                  strokeDasharray={edge.dashed ? "5,4" : undefined}
                  opacity={0.45}
                  markerEnd={`url(#arrow-${portal})`}
                />
                {edge.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={midY - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fill={meta.color}
                    opacity={0.7}
                    fontFamily="system-ui, sans-serif"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = nodePos(node);
          return (
            <div
              key={node.id}
              className="absolute"
              style={{ left: pos.x, top: pos.y, width: NODE_W }}
            >
              <FlowNodeBox
                node={node}
                color={meta.color}
                lightBg={meta.light}
                border={meta.border}
                textColor={meta.text}
                accentColor={meta.color}
              />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className={`border-t ${meta.border} px-5 py-3 bg-white flex items-center gap-5 flex-wrap`}>
        {[
          { type: "entry", label: "Entry Point", style: "bg-gray-600 text-white" },
          { type: "screen", label: "Screen / Page", style: "bg-white border border-gray-200 text-gray-700" },
          { type: "action", label: "Action / Step", style: `${meta.light} border ${meta.border} ${meta.text}` },
          { type: "exit", label: "Terminal State", style: "bg-gray-50 border border-gray-200 text-gray-400" },
        ].map((l) => (
          <div key={l.type} className="flex items-center gap-1.5">
            <div className={`w-5 h-4 rounded text-[9px] flex items-center justify-center ${l.style}`}>■</div>
            <span className="text-xs text-gray-500">{l.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <svg width="30" height="12"><line x1="0" y1="6" x2="22" y2="6" stroke={meta.color} strokeWidth="1.5" opacity="0.5"/><polygon points="22,3 30,6 22,9" fill={meta.color} opacity="0.5"/></svg>
            <span className="text-xs text-gray-400">Navigate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="30" height="12"><line x1="0" y1="6" x2="22" y2="6" stroke={meta.color} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5"/><polygon points="22,3 30,6 22,9" fill={meta.color} opacity="0.5"/></svg>
            <span className="text-xs text-gray-400">Optional</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Authentication gate diagram ───────────────────────────────

function AuthGateFlow() {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
      <div className="bg-gray-800 px-5 py-4">
        <h3 className="text-white font-bold text-base">🔐 Authentication & Role Routing</h3>
        <p className="text-white/50 text-xs">How users reach their portal from the public entry point</p>
      </div>
      <div className="p-6">
        <div className="flex flex-col items-center gap-0">
          {/* Entry */}
          <div className="bg-gray-800 text-white rounded-xl px-6 py-3 text-sm font-bold text-center">
            🌐 User visits STUNIVOZ
          </div>
          <Arrow />
          {/* Decision: Login page */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl px-6 py-2.5 text-sm font-medium text-amber-800 text-center">
            ◇ Which portal?
          </div>
          {/* 4 branches */}
          <div className="flex gap-6 mt-4">
            {[
              { label: "/login", sub: "Google / GitHub / Email", color: "blue", portal: "Student" },
              { label: "/provider/login", sub: "Email/password only", color: "purple", portal: "Company" },
              { label: "/admin/login", sub: "Email/password only", color: "red", portal: "Admin" },
              { label: "/staff/login", sub: "Email/password only", color: "emerald", portal: "Staff" },
            ].map((b) => (
              <div key={b.portal} className="flex flex-col items-center gap-2">
                <div className={`h-8 w-px bg-${b.color}-200`} />
                <div className={`bg-${b.color}-600 text-white rounded-xl px-4 py-2 text-center`}>
                  <p className="text-xs font-bold">{b.portal}</p>
                  <p className="text-[10px] opacity-70 font-mono">{b.label}</p>
                </div>
                <div className={`h-4 w-px bg-${b.color}-200`} />
                <div className={`bg-${b.color}-50 border border-${b.color}-200 text-${b.color}-700 rounded-lg px-3 py-1.5 text-center`}>
                  <p className="text-[10px]">{b.sub}</p>
                </div>
                <Arrow small />
                <div className={`bg-${b.color}-100 border border-${b.color}-300 text-${b.color}-800 rounded-xl px-3 py-2 text-center`}>
                  <p className="text-xs font-semibold">RoleRoute ✓</p>
                  <p className="text-[10px] opacity-60">Verified & redirected</p>
                </div>
              </div>
            ))}
          </div>
          {/* Bottom note */}
          <div className="mt-6 bg-gray-50 border border-gray-100 rounded-xl px-6 py-3 text-center max-w-md">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">RoleRoute</span> component checks <code className="bg-gray-100 px-1 rounded text-[11px]">profile.role</code> from Firebase and redirects unauthorized users back to their portal's login page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Arrow({ small }: { small?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`${small ? "h-4" : "h-5"} w-px bg-gray-300`} />
      <svg width="12" height="8" viewBox="0 0 12 8">
        <polygon points="0,0 12,0 6,8" fill="#9CA3AF" />
      </svg>
    </div>
  );
}

// ── System overview diagram ───────────────────────────────────

function SystemOverview() {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4">
        <h3 className="text-white font-bold text-base">🏗️ System Data Flow</h3>
        <p className="text-white/60 text-xs">How portals interact with Firebase backend</p>
      </div>
      <div className="p-5">
        {/* 3 layers */}
        <div className="flex flex-col gap-4">
          {/* Frontend layer */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Frontend (React + Vite)</p>
            <div className="flex gap-3">
              {[
                { label: "Student Portal", color: "blue" },
                { label: "Company Portal", color: "purple" },
                { label: "Admin Panel", color: "red" },
                { label: "Staff Panel", color: "emerald" },
              ].map((p) => (
                <div key={p.label} className={`flex-1 bg-${p.color}-50 border border-${p.color}-200 rounded-xl px-3 py-2.5 text-center`}>
                  <p className={`text-xs font-semibold text-${p.color}-700`}>{p.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">React Router v6</p>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow down */}
          <div className="flex justify-around">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-5 w-px bg-gray-300" />
                <svg width="10" height="6"><polygon points="0,0 10,0 5,6" fill="#9CA3AF" /></svg>
              </div>
            ))}
          </div>

          {/* Firebase layer */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Firebase Backend (BaaS)</p>
            <div className="flex gap-3">
              {[
                { label: "Firebase Auth", sub: "OAuth + Email/Pass", icon: "🔑" },
                { label: "Firestore", sub: "NoSQL database", icon: "🗄️" },
                { label: "Storage", sub: "Files, resumes, images", icon: "📦" },
                { label: "Cloud Functions", sub: "Serverless logic", icon: "⚡" },
              ].map((s) => (
                <div key={s.label} className="flex-1 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5 text-center">
                  <p className="text-base mb-0.5">{s.icon}</p>
                  <p className="text-xs font-semibold text-orange-700">{s.label}</p>
                  <p className="text-[10px] text-gray-400">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow down */}
          <div className="flex justify-around">
            {[0, 1].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-5 w-px bg-gray-300" />
                <svg width="10" height="6"><polygon points="0,0 10,0 5,6" fill="#9CA3AF" /></svg>
              </div>
            ))}
          </div>

          {/* Infrastructure */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Infrastructure</p>
            <div className="flex gap-3">
              {[
                { label: "Firebase Hosting", sub: "CDN + HTTPS", icon: "🌍" },
                { label: "Security Rules", sub: "Firestore + Storage", icon: "🔒" },
                { label: "Google Analytics", sub: "Usage tracking", icon: "📊" },
                { label: "Sentry (planned)", sub: "Error monitoring", icon: "🐛" },
              ].map((s) => (
                <div key={s.label} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-center">
                  <p className="text-base mb-0.5">{s.icon}</p>
                  <p className="text-xs font-semibold text-gray-700">{s.label}</p>
                  <p className="text-[10px] text-gray-400">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export function AppFlow() {
  const [activePortal, setActivePortal] = useState<Portal | "all">("all");

  const visiblePortals = activePortal === "all" ? PORTALS : [activePortal as Portal];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm px-8 py-4 flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">STUNIVOZ</p>
            <p className="text-[10px] text-gray-400 leading-tight">App Flow Diagram</p>
          </div>
        </div>

        {/* Portal filter tabs */}
        <div className="flex gap-1.5 ml-6">
          <button
            onClick={() => setActivePortal("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePortal === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Portals
          </button>
          {PORTALS.map((p) => (
            <button
              key={p}
              onClick={() => setActivePortal(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activePortal === p
                  ? `${PORTAL_META[p].bg} text-white`
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {PORTAL_META[p].emoji} {PORTAL_META[p].label.replace(" Portal", "").replace(" Panel", "")}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-gray-400">v1.0 · May 2026</span>
          <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">● Live</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 space-y-8 max-w-7xl mx-auto">

        {/* Top overview cards */}
        {activePortal === "all" && (
          <div className="grid grid-cols-4 gap-4">
            {PORTALS.map((p) => {
              const meta = PORTAL_META[p];
              const flow = PORTAL_FLOWS[p];
              return (
                <button
                  key={p}
                  onClick={() => setActivePortal(p)}
                  className={`${meta.light} border-2 ${meta.border} rounded-2xl p-5 text-left hover:shadow-md transition-all group`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{meta.emoji}</span>
                    <span className={`text-[10px] font-semibold ${meta.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      View flow →
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{meta.label}</h4>
                  <div className="mt-3 flex gap-3 text-center">
                    <div>
                      <p className={`text-lg font-extrabold ${meta.text}`}>{flow.nodes.filter(n => n.type === "screen").length}</p>
                      <p className="text-[10px] text-gray-400">Screens</p>
                    </div>
                    <div>
                      <p className={`text-lg font-extrabold ${meta.text}`}>{flow.edges.length}</p>
                      <p className="text-[10px] text-gray-400">Flows</p>
                    </div>
                    <div>
                      <p className={`text-lg font-extrabold ${meta.text}`}>{flow.nodes.filter(n => n.type === "action").length}</p>
                      <p className="text-[10px] text-gray-400">Actions</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Auth gate (show in "all" view) */}
        {activePortal === "all" && <AuthGateFlow />}

        {/* System overview (show in "all" view) */}
        {activePortal === "all" && <SystemOverview />}

        {/* Portal flow diagrams */}
        <div className={`grid gap-8 ${visiblePortals.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {visiblePortals.map((p) => (
            <PortalFlowDiagram key={p} portal={p} />
          ))}
        </div>

      </div>
    </div>
  );
}
