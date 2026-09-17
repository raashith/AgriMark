'use client';

import { supabase } from './supabase';

let sessionId: string | null = null;

async function ensureSession() {
  if (sessionId) return sessionId;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .schema('stitch_app')
    .from('sessions')
    .insert({ user_id: user.id, app_version: '1.0.0', user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : null })
    .select('id')
    .single();
  sessionId = data?.id ?? null;
  return sessionId;
}

export async function trackScreen(route: string, metadata: Record<string, unknown> = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sid = await ensureSession();
    await supabase.schema('stitch_app').from('screen_events').insert({
      session_id: sid,
      user_id: user?.id ?? null,
      route,
      event_type: 'view',
      metadata,
    });
  } catch {
    // Telemetry must never block a screen from rendering.
  }
}

export async function trackAction(actionName: string, route?: string, success?: boolean, durationMs?: number, metadata: Record<string, unknown> = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sid = await ensureSession();
    await supabase.schema('stitch_app').from('action_events').insert({
      session_id: sid,
      user_id: user?.id ?? null,
      route,
      action_name: actionName,
      success: success ?? null,
      duration_ms: durationMs ?? null,
      metadata,
    });
  } catch {
    // Telemetry must never block user actions.
  }
}

export function resetTelemetrySession() {
  sessionId = null;
}
