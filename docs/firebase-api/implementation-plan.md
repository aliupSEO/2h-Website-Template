# Implementation plan — Firebase in Central Hub

Goal: turn **`/firebase`** from a placeholder into a useful ops surface: list projects/apps, Hosting releases, then Auth admin — always through a BFF.

Git: branch from `dev` (e.g. `feature/firebase-projects`) → PR into `dev`.

---

## Auth / credentials path

| Phase | Approach |
|-------|----------|
| **0 – Spike** | One service account JSON for a test project; Management list + Admin `listUsers` |
| **1 – Hub MVP** | BFF holds SA(s); UI lists projects/apps |
| **2 – Multi-client** | SA (or OAuth) per client project; map Client → `firebaseProjectId` |
| **3 – Ops** | Auth user tools + Hosting release history / rollback |

Never `VITE_` a service account.

---

## Architecture

```
┌────────────────────┐     ┌─────────────────────────────┐     ┌──────────────────────┐
│  Firebase page UI  │────▶│  Hub API / BFF              │────▶│  firebase.googleapis  │
│  features/firebase │     │  firebase-admin + Google    │     │  hosting.googleapis   │
└────────────────────┘     │  Auth access tokens         │     │  (Admin SDK gRPC/HTTP)│
                           └─────────────────────────────┘     └──────────────────────┘
```

---

## Folder placement

```
src/
  features/firebase/
    components/    # ProjectList, AppsTable, HostingReleases, AuthUsersTable
    hooks/
    schemas.ts
    types.ts
    index.ts
  services/
    firebaseService.ts   # Hub BFF only
  pages/firebase/
    FirebasePage.tsx
```

---

## Phases

### Phase 0 — Spike

- [ ] Create service account key for one Firebase project.
- [ ] Call Management `GET /v1beta1/projects` (or get single project).
- [ ] Init `firebase-admin`, run `auth.listUsers(10)`.
- [ ] Optional: Hosting `sites.list` + `releases.list`.
- [ ] `.env.example` placeholders only: `FIREBASE_PROJECT_ID=`, document that SA JSON is server-mounted (path or secret manager), not committed.

### Phase 1 — Inventory UI (MVP)

BFF routes (example):

| Hub route | Backend |
|-----------|---------|
| `GET /api/firebase/projects` | Management `projects.list` |
| `GET /api/firebase/projects/:projectId` | `projects.get` + `searchApps` |
| `GET /api/firebase/projects/:projectId/apps` | web/ios/android list or searchApps |
| `GET /api/firebase/projects/:projectId/hosting/releases` | Hosting releases.list |

- [ ] `/firebase`: project cards/table → detail with apps + console links.
- [ ] Loading via shared Loading components; Zod only if forms appear.
- [ ] Link out: `https://console.firebase.google.com/project/{projectId}`.

**Exit:** operators see which Firebase projects/apps exist without leaving Hub.

### Phase 2 — Client linkage

- [ ] Client field: `firebaseProjectId` (+ optional web `appId`).
- [ ] From Clients → Firebase detail; filter Hub Firebase list by linked clients.

### Phase 3 — Auth ops

| Hub route | Admin SDK |
|-----------|-----------|
| `GET /api/firebase/projects/:id/auth/users` | `listUsers` (+ pageToken) |
| `GET …/users?email=` | `getUserByEmail` |
| `PATCH …/users/:uid` | disable/enable, claims (narrow) |
| `DELETE …/users/:uid` | delete — ConfirmModal + role check |

- [ ] Never bulk-export emails to logs.
- [ ] Minimal toasts; confirm destructive actions.

### Phase 4 — Hosting ops (optional)

- [ ] Show last N releases (time, version, user).
- [ ] “Rollback to this version” → `releases.create` with prior `versionName` + ConfirmModal.
- [ ] Defer full file-upload deploy from Hub (use CI/Vercel).

### Phase 5 — Hardening

- [ ] Secret manager; per-project IAM.
- [ ] Google OAuth for operator identity instead of shared SA where possible.
- [ ] Audit table for Auth/Hosting mutations.

---

## MVP types (UI)

```ts
type FirebaseProject = {
  projectId: string
  displayName: string
  state: string
}

type FirebaseAppSummary = {
  appId: string
  platform: 'web' | 'ios' | 'android'
  displayName: string
}

type HostingRelease = {
  name: string
  releaseTime: string
  type: string
  versionName?: string
}
```

---

## Testing plan

- [ ] Inventory works with SA that only has Viewer/Firebase Admin on one project.
- [ ] Missing SA for project → clear 404/403 in UI.
- [ ] Auth list paginates; disable user reflects in Firebase Console.
- [ ] No SA JSON appears in network responses to the browser.

---

## First PR slices

1. Docs (this folder).  
2. `feature/firebase-projects` — list + detail apps.  
3. `feature/firebase-client-link` — Client field.  
4. `feature/firebase-auth-users` — support tools.  
5. Optional: Hosting releases / rollback.

---

## Out of scope for early Hub

- Full Firestore data browser  
- Recreating Firebase Console  
- Deploying entire static sites from Hub UI (Hosting upload pipeline)  
- Replacing Vercel for frontends that already live there
