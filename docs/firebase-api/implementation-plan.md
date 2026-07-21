# Implementation plan — Firebase in Central Hub

Goal: turn **`/firebase`** into a scalable ops surface for Firebase projects, apps, Auth config, and service enablement — always through a BFF.

Git: branch from `dev` (e.g. `feature/firebase-foundation`) → PR into `dev`.

---

## Locked defaults

| Decision | Choice |
|----------|--------|
| Create depth | **Semi-create** — list available GCP projects → `addFirebase` → create apps → configure Auth / Firestore / Storage. Full GCP `projects.create` is Phase 5. |
| Credentials | Phase 0: one default SA. Architecture: **multi-project registry** from day one (`env_default` now; `secret_ref` later). |

---

## Architecture

```
┌────────────────────┐     ┌─────────────────────────────┐     ┌──────────────────────┐
│  Firebase page UI  │────▶│  Hub API / BFF              │────▶│  firebase.googleapis  │
│  features/firebase │     │  google-auth + firebase-admin│    │  identitytoolkit      │
└────────────────────┘     │  credential resolver        │     │  Firestore / Storage  │
                           └─────────────────────────────┘     └──────────────────────┘
```

### Multi-project credential model

| Module | Role |
|--------|------|
| `server/firebase/registry.ts` | Maps `projectId` → credential source (`env_default` \| `secret_ref`) |
| `server/firebase/credentials.ts` | Loads SA; mints OAuth access token |
| `server/firebase/admin-apps.ts` | Cached `admin.app.App` per `projectId` |
| `server/firebase/client.ts` | Management / Identity Toolkit / GCP REST helpers |

Never `VITE_` a service account. Never return SA JSON to the browser.

---

## Folder placement

```
docs/firebase-api/
server/firebase/          # env, credentials, registry, admin-apps, client, handlers, types
api/firebase/**           # Vercel serverless mirrors
src/features/firebase/    # components, schemas, types, index
src/services/firebaseService.ts
src/stores/firebaseStore.ts
src/pages/firebase/FirebasePage.tsx
src/lib/api-endpoints.ts  # firebase paths + parsers
```

---

## Phases

### Phase 0 — Foundation

- [x] `firebase-admin` + `google-auth-library`
- [x] `env.ts`, `credentials.ts`, `registry.ts`, `admin-apps.ts`, `client.ts`
- [x] `apiEndpoints.firebase` + path matchers
- [x] Vite BFF + `api/firebase/*`
- [x] `.env.example`: `FIREBASE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, optional `FIREBASE_SERVICE_ACCOUNT_JSON`
- [x] `GET /api/firebase/status` → `{ configured, defaultProjectId? }`

### Phase 1 — Inventory

| Hub route | Backend |
|-----------|---------|
| `GET /api/firebase/projects` | Management `projects.list` |
| `GET /api/firebase/projects/:projectId` | `projects.get` + `searchApps` |
| `GET /api/firebase/projects/:projectId/apps` | apps from searchApps / platform lists |

UI: project list → select → apps table + console deep link.

### Phase 2 — Create & app config

| Hub route | Backend |
|-----------|---------|
| `GET /api/firebase/available-projects` | `availableProjects` |
| `POST /api/firebase/projects` | `addFirebase` `{ projectId }` |
| `POST …/apps/web` | `webApps.create` |
| `GET …/apps/:appId/config` | `webApps.getConfig` |
| `DELETE …/apps/:appId` | `webApps.remove` |

### Phase 3 — Auth config + services

| Hub route | Backend |
|-----------|---------|
| `GET/PATCH …/auth/config` | authorizedDomains |
| `GET/POST/PATCH …/auth/providers` | IdP configs |
| `POST …/firestore/enable` | create Firestore database |
| `POST …/storage/enable` | enable Storage + default bucket |

UI tabs: **Projects | Apps | Auth | Services**.

### Phase 4 — Ops (later)

Auth users (Admin SDK), Hosting releases / rollback. Admin role + ConfirmModal for destructive actions.

### Phase 5 — Hardening (later)

Per-project SA in secret store, audit log, GCP `projects.create` + `projects.delete`.

---

## Security rules

- Privileged secrets only on BFF; fail loud if missing when calling Google.
- Destructive actions: `ConfirmModal` (+ Hub `admin` when roles are wired).
- Do not log emails, tokens, or SA JSON.
- Client config (`apiKey`, `appId`) is public-by-design — still only expose via authenticated Hub session.

---

## Testing checklist

- [ ] Status returns `configured: false` without SA; clear UI message.
- [ ] With SA: list projects; open detail; see apps.
- [ ] addFirebase on available GCP project; create web app; copy config.
- [ ] Add/remove authorized domain; enable Google provider (with client id/secret).
- [ ] Enable Firestore / Storage once; second call is idempotent or clear error.
- [ ] No SA JSON in network responses to the browser.
- [ ] `npm run build` passes.
