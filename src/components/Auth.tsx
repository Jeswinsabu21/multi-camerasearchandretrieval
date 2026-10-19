import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import '@lovable.dev/cloud-auth-js/styles.css';
import { Button } from './Button';

const AuthContext = createContext<{ user: User | null; ready: boolean }>({ user: null, ready: false });
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    let alive = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      setUser(session?.user ?? null); setReady(true);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        if (event === 'SIGNED_OUT') queryClient.clear();
        else void queryClient.invalidateQueries();
        void router.invalidate();
      }
    });
    void supabase.auth.getUser().then(({ data }) => { if (alive) { setUser(data.user); setReady(true); } });
    return () => { alive = false; subscription.unsubscribe(); };
  }, [queryClient, router]);
  return <AuthContext.Provider value={{ user, ready }}>{children}</AuthContext.Provider>;
}
export function SignInForm() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  async function submit() {
    setBusy(true); setMessage('');
    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setMessage('Check your email for a password reset link.');
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        if (!data.session) setMessage('Check your email to confirm your account before signing in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error;
      }
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Sign-in failed. Please retry.'); }
    finally { setBusy(false); }
  }
  async function social(provider: 'google' | 'lovable') {
    setMessage(''); setBusy(true);
    try { const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin }); if (result.error) setMessage(result.error.message); }
    catch { setMessage('Sign-in failed. Please retry.'); } finally { setBusy(false); }
  }
  return <section className="auth-form"><h3>{mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Reset password' : 'Sign in'}</h3><p className="lead">Sign in to keep your cases and uploaded evidence private.</p>
    <form onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <label className="field"><span>Email</span><input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      {mode !== 'reset' && <label className="field"><span>Password</span><input type="password" required minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} /></label>}
      <Button disabled={busy} type="submit">{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}</Button>
    </form>
    {message && <p role="status">{message}</p>}
    <div className="auth-actions"><Button variant="secondary" disabled={busy} onClick={() => void social('google')}>Continue with Google</Button></div>
    <div className="auth-actions"><Button variant="ghost" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMessage(''); }}>{mode === 'signup' ? 'Already have an account? Sign in' : 'Create an account'}</Button><Button variant="ghost" onClick={() => { setMode(mode === 'reset' ? 'signin' : 'reset'); setMessage(''); }}>{mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}</Button></div>
  </section>;
}