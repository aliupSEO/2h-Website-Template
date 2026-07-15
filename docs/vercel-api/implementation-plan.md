# Implementation plan — Vercel deployments in Central Hub

Goal: replace the placeholder **Vercel** page with project list, live deployments, and safe Redeploy / Promote / Rollback actions.

Git flow: branch from `dev` (e.g. `feature/vercel-deployments`) → PR into `dev`.

---

## Auth path

| Phase | Auth | Why |
|-------|------|-----|
| **0 – Spike** | Account access token + `teamId` via curl / tiny proxy | Prove list + redeploy |
| **1 – Hub MVP** | Same token on BFF for operators | Internal hub value fast |
| **2 – Harden** | Per-team tokens in secret store; optional Deploy Hooks per project | Narrow blast radius |
| **3 – Optional** | Vercel Integration / webhooks | Multi-tenant / auto-refresh |

Same rule as GitHub: **no browser-held tokens**.

---

## Architecture

```
┌──────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│  Vercel page UI  │────▶│  Hub API / BFF        │────▶│  api.vercel.com  │
│  features/vercel │     │  VERCEL_TOKEN + team  │     │  REST / @vercel/sdk │
└──────────────────┘     └──────────────────────┘     └──────────────────┘
```

---

## Folder placement

```
src/
  features/vercel/
    components/     # ProjectList, DeploymentsTable, DeploymentStatusBadge, RedeployButton
    hooks/          # useProjects, useDeployments, useRedeploy
    schemas.ts      # Zod if any forms (e.g. filter / promote confirm notes)
    types.ts
    index.ts
  services/
    vercelService.ts   # Hub BFF only
  pages/vercel/
    VercelPage.tsx
```

---

## Phases

### Phase 0 — Spike

- [ ] Create Vercel access token scoped to the right Team.
- [ ] Curl: list projects, list deployments for one `projectId`, redeploy via `deploymentId`.
- [ ] Note Team ID + a sample `prj_` / `dpl_` ids for fixtures.
- [ ] Add empty placeholders to `.env.example`: `VERCEL_TOKEN=`, `VERCEL_TEAM_ID=` (server-only).

**Exit:** known-good requests for list + redeploy.

### Phase 1 — BFF + service

Suggested Hub routes:

| Hub route | Proxies |
|-----------|---------|
| `GET /api/vercel/projects` | `GET /v9/projects?teamId=…` |
| `GET /api/vercel/projects/:projectId/deployments` | `GET /v6/deployments?projectId=…&limit=…` |
| `GET /api/vercel/deployments/:id` | get deployment |
| `POST /api/vercel/deployments/:id/redeploy` | `POST /v13/deployments` + `deploymentId` |
| `POST /api/vercel/projects/:projectId/promote/:deploymentId` | promote |
| `POST /api/vercel/projects/:projectId/rollback/:deploymentId` | rollback |

- [ ] Use `@vercel/sdk` on the server.
- [ ] Map DTOs → Hub types (`id`, `url`, `readyState`, `target`, `createdAt`, `inspectorUrl`, branch/sha from `meta`).
- [ ] `vercelService.ts` used only from feature hooks.

### Phase 2 — `/vercel` UX (MVP)

- [ ] Projects list (search, last updated).
- [ ] Project detail / panel: deployments table with status badge, env (`production` / preview), URL + inspector link.
- [ ] Polling or manual refresh while `BUILDING` / `QUEUED`.
- [ ] **Redeploy** → `ConfirmModal` → BFF → toast; disable while in flight.
- [ ] Loading via `Loading` / `LoadingScreen`; no custom spinners.
- [ ] Empty / error states (bad token, wrong team).

**Exit:** operator can see deployments and trigger a rebuild from the Hub.

### Phase 3 — Promote / Rollback

- [ ] Actions on a `READY` deployment: Promote (no rebuild), Rollback (confirm strongly).
- [ ] Explain in UI copy: promote ≠ rebuild; redeploy = new build.

### Phase 4 — Link to Clients / Git

- [ ] Optional Client fields: `vercelProjectId`, production hostname.
- [ ] From GitHub repo link on Client → jump to matching Vercel project when `link` matches.

### Phase 5 — Polish

- [ ] Webhooks → invalidate cache / push “deployment READY”.
- [ ] Show truncated build error message from deployment payload.
- [ ] Deploy Hook fallback for projects where API redeploy is restricted.
- [ ] Filter by branch / state (mirror dashboard dropdowns).

---

## MVP API contract (Hub ↔ UI)

```ts
// GET /api/vercel/projects/:id/deployments
{
  deployments: Array<{
    id: string
    url: string | null
    inspectorUrl: string | null
    readyState: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED' | 'BLOCKED' | 'INITIALIZING'
    target: 'production' | 'staging' | null
    createdAt: number
    branch?: string
    sha?: string
  }>
}

// POST /api/vercel/deployments/:id/redeploy → { deployment: { id, url, readyState } }
```

---

## Env checklist

| Name | Where | Notes |
|------|--------|------|
| `VERCEL_TOKEN` | Server only | Access token |
| `VERCEL_TEAM_ID` | Server (ok to expose as non-secret if needed) | Required for team resources |
| Deploy Hook URLs | Server only | Optional per-project |

---

## Testing plan

- [ ] List shows private/team projects with correct token scope.
- [ ] Redeploy creates new `dpl_` and moves through BUILDING → READY (or ERROR).
- [ ] Promote / rollback only after confirm; wrong id → clear error toast.
- [ ] Revoked token → 401 surfaced in UI.

---

## First shipping slices (PRs)

1. Docs (this folder).  
2. `feature/vercel-projects-list` — BFF stub/mock + projects UI.  
3. `feature/vercel-deployments` — deployments table + poll.  
4. `feature/vercel-redeploy` — confirm + redeploy.  
5. Later: promote/rollback + client links.

---

## Out of scope for MVP

- Creating brand-new Vercel projects from Hub (possible via API; defer).  
- Editing env vars in Hub (Vercel dashboard / Env feature later).  
- Full log streaming UI (link to `inspectorUrl` first).
