# AgendaLibre — Front + API architecture

## Overview

| Layer | Path | Role |
|-------|------|------|
| Expo UI | `app/`, `components/` | Screens (Expo Router). Keep runnable offline. |
| State PoC | `store/` | Zustand + AsyncStorage; source of truth when API mode is off. |
| Domain DTOs | `contracts/` | Self-contained TypeScript bible (no `@/` Expo imports). |
| API client | `api/` | Fetch wrapper + per-domain endpoints against mock server. |
| Helpers | `lib/` | Pure domain helpers (cash, honorarios, roles, …). |
| Mock API | `../agenda-libre-api` | Hono + Zod + in-memory DB on `:8787`. |

## Modes

- **`EXPO_PUBLIC_USE_MOCK_API=false` (default)** — Zustand-only PoC (current demos).
- **`EXPO_PUBLIC_USE_MOCK_API=true`** — prefer HTTP; call `hydrateFromApi()` to pull
  `/auth/me` + core collections into Zustand. Screens can gradually switch reads
  to `api/endpoints/*` with fallback to store.

Base URL: `EXPO_PUBLIC_API_URL` (default `http://127.0.0.1:8787`).

## Zustand selector rule

Never put `.filter` / `.map` / `.find` **inside** `useAppStore(selector)`.
Select raw slices, then `useMemo` derived lists.

## Contracts ownership

`contracts/types.ts` defines Niche, UserRole, Service, Appointment, envelopes, etc.
`data/types.ts` re-exports unions + keeps helper functions (`roleLabel`, …).
API mirrors contracts under `agenda-libre-api/src/contracts` (no Expo path aliases).

## Replacing mock-db

Keep module boundaries in the API (`handlers → service → repository`).
Swap repository implementations to Prisma; wire JWT instead of `auth-mock`.
Front `api/` client stays the same if envelopes and routes stay stable.

## Public storefront path

`app/v/[slug].tsx` tries `storefrontApi.publicBySlug` when API mode is on,
falling back to local Zustand storefront for offline PoC.



## Dual-write (`store/apiActions.ts`)

Screens mutate via `api*` helpers (services, clients, appointments, notifications, …):
when `EXPO_PUBLIC_USE_MOCK_API=true` they hit `api/endpoints/*`, mirror into Zustand,
and soft-fallback to local store if the mock API is down. Offline PoC keeps working
unchanged (`apiMode` off → pure Zustand). No Nest/Prisma/payments in this path.

## Data dictionary & OpenAPI

- `docs/DICCIONARIO-DATOS.md` — entities, enums, Chile/CLP/honorarios notes
- `docs/openapi.json` — generated (`agenda-libre-api` → `npm run openapi`)

## Runtime flags

- `EXPO_PUBLIC_USE_MOCK_API=true` (also `app.json` extra.useMockApi)
- Boot: `_layout` → `hydrateFromApi()` soft-fail → Zustand seeds
- Auth token: `api/session.ts` Bearer auto-attach in `api/client.ts`
- Caches: API TTL (`infrastructure/cache/ttl-cache.ts`) · front GET (`api/cache.ts`)
- Logs: API `request-logger` (+ requestId) · front `[api:req|res|err|cache]` in dev

## Mobile UX polish (overnight)

| Piece | Path | Behavior |
|-------|------|----------|
| **OfflineBanner** | `components/OfflineBanner.tsx` | Slim dismissible bar when hydrate `/health` fails (`store/useConnectivity`). |
| **Pull-to-refresh** | `lib/usePullToRefresh.tsx` + `lib/pullRefresh.ts` | Shared `RefreshControl` on Hoy / clientes / servicios; refreshes agenda data. |
| **Haptics** | `lib/haptics.ts` | Web-safe `expo-haptics` wrappers (no-op on web / missing native). |
| **Reduce motion** | `lib/reduceMotion.ts` | Gate via `EXPO_PUBLIC_REDUCE_MOTION` + web `prefers-reduced-motion`; used by `components/motion.tsx`. |

## Idempotency (overnight)

- API: optional `Idempotency-Key` on `POST /appointments` + `POST /clients` (in-memory 24h).
- Front: `appointmentsApi.create` auto-sends a uuid; override via `opts.idempotencyKey`.

