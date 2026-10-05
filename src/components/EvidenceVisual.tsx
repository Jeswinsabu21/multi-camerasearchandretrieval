import { ScanLine } from "lucide-react";

export function EvidenceVisual({ label, matched = false }: { label: string; matched?: boolean }) {
  return <div className={`evidence-visual ${matched ? "matched" : ""}`}>
    <div className="cctv-noise" />
    <div className="subject-silhouette"><span className="head" /><span className="torso" /><span className="legs" /></div>
    {matched && <div className="detect-box"><span>P-1042 · 0.94</span></div>}
    <div className="camera-stamp"><ScanLine size={14} /> {label}</div>
  </div>;
}
