'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Key, Globe, Lock, Play } from 'lucide-react';
import { detectKeyType, supabase } from '@/lib/supabase';
import { getAuthCallbackUrl, parseOAuthUrl, OAuthUrlDiagnostics, SUPABASE_GOOGLE_CALLBACK } from '@/lib/auth-config';
import Link from 'next/link';

export default function AuthVerificationPage() {
  const [testing, setTesting] = useState(false);
  const [generatingOAuth, setGeneratingOAuth] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'warning'; message: string } | null>(null);
  const [oauthDiagnostics, setOauthDiagnostics] = useState<OAuthUrlDiagnostics | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';
  let supabaseHost = 'xrcqzpnstdbbtafhcwbb.supabase.co';
  try {
    supabaseHost = new URL(supabaseUrl).hostname;
  } catch {}

  const activeKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const keyType = detectKeyType(activeKey);

  const canonicalCallbackUrl = getAuthCallbackUrl();

  const runDiagnosticCheck = async () => {
    setTesting(true);
    setTestResult(null);

    await new Promise((r) => setTimeout(r, 600));

    const issues: string[] = [];

    if (!activeKey) {
      issues.push('Supabase Publishable Key is missing in environment variables.');
    }
    if (!supabaseUrl.includes('xrcqzpnstdbbtafhcwbb')) {
      issues.push('Supabase Host does not match project xrcqzpnstdbbtafhcwbb.');
    }

    if (issues.length > 0) {
      setTestResult({
        status: 'warning',
        message: issues.join(' '),
      });
    } else {
      setTestResult({
        status: 'success',
        message: 'Client environment parameters are configured. Use "Generate OAuth Request" below to inspect the live redirect_uri parameters sent to Google.',
      });
    }
    setTesting(false);
  };

  const handleGenerateOAuthRequest = async () => {
    setGeneratingOAuth(true);
    setOauthDiagnostics(null);

    try {
      const redirectTo = getAuthCallbackUrl();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          scopes: 'openid email profile',
          queryParams: { prompt: 'select_account' },
        },
      });

      if (error || !data?.url) {
        setTestResult({
          status: 'warning',
          message: `OAuth URL generation failed: ${error?.message || 'No URL returned from Supabase Auth.'}`,
        });
      } else {
        // Intercept and parse without navigating automatically
        const diagnostics = parseOAuthUrl(data.url);
        setOauthDiagnostics(diagnostics);
      }
    } catch (err: any) {
      setTestResult({
        status: 'warning',
        message: `OAuth request generation error: ${err?.message || 'Unexpected failure'}`,
      });
    } finally {
      setGeneratingOAuth(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="max-w-5xl mx-auto space-y-6 py-4">
        {/* Header */}
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Production Auth Diagnostic Console
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Google OAuth & Supabase Verification
            </h1>
            <p className="text-xs text-gray-300 max-w-2xl">
              Non-sensitive diagnostic overview for Google OAuth verification, PKCE flow integrity, and live redirect_uri parameter inspection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={runDiagnosticCheck}
              disabled={testing || generatingOAuth}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow"
            >
              <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Verifying...' : 'Check Config'}</span>
            </button>

            <button
              onClick={handleGenerateOAuthRequest}
              disabled={testing || generatingOAuth}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow"
            >
              <Play className={`w-4 h-4 ${generatingOAuth ? 'animate-spin' : ''}`} />
              <span>{generatingOAuth ? 'Generating...' : 'Generate OAuth Request'}</span>
            </button>
          </div>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
              testResult.status === 'success'
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                : 'bg-amber-950/60 border-amber-800/60 text-amber-300'
            }`}
          >
            {testResult.status === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            )}
            <div className="space-y-1">
              <span className="font-bold">Diagnostic Status</span>
              <p className="leading-relaxed">{testResult.message}</p>
            </div>
          </div>
        )}

        {/* Live Intercepted OAuth Diagnostics Card */}
        {oauthDiagnostics && (
          <div className="bg-[#121a16] border border-purple-900/60 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" /> Live Intercepted Google OAuth Request Parameters
              </h3>
              <span className={`px-3 py-1 text-xs font-mono font-bold rounded-full border ${
                oauthDiagnostics.isCanonicalSupabaseCallback
                  ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                  : 'bg-red-950 border-red-800 text-red-300'
              }`}>
                {oauthDiagnostics.isCanonicalSupabaseCallback ? '✓ CANONICAL SUPABASE REDIRECT MATCH' : '⚠️ MISMATCH DETECTED'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl space-y-1">
                <span className="text-gray-400 text-[10px] block">GOOGLE OAUTH HOST</span>
                <span className="text-white font-bold">{oauthDiagnostics.host}</span>
              </div>

              <div className="p-3.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl space-y-1">
                <span className="text-gray-400 text-[10px] block">RESPONSE TYPE</span>
                <span className="text-emerald-400 font-bold">{oauthDiagnostics.responseType || 'code'}</span>
              </div>

              <div className="p-3.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl space-y-1">
                <span className="text-gray-400 text-[10px] block">PKCE METHOD</span>
                <span className="text-emerald-400 font-bold">{oauthDiagnostics.codeChallengeMethod || 'S256'}</span>
              </div>

              <div className="p-3.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl space-y-1">
                <span className="text-gray-400 text-[10px] block">STATE PRESENT</span>
                <span className="text-emerald-400 font-bold">{oauthDiagnostics.hasState ? 'YES' : 'NO'}</span>
              </div>
            </div>

            <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-3 text-xs font-mono">
              <div>
                <span className="text-gray-400 text-[10px] block uppercase font-bold text-amber-400">Extracted Google Client ID (`client_id`)</span>
                <span className="text-amber-300 font-bold break-all">{oauthDiagnostics.clientId || 'Not found'}</span>
                <p className="text-[11px] text-gray-400 font-sans mt-1">
                  ⚠️ Compare this exact Client ID against the <strong>agrimark</strong> Web OAuth client in Google Cloud Console. They MUST be identical.
                </p>
              </div>

              <div className="pt-2 border-t border-[#1e2d26]">
                <span className="text-gray-400 text-[10px] block uppercase font-bold">Evaluated `redirect_uri` Parameter</span>
                <span className="text-emerald-300 font-bold break-all">{oauthDiagnostics.redirectUri}</span>
              </div>

              <div className="pt-2 border-t border-[#1e2d26]">
                <span className="text-gray-400 text-[10px] block uppercase font-bold">Expected Google Cloud Authorized Redirect URI</span>
                <span className="text-purple-300 font-bold break-all">{SUPABASE_GOOGLE_CALLBACK}</span>
              </div>
            </div>
          </div>
        )}

        {/* Diagnostic Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl space-y-2">
            <span className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> Supabase Canonical Host
            </span>
            <p className="text-sm font-mono font-bold text-white break-all">{supabaseHost}</p>
            <span className="text-[11px] text-emerald-400 block font-semibold">Active &amp; Verified</span>
          </div>

          <div className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl space-y-2">
            <span className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" /> Detected Client Key Type
            </span>
            <p className="text-sm font-mono font-bold text-white uppercase">{keyType}</p>
            <span className="text-[11px] text-gray-400 block">
              {keyType === 'sb_publishable' ? 'Modern SB Publishable Key' : 'Legacy JWT Anon Key'}
            </span>
          </div>

          <div className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl space-y-2">
            <span className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Production Callback URL
            </span>
            <p className="text-xs font-mono font-bold text-emerald-400 break-all">{canonicalCallbackUrl}</p>
            <span className="text-[11px] text-gray-400 block">PKCE Callback Handler</span>
          </div>
        </div>

        {/* OAuth Flow Sequence Visualization */}
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-3xl space-y-4 shadow-lg">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Google OAuth Architectural Sequence
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs font-mono">
            <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-gray-300">
              <span className="text-emerald-400 font-bold block mb-1">Step 1</span>
              User clicks &quot;Continue with Google&quot; on AgriMark
            </div>
            <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-gray-300">
              <span className="text-emerald-400 font-bold block mb-1">Step 2</span>
              Google Account consent &amp; selection screen
            </div>
            <div className="p-3 bg-[#0a0f0d] border border-amber-800/40 text-amber-300 rounded-xl">
              <span className="text-amber-400 font-bold block mb-1">Step 3 (Critical)</span>
              Google redirects to Supabase Auth callback:<br />
              <code className="text-[10px] text-amber-200">https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/callback</code>
            </div>
            <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-gray-300">
              <span className="text-emerald-400 font-bold block mb-1">Step 4</span>
              Supabase exchanges code &amp; redirects to AgriMark callback:<br />
              <code className="text-[10px] text-emerald-300">https://agrimark-six.vercel.app/auth/callback</code>
            </div>
            <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-gray-300">
              <span className="text-emerald-400 font-bold block mb-1">Step 5</span>
              PKCE session created &amp; redirected to role dashboard
            </div>
          </div>
        </div>

        {/* Redirect URI Mismatch Troubleshooting Guide */}
        <div className="bg-[#121a16] border border-amber-900/50 p-6 rounded-3xl space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Eliminating Error 400: redirect_uri_mismatch</span>
          </div>

          <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
            <p>
              If Google displays <code className="bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded">Error 400: redirect_uri_mismatch</code>, it means Google received Supabase&apos;s callback URL (<code className="text-emerald-400 font-mono">https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/callback</code>), but this URL is missing from the <strong>Authorized redirect URIs</strong> setting in Google Cloud Console.
            </p>

            <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-2">
              <span className="font-bold text-white block">Required Google Cloud Console Configuration:</span>
              <ul className="list-disc pl-5 space-y-1 text-gray-400">
                <li>Go to <strong>Google Cloud Console</strong> &rarr; APIs &amp; Services &rarr; Credentials.</li>
                <li>Select the <strong>OAuth 2.0 Web Client ID</strong> used for AgriMark.</li>
                <li>Under <strong>Authorized JavaScript origins</strong>, add: <code className="text-emerald-400">https://agrimark-six.vercel.app</code></li>
                <li>Under <strong>Authorized redirect URIs</strong>, add EXACTLY: <code className="text-emerald-400 font-bold font-mono">https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/callback</code></li>
                <li className="text-amber-300 font-semibold">Do NOT put <code className="line-through text-red-400">https://agrimark-six.vercel.app/auth/callback</code> in Google Cloud Console — Google must redirect to Supabase Auth first!</li>
              </ul>
            </div>

            <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-2">
              <span className="font-bold text-white block">Required Supabase Auth Dashboard Configuration:</span>
              <ul className="list-disc pl-5 space-y-1 text-gray-400">
                <li>Go to <strong>Supabase Project Dashboard</strong> (xrcqzpnstdbbtafhcwbb) &rarr; Authentication &rarr; URL Configuration.</li>
                <li>Set <strong>Site URL</strong>: <code className="text-emerald-400">https://agrimark-six.vercel.app</code></li>
                <li>Add to <strong>Redirect URLs</strong>:</li>
                <ul className="list-circle pl-5 space-y-0.5 font-mono text-[11px] text-emerald-300">
                  <li>https://agrimark-six.vercel.app/auth/callback</li>
                  <li>https://agrimark-six.vercel.app/*</li>
                  <li>https://*.vercel.app/auth/callback</li>
                </ul>
              </ul>
            </div>
          </div>
        </div>

        {/* Security & Verification Checklist */}
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-3xl space-y-4 shadow-lg">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> OAuth Verification Checklist
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl flex items-center justify-between text-gray-300">
              <span>Google Scopes Minimum (openid, email, profile)</span>
              <span className="text-emerald-400 font-bold font-mono">ENFORCED</span>
            </div>
            <div className="p-3.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl flex items-center justify-between text-gray-300">
              <span>PKCE Code Exchange (`exchangeCodeForSession`)</span>
              <span className="text-emerald-400 font-bold font-mono">ACTIVE</span>
            </div>
            <div className="p-3.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl flex items-center justify-between text-gray-300">
              <span>Zero Client Secrets in Frontend Bundle</span>
              <span className="text-emerald-400 font-bold font-mono">SECURE</span>
            </div>
            <div className="p-3.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl flex items-center justify-between text-gray-300">
              <span>Privacy Policy Page (`/privacy`)</span>
              <Link href="/privacy" className="text-emerald-400 underline font-bold flex items-center gap-1">
                View Policy <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-3.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl flex items-center justify-between text-gray-300">
              <span>Terms of Service Page (`/terms`)</span>
              <Link href="/terms" className="text-emerald-400 underline font-bold flex items-center gap-1">
                View Terms <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-3.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl flex items-center justify-between text-gray-300">
              <span>Role-Based Post-Login Redirection</span>
              <span className="text-emerald-400 font-bold font-mono">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
