# Supabase Auth — Sign in & password reset

Browser auth uses the anon key + RLS via `getSupabaseClient()` and `authService`.

## App surface

| Route | Purpose |
|-------|---------|
| `/auth/sign-in` | Email/password + Google OAuth |
| `/auth/forgot-password` | Send reset email |
| `/auth/reset-password` | Set new password after email link (`PublicRoute` with `guestOnly={false}`) |

Code: `src/services/authService.ts`, `src/features/auth/`, `src/stores/authStore.ts`.

## Dashboard redirect allow-list

In [Authentication → URL configuration](https://supabase.com/dashboard/project/_/auth/url-configuration):

1. **Site URL** — production origin (e.g. `https://your-app.vercel.app`).
2. **Redirect URLs** — include every origin you use locally and in deploy:

```
http://localhost:5173/**
https://your-app.vercel.app/**
https://your-preview.vercel.app/**
```

Password reset redirects to `{origin}/auth/reset-password`. Google OAuth returns to `{origin}/dashboard`.

## Providers

- **Email** — enable Email provider; create users in Auth (or invite) so `profiles` is created by `handle_new_user`.
- **Google** — enable Google provider and set Client ID / Secret from Google Cloud Console. Without this, Continue with Google fails at the API.

## Inactive profiles

If `profiles.is_active` is `false`, the client signs the user out and shows a disabled-account message.

## Local smoke check

1. `.env.local` has `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
2. Create a user in Supabase Auth (or local Studio).
3. Sign in at `/auth/sign-in`.
4. Forgot password → inbox → `/auth/reset-password` → update password.
