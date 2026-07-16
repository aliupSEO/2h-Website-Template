# Vercel webhook setup (Central Hub)

Endpoint for account/team webhooks:

```text
https://2h-central-hub-production.vercel.app/api/webhooks/vercel
```

Set `VERCEL_WEBHOOK_SECRET` in `.env.local` (and Vercel project env) to the signing secret shown when you create the webhook.

Local testing needs a public tunnel (e.g. ngrok) pointing at `http://localhost:5173/api/webhooks/vercel`.

## Projects

Choose **All Projects** (recommended for the Hub), or **Specific Projects** if you want a filtered subset.

## Events to enable

### Deployment Events
- `deployment.created`
- `deployment.error`
- `deployment.blocked`
- `deployment.canceled`
- `deployment.succeeded`
- `deployment.promoted`
- `deployment.rollback`

### Project Events
- `project.created`
- `project.removed`
- `project.renamed`
- `project.env-variable.created`
- `project.env-variable.updated`
- `project.env-variable.deleted`

## Skip for now

Domain, Feature Flag, Firewall, Observability, Check run / cleanup noise — not used by Hub MVP.

## Secret

Copy the webhook signing secret into `.env.local` / Vercel env as:

```env
VERCEL_WEBHOOK_SECRET=...
```

Hub verifies `x-vercel-signature` (HMAC-SHA1) on every request.
