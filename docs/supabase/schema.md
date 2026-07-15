# Supabase schema — profiles & clients

Migration: `supabase/migrations/20260715132806_create_profiles_and_clients.sql`

## Roles vs clients

| Concept | What it is |
|---------|------------|
| **admin / manager / user** | Hub **usage roles** on `profiles.role` (auth) |
| **clients** | CRM **table** for company contacts — **not** a role |

App labels: **Admin**, **Manager**, **User** (`src/constants/roles.ts`).

## Tables

```
auth.users
    └── profiles (id = auth.users.id, role)
              │
              ├── clients.created_by / updated_by
              │
clients
    ├── client_links
    └── client_files  (storage_path → Storage bucket; no data URLs in DB)
```

### `profiles`

| Column | Notes |
|--------|--------|
| `id` | FK → `auth.users` |
| `email`, `full_name`, `avatar_url` | |
| `role` | `admin` \| `manager` \| `user` (default `user`) |
| `is_active` | Soft disable |

New Auth users get a profile via `handle_new_user` trigger.

### `clients`

Matches Hub client UI: name, email, phone, status (`active` \| `inactive` \| `draft`), optional notes, audit columns.

### `client_links` / `client_files`

Normalized links and file metadata. File bytes live in **Supabase Storage**; only `storage_path` is stored.

## RLS (summary)

| Table | Read | Write |
|-------|------|--------|
| profiles | Own, or admin/manager | Own (cannot self-escalate role); admin all |
| clients | All hub roles | Insert/update: admin/manager; delete: admin |
| client_links / client_files | All hub roles | admin/manager |

## Apply

```bash
# local
npm run db:reset

# linked remote
npm run db:push
npm run db:types
```
