import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SignInForm, useAuth } from './Auth';
import { Button } from './Button';

const navigation = [
  { to: "/create-case", label: "Create Case" },
  { to: "/results", label: "Ranked List" },
  { to: "/case-history", label: "Case History" },
] as const;

export function AppShell({ title, children }: { title: string; eyebrow: string; children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, ready } = useAuth();
  const queryClient = useQueryClient();
  async function signOut() {
    await queryClient.cancelQueries(); queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) window.alert('Sign-out failed. Please retry.');
  }
  if (ready && !user) {
    return (
      <div className="app-shell">
        <main className="signin-screen">
          <h1 className="signin-title">MULTI CAMERA SEARCH PROJECT</h1>
          <SignInForm />
          <footer className="responsible-notice">Automated search candidates require human verification.</footer>
        </main>
      </div>
    );
  }
  return (
    <div className="app-shell">
      <header className="project-header">
        <div className="project-header-row">
          <h1>MULTI CAMERA SEARCH PROJECT</h1>
          <div className="header-auth">
            {!ready ? null : user ? (
              <Button variant="secondary" onClick={() => void signOut()}><LogOut size={15} /> Sign out</Button>
            ) : (
              <Button variant="secondary"><LogIn size={15} /> Sign in</Button>
            )}
          </div>
        </div>
        <nav className="project-nav" aria-label="Primary navigation">
          {navigation.map(({ to, label }) => {
            const active = pathname === to || (to === "/create-case" && pathname === "/");
            return <Link key={to} to={to} className={active ? "project-tab active" : "project-tab"} aria-current={active ? "page" : undefined}>{label}</Link>;
          })}
        </nav>
      </header>
      <main className="main-content">
        <div className="page-content"><div className="workspace-heading"><h2 className="page-heading">{title}</h2></div>{!ready ? <p role="status">Loading…</p> : children}</div>
        <footer className="responsible-notice">Automated search candidates require human verification.</footer>
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
