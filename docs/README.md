# Central Hub — integration docs

Research notes and implementation plans for third-party APIs we may wire into the hub.

| Integration | Nav route | Docs |
|-------------|-----------|------|
| GitHub (repos) | `/git` | [github-api/](./github-api/) |
| Vercel (deployments) | `/vercel` | [vercel-api/](./vercel-api/) |
| Firebase (projects / Auth / Hosting) | `/firebase` | [firebase-api/](./firebase-api/) |

**Shared rule:** tokens live on a **backend/BFF** only — never `VITE_*` secrets in the React app.
