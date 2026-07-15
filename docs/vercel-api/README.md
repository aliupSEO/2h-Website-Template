# Vercel API — Central Hub notes

Yes — Vercel has a full **REST API** (plus official `@vercel/sdk`) so Central Hub can **list projects**, **see deployments** (status, URL, env), **redeploy**, **promote**, and **rollback**.

| Doc | What it covers |
|-----|----------------|
| [research-notes.md](./research-notes.md) | Endpoints, tokens, redeploy options, SDK, curl |
| [implementation-plan.md](./implementation-plan.md) | Phased plan for `/vercel` in this app |

**Official sources**

- REST / SDK overview: https://vercel.com/docs/rest-api  
- List deployments: https://vercel.com/docs/rest-api/reference/endpoints/deployments/list-deployments  
- Create / redeploy: https://vercel.com/docs/rest-api/deployments/create-a-new-deployment  
- Promote (no rebuild): https://vercel.com/docs/rest-api/projects/point-production-traffic-to-a-given-deployment  
- Deploy Hooks: https://vercel.com/docs/deploy-hooks  
- Access tokens KB: https://vercel.com/kb/guide/how-do-i-use-a-vercel-api-access-token  
- JS SDK: https://github.com/vercel/sdk (`@vercel/sdk`)

**Base URL:** `https://api.vercel.com`  
**Auth header:** `Authorization: Bearer <VERCEL_TOKEN>`  
**Teams:** append `?teamId=<team_id>` (or `slug=`) on most calls.
