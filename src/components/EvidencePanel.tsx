import { Check, Clock3, MapPin, Route, X } from "lucide-react";
import type { Candidate, ReviewStatus } from "../data/mockData";
import { saveReview } from "../services/storage";
import { Button } from "./Button";
import { EvidenceVisual } from "./EvidenceVisual";

export function EvidencePanel({ candidate, onClose, onReview }: { candidate: Candidate; onClose: () => void; onReview: (status: ReviewStatus) => void }) {
  const review = (status: ReviewStatus) => { saveReview(candidate.trackId, status); onReview(status); };
  return <div className="panel-backdrop" onMouseDown={onClose}><section className="evidence-panel" onMouseDown={(event) => event.stopPropagation()} aria-label="Evidence details">
    <div className="panel-header"><div><span>Candidate Match #{candidate.rank}</span><h2>Evidence for {candidate.trackId}</h2></div><button className="icon-button" aria-label="Close evidence" onClick={onClose}><X size={20} /></button></div>
    <div className="comparison"><div><label>Reference</label><EvidenceVisual label="QUERY IMAGE" /></div><div><label>Matched evidence</label><EvidenceVisual label={`${candidate.camera} · ${candidate.timestamp}`} matched /></div></div>
    <div className="panel-section"><h3>Evidence contributing to ranking</h3><Score label="Appearance similarity" value={candidate.similarity} /><Score label="Attribute compatibility" value={candidate.attributeScore} />
      <div className="evidence-checks">{candidate.attributes.map((item) => <span key={item}><Check size={15} /> {item}</span>)}<span><Check size={15} /> Subject type: Person</span></div>
      <blockquote>“{candidate.caption}”</blockquote>
    </div>
    <div className="panel-section"><h3>Spatiotemporal validation</h3><div className="route-summary"><div><MapPin size={17} /><span>CAM-01 · Main Gate<small>10:32:10</small></span></div><div className="route-line"><Route size={18} /><span>Estimated route: 3 min 40 sec</span></div><div><MapPin size={17} /><span>{candidate.camera} · {candidate.location}<small>{candidate.timestamp}</small></span></div></div><div className={`validation-result ${candidate.plausible ? "valid" : "invalid"}`}><Clock3 size={16} />{candidate.plausible ? "Travel is temporally plausible (5 minutes available)" : "Travel is physically implausible (4 minutes available; 18 required)"}</div></div>
    <div className="review-actions"><Button onClick={() => review("Confirmed by Investigator")}><Check size={16} /> Confirm Candidate</Button><Button variant="danger" onClick={() => review("Rejected by Investigator")}><X size={16} /> Reject Candidate</Button><Button variant="secondary" onClick={() => review("Further Review")}><Clock3 size={16} /> Further Review</Button></div>
  </section></div>;
}
function Score({ label, value }: { label: string; value: number }) { return <div className="score-row"><div><span>{label}</span><strong>{value}%</strong></div><div className="score-track"><i style={{ width: `${value}%` }} /></div></div>; }
