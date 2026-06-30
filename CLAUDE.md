# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # dev server at http://localhost:5173 (mocks on by default)
npm run build        # tsc -b + vite build
npm run typecheck    # type-check without emitting
npm run lint         # ESLint + jsx-a11y
npm run format       # Prettier over src/**/*.{ts,tsx,css}
```

No test suite exists yet.

## Architecture

React 18 + Vite SPA. No SSR. `@` alias maps to `src/`.

### Feature slices

`src/features/` is the primary structure. Each slice owns its pages, forms, queries, and Zod schemas:

- `public/` — unauthenticated job browse
- `auth/` — OTP-based login
- `candidate/` — onboarding, profile, applications
- `employer/` — onboarding, profile, job management, applicant review
- `admin/` — dashboard (Recharts), employer/candidate/user management

### Routing & guards (`src/routes/`)

Three guard components wrap role-sensitive routes:
- `RequireAuth` — checks `authStore.user.role`, redirects to login if unauthenticated or account disabled
- `RequireProfile` — forces onboarding until `user.profileCompleted` is true
- `RedirectIfAuthed` — used on the login page only

Route tree is in `router.tsx`. Path constants in `paths.ts`.

### Auth session flow

1. `useSessionBootstrap` (called once in `AppShell`) fires `GET /users/current` on every page load.
2. The axios interceptor silently calls `POST /auth/token/refresh` on 401 (deduplicated across concurrent requests) then retries.
3. Access token lives **in memory only** (`src/api/client.ts` module-level `let accessToken`), never in localStorage.
4. `authStore` (Zustand) holds `{ status, user }` — not the token.
5. Session expiry calls `onSessionExpired` → `authStore.reset()` + `queryClient.clear()`.

### API layer (`src/api/`)

- `client.ts` — Axios instance, token management, refresh interceptor, `normaliseError` → `ApiError`
- Per-domain modules: `auth`, `users`, `jobs`, `applications`, `candidate`, `employer`, `admin`, `stats`
- All types in `api/types.ts`

TanStack Query wraps API calls. Query config: `staleTime=30s`, no retry on 4xx. Query/mutation hooks live in `features/<domain>/queries.ts`.

### Mock backend (`src/mocks/`)

Enabled when `VITE_USE_MOCKS=true` (default in dev and production demo build). The mock intercepts axios at the adapter level — no service worker needed. `db.ts` holds in-memory state; `handlers.ts` implements REST routes with the same shape as the real API. Seed data in `seed.ts`.

To develop against the real backend: set `VITE_USE_MOCKS=false` in `.env`. The dev server proxies `/api` to `VITE_PROXY_TARGET` (default `http://localhost:8080`).

### i18n

Two languages: `en` (default) and `hi`. Translation files are bundled (not lazy-loaded) in `src/i18n/locales/`. Eight namespaces: `common`, `auth`, `jobs`, `applications`, `candidate`, `employer`, `admin`, `validation`. Language choice is persisted to localStorage under key `ars.lang`. `<html lang>` is kept in sync on every language change.

### State management split

| What | Where |
|---|---|
| Server/async state | TanStack Query |
| Auth session | Zustand `authStore` |
| Accessibility prefs (font size, high-contrast) | Zustand `a11yStore` |

### Accessibility

GIGW 3.0 / WCAG 2.1 AA target. Radix UI primitives for all interactive widgets. Status indicators always use text+icon, never colour alone. `AccessibilityToolbar` provides font resize and high-contrast toggle. One `<h1>` per page enforced.

### Backend API base URL

`env.apiBaseUrl` defaults to `/api/v1`. In dev, Vite proxies `/api` to `VITE_PROXY_TARGET` (default `http://localhost:8080`). The real backend listens at `http://localhost:4000/api/v1`, so set `VITE_PROXY_TARGET=http://localhost:4000` and `VITE_USE_MOCKS=false` to develop against it.

### Auth OTP flow

`POST /auth/otp/request` takes `{ phone, role }`. `POST /auth/otp/verify` also requires `role` in the body (needed by backend on first sign-up). The `LoginPage` captures `role` in `PhoneStep`, stores it in component state, and threads it through to `OtpStep` → `verifyOtp()`.

### Document access

Uploaded files (resume, Aadhaar, certificates, employer docs) cannot be fetched directly from `/uploads/…`. They must be requested via `GET /api/v1/documents/:filename` with a Bearer token. The helper `fetchDocumentBlobUrl(urlPath)` in `src/api/documents.ts` extracts the filename, fetches via the `api` axios instance (so the interceptor injects the token), and returns a temporary `blob:` URL for `window.open` or `<img src>`. Returns `null` for mock-mode URLs (`mock://…`); callers should handle null by suppressing the link.

### Admin dashboard metrics

The real backend returns `successfulHires` from `GET /admin/dashboard`. The mock extends this with `totalPlacements` and `verifiedPlacements`. `AdminDashboardMetrics` in `types.ts` declares all three as optional; `DashboardPage` uses `totalPlacements ?? successfulHires ?? 0` so it works with both backends.

### Deployment

Deployed to Vercel. `vite.config.ts` sets `base: '/'`. `vercel.json` handles SPA rewrites.
Docker build produces a static nginx image (`nginx.conf` included).
