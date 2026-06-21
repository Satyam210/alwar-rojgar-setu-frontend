# Alwar Rojgar Setu — Frontend

A mobile-first job-matching portal connecting Alwar's youth with local employers. This is the
**Phase 1** web frontend: a client-side rendered React SPA that consumes the backend REST API.

> Built to the locked decisions in the Frontend HLD v1.2, PRD v4, "Decisions From District", the
> Database Technical Design v1.0, and the API Design Refactoring Recommendations.

## Tech stack

| Concern            | Choice                                                        |
| ------------------ | ------------------------------------------------------------ |
| Framework          | React 18 + Vite + TypeScript (SPA; SSR ruled out)            |
| Routing            | React Router (role-based guards)                             |
| Styling            | Tailwind CSS + design tokens (WCAG AA palette)              |
| Accessible UI      | Radix UI primitives                                         |
| Server state       | TanStack Query                                              |
| Client state       | Zustand (auth session + accessibility prefs)               |
| Forms & validation | React Hook Form + Zod                                       |
| HTTP               | Axios with interceptors (in-memory JWT, silent 401 refresh) |
| i18n               | react-i18next (English default, Hindi toggle)              |
| Resume PDF         | @react-pdf/renderer                                        |
| Admin charts       | Recharts                                                   |
| Dates/numbers      | Intl API + date-fns                                       |
| Packaging          | Docker (nginx static serve)                                |

## Getting started

Requires **Node.js >= 18** (Node 22 recommended).

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev            # http://localhost:5173
```

The dev server proxies `/api` to `VITE_PROXY_TARGET` (defaults to `http://localhost:8080`).

### Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the Vite dev server            |
| `npm run build`     | Type-check and build for production   |
| `npm run preview`   | Preview the production build          |
| `npm run lint`      | ESLint (incl. `jsx-a11y`)            |
| `npm run typecheck` | TypeScript type-check                |

## Architecture

```
src/
  api/         Typed REST client (axios) + per-domain service modules
  components/  ui/ (Radix primitives), layout/ (shell), common/ (states, badges)
  config/      Env access
  features/    Feature-sliced screens: public, auth, candidate, employer, admin, jobs, applications
  hooks/       Session bootstrap, page title
  i18n/        react-i18next setup + en/hi catalogs (8 namespaces)
  lib/         cn, format (Intl), query client, constants, validation helpers
  routes/      Route paths, guards, router
  stores/      Zustand stores (auth, accessibility)
  styles/      Tailwind entry + design tokens + high-contrast theme
```

### Authentication (HLD §5)

- Access JWT (1h) is held **in memory only** — never in localStorage.
- Refresh token (30d) is delivered via an httpOnly Secure cookie; the axios interceptor performs a
  single silent refresh on `401` and retries.
- On load, `GET /users/current` rehydrates `{ role, profileCompleted, isActive }` to drive guards.

### Accessibility (GIGW 3.0 / WCAG 2.1 AA)

Skip link, accessibility toolbar (font resize + high-contrast), semantic landmarks, one `<h1>` per
page, labelled controls with `aria-describedby` errors, text+icon status (never colour-only),
visible focus, `<html lang>` kept in sync, mobile-first reflow at 320px.

## Deployment (GitHub Pages)

The repo ships a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds on a
Node 20 runner and publishes to GitHub Pages on every push to `main`. The public build runs on
the in-browser **mock backend** (`.env.production` sets `VITE_USE_MOCKS=true`), so the demo is
fully usable without a live API.

One-time setup:

1. Push the repo to `https://github.com/Satyam210/alwar-rojgar-setu`.
2. In **Settings → Pages**, set **Source = GitHub Actions**.
3. Every push to `main` then deploys to `https://satyam210.github.io/alwar-rojgar-setu/`.

> The Vite `base` and the React Router `basename` are set to `/alwar-rojgar-setu/` for production
> builds. If you fork under a different repo name, update `base` in `vite.config.ts`.

## Docker

```bash
docker build -t alwar-rojgar-setu-frontend .
docker run -p 8080:80 alwar-rojgar-setu-frontend
```

## Status

See `CONTEXT.md` for the running summary of goals, decisions, and what's built vs. pending.
