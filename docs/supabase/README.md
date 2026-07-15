# Supabase — Central Hub

Production-style setup: SQL migrations in-repo, typed JS client, secrets only in `.env.local`.

## Layout

| Path | Role |
|------|------|
| `supabase/config.toml` | Local Supabase CLI config |
| `supabase/migrations/` | Versioned SQL migrations (schema lives here) |
| `src/lib/supabase/` | Browser client + `Database` types |
| `.env.example` | Env key names |
| `.env.local` | Real keys (gitignored) |

## Env keys

| Key | Where | Notes |
|-----|--------|------|
| `VITE_SUPABASE_URL` | Browser | Project URL |
| `VITE_SUPABASE_ANON_KEY` | Browser | Anon/public key — **RLS required** |
| `SUPABASE_URL` | Server / CLI | Same URL for BFF/tooling |
| `SUPABASE_ANON_KEY` | Server / CLI | Optional mirror of anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Bypasses RLS — **never** `VITE_*` |

Get values: [Supabase Dashboard → Project Settings → API](https://supabase.com/dashboard/project/_/settings/api).

## Scripts

```bash
npm run db:start    # local Docker stack
npm run db:stop
npm run db:status
npm run db:reset    # apply migrations (+ seed if configured)
npm run db:push     # push migrations to linked remote
npm run db:types    # regenerate src/lib/supabase/database.types.ts from local DB
```

## Next steps (schema)

1. Fill `.env.local` with your project URL + anon key.
2. `supabase link --project-ref <ref>` (optional, for remote).
3. Add SQL under `supabase/migrations/` (e.g. `YYYYMMDDHHMMSS_create_clients.sql`).
4. `npm run db:reset` (local) or `npm run db:push` (remote).
5. `npm run db:types`.

Use `getSupabaseClient()` from `@/lib/supabase` in services — not in low-level UI.
