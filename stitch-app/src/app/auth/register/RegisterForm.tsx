'use client';

import { useState } from 'react';
import { ArrowRight, Leaf, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { trackAction } from '@/lib/telemetry';

export default function RegisterForm() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'farmer' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setMessage(''); setBusy(true);
    const started = performance.now();
    try {
      if (form.password.length < 8) throw new Error('Password must be at least 8 characters.');
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(), password: form.password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/onboarding`, data: { full_name: form.full_name, phone: form.phone, requested_role: form.role } },
      });
      if (authError) throw new Error(authError.message);
      if (!data.user) throw new Error('Account creation did not return a user.');
      const { error: profileError } = await supabase.schema('stitch_app').from('user_profiles').upsert({
        user_id: data.user.id, full_name: form.full_name, phone: form.phone, role: form.role, onboarding_completed: false, updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (profileError) throw profileError;
      void trackAction('register', '/auth/register', true, Math.round(performance.now() - started), { role: form.role });
      if (data.session) window.location.assign('/auth/onboarding');
      else setMessage('Account created. Check your email to confirm your address, then sign in.');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Unable to create the account.';
      setError(text);
      void trackAction('register', '/auth/register', false, Math.round(performance.now() - started));
    } finally { setBusy(false); }
  };

  return <div className="login-page"><div className="login-card">
    <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:7,fontSize:12,fontWeight:800,color:'#68716b'}}><Leaf size={15}/> Back to AgriMark</Link>
    <div style={{marginTop:24,display:'flex',alignItems:'center',gap:12}}><div className="logo"><Leaf/></div><div><div style={{fontWeight:800,fontSize:20}}>Create your AgriMark account</div><div style={{fontSize:12,color:'#727a75'}}>Start with the essentials. Complete your farm profile next.</div></div></div>
    <form onSubmit={submit} className="form-grid" style={{marginTop:26}}>
      {error && <div className="error">{error}</div>}{message && <div style={{padding:11,borderRadius:12,background:'#edf6ef',color:'#257042',fontSize:12}}>{message}</div>}
      <div className="field"><label>Full name</label><input value={form.full_name} onChange={(e)=>update('full_name',e.target.value)} placeholder="Your name" required/></div>
      <div className="field"><label>Email</label><input value={form.email} onChange={(e)=>update('email',e.target.value)} type="email" autoComplete="email" placeholder="you@example.com" required/></div>
      <div className="field"><label>Mobile number</label><input value={form.phone} onChange={(e)=>update('phone',e.target.value)} type="tel" autoComplete="tel" placeholder="+91 98765 43210"/></div>
      <div className="field"><label>Primary role</label><select value={form.role} onChange={(e)=>update('role',e.target.value)}><option value="farmer">Farmer</option><option value="buyer">Buyer</option><option value="fpo">FPO</option><option value="logistics">Logistics</option><option value="service_provider">Service provider</option></select></div>
      <div className="field"><label>Password</label><input value={form.password} onChange={(e)=>update('password',e.target.value)} type="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required/></div>
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? <Loader2 size={16}/> : <ArrowRight size={16}/>} {busy ? 'Creating…' : 'Create account'}</button>
    </form>
    <div style={{marginTop:20,textAlign:'center',fontSize:12,color:'#737b76'}}>Already registered? <Link href="/auth/login" style={{color:'#1B4D3E',fontWeight:800}}>Log in</Link></div>
  </div></div>;
}
