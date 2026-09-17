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
  } catch (_) {
    // Telemetry errors fail silently to not block UI
  }
}

export async function recordActionEvent(actionName: string, payload?: Record<string, any>) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;
    const client = (supabase as any);
    if (client && client.from) {
      await client.from('action_events').insert({
        action_name: actionName,
        user_id: userId,
        payload: payload || {},
        timestamp: new Date().toISOString(),
      });
    }
  } catch (_) {
    // Telemetry errors fail silently
  }
}
