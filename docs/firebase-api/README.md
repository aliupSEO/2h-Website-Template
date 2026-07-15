# Firebase — Central Hub notes

Firebase is not one API — it’s a **family of Google APIs** plus the **Admin SDK**. From Central Hub we can inventory projects/apps, manage Auth users, inspect Hosting releases, and (with care) read/operate data services — all via a **server BFF**, never from the browser with service-account keys.

| Doc | What it covers |
|-----|----------------|
| [research-notes.md](./research-notes.md) | What we can do, auth, APIs vs Admin SDK |
| [implementation-plan.md](./implementation-plan.md) | Phased plan for `/firebase` |

**Key official docs**

- Management API: https://firebase.google.com/docs/reference/firebase-management/rest  
- Manage projects workflow: https://firebase.google.com/docs/projects/api/workflow_set-up-and-manage-project  
- Admin SDK setup: https://firebase.google.com/docs/admin/setup  
- Auth manage users: https://firebase.google.com/docs/auth/admin/manage-users  
- Hosting REST deploy: https://firebase.google.com/docs/hosting/api-deploy  
- Hosting API ref: https://firebase.google.com/docs/reference/hosting/rest  

**Base URLs**

| Surface | Host |
|---------|------|
| Management | `https://firebase.googleapis.com` |
| Hosting | `https://firebasehosting.googleapis.com` |
| Admin SDK | Node package `firebase-admin` (wraps Auth, Firestore, RTDB, etc.) |
