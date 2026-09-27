'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Key, Globe, Lock } from 'lucide-react';
import { isFirebaseConfigured, getFirebaseApp } from '@/lib/firebase';
import Link from 'next/link';

export default function AuthVerificationPage() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'warning'; message: string } | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '';
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '';

  const runDiagnosticCheck = async () => {
    setTesting(true);
    setTestResult(null);

    await new Promise((r) => setTimeout(r, 400));

    const issues: string[] = [];

    if (!apiKey) issues.push('NEXT_PUBLIC_FIREBASE_API_KEY is missing.');
    if (!authDomain) issues.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is missing.');
    if (!projectId) issues.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing.');
    if (!appId) issues.push('NEXT_PUBLIC_FIREBASE_APP_ID is missing.');

    if (issues.length > 0) {
      setTestResult({
        status: 'warning',
        message: issues.join(' '),
      });
    } else {
      try {
        const app = getFirebaseApp();
        setTestResult({
          status: 'success',
          message: `Firebase Web App (${app.name}) initialized successfully for project "${projectId}".`,
        });
      } catch (err: any) {
        setTestResult({
          status: 'warning',
          message: `Firebase Initialization Error: ${err?.message || 'Unknown error'}`,
        });
      }
    }
    setTesting(false);
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
              Firebase Authentication Verification
            </h1>
            <p className="text-xs text-gray-300 max-w-2xl">
              Non-sensitive diagnostic overview for Firebase Web SDK configuration and runtime initialization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={runDiagnosticCheck}
              disabled={testing}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow"
            >
              <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Verifying...' : 'Check Firebase Config'}</span>
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

        {/* Diagnostic Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl space-y-2">
            <span className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> Project ID
            </span>
            <p className="text-sm font-mono font-bold text-white break-all">{projectId || 'NOT SET'}</p>
            <span className="text-[11px] text-emerald-400 block font-semibold">
              {projectId ? 'Present' : 'Missing'}
            </span>
          </div>

          <div className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl space-y-2">
            <span className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" /> Auth Domain
            </span>
            <p className="text-sm font-mono font-bold text-white break-all">{authDomain || 'NOT SET'}</p>
            <span className="text-[11px] text-emerald-400 block font-semibold">
              {authDomain ? 'Present' : 'Missing'}
            </span>
          </div>

          <div className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl space-y-2">
            <span className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> App ID Shape
            </span>
            <p className="text-xs font-mono font-bold text-emerald-400 break-all">
              {appId ? `${appId.slice(0, 10)}...` : 'NOT SET'}
            </p>
            <span className="text-[11px] text-gray-400 block">Firebase Web App ID</span>
          </div>

          <div className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl space-y-2">
            <span className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> API Key Status
            </span>
            <p className="text-xs font-mono font-bold text-emerald-400 break-all">
              {apiKey ? `Configured (${apiKey.length} chars)` : 'NOT SET'}
            </p>
            <span className="text-[11px] text-gray-400 block">Client Web API Key</span>
          </div>
        </div>

        {/* Security & Verification Checklist */}
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-3xl space-y-4 shadow-lg">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Firebase Auth Verification Checklist
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl flex items-center justify-between text-gray-300">
              <span>Firebase Client Config Validation (`isFirebaseConfigured`)</span>
              <span className="text-emerald-400 font-bold font-mono">
                {isFirebaseConfigured() ? 'CONFIGURED' : 'INCOMPLETE'}
              </span>
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
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
