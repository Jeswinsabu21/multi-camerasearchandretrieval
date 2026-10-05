import { CheckCircle2, Clock3, Eye, MapPin, XCircle } from "lucide-react";
import type { Candidate, ReviewStatus } from "../data/mockData";
import { Button } from "./Button";
import { EvidenceVisual } from "./EvidenceVisual";
import { StatusBadge } from "./AppShell";

export function CandidateCard({ candidate, status, onView }: { candidate: Candidate; status: ReviewStatus; onView: () => void }) {
  return <article className="candidate-card">
    <div className="candidate-rank">#{candidate.rank}</div>
    <div className="candidate-thumb"><EvidenceVisual label={candidate.camera} matched /></div>
    <div className="candidate-main"><div className="candidate-title"><div><span>Candidate Match</span><h3>{candidate.trackId}</h3></div><StatusBadge tone={status.startsWith("Confirmed") ? "success" : status.startsWith("Rejected") ? "danger" : "warning"}>{status}</StatusBadge></div>
      <div className="candidate-meta"><span><MapPin size={14} />{candidate.location}</span><span><Clock3 size={14} />{candidate.timestamp}</span></div>
      <div className="attribute-tags">{candidate.attributes.map((attribute) => <span key={attribute}>{attribute}</span>)}</div>
    </div>
    <div className="score-block"><strong>{candidate.similarity}%</strong><span>Similarity Score</span><div className="score-track"><i style={{ width: `${candidate.similarity}%` }} /></div><small>{candidate.plausible ? <><CheckCircle2 size={14} /> Route plausible</> : <><XCircle size={14} /> Route implausible</>}</small></div>
    <Button variant="secondary" onClick={onView}><Eye size={16} /> View Evidence</Button>
  </article>;
}
