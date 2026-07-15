/**
 * Browser-safe Supabase config from Vite env (`.env.local`).
 * Never put SUPABASE_SERVICE_ROLE_KEY behind a VITE_ prefix.
 */
export function getSupabaseBrowserEnv() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

  if (!url) {
    throw new Error('VITE_SUPABASE_URL is not set. Add it to .env.local')
  }

  if (!anonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY is not set. Add it to .env.local')
  }

  return { url, anonKey } as const
}

export function hasSupabaseBrowserEnv() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL?.trim() &&
      import.meta.env.VITE_SUPABASE_ANON_KEY?.trim(),
  )
}
