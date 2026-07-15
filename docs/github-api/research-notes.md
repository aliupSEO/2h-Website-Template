# GitHub API research notes

Yes — GitHub exposes a full **REST API** (and GraphQL) to list, create, update, and delete repositories. For Central Hub we start with REST + **Octokit**.

---

## 1. What you can do (repos)

Base: `https://api.github.com`

| Goal | Method + path | Notes |
|------|----------------|-------|
| List **my** repos (incl. private) | `GET /user/repos` | Auth required; use this for Hub “see my repos” |
| List public repos for a username | `GET /users/{username}/repos` | No private repos |
| List org repos | `GET /orgs/{org}/repos` | Auth + org membership for private |
| Create repo (user account) | `POST /user/repos` | Body: `name`, `private`, `description`, … |
| Create repo (org) | `POST /orgs/{org}/repos` | User must be allowed to create in that org |
| Get one repo | `GET /repos/{owner}/{repo}` | |
| Update (rename, visibility, …) | `PATCH /repos/{owner}/{repo}` | |
| Delete repo | `DELETE /repos/{owner}/{repo}` | Needs delete permission; dangerous — confirm in UI |

**Related (later, not MVP)**

- Branches / protection, PRs, Issues, Actions runs, webhooks, Collaborators, Contents API (files).
- GraphQL (`POST https://api.github.com/graphql`) for denser dashboards in one query.

### Create body (common fields)

```json
{
  "name": "client-site",
  "description": "Client marketing site",
  "private": true,
  "auto_init": true,
  "gitignore_template": "Node"
}
```

### List query params (useful)

`GET /user/repos?visibility=all&affiliation=owner,organization_member&sort=updated&per_page=100`

Paginate with `Link` headers or Octokit `paginate()`.

---

## 2. How authentication works

Every write (and private reads) needs a **token** in:

```http
Authorization: Bearer <TOKEN>
```

### Option A — Fine-grained Personal Access Token (PAT)

**Best for:** local/dev, single-operator Hub, scripts.

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**  
   (Classic: https://github.com/settings/tokens — prefer fine-grained.)
2. Create token → pick resource owner (user or org) → select repos (all or subset).
3. Permissions (minimum for list + create + manage):
   - **Repository permissions → Administration:** Read and write (create/delete/settings), or narrower if GitHub UI allows Create-only patterns
   - **Contents:** Read (and Write if you seed files)
   - **Metadata:** Read (always required)
4. Copy token once → store only in server/env — **never** commit, never ship in the Vite bundle.

Classic PAT scopes (if used): `repo` for private create/list; `delete_repo` to delete.

### Option B — OAuth App (user signs in with GitHub)

**Best for:** Hub users each connect their own GitHub.

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Set Homepage + **Authorization callback URL** (your backend callback, e.g. `https://api.yourhub.com/auth/github/callback`).
3. User clicks “Connect GitHub” → authorize → Hub backend exchanges `code` for access token → stores encrypted.
4. Scopes: typically `repo` (classic) or use GitHub App user tokens instead (recommended long-term).

### Option C — GitHub App (recommended for production Hub)

**Best for:** multi-tenant / org installs, webhooks, tighter permissions, higher rate limits.

1. GitHub → **Settings → Developer settings → GitHub Apps → New GitHub App**.
2. Permissions: Repositories (Administration / Metadata / Contents as needed).
3. Install on user/org → get `installation_id`.
4. Backend: sign JWT with app private key →  
   `POST /app/installations/{installation_id}/access_tokens` → short-lived installation token (~1h).
5. Optional: user-to-server OAuth on the App for “act as user”.

| Mode | Acts as | Rate limit (order of) | Use in Hub |
|------|---------|------------------------|------------|
| Fine-grained / classic PAT | One user | ~5k/hr | Phase 0–1 |
| OAuth App | Signed-in user | ~5k/hr per user | Multi-user connect |
| GitHub App installation | App on org/user | Higher (~15k/hr/install) | Production |

---

## 3. How to call it from JS/TS

### Raw `fetch`

```ts
const res = await fetch('https://api.github.com/user/repos?per_page=100', {
  headers: {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  },
})
const repos = await res.json()
```

### Octokit (prefer)

```ts
import { Octokit } from 'octokit'

const octokit = new Octokit({ auth: token })

const repos = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
  per_page: 100,
  sort: 'updated',
})

await octokit.rest.repos.createForAuthenticatedUser({
  name: 'client-site',
  private: true,
  auto_init: true,
})
```

---

## 4. Security rules for this project

- **Do not** put `GITHUB_TOKEN` / PAT in `.env.local` and call GitHub **from the browser**. The Vite client is public; tokens would leak.
- Hub should call a **backend (or serverless BFF)** that holds the token and proxies:  
  `Central Hub UI → our API → api.github.com`.
- Or use OAuth with authorization code **only on the server**.
- Store tokens encrypted at rest; rotate; scope as narrowly as possible.
- Destructive actions (delete repo, make public) → existing `ConfirmModal` pattern.

---

## 5. Mapping to Central Hub

| Hub nav | Role |
|---------|------|
| `/git` (`GitPage`) | UI to list repos, create repo, open on GitHub, later link to Clients |
| Clients feature | Optional: attach `owner/repo` (or remote URL) to a client record |
| Env | Store non-secret config names only; secrets stay server-side |

---

## 6. Quick curl checks (after you have a token)

```bash
# Who am I?
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user

# List my repos
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/user/repos?per_page=5&sort=updated"

# Create a private repo (careful — creates for real)
curl -s -X POST -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"hub-test-repo","private":true,"auto_init":true}'
```

If these work in terminal, the same endpoints power the Hub once a safe backend path exists.
