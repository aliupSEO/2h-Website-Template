# AGENTS.md — Website Template Agent Guide

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ
from your training data. **Read the relevant guide in `node_modules/next/dist/docs/` before
writing any code.** Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## 1. Project Overview

This is a **clone-and-go WordPress-connected Next.js template**.
The idea: clone this repo, fill in `.env.local`, and immediately start building pages —
all content comes from WordPress via WPGraphQL.

**Stack:**
- Next.js 16 (App Router, TypeScript)
- React 19
- Tailwind CSS v4 (`@import "tailwindcss"` — NOT the v3 config file style)
- No component library — pure Tailwind utility classes only

---

## 2. Environment Variables

All environment variables are documented in `.env.example`.
**Never hardcode URLs or keys.** Always read from `process.env`.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL` | ✅ | WordPress WPGraphQL endpoint |
| `NEXT_PUBLIC_WORDPRESS_REST_URL` | ✅ | WordPress base URL for REST API |
| `FIREBASE_PROJECT_ID` | optional | Firebase project (contact form fallback) |
| `FIREBASE_API_KEY` | optional | Firebase API key (contact form fallback) |
| `FIREBASE_COLLECTION` | optional | Firestore collection name (default: `submissions`) |

**Do NOT add hardcoded site URLs anywhere in source.** If you need a URL, add it to `.env.example` and read it from env.

---

## 3. Data Fetching — GraphQL

### The core helper
All GraphQL calls go through `lib/graphql.ts → fetchGraphQL()`.

```ts
// CORRECT
import { fetchGraphQL } from "@/lib/graphql";
const data = await fetchGraphQL(`query { ... }`, { variable: value });

// WRONG — never call the WP endpoint directly from a page/component
const res = await fetch("https://somesite.com/graphql", ...);
```

### Rules
- **Always use `fetchGraphQL`** — never call the endpoint inline.
- **Always add a new named function** in `lib/graphql.ts` for each page's data need (e.g., `getAboutPage()`).
- **Always fetch SEO fields** alongside content (`title`, `description`, `canonicalUrl`, `openGraph`).
- **Revalidation is set to `1` second** — do not change this without a strong reason.
- **Pages are Server Components** — fetch data at the page level, pass as props to client components.

### SEO field shape (expected from WPGraphQL + RankMath)

**Note:** We use RankMath, so the focus keyword field is `focusKeywords` (not `focuskw` which is Yoast). Ensure you map `seo.focusKeywords` to the Next.js `keywords` metadata array in all pages.

```graphql
seo {
  title
  description
  focusKeywords
  canonicalUrl
  robots
  openGraph {
    title
    description
    image { secureUrl }
  }
}
```

---

## 4. Contact Form

### Architecture
```
Client: <ContactForm /> (components/ContactForm.tsx)
  ↓ POST /api/contact (JSON or x-www-form-urlencoded)
Server: app/api/contact/route.ts
  ↓ 1st try → WordPress REST API (/wp-json/firebase-form/v1/submit)
  ↓ fallback → Firestore REST API (if WP is unreachable)
```

### Rules
- **`ContactForm` is a client component** (`"use client"` at top). Never make it a server component.
- **Do not bypass `/api/contact`** — never POST directly to WordPress from the client (CORS, keys exposure).
- The contact route supports **3 form modes** — don't remove any of them:
  1. `fields` prop (array of field definitions from WP settings API)
  2. `formHtml` prop (raw WordPress Fluent Form HTML)
  3. Fallback hardcoded form (name / email / message)
- **reCAPTCHA** is optional and widget-rendered — do not remove the reCAPTCHA logic even if not used.
- The WordPress REST submit endpoint URL comes from `NEXT_PUBLIC_WORDPRESS_REST_URL` env var.

---

## 5. App Router Conventions

- **Server Components by default** — only add `"use client"` when you need browser APIs, state, or event handlers.
- **Metadata:** Export a `metadata` object or `generateMetadata` function from every page. When using dynamic metadata from WPGraphQL, ALWAYS map `seo.focusKeywords` to the `keywords` field:
  ```ts
  export const metadata: Metadata = { title: "...", description: "..." };
  // or dynamic:
  export async function generateMetadata(): Promise<Metadata> { 
    const page = await getPage();
    return {
      title: page?.seo?.title,
      description: page?.seo?.description,
      keywords: page?.seo?.focusKeywords ? [page.seo.focusKeywords] : undefined,
    };
  }
  ```
- **Route structure:** One folder = one page. Dynamic routes use `[slug]` folders.
- **API Routes:** Live in `app/api/<name>/route.ts`. Export named HTTP method handlers (`GET`, `POST`, etc.).
- **Images:** Always use `next/image` with `<Image>`. Never use raw `<img>` tags.
- **Links:** Always use `next/link` with `<Link>`. Never use raw `<a>` tags for internal navigation.

---

## 6. Tailwind v4 Rules

This project uses **Tailwind v4** — the API is different from v3.

| Feature | v3 (OLD — do NOT use) | v4 (correct) |
|---|---|---|
| Config file | `tailwind.config.js` | Does not exist — configure via CSS |
| Import | `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| Custom tokens | `theme.extend` in JS | `@theme inline { --color-x: ... }` in CSS |
| Arbitrary values | `bg-[#fff]` | same — still works |
| Dark mode | `darkMode: 'class'` in config | `@variant dark` in CSS |

