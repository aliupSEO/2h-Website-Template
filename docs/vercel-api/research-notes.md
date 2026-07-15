# Vercel API research notes

Central Hub’s **Vercel** page (`/vercel`) can drive real project + deployment control — same pattern as GitHub: UI → Hub BFF → `api.vercel.com`.

---

## 1. What we can do (deployments focus)

| Goal | Method + path | Notes |
|------|----------------|-------|
| List projects | `GET /v9/projects` | Apps under account/team |
| Get project | `GET /v9/projects/{projectId}` | Includes link to git repo, domains |
| List deployments | `GET /v6/deployments` or `GET /v7/deployments` | Filter by `projectId`, `state`, `target`, `branch` |
| Get one deployment | `GET /v13/deployments/{idOrUrl}` | Status, URL, meta, errors |
| **Redeploy** (rebuild) | `POST /v13/deployments` with `{ "deploymentId": "dpl_…" }` | New build; inherits settings/env unless overridden |
| Deploy from Git | `POST /v13/deployments` + `gitSource` | Trigger from provider ref/sha |
| Cancel in-flight | cancel deployment endpoint (SDK: `cancelDeployment`) | While `BUILDING` / queued |
| Delete deployment | `DELETE /v13/deployments/{id}` | Breaks instant rollback for that id |
| **Promote** to production (no rebuild) | `POST /v10/projects/{projectId}/promote/{deploymentId}` | Point prod traffic at existing deploy |
| **Rollback** | `POST /v1/projects/{projectId}/rollback/{deploymentId}` | Instant domain assign to prior prod deploy |
| Deployment events / logs | get deployment events (SDK) | For build log tail in Hub later |

**Deploy Hooks (simpler rebuild trigger)**  
Project settings → Deploy Hooks → unique URL; `POST` (or `GET`) with **no Bearer token**. Good for “Redeploy production branch” buttons if you store the hook secret server-side. Anyone with the URL can deploy — treat like a password. Docs: https://vercel.com/docs/deploy-hooks

**Choose the right “redeploy” behavior**

| User intent | Use |
|-------------|-----|
| Rebuild same commit / fix bad cache / pick up new env | `POST /v13/deployments` + `deploymentId`, or Deploy Hook |
| Serve an already-built preview as production (no rebuild) | Promote endpoint |
| Instantly undo a bad production release | Rollback endpoint |

---

## 2. Deployment states (for UI badges)

Common `readyState` / `state` values:

`QUEUED` → `INITIALIZING` → `BUILDING` → `READY` | `ERROR` | `CANCELED` | `BLOCKED`

Also useful list fields: `uid`, `url`, `inspectorUrl`, `target` (`production` | `staging` | null), `created` / `createdAt`, `meta` (git branch/sha), `source` (includes `"redeploy"`).

---

## 3. How to get a token

1. Log in at [vercel.com](https://vercel.com) → use **Personal Account** scope in the top-left when creating tokens (tokens are created under account settings).
2. **Settings → Tokens** (Account Tokens) → **Create**.
3. Name it (e.g. `2h-central-hub`), pick **scope** (Personal and/or specific Team).
4. Copy once → store **only on the Hub server** (`VERCEL_TOKEN` / `VERCEL_ACCESS_TOKEN`).

KB: https://vercel.com/kb/guide/how-do-i-use-a-vercel-api-access-token

**Team calls:** most endpoints need `teamId` query param. Find Team ID under the team’s **Settings → General**.

```bash
# Personal account deployments
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?limit=5"

# Team deployments
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?teamId=$VERCEL_TEAM_ID&limit=5"
```

There is **no user OAuth product** as central as GitHub’s for arbitrary third-party apps in the same way for this use case; Hub MVP = **access token on BFF**. Long-term: [Vercel Integrations](https://vercel.com/docs/integrations) if you need marketplace install flow.

---

## 4. Official JS SDK

```bash
npm i @vercel/sdk
```

```ts
import { Vercel } from '@vercel/sdk'

const vercel = new Vercel({ bearerToken: process.env.VERCEL_TOKEN! })

const { deployments } = await vercel.deployments.getDeployments({
  teamId: process.env.VERCEL_TEAM_ID,
  projectId: 'prj_…',
  limit: 20,
})

// Redeploy an existing deployment (rebuild)
await vercel.deployments.createDeployment({
  teamId: process.env.VERCEL_TEAM_ID,
  requestBody: {
    name: 'my-project', // project name
    deploymentId: 'dpl_…',
  },
})
```

Raw `fetch` works the same with `Authorization: Bearer …`.

---

## 5. Redeploy examples

### A) API redeploy (recommended for Hub “Redeploy” button)

```bash
curl -X POST "https://api.vercel.com/v13/deployments?teamId=$VERCEL_TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-project","deploymentId":"dpl_xxxxxxxxx"}'
```

Creates a **new** deployment id/url/build. Settings/env inherit unless overridden.

### B) Deploy Hook

```bash
curl -X POST "https://api.vercel.com/v1/integrations/deploy/<HOOK_ID>/<SECRET>"
# exact URL copied from project → Settings → Git → Deploy Hooks
```

### C) Promote (no rebuild)

```bash
curl -X POST \
  "https://api.vercel.com/v10/projects/$PROJECT_ID/promote/$DEPLOYMENT_ID?teamId=$VERCEL_TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN"
```

---

## 6. Security for Central Hub

- Never put `VERCEL_TOKEN` or Deploy Hook URLs in the Vite client (`VITE_*`).
- Hub UI calls **our** API only (`/api/vercel/...`); BFF holds token + `teamId`.
- Redeploy / promote / rollback are destructive-ish → use `ConfirmModal` + minimal toasts.
- Scope tokens to the Team that owns client projects; rotate when people leave.

---

## 7. Mapping to Central Hub

| Hub area | Role |
|----------|------|
| `/vercel` (`VercelPage`) | List projects → open deployments → Redeploy / Promote / Rollback |
| `/git` + GitHub | Source of truth for repos; Vercel shows what’s deployed |
| Clients | Optional: store `vercelProjectId` (+ production URL) per client |
| Env page | Names of env vars in Hub config — actual secrets stay in Vercel |

---

## 8. Related APIs (later)

- Environments / env vars CRUD on projects  
- Domains  
- Webhooks (deployment lifecycle events → refresh Hub)  
- Integration Configuration APIs if shipping a Vercel Marketplace integration
