import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell, SectionHeader, StatusBadge } from './AppShell';
import { Button } from './Button';
import { Field } from './CaseWorkspace';
import { MapSection } from './MapSection';
import { useAuth } from './Auth';
import { evidenceUrl, listCases, listEvidence, reviewEvidence, REVIEW_STATUSES, type Evidence } from '@/services/investigations';
import type { MapPoint } from './map-types';

export function SavedEvidence({ initialCase = '', title = 'Ranked List' }: { initialCase?: string; title?: string }) {
  const { user } = useAuth();
  const [chosen, setChosen] = useState(initialCase);
  const cases = useQuery({ queryKey: ['cases', user?.id], queryFn: listCases, enabled: Boolean(user) });
  const caseId = chosen || cases.data?.[0]?.id || '';
  const evidence = useQuery({ queryKey: ['evidence', user?.id, caseId], queryFn: () => listEvidence(caseId), enabled: Boolean(user && caseId) });
  const [filter, setFilter] = useState('');
  const current = cases.data?.find((c) => c.id === caseId);
  const mapPoints: MapPoint[] = (evidence.data ?? [])
    .filter((item) => item.latitude !== null && item.longitude !== null)
    .sort((a, b) => (a.captured_at ?? a.created_at).localeCompare(b.captured_at ?? b.created_at))
    .map((item) => ({ id: item.id, label: item.camera_id || item.filename, detail: item.location || undefined, lat: item.latitude as number, lng: item.longitude as number, time: item.captured_at ? new Date(item.captured_at).toLocaleString() : undefined }));
  return <AppShell title={title} eyebrow="Cases">
    <Field label="Case"><select value={caseId} onChange={(e) => setChosen(e.target.value)}><option value="">Select a case</option>{cases.data?.map((c) => <option key={c.id} value={c.id}>{c.title} · {c.id}</option>)}</select></Field>
    {cases.isPending && <p role="status">Loading cases…</p>}
    {cases.isError && <p role="alert" className="error-message">Could not load cases. <Button variant="ghost" onClick={() => void cases.refetch()}>Retry</Button></p>}
    {cases.data?.length === 0 && <p>No cases yet. Create a case and upload your evidence.</p>}
    {current && <section className="form-section saved-case-summary"><SectionHeader title={current.title} /><p>{current.description || 'No incident details recorded.'}</p><p><strong>Search description:</strong> {current.query || 'Not provided'}</p><p><strong>Subject:</strong> {current.subject} · <strong>Investigator:</strong> {current.investigator}</p>
      {current.attributes.length > 0 && <div className="attribute-tags">{current.attributes.map((tag) => <span key={tag}>{tag}</span>)}</div>}
    </section>}
    {caseId && <section className="form-section"><SectionHeader title="Movement route" description="Camera positions plotted in time order, connected as the subject's movement path." /><MapSection points={mapPoints} /></section>}
    {caseId && <><SectionHeader title="Uploaded evidence" action={<input className="evidence-filter" aria-label="Filter uploaded evidence" placeholder="Filter files or cameras" value={filter} onChange={(e) => setFilter(e.target.value)} />} />
      {evidence.isPending && <p role="status">Loading evidence…</p>}
      {evidence.isError && <p role="alert" className="error-message">Could not load evidence. <Button variant="ghost" onClick={() => void evidence.refetch()}>Retry</Button></p>}
      {evidence.data?.length === 0 && <p>No evidence has been uploaded to this case.</p>}
      <div className="uploaded-evidence-list">{evidence.data?.filter((item) => `${item.filename} ${item.camera_id} ${item.location}`.toLowerCase().includes(filter.toLowerCase())).map((item) => <UploadedEvidence key={item.id} item={item} />)}</div>
      {evidence.data && evidence.data.length > 0 && !evidence.data.some((item) => `${item.filename} ${item.camera_id} ${item.location}`.toLowerCase().includes(filter.toLowerCase())) && <p>No files match this filter.</p>}
    </>}
  </AppShell>;
}
function UploadedEvidence({ item }: { item: Evidence }) {
  const [url, setUrl] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [note, setNote] = useState(item.review_note); const [status, setStatus] = useState<typeof REVIEW_STATUSES[number]>(REVIEW_STATUSES.find((s) => s === item.review_status) ?? REVIEW_STATUSES[0]);
  const queryClient = useQueryClient();
  useEffect(() => { let active = true; void evidenceUrl(item.storage_path).then((value) => { if (active) setUrl(value); }).catch(() => { if (active) setError('Could not open this private file.'); }); return () => { active = false; }; }, [item.storage_path]);
  async function saveReview() { setBusy(true); setError(''); try { await reviewEvidence(item.id, status, note); await queryClient.invalidateQueries({ queryKey: ['evidence'] }); } catch { setError('Review could not be saved. Please retry.'); } finally { setBusy(false); } }
  return <article className="uploaded-evidence"><div className="uploaded-media">{url ? item.mime_type.startsWith('image/') ? <img src={url} alt={item.filename} onError={() => setError('This file could not be displayed. Reload to refresh its private link.')} /> : <video src={url} controls preload="metadata" onError={() => setError('This video could not be displayed. Reload to refresh its private link.')} /> : <p>Opening file…</p>}</div><div className="min-w-0"><h3 className="break-all">{item.filename}</h3><StatusBadge>{item.review_status}</StatusBadge><p>Camera: {item.camera_id || 'Not provided'} · {item.location || 'Location not provided'}</p>{item.latitude !== null && item.longitude !== null && <p>Position: {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}</p>}<p>Captured: {item.captured_at ? new Date(item.captured_at).toLocaleString() : 'Not provided'}</p>{item.notes && <p>{item.notes}</p>}
    <Field label="Human review"><select value={status} onChange={(e) => { const value = REVIEW_STATUSES.find((s) => s === e.target.value); if (value) setStatus(value); }}>{REVIEW_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field><Field label="Investigator note"><textarea value={note} onChange={(e) => setNote(e.target.value)} /></Field><Button variant="secondary" disabled={busy} onClick={() => void saveReview()}>{busy ? 'Saving…' : 'Save review'}</Button>{item.reviewed_at && <p className="lead">Review saved: {new Date(item.reviewed_at).toLocaleString()}</p>}{url && <a className="text-link" href={url} target="_blank" rel="noreferrer">Open original file</a>}{error && <p className="error-message" role="alert">{error}</p>}
  </div></article>;
}