**Do NOT create a `tailwind.config.js` or `tailwind.config.ts`** — it is not needed and will conflict.

Custom color tokens are defined in `app/globals.css` under `@theme inline`:
```css
@theme inline {
  --color-brand-green: #22c55e;
  --color-brand-dark: #0a0a0a;
}
```

Use them in classes like `bg-brand-green`, `text-brand-dark`.

---

## 7. Styling Rules

- **No inline `style={{}}` unless strictly necessary** (e.g., dynamic CSS custom properties). Use Tailwind classes.
- **No CSS Modules** — not set up, don't add them.
- **Green + black is the brand palette** — `emerald-*` and `green-*` Tailwind shades for accents, `zinc-900` / `black` for backgrounds.
- **Typography:** Inter (loaded via `next/font/google` in `layout.tsx`). Do not import other fonts without updating layout.
- **Animations:** Use Tailwind's built-in `animate-*` utilities. Do not install Framer Motion unless explicitly asked.

---

## 8. Component Architecture

```
app/                   ← Pages (Server Components)
  layout.tsx           ← Root layout — do not add client-side logic here
  page.tsx             ← Home page
  [page-name]/
    page.tsx           ← Page (fetches own data via lib/graphql.ts)

components/            ← Reusable components
  ContactForm.tsx      ← Client component (always "use client")
  Header.tsx           ← Add when needed
  Footer.tsx           ← Add when needed

lib/
  graphql.ts           ← All WP data fetching functions — SINGLE SOURCE OF TRUTH
```

### When to add a new component
- It's used in more than one page → make it a component
- It needs `useState` / `useEffect` / event handlers → must be a client component
- It's purely presentational with no interactivity → keep it a server component (no `"use client"`)

---

## 9. What NOT to Do

- ❌ Do NOT install `axios` — use native `fetch`
- ❌ Do NOT use `getServerSideProps` or `getStaticProps` — this is App Router, not Pages Router
- ❌ Do NOT create `pages/` directory — it will conflict with App Router
- ❌ Do NOT use `className` with template literals for Tailwind classes — Tailwind's JIT scanner won't pick them up reliably:
  ```ts
  // WRONG
  const color = isDark ? "bg-zinc-900" : "bg-white";
  className={`${color} p-4`}
  
  // CORRECT — conditionally apply full classes
  className={isDark ? "bg-zinc-900 p-4" : "bg-white p-4"}
  ```
- ❌ Do NOT add `"use client"` to `app/layout.tsx` — it breaks streaming/metadata
- ❌ Do NOT fetch data inside client components — data fetching belongs in server components or API routes
- ❌ Do NOT commit `.env.local` — it is gitignored; only `.env.example` is committed
- ❌ Do NOT use `any` type without a comment explaining why

---

## 10. Adding a New Page (Workflow)

1. **Add a GraphQL query function** in `lib/graphql.ts`:
   ```ts
   export async function getAboutPage() {
     const data = await fetchGraphQL(`
       query {
         pages(where: { name: "about" }) {
           nodes { title content seo { title description } }
         }
       }
     `);
     return data?.pages?.nodes[0] || null;
   }
   ```

2. **Create `app/about/page.tsx`** (Server Component):
   ```ts
   import { getAboutPage } from "@/lib/graphql";
   
   export async function generateMetadata() {
     const page = await getAboutPage();
     return { title: page?.seo?.title, description: page?.seo?.description };
   }
   
   export default async function AboutPage() {
     const page = await getAboutPage();
     return <main dangerouslySetInnerHTML={{ __html: page?.content || "" }} />;
   }
   ```

3. Add a link to the page in the Header component.

---

## 11. WordPress Plugin Requirements

For this template to work, the WordPress site needs:
- **2H Hub connector** (Settings → 2H Hub)
- **Hub plugins** installed through that connector
- **WPGraphQL** plugin (provides the `/graphql` endpoint)
- **RankMath** + **WPGraphQL for Rank Math SEO** bridge plugin (do NOT use the generic Yoast WPGraphQL SEO plugin)
- **firebase-form** custom plugin (provides `/wp-json/firebase-form/v1/submit` and `/wp-json/firebase-form/v1/settings`)

Do not install, upload, activate, or download the 2H Hub connector or any WordPress plugin. A person installs those in WordPress.

If the 2H Hub connector or a required plugin is missing, **stop**. Do not design, do not create pages, and do not work around it. Show this error and nothing else:

**Error:** Install the 2H Hub connector and plugins.
