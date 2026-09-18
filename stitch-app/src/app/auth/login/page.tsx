'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Leaf, Loader2, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { trackAction, resetTelemetrySession } from '@/lib/telemetry';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    const started = performance.now();
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      if (authError) throw new Error(authError.message);
      if (!data.user) throw new Error('No authenticated user returned.');
      resetTelemetrySession();
      await supabase.schema('stitch_app').from('user_profiles').upsert({
        user_id: data.user.id,
        full_name: String(data.user.user_metadata?.full_name || ''),
        phone: String(data.user.user_metadata?.phone || ''),
        role: String(data.user.user_metadata?.requested_role || 'farmer'),
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      await trackAction('login', '/auth/login', true, Math.round(performance.now() - started));
      window.location.assign('/farmer/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to log in.';
      setError(message);
      void trackAction('login', '/auth/login', false, Math.round(performance.now() - started), { error: message.slice(0, 180) });
    } finally { setBusy(false); }
  };

  const google = async () => {
    setError(''); setNotice('');
    const started = performance.now();
    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/auth/onboarding`, queryParams: { prompt: 'select_account' } },
      });
      if (authError || !data.url) throw new Error(authError?.message || 'Google sign-in could not start.');
      void trackAction('google_login_start', '/auth/login', true, Math.round(performance.now() - started));
      window.location.assign(data.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in could not start.';
      setError(message);
      void trackAction('google_login_start', '/auth/login', false, Math.round(performance.now() - started));
    }
  };

  return <div className="login-page">
    <div className="login-card">
      <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:7,fontSize:12,fontWeight:800,color:'#68716b'}}><ArrowLeft size={15}/> Back to AgriMark</Link>
      <div style={{marginTop:24,display:'flex',alignItems:'center',gap:12}}><div className="logo"><Leaf/></div><div><div style={{fontWeight:800,fontSize:20}}>Welcome back</div><div style={{fontSize:12,color:'#727a75'}}>Fast, persistent sign-in for your AgriMark workspace</div></div></div>
      <form onSubmit={submit} className="form-grid" style={{marginTop:26}}>
        {error && <div className="error">{error}</div>}
        {notice && <div style={{padding:11,borderRadius:12,background:'#edf6ef',color:'#257042',fontSize:12}}>{notice}</div>}
        <div className="field"><label>Email</label><div style={{position:'relative'}}><Mail size={16} style={{position:'absolute',left:13,top:16,color:'#7a817d'}}/><input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@example.com" required style={{paddingLeft:40,width:'100%'}}/></div></div>
        <div className="field"><label>Password</label><div style={{position:'relative'}}><Lock size={16} style={{position:'absolute',left:13,top:16,color:'#7a817d'}}/><input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Your password" required style={{paddingLeft:40,width:'100%'}}/></div></div>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? <Loader2 size={16} style={{animation:'spin 1s linear infinite'}}/> : <ArrowRight size={16}/>} {busy ? 'Signing in…' : 'Sign in'}</button>
        <button className="btn btn-secondary" type="button" onClick={google} disabled={busy}>Continue with Google</button>
        <div style={{display:'flex',gap:8,alignItems:'center',fontSize:11,color:'#727a75',marginTop:2}}><CheckCircle2 size={14} color="#257042"/> Session refresh is handled through Supabase SSR cookies.</div>
      </form>
      <div style={{marginTop:20,textAlign:'center',fontSize:12,color:'#737b76'}}>New to AgriMark? <Link href="/auth/register" style={{color:'#1B4D3E',fontWeight:800}}>Create your account</Link></div>
    </div>
  </div>;
}
