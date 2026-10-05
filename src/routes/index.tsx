import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, BriefcaseBusiness, Camera, CheckCircle2, Clock3, Database, Layers3 } from "lucide-react";
import { AppShell, SectionHeader, StatusBadge } from "../components/AppShell";
import { cases } from "../data/mockData";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — TRINETRA" }, { name: "description", content: "Investigator dashboard for multi-camera evidence search and review." }, { property: "og:title", content: "TRINETRA Investigation Dashboard" }, { property: "og:description", content: "Human-reviewed multi-camera evidence search prototype." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Dashboard,
});

const stats = [["Total Cases", "12", BriefcaseBusiness], ["Active Cases", "3", Activity], ["Pending Reviews", "7", Clock3], ["Evidence Items", "2,784", Database], ["Processed Cameras", "28", Camera], ["Generated Tracklets", "3,419", Layers3]] as const;
function Dashboard() { return <AppShell title="Investigation Dashboard" eyebrow="Overview">
  <div className="title-row"><div><p className="lead">Review case activity and evidence processing across archived camera footage.</p></div><Link to="/create-case" className="button button-primary">New Case <ArrowRight size={16} /></Link></div>
  <section className="stats-grid">{stats.map(([label, value, Icon]) => <div className="stat-card" key={label}><div className="stat-icon"><Icon size={19} /></div><div><span>{label}</span><strong>{value}</strong></div></div>)}</section>
  <div className="dashboard-grid"><section className="surface"><SectionHeader title="Recent Cases" description="Most recently updated investigations" action={<Link to="/case-history" className="text-link">View all <ArrowRight size={14} /></Link>} /><div className="simple-list">{cases.map((item) => <div className="case-row" key={item.id}><div className="case-icon"><BriefcaseBusiness size={18} /></div><div className="grow"><strong>{item.title}</strong><span>{item.id} · {item.updated}</span></div><StatusBadge tone={item.status === "Completed" ? "success" : item.status === "Processing" ? "info" : "warning"}>{item.status}</StatusBadge></div>)}</div></section>
  <section className="surface"><SectionHeader title="Processing Status" description="Current system readiness" /><div className="system-list"><div><span><CheckCircle2 /> Detection & tracking</span><StatusBadge tone="success">Ready</StatusBadge></div><div><span><CheckCircle2 /> Qwen2.5-VL pipeline</span><StatusBadge tone="success">Model ready</StatusBadge></div><div><span><CheckCircle2 /> Evidence index</span><StatusBadge tone="success">Available</StatusBadge></div><div><span><CheckCircle2 /> Route-time validator</span><StatusBadge tone="success">Available</StatusBadge></div></div></section></div>
  <section className="method-strip"><div><span>01</span><strong>Attribute pre-filter</strong><small>Narrow candidate pool</small></div><ArrowRight /><div><span>02</span><strong>Similarity search</strong><small>Rank appearance embeddings</small></div><ArrowRight /><div><span>03</span><strong>Route-time validation</strong><small>Check feasible movement</small></div><ArrowRight /><div><span>04</span><strong>Human review</strong><small>Investigator decides</small></div></section>
</AppShell>; }
