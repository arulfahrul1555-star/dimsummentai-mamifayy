import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Helper to safely read and sanitize credentials
function getEnvConfig() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const anonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  ).trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  return { url, anonKey, serviceRoleKey };
}

/**
 * Checks if Supabase credentials are configured with valid non-placeholder values.
 */
export function isSupabaseConfigured(): boolean {
  const { url, anonKey, serviceRoleKey } = getEnvConfig();

  if (!url || !url.startsWith('http')) {
    return false;
  }
  // Ignore template placeholders
  if (url.includes('your-project-id') || url.includes('placeholder')) {
    return false;
  }
  const key = serviceRoleKey || anonKey;
  if (!key || key.includes('your-anon-key') || key.includes('your-service-role-key') || key.length < 20) {
    return false;
  }
  return true;
}

let publicClientInstance: SupabaseClient | null = null;
let publicClientKey: string | null = null;
let adminClientInstance: SupabaseClient | null = null;
let adminClientKey: string | null = null;

/**
 * Returns public Supabase client (using NEXT_PUBLIC_SUPABASE_ANON_KEY).
 * Suitable for client-side or public anon reads.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const { url, anonKey, serviceRoleKey } = getEnvConfig();
  const key = anonKey || serviceRoleKey;
  const cacheKey = `${url}:${key}`;

  if (!publicClientInstance || publicClientKey !== cacheKey) {
    publicClientInstance = createClient(url, key, {
      auth: {
        persistSession: false,
      },
    });
    publicClientKey = cacheKey;
  }
  return publicClientInstance;
}

/**
 * Returns Supabase client for server-side API routes.
 * Prefers SUPABASE_SERVICE_ROLE_KEY (to bypass RLS for administrative operations)
 * and falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const { url, anonKey, serviceRoleKey } = getEnvConfig();
  const key = serviceRoleKey || anonKey;
  const cacheKey = `${url}:${key}`;

  if (!adminClientInstance || adminClientKey !== cacheKey) {
    adminClientInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    adminClientKey = cacheKey;
  }
  return adminClientInstance;
}

