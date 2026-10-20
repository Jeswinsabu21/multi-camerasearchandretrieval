import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell, SectionHeader, StatusBadge } from './AppShell';
import { Button } from './Button';
import { Field } from './CaseWorkspace';
import { MapSection } from './MapSection';
import { useAuth } from './Auth';
import { evidenceUrl, listCases, listEvidence, reviewEvidence, updateEvidence, uploadEvidence, REVIEW_STATUSES, type Evidence } from '@/services/investigations';
import { validateFileContents } from '@/lib/evidence-validation';
import type { MapPoint } from './map-types';

export function SavedEvidence({ initialCase = '', title = 'Case Details' }: { initialCase?: string; title?: string }) {
  const { user } = useAuth();
  const [chosen, setChosen] = useState(initialCase);
  const cases = useQuery({ queryKey: ['cases', user?.id], queryFn: listCases, enabled: Boolean(user) });
  const caseId = chosen || cases.data?.[0]?.id || '';
  const evidence = useQuery({ queryKey: ['evidence', user?.id, caseId], queryFn: () => listEvidence(caseId), enabled: Boolean(user && caseId) });
  const [filter, setFilter] = useState('');
  const [newFiles, setNewFiles] = useState<NewEvidence[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const current = cases.data?.find((c) => c.id === caseId);
  const mapPoints: MapPoint[] = (evidence.data ?? [])
    .filter((item) => item.latitude !== null && item.longitude !== null)
    .sort((a, b) => (a.captured_at ?? a.created_at).localeCompare(b.captured_at ?? b.created_at))
    .map((item) => ({ id: item.id, label: item.camera_id || 'Evidence location', detail: `${item.filename}${item.location ? ` · ${item.location}` : ''}`, lat: item.latitude as number, lng: item.longitude as number, time: item.captured_at ? new Date(item.captured_at).toLocaleString() : undefined }));
  return <AppShell title={title} eyebrow="Cases">
    <Field label="Case"><select value={caseId} onChange={(e) => setChosen(e.target.value)}><option value="">Select a case</option>{cases.data?.map((c) => <option key={c.id} value={c.id}>{c.title} · {c.id}</option>)}</select></Field>
    {cases.isPending && <p role="status">Loading cases…</p>}
    {cases.isError && <p role="alert" className="error-message">Could not load cases. <Button variant="ghost" onClick={() => void cases.refetch()}>Retry</Button></p>}
    {cases.data?.length === 0 && <p>No cases yet. Create a case and upload your evidence.</p>}
    {current && <section className="form-section saved-case-summary"><SectionHeader title={current.title} /><p>{current.description || 'No incident details recorded.'}</p><p><strong>Search description:</strong> {current.query || 'Not provided'}</p><p><strong>Subject:</strong> {current.subject} · <strong>Investigator:</strong> {current.investigator}</p>
      {current.attributes.length > 0 && <div className="attribute-tags">{current.attributes.map((tag) => <span key={tag}>{tag}</span>)}</div>}
    </section>}
    {caseId && <section className="form-section"><SectionHeader title="Evidence map" description="Saved evidence with coordinates is numbered in capture order and plotted at its recorded location." /><MapSection points={mapPoints} /></section>}
    {caseId && <><section className="form-section evidence-upload-section"><SectionHeader title="Add evidence" description="Upload additional images or videos and record each camera position." />
      <Field label="Add files (JPG, PNG, MP4, WebM · up to 50 MB each)"><input type="file" multiple accept=".jpg,.jpeg,.png,.mp4,.webm" disabled={uploading} onChange={(e) => { void selectNewFiles(e.target.files); e.target.value = ''; }} /></Field>
      {newFiles.map((item) => <NewEvidenceRow key={item.id} item={item} update={(changes) => setNewFiles((current) => current.map((file) => file.id === item.id ? { ...file, ...changes } : file))} remove={() => setNewFiles((current) => current.filter((file) => file.id !== item.id))} />)}
      {uploadError && <p className="error-message" role="alert">{uploadError}</p>}
      {newFiles.length > 0 && <Button disabled={uploading} onClick={() => void uploadNewFiles()}>{uploading ? 'Uploading…' : 'Upload selected evidence'}</Button>}
    </section><SectionHeader title="Case evidence history" description="All uploads saved to this case, including their camera and location metadata." action={<input className="evidence-filter" aria-label="Filter uploaded evidence" placeholder="Filter files or cameras" value={filter} onChange={(e) => setFilter(e.target.value)} />} />
      {evidence.isPending && <p role="status">Loading evidence…</p>}
      {evidence.isError && <p role="alert" className="error-message">Could not load evidence. <Button variant="ghost" onClick={() => void evidence.refetch()}>Retry</Button></p>}
      {evidence.data?.length === 0 && <p>No evidence has been uploaded to this case.</p>}
      <div className="uploaded-evidence-list">{evidence.data?.filter((item) => `${item.filename} ${item.camera_id} ${item.location}`.toLowerCase().includes(filter.toLowerCase())).map((item) => <UploadedEvidence key={item.id} item={item} />)}</div>
      {evidence.data && evidence.data.length > 0 && !evidence.data.some((item) => `${item.filename} ${item.camera_id} ${item.location}`.toLowerCase().includes(filter.toLowerCase())) && <p>No files match this filter.</p>}
    </>}
  </AppShell>;
  async function selectNewFiles(selected: FileList | null) {
    if (!selected) return;
    setUploadError('');
    const valid: NewEvidence[] = [];
    const errors: string[] = [];
    for (const file of Array.from(selected)) {
      try { await validateFileContents(file); valid.push({ id: crypto.randomUUID(), file, camera_id: '', location: '', captured_at: '', notes: '', latitude: '', longitude: '' }); }
      catch (error) { errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Invalid file'}`); }
    }
    setNewFiles((current) => [...current, ...valid]);
    setUploadError(errors.join(' '));
  }
  async function uploadNewFiles() {
    if (!caseId) return;
    setUploading(true); setUploadError('');
    const failures: string[] = [];
    for (const item of newFiles) {
      try {
        await uploadEvidence(caseId, item.file, { camera_id: item.camera_id, location: item.location, captured_at: item.captured_at ? new Date(item.captured_at).toISOString() : null, notes: item.notes, latitude: parseCoordinate(item.latitude, -90, 90), longitude: parseCoordinate(item.longitude, -180, 180) });
      } catch (error) { failures.push(`${item.file.name}: ${error instanceof Error ? error.message : 'Upload failed.'}`); }
    }
    setNewFiles(failures.length ? newFiles.filter((item) => failures.some((message) => message.startsWith(`${item.file.name}:`))) : []);
    setUploadError(failures.join(' '));
    await evidence.refetch();
    await cases.refetch();
    setUploading(false);
  }
}
type NewEvidence = { id: string; file: File; camera_id: string; location: string; captured_at: string; notes: string; latitude: string; longitude: string };
function parseCoordinate(value: string, min: number, max: number) {
  if (!value.trim()) return null;
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) throw new Error(`Coordinates must be between ${min} and ${max}.`);
  return parsed;
}
function NewEvidenceRow({ item, update, remove }: { item: NewEvidence; update: (changes: Partial<NewEvidence>) => void; remove: () => void }) {
  return <div className="camera-entry"><div className="file-heading"><div><strong className="break-all">{item.file.name}</strong><p>{(item.file.size / 1024 / 1024).toFixed(2)} MB · Ready</p></div><Button type="button" variant="ghost" onClick={remove}>Remove</Button></div><div className="form-grid"><Field label="Camera ID"><input value={item.camera_id} onChange={(e) => update({ camera_id: e.target.value })} /></Field><Field label="Camera location"><input value={item.location} onChange={(e) => update({ location: e.target.value })} /></Field><Field label="Latitude"><input inputMode="decimal" value={item.latitude} onChange={(e) => update({ latitude: e.target.value })} /></Field><Field label="Longitude"><input inputMode="decimal" value={item.longitude} onChange={(e) => update({ longitude: e.target.value })} /></Field><Field label="Capture date and time"><input type="datetime-local" value={item.captured_at} onChange={(e) => update({ captured_at: e.target.value })} /></Field><Field label="Evidence notes"><input value={item.notes} onChange={(e) => update({ notes: e.target.value })} /></Field></div></div>;
}
function UploadedEvidence({ item }: { item: Evidence }) {
  const [url, setUrl] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [note, setNote] = useState(item.review_note); const [status, setStatus] = useState<typeof REVIEW_STATUSES[number]>(REVIEW_STATUSES.find((s) => s === item.review_status) ?? REVIEW_STATUSES[0]);
  const [metadata, setMetadata] = useState({ camera_id: item.camera_id, location: item.location, latitude: item.latitude?.toString() ?? '', longitude: item.longitude?.toString() ?? '', captured_at: item.captured_at ? item.captured_at.slice(0, 16) : '', notes: item.notes });
  const queryClient = useQueryClient();
  useEffect(() => { let active = true; void evidenceUrl(item.storage_path).then((value) => { if (active) setUrl(value); }).catch(() => { if (active) setError('Could not open this private file.'); }); return () => { active = false; }; }, [item.storage_path]);
  async function saveReview() { setBusy(true); setError(''); try { await reviewEvidence(item.id, status, note); await queryClient.invalidateQueries({ queryKey: ['evidence'] }); } catch { setError('Review could not be saved. Please retry.'); } finally { setBusy(false); } }
  async function saveMetadata() { setBusy(true); setError(''); try { await updateEvidence(item.id, { camera_id: metadata.camera_id, location: metadata.location, latitude: parseCoordinate(metadata.latitude, -90, 90), longitude: parseCoordinate(metadata.longitude, -180, 180), captured_at: metadata.captured_at ? new Date(metadata.captured_at).toISOString() : null, notes: metadata.notes }); await queryClient.invalidateQueries({ queryKey: ['evidence'] }); } catch (error) { setError(error instanceof Error ? error.message : 'Evidence details could not be saved.'); } finally { setBusy(false); } }
  return <article className="uploaded-evidence"><div className="uploaded-media">{url ? item.mime_type.startsWith('image/') ? <img src={url} alt={item.filename} onError={() => setError('This file could not be displayed. Reload to refresh its private link.')} /> : <video src={url} controls preload="metadata" onError={() => setError('This video could not be displayed. Reload to refresh its private link.')} /> : <p>Opening file…</p>}</div><div className="min-w-0"><h3 className="break-all">{item.filename}</h3><StatusBadge>{item.review_status}</StatusBadge><div className="form-grid"><Field label="Camera ID"><input value={metadata.camera_id} onChange={(e) => setMetadata({ ...metadata, camera_id: e.target.value })} /></Field><Field label="Camera location"><input value={metadata.location} onChange={(e) => setMetadata({ ...metadata, location: e.target.value })} /></Field><Field label="Latitude"><input inputMode="decimal" value={metadata.latitude} onChange={(e) => setMetadata({ ...metadata, latitude: e.target.value })} /></Field><Field label="Longitude"><input inputMode="decimal" value={metadata.longitude} onChange={(e) => setMetadata({ ...metadata, longitude: e.target.value })} /></Field><Field label="Capture date and time"><input type="datetime-local" value={metadata.captured_at} onChange={(e) => setMetadata({ ...metadata, captured_at: e.target.value })} /></Field><Field label="Evidence notes"><input value={metadata.notes} onChange={(e) => setMetadata({ ...metadata, notes: e.target.value })} /></Field></div>
    <Button variant="secondary" disabled={busy} onClick={() => void saveMetadata()}>{busy ? 'Saving…' : 'Save evidence details'}</Button><Field label="Human review"><select value={status} onChange={(e) => { const value = REVIEW_STATUSES.find((s) => s === e.target.value); if (value) setStatus(value); }}>{REVIEW_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field><Field label="Investigator note"><textarea value={note} onChange={(e) => setNote(e.target.value)} /></Field><Button variant="secondary" disabled={busy} onClick={() => void saveReview()}>{busy ? 'Saving…' : 'Save review'}</Button>{item.reviewed_at && <p className="lead">Review saved: {new Date(item.reviewed_at).toLocaleString()}</p>}{url && <a className="text-link" href={url} target="_blank" rel="noreferrer">Open original file</a>}{error && <p className="error-message" role="alert">{error}</p>}
  </div></article>;
}
