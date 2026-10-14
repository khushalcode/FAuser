/**
 * Supabase client for Food Munch Customer app.
 *
 * - Reads config from (in priority order):
 *     1. EXPO_PUBLIC_SUPABASE_* env vars (override for EAS builds, .env files)
 *     2. `Constants.expoConfig.extra.supabaseUrl` / `supabaseAnonKey` baked
 *        into app.json
 * - If both are missing/invalid, `isSupabaseConfigured` is false and the api
 *   layer falls back to local mock data so the app remains fully interactive
 *   in Expo Go preview.
 * - The client is created lazily on first access (via the `supabase` getter)
 *   so that:
 *     1. Static / SSR web renders don't touch AsyncStorage (which would
 *        throw `window is not defined` in Node).
 *     2. The initial JS bundle stays small — Supabase's network code only
 *        spins up if a screen actually calls into it.
 *
 * Also exposes helpers used by the realtime + storage modules.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig as any)?.extra ?? {};

const supabaseUrl = (
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  (typeof extra.supabaseUrl === 'string' ? extra.supabaseUrl : '') ||
  ''
).trim();

const supabaseAnonKey = (
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  (typeof extra.supabaseAnonKey === 'string' ? extra.supabaseAnonKey : '') ||
  ''
).trim();

export const isSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('your_supabase_url') &&
  !supabaseAnonKey.includes('your-anon-key');

let cachedClient: SupabaseClient | null = null;
let clientInitAttempted = false;

/**
 * Lazy Supabase client getter. Returns `null` when:
 *   - Supabase isn't configured (mock mode)
 *   - The app is rendering on a server (Node SSR) where AsyncStorage isn't
 *     available — we skip creating the client to avoid crashing the SSR
 *     render pass. The mobile / web client builds still get a real client.
 */
function getSupabaseClient(): SupabaseClient | null {
  if (clientInitAttempted) return cachedClient;
  clientInitAttempted = true;

  if (!isSupabaseConfigured) return null;

  // Don't try to create the client during SSR — AsyncStorage needs `window`.
  // Expo Router's static render runs in Node, so guard against that.
  const isSSR =
    typeof window === 'undefined' &&
    typeof (globalThis as any).localStorage === 'undefined';

  if (isSSR) return null;

  try {
    // Lazy-require AsyncStorage so the import is free in SSR contexts.
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    cachedClient = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      },
      realtime: {
        params: { eventsPerSecond: 5 }
      }
    });
  } catch (e) {
    console.warn('[supabase] init failed, falling back to mock data', e);
    cachedClient = null;
  }

  return cachedClient;
}

/**
 * Lazy proxy: `import { supabase } from '@/lib/supabase'` returns an object
 * whose property accesses forward to the underlying client (created on
 * first access). This keeps the existing `supabase.from(...)` call sites
 * working without any refactor.
 */
export const supabase: SupabaseClient | null = new Proxy(
  {} as SupabaseClient,
  {
    get(_target, prop) {
      const client = getSupabaseClient();
      if (!client) return undefined;
      const value = (client as any)[prop];
      return typeof value === 'function' ? value.bind(client) : value;
    }
  }
) as SupabaseClient | null;

/**
 * Public URL helper for Supabase Storage assets.
 * Returns null when Supabase isn't configured.
 */
export function getPublicUrl(bucket: string, path: string): string | null {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch {
    return null;
  }
}
