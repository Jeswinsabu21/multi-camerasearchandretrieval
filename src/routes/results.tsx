import { createFileRoute } from "@tanstack/react-router";
import { Filter, Image, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell, SectionHeader } from "../components/AppShell";
import { CandidateCard } from "../components/CandidateCard";
import { EvidencePanel } from "../components/EvidencePanel";
import { candidates, type Candidate, type ReviewStatus } from "../data/mockData";
import { getReviews } from "../services/storage";
export const Route = createFileRoute("/results")({ head: () => ({ meta: [{ title: "Investigation Results — TRINETRA" }, { name: "description", content: "Ranked, explainable evidence candidates requiring investigator verification." }, { property: "og:title", content: "Investigation Results — TRINETRA" }, { property: "og:description", content: "Review candidate evidence, similarity scores, and route-time plausibility." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: Results });
function Results() { const [selected, setSelected] = useState<Candidate | null>(null); const [reviews, setReviews] = useState<Record<string, ReviewStatus>>({}); useEffect(() => setReviews(getReviews()), []);
 return <AppShell title="Investigation Results" eyebrow="Cases / CASE-2026-001"><div className="query-summary"><div className="query-icon"><Image size={21} /></div><div><span>Reference query</span><strong>Adult male wearing green shirt and black shorts</strong><small>Subject: Person · 3 cameras · 10:00–11:00</small></div></div>
 <section className="search-flow"><div><Search size={17} /><span>Candidates found</span><strong>27</strong></div><i>→</i><div><Filter size={17} /><span>Attribute filtered</span><strong>11</strong></div><i>→</i><div><span>Similarity search</span><strong>8</strong></div><i>→</i><div><span>Route validated</span><strong>5</strong></div></section>
 <section><SectionHeader title="Ranked Candidates" description="Ordered by appearance, attributes, and route-time plausibility. Each result requires investigator review." /><div className="candidate-list">{candidates.map((candidate) => <CandidateCard key={candidate.trackId} candidate={candidate} status={reviews[candidate.trackId] ?? candidate.status} onView={() => setSelected(candidate)} />)}</div></section>
 {selected && <EvidencePanel candidate={selected} onClose={() => setSelected(null)} onReview={(status) => { setReviews({ ...reviews, [selected.trackId]: status }); setSelected(null); }} />}</AppShell>; }
