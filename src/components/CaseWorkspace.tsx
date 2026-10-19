import { useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { AppShell, SectionHeader } from './AppShell';
import { Button } from './Button';
import { createInvestigation, uploadEvidence, type Investigation } from '@/services/investigations';
import { validateFileContents } from '@/lib/evidence-validation';

type SelectedFile = { id: string; file: File; camera_id: string; location: string; captured_at: string; notes: string; status: 'Selected' | 'Uploading' | 'Uploaded' | 'Failed'; error: string };
export function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) { return <label className={`field ${wide ? 'field-wide' : ''}`}><span>{label}</span>{children}</label>; }
export function CaseWorkspace() {
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [investigator, setInvestigator] = useState(''); const [subject, setSubject] = useState('Person'); const [query, setQuery] = useState(''); const [date, setDate] = useState('');
  const [files, setFiles] = useState<SelectedFile[]>([]); const [saved, setSaved] = useState<Investigation | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const update = (id: string, changes: Partial<SelectedFile>) => setFiles((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  async function selectFiles(selected: FileList | null) {
    if (!selected) return;
    setError('');
    const valid: SelectedFile[] = []; const errors: string[] = [];
    for (const file of Array.from(selected)) {
      try { await validateFileContents(file); valid.push({ id: crypto.randomUUID(), file, camera_id: '', location: '', captured_at: '', notes: '', status: 'Selected', error: '' }); }
      catch (e) { errors.push(`${file.name}: ${e instanceof Error ? e.message : 'Invalid file'}`); }
    }
    setFiles((current) => [...current, ...valid]); setError(errors.join(' '));
  }
  async function save() {
    setBusy(true); setError('');
    try {
      const record = saved ?? await createInvestigation({ title: title.trim(), description, investigator: investigator.trim(), subject, query, incident_date: date || null });
      setSaved(record);
      let failures = 0;
      for (const item of files.filter((f) => f.status !== 'Uploaded')) {
        update(item.id, { status: 'Uploading', error: '' });
        try { await uploadEvidence(record.id, item.file, { camera_id: item.camera_id, location: item.location, captured_at: item.captured_at ? new Date(item.captured_at).toISOString() : null, notes: item.notes }); update(item.id, { status: 'Uploaded' }); }
        catch (e) { failures++; update(item.id, { status: 'Failed', error: e instanceof Error ? e.message : 'Upload failed.' }); }
      }
      if (failures) setError('The case is saved, but some files failed to upload. Retry the failed uploads below.');
      await queryClient.invalidateQueries({ queryKey: ['cases'] });
      await queryClient.invalidateQueries({ queryKey: ['evidence'] });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save the case. Please retry.'); }
    finally { setBusy(false); }
  }
  return <AppShell title="Create Case" eyebrow="Cases"><form onSubmit={(e) => { e.preventDefault(); void save(); }}>
    {saved && <div className="success-banner" role="status">Case saved: {saved.title} · {saved.id}</div>}
    {error && <p className="error-message" role="alert">{error}</p>}
    <fieldset disabled={busy || Boolean(saved)} className="plain-fieldset"><section className="surface form-section"><SectionHeader title="Case details" /><div className="form-grid">
      <Field label="Case title"><input required value={title} onChange={(e) => setTitle(e.target.value)} /></Field><Field label="Investigator name"><input required value={investigator} onChange={(e) => setInvestigator(e.target.value)} /></Field>
      <Field label="Subject type"><select value={subject} onChange={(e) => setSubject(e.target.value)}><option>Person</option><option>Vehicle</option><option>Both</option></select></Field><Field label="Incident date (optional)"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      <Field label="Incident details" wide><textarea value={description} onChange={(e) => setDescription(e.target.value)} /></Field><Field label="Search description / known attributes" wide><textarea value={query} onChange={(e) => setQuery(e.target.value)} /></Field>
    </div></section></fieldset>
    <section className="surface form-section"><SectionHeader title="Images and camera footage" /><Field label="Add files (JPG, PNG, MP4, WebM · up to 50 MB each)"><input type="file" multiple accept=".jpg,.jpeg,.png,.mp4,.webm" disabled={busy} onChange={(e) => { void selectFiles(e.target.files); e.target.value = ''; }} /></Field>
      <div className="camera-list">{files.map((item) => <fieldset key={item.id} className="camera-entry plain-fieldset" disabled={busy || item.status === 'Uploaded'}><div className="file-heading"><div className="min-w-0"><strong className="break-all">{item.file.name}</strong><p>{(item.file.size / 1024 / 1024).toFixed(2)} MB · {item.status}</p></div><Button type="button" variant="ghost" onClick={() => setFiles(files.filter((f) => f.id !== item.id))} aria-label={`Remove ${item.file.name}`}>Remove</Button></div>
        <div className="form-grid"><Field label="Camera ID"><input value={item.camera_id} onChange={(e) => update(item.id, { camera_id: e.target.value })} /></Field><Field label="Camera location"><input value={item.location} onChange={(e) => update(item.id, { location: e.target.value })} /></Field><Field label="Capture date and time (optional)"><input type="datetime-local" value={item.captured_at} onChange={(e) => update(item.id, { captured_at: e.target.value })} /></Field><Field label="Evidence notes"><input value={item.notes} onChange={(e) => update(item.id, { notes: e.target.value })} /></Field></div>{item.error && <p className="error-message" role="alert">{item.error}</p>}
      </fieldset>)}</div>
    </section><div className="form-actions"><Button type="submit" disabled={busy}>{busy ? 'Saving / uploading…' : saved ? 'Upload / retry files' : 'Save Case & Upload'}</Button>{saved && <Link to="/results" search={{ case: saved.id }} className="button button-secondary">Open saved evidence</Link>}</div>
    {saved && <Button type="button" variant="ghost" disabled={busy} onClick={() => { setSaved(null); setFiles([]); setTitle(''); setDescription(''); setInvestigator(''); setQuery(''); setDate(''); setError(''); }}>Create another case</Button>}
  </form></AppShell>;
}