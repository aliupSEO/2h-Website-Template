# Firebase research notes

What Central Hub can do from **`/firebase`**, compared with GitHub/Vercel.

| Platform | Hub-friendly strength |
|----------|------------------------|
| **GitHub** | Repos CRUD |
| **Vercel** | Deployments / redeploy / promote |
| **Firebase** | Projects + apps inventory, **Auth user admin**, Hosting releases, optional data ops |

Firebase is broader and more sensitive (user PII, production data). Prefer **read + inventory + Hosting history** first; mutate Auth/data only with confirm + roles.

---

## 1. Two integration layers

### A) Firebase Management REST API (org / project / apps)

Programmatic setup of Firebase-on-GCP projects and registered apps (Web / iOS / Android).

| Goal | Endpoint (sketch) |
|------|-------------------|
| List Firebase projects | `GET https://firebase.googleapis.com/v1beta1/projects` |
| Get one project | `GET …/v1beta1/projects/{projectId}` |
| List GCP projects that can add Firebase | `GET …/v1beta1/availableProjects` |
| Add Firebase to a GCP project | `POST …/v1beta1/{project}:addFirebase` |
| List / create Web apps | `…/projects/{id}/webApps` |
| Get web app config JSON | `GET …/webApps/{appId}/config` |
| Search all apps | `GET …/projects/{id}:searchApps` |
| Admin SDK config artifact | `GET …/projects/{id}/adminSdkConfig` |

Good Hub MVP: **list projects → open project → show Web/iOS/Android apps + links to console**.

### B) Firebase Admin SDK (per-project privileged ops)

Server-only Node package `firebase-admin`, initialized with a **service account** JSON (or Application Default Credentials).

Typical products Hub might expose later:

| Product | Via Admin SDK | Hub value |
|---------|---------------|-----------|
| **Authentication** | list / get / create / update / delete users, custom claims, disable | Support tools |
| **Firestore** | read/write with admin privileges | Dangerous — rarely expose full console |
| **Realtime Database** | same | Same caution |
| **Cloud Storage** | list/manage via Google Cloud APIs | Asset ops |
| **Cloud Messaging (FCM)** | send / topic | Ops tooling |
| **Remote Config** | REST/Admin templates | Feature flags |
| **App Check / Extensions** | separate APIs | Advanced |

Auth user manage docs: https://firebase.google.com/docs/auth/admin/manage-users  

### C) Firebase Hosting REST API (deploy / releases)

Separate from Admin SDK. Base: `https://firebasehosting.googleapis.com`

| Goal | Capability |
|------|------------|
| List sites | `GET …/v1beta1/projects/{projectId}/sites` |
| List versions / releases | versions.list, releases.list |
| Redeploy / clone traffic | Create release pointing at an existing finalized version (rollback-ish) |
| Full new deploy | create version → populateFiles → upload → finalize → `releases.create` |

Docs: https://firebase.google.com/docs/hosting/api-deploy  

**Note:** Full CI-style deploys from Hub are heavy (file hashes/uploads). Better Hub MVP: **list sites + recent releases**, link to console / trigger **Cloud Build** or CLI elsewhere. Optional: “re-release previous version” for rollback.

---

## 2. How to get credentials

### Service account (recommended for Hub BFF)

1. Firebase Console → Project → **Project settings → Service accounts**.
2. **Generate new private key** (JSON) — **never** commit; never `VITE_*`.
3. On the server: `admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })`.
4. For Management / Hosting REST: mint a short-lived OAuth access token from the same SA with scopes such as:
   - `https://www.googleapis.com/auth/firebase`
   - `https://www.googleapis.com/auth/cloud-platform` (broader)
   - Hosting: `https://www.googleapis.com/auth/firebase.hosting`

One Hub may manage **many** client Firebase projects → either:

- one SA per project (stored encrypted, keyed by `projectId`), or  
- a Google Workspace / Cloud org SA with IAM across client projects (harder, better long-term).

### OAuth (operator signs in with Google)

Useful if Hub operators use their own Google identity with Firebase Viewer/Editor roles — no long-lived key in env for every project. More work (OAuth consent, token refresh). Fits Phase 2+.

### What not to do

- Do **not** ship client Firebase web config as a secret (it’s public by design) — but also don’t confuse it with Admin credentials.
- Do **not** call Admin SDK from the Vite app.

---

## 3. Practical Hub feature set (recommended)

### Tier 1 — Safe MVP (match GitHub/Vercel “see stuff”)

- List Firebase projects (Management API).
- Per project: display projectId, displayName, apps (`searchApps` / webApps list).
- Deep links into Firebase Console.
- Optional: show Hosting `defaultUrl` (`*.web.app`) and last few **releases**.

### Tier 2 — Ops (high value for 2H)

- **Auth users** table for a selected project: list, search by email, disable/enable, reset (Admin SDK).
- Confirm modals + audit log (who did what).
- Link Client record → `firebaseProjectId`.

### Tier 3 — Advanced (only if needed)

- Hosting rollback via re-release of prior version.
- Remote Config template view/publish.
- FCM test send.
- Firestore “collection browser” — usually **avoid** (too easy to leak client data).

---

## 4. Multi-project Admin pattern (important)

Admin SDK is initialized **per Firebase project**:

```ts
import admin from 'firebase-admin'

const apps = new Map<string, admin.app.App>()

function getFirebaseApp(projectId: string, serviceAccount: object) {
  if (!apps.has(projectId)) {
    apps.set(
      projectId,
      admin.initializeApp(
        { credential: admin.credential.cert(serviceAccount as admin.ServiceAccount) },
        projectId, // named app
      ),
    )
  }
  return apps.get(projectId)!
}

// Example: list users
const auth = getFirebaseApp(projectId, sa).auth()
const result = await auth.listUsers(1000)
```

Hub BFF loads the right SA for the selected project (from secrets store / Env feature later).

---

## 5. Quick mental model vs Vercel redeploy

| Need | Firebase equivalent |
|------|---------------------|
| See “deployments” | Hosting **releases** / **versions** (not 1:1 with Vercel `dpl_`) |
| Redeploy | New Hosting version+release **or** re-release old version; many clients deploy via CI to Hosting or use Vercel instead |
| Promote / rollback | `releases.create` with an older `versionName` |
| Users / auth | Admin Auth APIs (Vercel has no equivalent) |

Many 2H client sites may use **Vercel for frontends** and **Firebase for Auth/Firestore** — Hub should link both on the Client record.

---

## 6. Security

- Service account JSON = root-like for that project. Encrypt at rest; rotate; least-privilege IAM roles where possible.
- Auth user actions = PII. Restrict Hub roles; log every mutation.
- Never return private keys or full SA JSON to the frontend.
- Prefer read-only Management scopes for inventory users.

---

## 7. Mapping to Central Hub

| Hub area | Role |
|----------|------|
| `/firebase` | Project list, apps, Hosting releases, later Auth tools |
| Clients | `firebaseProjectId`, optional web appId |
| Env | Pointers / encrypted SA storage metadata (not the keys in git) |
| Vercel / Git | Same client’s deploy + source |
