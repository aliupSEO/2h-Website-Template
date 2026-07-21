# Firebase credentials runbook

How to connect Central Hub’s BFF to Google Firebase APIs. **Never commit** service-account JSON or put it in `VITE_*` vars.

---

## 1. Create a service account

1. Open [Google Cloud Console](https://console.cloud.google.com/) for the org / billing account that owns client projects.
2. Pick a **hub ops** project (or one client project for the Phase 0 spike).
3. **IAM & Admin → Service Accounts → Create**.
4. Grant roles on projects Hub must manage (start least-privilege, expand as needed):

| Role | Why |
|------|-----|
| `Firebase Admin` / `Firebase Admin SDK Administrator Service Agent` | Management + Admin SDK |
| `Service Usage Admin` (or Viewer + ability to enable) | Enable Firestore / Storage APIs |
| `Cloud Datastore Owner` or Firestore admin | Create Firestore database |
| `Storage Admin` | Create default bucket |
| `Identity Platform Admin` / `Firebase Authentication Admin` | Authorized domains + IdP configs |
| `Viewer` on org folders (optional) | List available GCP projects |

5. **Keys → Add key → JSON**. Save the file **outside the repo** (e.g. `D:\secrets\hub-firebase-sa.json`).

For multi-project access, either:

- Grant this SA IAM on each client project, or
- Later: register one SA per project via Hub registry (`secret_ref`).

---

## 2. Enable Google APIs

On each project (or the org), enable:

- Firebase Management API (`firebase.googleapis.com`)
- Identity Toolkit API (`identitytoolkit.googleapis.com`)
- Cloud Firestore API (`firestore.googleapis.com`)
- Cloud Storage for Firebase / Google Cloud Storage API
- Service Usage API (`serviceusage.googleapis.com`)

---

## 3. Local `.env.local`

Copy from `.env.example` and set:

```bash
# Default / spike project id (optional but useful for status)
FIREBASE_PROJECT_ID=your-firebase-project-id

# Preferred: absolute path to SA JSON (gitignored location)
GOOGLE_APPLICATION_CREDENTIALS=D:\secrets\hub-firebase-sa.json

# Alternative (server only): inline JSON string — avoid if path works
# FIREBASE_SERVICE_ACCOUNT_JSON=
```

Restart `npm run dev` after changing env. Confirm:

```http
GET /api/firebase/status
→ { "configured": true, "defaultProjectId": "…" }
```

If `configured: false`, the UI shows a setup message — fix path / IAM / enable APIs.

---

## 4. Vercel / production secrets

In the Hub Vercel project → **Settings → Environment Variables** (server / Production + Preview):

| Key | Value |
|-----|--------|
| `FIREBASE_PROJECT_ID` | Default project id |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Full SA JSON string (Vercel has no local file path) |

Prefer a secret manager later (Phase 5). Do **not** expose these as `VITE_*`.

---

## 5. Scopes used by Hub

Access tokens minted from the SA use:

- `https://www.googleapis.com/auth/cloud-platform`
- `https://www.googleapis.com/auth/firebase`
- `https://www.googleapis.com/auth/identitytoolkit`

---

## 6. Safety checklist

- [ ] SA JSON is not in git (`git status` clean of `*.json` keys)
- [ ] No `VITE_FIREBASE_*` privileged vars
- [ ] Hub operators use Supabase Auth; Google SA stays on the server
- [ ] Destructive Hub actions use ConfirmModal
- [ ] Rotate keys if a key ever leaks into chat, logs, or a PR
