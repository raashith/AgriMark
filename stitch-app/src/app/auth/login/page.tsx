'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Leaf, Loader2, Mail, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); setBusy(true);
    try {
      const auth = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (auth.error || !auth.data.session?.access_token) throw new Error(auth.error?.message || 'Authentication failed.');
      localStorage.setItem('agrimark_token', auth.data.session.access_token);
      const profile = await api.me();
      localStorage.setItem('agrimark_user', JSON.stringify(profile));
      window.location.assign('/farmer/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in.');
    } finally { setBusy(false); }
  };

  const google = async () => {
    setError('');
    const { data, error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: 'select_account' } },
    });
    if (authError || !data.url) setError(authError?.message || 'Google sign-in could not start.');
    else window.location.assign(data.url);
  };

  return <div className="login-page">
    <div className="login-card">
      <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:7,fontSize:12,fontWeight:800,color:'#68716b'}}><ArrowLeft size={15}/> Back to AgriMark</Link>
      <div style={{marginTop:24,display:'flex',alignItems:'center',gap:12}}><div className="logo"><Leaf/></div><div><div style={{fontWeight:800,fontSize:20}}>Welcome back</div><div style={{fontSize:12,color:'#727a75'}}>Sign in to your AgriMark workspace</div></div></div>
      <form onSubmit={submit} className="form-grid" style={{marginTop:26}}>
        {error && <div className="error">{error}</div>}
        <div className="field"><label>Email</label><div style={{position:'relative'}}><Mail size={16} style={{position:'absolute',left:13,top:16,color:'#7a817d'}}/><input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@example.com" required style={{paddingLeft:40,width:'100%'}}/></div></div>
        <div className="field"><label>Password</label><div style={{position:'relative'}}><Lock size={16} style={{position:'absolute',left:13,top:16,color:'#7a817d'}}/><input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Your password" required style={{paddingLeft:40,width:'100%'}}/></div></div>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? <Loader2 size={16} style={{animation:'spin 1s linear infinite'}}/> : <ArrowRight size={16}/>} {busy ? 'Signing in…' : 'Sign in'}</button>
        <button className="btn btn-secondary" type="button" onClick={google}>Continue with Google</button>
      </form>
      <div style={{marginTop:20,textAlign:'center',fontSize:12,color:'#737b76'}}>New to AgriMark? <Link href="/auth/register" style={{color:'#1B4D3E',fontWeight:800}}>Create your account</Link></div>
    </div>
  </div>;
}
