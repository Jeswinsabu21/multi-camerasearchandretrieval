import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell, SectionHeader, StatusBadge } from "../components/AppShell";
import { Button } from "../components/Button";
import { useAuth } from "../components/Auth";
import { listCases } from "../services/investigations";

export const Route = createFileRoute("/case-history")({ head: () => ({ meta: [{ title: "Case History — TRINETRA" }, { name: "description", content: "Search and revisit saved investigation cases and review decisions." }, { property: "og:title", content: "Case History — TRINETRA" }, { property: "og:description", content: "Review past multi-camera evidence search cases." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: History });

function History() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const cases = useQuery({ queryKey: ["cases", user?.id], queryFn: listCases, enabled: Boolean(user) });
  const filtered = (cases.data ?? []).filter((item) => `${item.id} ${item.title} ${item.investigator}`.toLowerCase().includes(query.toLowerCase()));
  return <AppShell title="Case History" eyebrow="Cases"><section className="surface"><SectionHeader title="All Cases" description={`${cases.data?.length ?? 0} investigations saved`} action={<div className="search-box"><Search size={16} /><input aria-label="Search cases" placeholder="Search cases" value={query} onChange={(e) => setQuery(e.target.value)} /></div>} />
    {cases.isPending && <p role="status">Loading cases…</p>}
    {cases.isError && <p role="alert" className="error-message">Could not load cases. <Button variant="ghost" onClick={() => void cases.refetch()}>Retry</Button></p>}
    {cases.data?.length === 0 && <p>No cases yet. Create a case to see it here.</p>}
    {filtered.length > 0 && <div className="table-wrap"><table><thead><tr><th>Case</th><th>Incident date</th><th>Investigator</th><th>Subject</th><th>Evidence files</th><th>Created</th><th>Action</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><span className="table-subtitle">{item.id}</span></td><td>{item.incident_date ?? "—"}</td><td>{item.investigator}</td><td>{item.subject}</td><td>{item.case_evidence.length}</td><td>{new Date(item.created_at).toLocaleDateString()}</td><td><Link to="/results" search={{ case: item.id }} className="icon-link" aria-label={`View ${item.title}`}><Eye size={17} /></Link></td></tr>)}</tbody></table></div>}
    {cases.data && cases.data.length > 0 && filtered.length === 0 && <p>No cases match this search.</p>}
  </section></AppShell>;
}
