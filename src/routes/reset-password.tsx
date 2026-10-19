import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/Button';
export const Route = createFileRoute('/reset-password')({ head: () => ({ meta: [{ title: 'Reset Password — TRINETRA' }, { name: 'description', content: 'Reset your TRINETRA investigator account password.' }, { property: 'og:title', content: 'Reset Password — TRINETRA' }, { property: 'og:description', content: 'Set a new password through your secure recovery link.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }), component: ResetPassword });
function ResetPassword() {
  const [valid, setValid] = useState(false); const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { const params = new URLSearchParams(window.location.hash.slice(1)); if (params.get('type') === 'recovery') void supabase.auth.getUser().then(({ data }) => setValid(Boolean(data.user))); }, []);
  async function reset() { setBusy(true); const { error } = await supabase.auth.updateUser({ password }); setMessage(error ? error.message : 'Password updated. You can return to your cases.'); setBusy(false); }
  return <main className="page-content"><h1>Reset password</h1>{valid ? <form className="auth-form" onSubmit={(e) => { e.preventDefault(); void reset(); }}><label className="field"><span>New password</span><input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label><Button disabled={busy}>{busy ? 'Saving…' : 'Set new password'}</Button></form> : <p>Open the password reset link from your email.</p>}{message && <p role="status">{message}</p>}<a href="/" className="text-link">Return to cases</a></main>;
}