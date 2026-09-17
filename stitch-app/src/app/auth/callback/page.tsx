'use client';

import { useEffect, useState } from 'react';
import { Loader2, Leaf } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { resetTelemetrySession, trackAction } from '@/lib/telemetry';

export default function AuthCallbackPage() {
  const params = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      const started = performance.now();
      try {
        const code = params.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user was returned.');
        resetTelemetrySession();
        await supabase.schema('stitch_app').from('user_profiles').upsert({
          user_id: user.id,
          full_name: String(user.user_metadata?.full_name || ''),
          phone: String(user.user_metadata?.phone || ''),
          role: String(user.user_metadata?.requested_role || 'farmer'),
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        await trackAction('auth_callback', '/auth/callback', true, Math.round(performance.now() - started));
        const next = params.get('next');
        window.location.replace(next && next.startsWith('/') ? next : '/auth/onboarding');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication callback failed.';
        setError(message);
        void trackAction('auth_callback', '/auth/callback', false, Math.round(performance.now() - started));
      }
    };
    void run();
  }, [params]);

  return <div className="login-page"><div className="login-card" style={{textAlign:'center'}}><div className="logo" style={{margin:'0 auto'}}><Leaf/></div><div style={{fontWeight:800,fontSize:20,marginTop:16}}>{error ? 'Authentication needs attention' : 'Finishing sign-in…'}</div>{error ? <div className="error" style={{marginTop:16}}>{error}</div> : <div style={{marginTop:18,color:'#727a75'}}><Loader2 size={20}/></div>}</div></div>;
}
