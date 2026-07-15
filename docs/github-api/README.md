# GitHub API — Central Hub notes

Research notes for wiring the **Git** area of 2H Central Hub to GitHub so we can **list, create, and manage repositories**.

| Doc | What it covers |
|-----|----------------|
| [research-notes.md](./research-notes.md) | Official APIs, auth options, how to get tokens, scopes |
| [implementation-plan.md](./implementation-plan.md) | Phased plan for this repo (UI → service → auth → ship) |

**Official sources**

- Repos REST: https://docs.github.com/en/rest/repos/repos
- Auth: https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api
- Fine-grained PATs: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- GitHub Apps: https://docs.github.com/en/apps/creating-github-apps
- Octokit (JS SDK): https://github.com/octokit/octokit.js

**Base URL:** `https://api.github.com`  
**Required headers (typical):**

```http
Accept: application/vnd.github+json
Authorization: Bearer <TOKEN>
X-GitHub-Api-Version: 2022-11-28
```
