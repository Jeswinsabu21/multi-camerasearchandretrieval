import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

const navigation = [
  { to: "/create-case", label: "Create Case" },
  { to: "/results", label: "Ranked List" },
  { to: "/case-history", label: "Case History" },
] as const;

export function AppShell({ title, children }: { title: string; eyebrow: string; children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <div className="app-shell">
      <header className="project-header">
        <h1>MULTI CAMERA SEARCH PROJECT</h1>
        <nav className="project-nav" aria-label="Primary navigation">
          {navigation.map(({ to, label }) => {
            const active = pathname === to || (to === "/create-case" && (pathname === "/" || pathname === "/process-case"));
            return <Link key={to} to={to} className={active ? "project-tab active" : "project-tab"} aria-current={active ? "page" : undefined}>{label}</Link>;
          })}
        </nav>
      </header>
      <main className="main-content">
        <div className="page-content"><h2 className="page-heading">{title}</h2>{children}</div>
        <footer className="responsible-notice">AI-generated candidates require human verification. Similarity does not establish identity.</footer>
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
