# Firebase Hub — API map

Hub BFF routes and the Google APIs they call. All paths are under `/api/firebase`. Responses never include service-account private keys.

Base Google hosts:

| Alias | URL |
|-------|-----|
| Management | `https://firebase.googleapis.com/v1beta1` |
| Identity Toolkit | `https://identitytoolkit.googleapis.com/admin/v2` |
| Firestore Admin | `https://firestore.googleapis.com/v1` |
| Storage | `https://storage.googleapis.com/storage/v1` |
| Service Usage | `https://serviceusage.googleapis.com/v1` |

---

## Status

| Hub | Method | Google |
|-----|--------|--------|
| `/api/firebase/status` | GET | (local) credential probe |

**Response**

```ts
{ configured: boolean; defaultProjectId?: string | null }
```

---

## Projects (Phase 1–2)

| Hub | Method | Google |
|-----|--------|--------|
| `/api/firebase/projects` | GET | `GET …/projects` |
| `/api/firebase/projects` | POST | `POST …/projects/{projectId}:addFirebase` |
| `/api/firebase/available-projects` | GET | `GET …/availableProjects` |
| `/api/firebase/projects/:projectId` | GET | `GET …/projects/{projectId}` + `:searchApps` |

**Project DTO**

```ts
{
  projectId: string
  displayName: string
  state: string
  projectNumber?: string
}
```

**POST body (addFirebase)**

```ts
{ projectId: string }
```

**Available project DTO**

```ts
{ projectId: string; displayName: string }
```

---

## Apps (Phase 1–2)

| Hub | Method | Google |
|-----|--------|--------|
| `/api/firebase/projects/:projectId/apps` | GET | `GET …/projects/{id}:searchApps` |
| `/api/firebase/projects/:projectId/apps/web` | POST | `POST …/projects/{id}/webApps` |
| `/api/firebase/projects/:projectId/apps/:appId/config` | GET | `GET …/projects/{id}/webApps/{appId}/config` |
| `/api/firebase/projects/:projectId/apps/:appId` | DELETE | `POST …/projects/{id}/webApps/{appId}:remove` |

**App DTO**

```ts
{
  appId: string
  platform: 'web' | 'ios' | 'android'
  displayName: string
  namespace?: string | null
  bundleId?: string | null
  packageName?: string | null
}
```

**Create web app body**

```ts
{ displayName: string }
```

**Config response** — pass-through of Firebase web config JSON (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, `measurementId?`).

---

## Auth config (Phase 3)

| Hub | Method | Google |
|-----|--------|--------|
| `/api/firebase/projects/:projectId/auth/config` | GET | `GET …/projects/{id}/config` |
| `/api/firebase/projects/:projectId/auth/config` | PATCH | `PATCH …/projects/{id}/config?updateMask=authorizedDomains` |
| `/api/firebase/projects/:projectId/auth/providers` | GET | `GET …/projects/{id}/defaultSupportedIdpConfigs` |
| `/api/firebase/projects/:projectId/auth/providers` | POST | `POST …/projects/{id}/defaultSupportedIdpConfigs?idpId=` |
| `/api/firebase/projects/:projectId/auth/providers/:idpId` | PATCH | `PATCH …/defaultSupportedIdpConfigs/{idpId}` |

**Auth config DTO**

```ts
{ authorizedDomains: string[] }
```

**PATCH body**

```ts
{ authorizedDomains: string[] }
```

**Provider DTO**

```ts
{
  name: string
  idpId: string
  enabled: boolean
  clientId?: string | null
}
```

**POST / PATCH body**

```ts
{
  idpId: string           // e.g. google.com, microsoft.com
  enabled: boolean
  clientId: string
  clientSecret?: string   // required on create; optional on update
}
```

---

## Services enable (Phase 3)

| Hub | Method | Google |
|-----|--------|--------|
| `/api/firebase/projects/:projectId/firestore/enable` | POST | `POST …/projects/{id}/databases?databaseId=(default)` |
| `/api/firebase/projects/:projectId/storage/enable` | POST | enable `storage.googleapis.com` + create bucket `{projectId}.appspot.com` if missing |

**Firestore body (optional)**

```ts
{ locationId?: string }  // default e.g. nam5
```

**Storage body (optional)**

```ts
{ location?: string; bucketName?: string }
```

---

## Error shape

All handlers return Hub-standard errors:

```ts
{ error: string; status: number }
```

Google 403/404 are mapped to clear messages (missing IAM, project not Firebase-enabled, etc.).
