# Central Hub — integration docs

Research notes and implementation plans for third-party APIs we may wire into the hub.

| Integration | Nav route | Docs |
|-------------|-----------|------|
| Supabase (Hub database) | — | [supabase/](./supabase/) |
| GitHub (repos) | `/git` | [github-api/](./github-api/) |
| Vercel (deployments) | `/vercel` | [vercel-api/](./vercel-api/) |
| Firebase (projects / Auth / Hosting) | `/firebase` | [firebase-api/](./firebase-api/) |

**Shared rule:** privileged tokens live on a **backend/BFF** only. Browser may use `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` with RLS — never put the service role behind `VITE_*`.
