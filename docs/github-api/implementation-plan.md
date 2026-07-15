# Implementation plan — GitHub repos in Central Hub

Goal: replace the placeholder **Git** page with list / create / manage repos via GitHub’s API, without leaking credentials to the browser.

Follow git workflow: branch from `dev` (e.g. `feature/github-repos`), PR into `dev`.

---

## Recommended auth path (phased)

| Phase | Auth | Why |
|-------|------|-----|
| **0 – Spike** | Fine-grained PAT on a tiny local/serverless proxy | Prove list + create before UX |
| **1 – Hub MVP** | Same PAT (or org bot account) via BFF for operators | Fast value for internal use |
| **2 – Multi-user** | GitHub App (+ optional user OAuth) | Proper product: install on org, webhooks later |

Do **not** start Phase 1 by calling GitHub from React with a token in `VITE_*`.

---

## Architecture (target)

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  Git page (UI)  │────▶│  Hub API / BFF        │────▶│  api.github.com │
│  features/git   │     │  holds token / App    │     │  REST (Octokit) │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

**Frontend:** pages compose; API only in `services/` + feature hooks.  
**Backend:** new (or extend existing) HTTP layer — Node/Express, Cloudflare Worker, Supabase Edge, etc. Exact host TBD; until then, mock the client against fixtures.

---

## Folder placement (this codebase)

```
src/
  features/git/
    components/          # RepoTable, CreateRepoForm, RepoActions
    hooks/               # useRepos, useCreateRepo
    schemas.ts           # Zod: create repo form
    types.ts
    index.ts
  services/
    githubService.ts     # calls Hub BFF (/api/github/...), never raw token
  pages/git/
    GitPage.tsx          # compose feature only
```

Routes stay in `App.tsx` (`/git` already exists).

---

## Phases

### Phase 0 — Spike (no UI polish)

- [ ] Create fine-grained PAT with repo Administration + Metadata (see [research-notes.md](./research-notes.md)).
- [ ] Script or temporary local proxy: `GET /user/repos`, `POST /user/repos`.
- [ ] Confirm private repos appear and create succeeds for user or target org.
- [ ] Document required scopes in `.env.example` as **names only** (e.g. `GITHUB_TOKEN=` empty; real value server-only).

**Exit:** known-good request shapes + field list for the UI.

### Phase 1 — BFF + service layer

- [ ] Add backend route group, e.g.:
  - `GET /api/github/repos` → proxied `GET /user/repos` (or org list)
  - `POST /api/github/repos` → proxied `POST /user/repos` or `/orgs/{org}/repos`
  - `GET /api/github/repos/:owner/:repo`
  - `PATCH /api/github/repos/:owner/:repo` (visibility, description)
  - `DELETE /api/github/repos/:owner/:repo` (guarded)
- [ ] Use **Octokit** on the server; map errors to Hub-friendly JSON (`401`, `403`, `422` name taken).
- [ ] `src/services/githubService.ts` talks only to Hub API.
- [ ] Types in `features/git/types.ts` (id, name, full_name, private, html_url, updated_at, …).

**Exit:** Hub frontend can list/create with server-stored token; no token in client bundle.

### Phase 2 — Git page UX (MVP)

- [ ] `GitPage`: loading via `LoadingScreen` / `Loading`; empty state; table or cards.
- [ ] Toolbar: search/filter (client-side first), visibility badge.
- [ ] **Create repo** form: Zod + RHF — name `*`, description, private toggle, optional org select, `auto_init`.
  - Red `*` on required; errors under fields; no input borders/rings (forms rule).
- [ ] Row actions: open on GitHub, copy clone URL, edit visibility (confirm), delete (`ConfirmModal`).
- [ ] Toasts: minimal `toast.success` / `toast.error`.

**Exit:** operator can manage day-to-day repos from `/git`.

### Phase 3 — Client linkage

- [ ] Optional field on Client: GitHub `owner/repo` or `html_url`.
- [ ] From Clients → deep-link to Git detail; from Git → “Link to client”.
- [ ] Persist in existing clients store/service until real API exists.

### Phase 4 — Production auth (GitHub App)

- [ ] Register GitHub App; generate private key; store in secret manager.
- [ ] Install on org(s) used for client work.
- [ ] Server mints installation tokens; drop long-lived PAT.
- [ ] Optional: “Connect GitHub” per Hub user (user access token).
- [ ] Webhooks later: `repository` events to refresh cache.

### Phase 5 — Nice-to-haves

- [ ] Default branch / protect `main`+`dev` via Rulesets API.
- [ ] Seed from Templates page (copy template repo).
- [ ] Show open PRs / Actions status on repo cards.
- [ ] Cache list in Zustand or React Query with stale time.

---

## MVP API contract (Hub ↔ UI)

```ts
// GET /api/github/repos →
{ repos: Array<{
  id: number
  name: string
  fullName: string
  private: boolean
  htmlUrl: string
  description: string | null
  updatedAt: string
  defaultBranch: string
}> }

// POST /api/github/repos
// body: { name, description?, private?, org?, autoInit? }
// → { repo: { ...same shape } }
```

---

## Env / secrets checklist

| Name | Where | Notes |
|------|--------|------|
| `GITHUB_TOKEN` or App private key | Server only | Never `VITE_` |
| `GITHUB_ORG` (optional default) | Server / non-secret ok | Default create target |
| `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID` | Server | Phase 4 |

Add placeholders to `.env.example`; keep `.env.local` / secrets gitignored (`*.local` already).

---

## Testing plan

- [ ] Unit: map Octokit payload → Hub DTO; Zod create schema.
- [ ] Manual: list private repos; create; rename/visibility; delete with confirm.
- [ ] Auth failures: expired/revoked token → clear error toast, no crash.
- [ ] Rate limit: surface `403` / `Retry-After` gracefully.

---

## Out of scope for first PR

- GraphQL dashboard
- Replacing local git CLI in the agent
- Pushing code from the Hub (Contents API / git remote) — list/create/manage metadata only

---

## First shipping slice (suggested PR)

1. Docs (this folder) — already started.  
2. `feature/github-repos-list`: BFF stub or mock + list UI on `/git`.  
3. `feature/github-create-repo`: create form + POST.  
4. Later PRs: edit/delete, client link, GitHub App.

Each PR: branch from `dev` → PR into `dev` → when stable, promote with `git push origin dev:main`.
