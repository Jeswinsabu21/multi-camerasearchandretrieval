import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, BriefcaseBusiness, ChevronRight, Database, History, Menu, Plus, Search, ServerCog, ShieldCheck, X } from "lucide-react";
import { useState, type ReactNode } from "react";

const navigation = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/create-case", label: "Create Case", icon: Plus },
  { to: "/process-case", label: "Process Case", icon: ServerCog },
  { to: "/results", label: "Search & Results", icon: Search },
  { to: "/evidence", label: "Evidence", icon: Database },
  { to: "/case-history", label: "Case History", icon: History },
  { to: "/system-status", label: "System Status", icon: ShieldCheck },
] as const;

export function AppShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><ShieldCheck size={22} /></div><div><strong>TRINETRA</strong><span>Investigation System</span></div></div>
        <button className="mobile-close" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20} /></button>
        <nav aria-label="Primary navigation">
          {navigation.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setOpen(false)} className={pathname === to ? "nav-link active" : "nav-link"}><Icon size={18} /><span>{label}</span>{pathname === to && <ChevronRight size={15} className="nav-arrow" />}</Link>)}
        </nav>
        <div className="sidebar-footer"><span className="online-dot" /> System operational</div>
      </aside>
      {open && <button className="backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <main className="main-content">
        <header className="topbar"><button className="menu-button" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={20} /></button><div><span>{eyebrow}</span><h1>{title}</h1></div><div className="investigator"><div className="avatar">JS</div><div><strong>Jeswin Sabu</strong><span>Investigator</span></div></div></header>
        <div className="page-content">{children}</div>
        <footer className="responsible-notice"><ShieldCheck size={17} /><span><strong>Decision-support system.</strong> AI-generated rankings are evidence only. Final identification decisions remain with the authorised investigator.</span></footer>
      </main>
    </div>
  );
}

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="section-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "success" | "warning" | "danger" | "info" | "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
