import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { validateFileContents } from '@/lib/evidence-validation';

export type Investigation = Database['public']['Tables']['investigation_cases']['Row'];
export type Evidence = Database['public']['Tables']['case_evidence']['Row'];
export type CaseInput = Pick<Investigation, 'title' | 'description' | 'investigator' | 'subject' | 'query' | 'incident_date' | 'attributes'>;
export const REVIEW_STATUSES = ['Requires Investigator Verification', 'Confirmed by Investigator', 'Rejected by Investigator', 'Further Review'] as const;

export async function listCases() {
  const { data, error } = await supabase.from('investigation_cases').select('*, case_evidence(id)').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
export async function createInvestigation(input: CaseInput) {
  if (!input.title.trim() || !input.investigator.trim()) throw new Error('Enter a case title and investigator name.');
  const { data, error } = await supabase.from('investigation_cases').insert(input).select().single();
  if (error) throw error;
  return data;
}
export async function listEvidence(caseId: string) {
  const { data, error } = await supabase.from('case_evidence').select('*').eq('case_id', caseId).order('created_at');
  if (error) throw error;
  return data;
}
export async function uploadEvidence(caseId: string, file: File, metadata: { camera_id: string; location: string; captured_at: string | null; notes: string; latitude: number | null; longitude: number | null }) {
  await validateFileContents(file);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Sign in before uploading evidence.');
  const extension = file.name.split('.').at(-1)?.toLowerCase();
  const storage_path = `${user.id}/${caseId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from('case-evidence').upload(storage_path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;
  const { error } = await supabase.from('case_evidence').insert({ case_id: caseId, user_id: user.id, storage_path, filename: file.name, mime_type: file.type, size_bytes: file.size, ...metadata });
  if (error) {
    const { error: cleanupError } = await supabase.storage.from('case-evidence').remove([storage_path]);
    throw new Error(cleanupError ? 'File metadata could not be saved; file cleanup also failed. Please retry later.' : 'File metadata could not be saved. The uploaded file was removed; please retry.');
  }
}
export async function evidenceUrl(path: string) {
  const { data, error } = await supabase.storage.from('case-evidence').createSignedUrl(path, 300);
  if (error) throw error;
  return data.signedUrl;
}
export async function reviewEvidence(id: string, status: typeof REVIEW_STATUSES[number], note: string) {
  const { data, error } = await supabase.from('case_evidence').update({ review_status: status, review_note: note, reviewed_at: new Date().toISOString() }).eq('id', id).select('id').single();
  if (error || !data) throw error ?? new Error('Evidence is no longer available.');
}
