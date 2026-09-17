import { supabase } from './supabase';

export async function recordScreenView(screenName: string, role?: string) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;
    const client = (supabase as any);
    if (client && client.from) {
      await client.from('screen_events').insert({
        screen_name: screenName,
        user_id: userId,
        role: role || 'guest',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (_) {}
}

export async function recordActionEvent(
  actionName: string,
  payloadOrPath?: any,
  success?: boolean,
  latencyMs?: number,
  extraPayload?: Record<string, any>
) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;
    const client = (supabase as any);
    if (client && client.from) {
      await client.from('action_events').insert({
        action_name: actionName,
        user_id: userId,
        payload: typeof payloadOrPath === 'object' ? payloadOrPath : { path: payloadOrPath, success, latencyMs, ...extraPayload },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (_) {}
}

export function resetTelemetrySession() {
  // Session reset helper
}

// Aliases for telemetry compatibility
export const trackAction = recordActionEvent;
export const trackScreenView = recordScreenView;
export const trackScreen = recordScreenView;
