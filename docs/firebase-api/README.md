# Firebase — Central Hub

Firebase is a **family of Google APIs** plus the **Admin SDK**. Central Hub manages client Firebase projects from **`/firebase`** through a **server BFF** — never with service-account keys in the browser.

| Doc | What it covers |
|-----|----------------|
| [implementation-plan.md](./implementation-plan.md) | Phases 0–5, folder layout, security |
| [api-map.md](./api-map.md) | Hub routes → Google APIs → shapes |
| [credentials-runbook.md](./credentials-runbook.md) | SA setup, IAM, env vars, Vercel secrets |
| [research-notes.md](./research-notes.md) | Background research (APIs vs Admin SDK) |

---

## Capability matrix

| Capability | API | Hub phase |
|---|---|---|
| List / get Firebase projects | Management `projects.list` / `get` | 1 |
| List available GCP projects | Management `availableProjects` | 2 |
| Add Firebase to GCP project | Management `projects.addFirebase` | 2 |
| Create Web / iOS / Android apps | Management `webApps` / `iosApps` / `androidApps` | 2 |
| Get client config / API keys | Management `webApps.getConfig` | 2 |
| Remove app | Management app `remove` | 2 |
| Delete GCP / Firebase project | Resource Manager `projects.delete` | 5 |
| Init Firestore database | Firestore Admin API | 3 |
| Enable / create Storage bucket | Storage + Service Usage | 3 |
| Sign-in providers | Identity Toolkit IdP configs | 3 |
| Authorized domains | Identity Toolkit `getConfig` / `updateConfig` | 3 |
| Auth users list / disable / delete | `firebase-admin` Auth | 4 |
| Hosting releases / rollback | Hosting REST | 4 |

**Out of early scope:** full Firestore document browser, recreating the entire Firebase Console, Hosting file-upload deploys from Hub.

---

## Phase map

| Phase | Goal |
|-------|------|
| **0** | Credentials, registry, Management client, `/api/firebase/status` |
| **1** | Inventory UI — list projects + apps |
| **2** | Semi-create — `addFirebase`, create web app, getConfig, remove app |
| **3** | Auth domains / providers, enable Firestore + Storage |
| **4** | Auth users + Hosting releases |
| **5** | Per-project SA registry, audit log, full GCP create/delete |

---

## Architecture

```
Browser (features/firebase)
  → firebaseService.ts
  → /api/firebase/*  (BFF)
  → credential resolver + project registry
  → firebase.googleapis.com | identitytoolkit | Firestore / Storage
  → firebase-admin (named apps per projectId)
```

Never put service accounts under `VITE_*`. Prefer path via `GOOGLE_APPLICATION_CREDENTIALS`.

---

## Official docs

- [Management API](https://firebase.google.com/docs/reference/firebase-management/rest)
- [Set up and manage a project](https://firebase.google.com/docs/projects/api/workflow_set-up-and-manage-project)
- [Admin SDK setup](https://firebase.google.com/docs/admin/setup)
- [Configure OAuth IdPs via REST](https://firebase.google.com/docs/auth/configure-oauth-rest-api)
- [Identity Toolkit REST](https://cloud.google.com/identity-platform/docs/reference/rest)
- [Hosting REST deploy](https://firebase.google.com/docs/hosting/api-deploy)

| Surface | Host |
|---------|------|
| Management | `https://firebase.googleapis.com` |
| Identity Toolkit | `https://identitytoolkit.googleapis.com` |
| Hosting | `https://firebasehosting.googleapis.com` |
| Admin SDK | Node `firebase-admin` |
