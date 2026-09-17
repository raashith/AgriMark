'use client';

import { useEffect, useState } from 'react';
import { Loader2, Leaf } from 'lucide-react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const [error, setError] = useState('');
  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (token) localStorage.setItem('agrimark_token', token);

        const profile = await api.me();
        localStorage.setItem('agrimark_user', JSON.stringify(profile));
        window.location.replace(profile.role === 'farmer' ? '/farmer/dashboard' : '/marketplace');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication callback failed.');
      }
    };
    void run();
  }, []);

  return <div className="login-page"><div className="login-card" style={{textAlign:'center'}}><div className="logo" style={{margin:'0 auto'}}><Leaf/></div><div style={{fontWeight:800,fontSize:20,marginTop:16}}>{error ? 'Authentication needs attention' : 'Finishing sign-in…'}</div>{error ? <div className="error" style={{marginTop:16}}>{error}</div> : <div style={{marginTop:18,color:'#727a75'}}><Loader2 size={20}/></div>}</div></div>;
}
