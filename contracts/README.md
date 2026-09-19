# AgendaLibre — Backend contracts (DTO bible)

These TypeScript interfaces are the **source of truth** for the mock REST API
(`../agenda-libre-api`) and the Expo PoC store.

## Conventions
- **IDs**: `string` (UUID-ready; PoC uses `prefix_random`)
- **Dates**: ISO-8601 (`updatedAt`, `createdAt`, `scheduledFor`) unless noted `YYYY-MM-DD`
- **Money**: integer **CLP** (no decimals)
- **Timezone**: Chile local for day boundaries in UI; store dates as calendar strings
- **Self-contained**: no `@/` Expo imports — Niche / UserRole live here; `data/types` re-exports them

## REST resource map (mock API :8787)

| Resource | Methods | Auth | Notes |
|----------|---------|------|-------|
| `GET /health` | GET | public | Liveness |
| `POST /auth/login` | POST | public | Mock login → session token |
| `POST /auth/register` | POST | public | Creates user + optional business |
| `GET /auth/me` | GET | bearer | Current mock user |
| `/businesses` | GET, POST, GET/:id, PATCH/:id | bearer | Tenants |
| `/services` | GET, POST, GET/:id, PATCH/:id, DELETE/:id | bearer | Catalog |
| `/professionals` | GET, POST, GET/:id, PATCH/:id, DELETE/:id | bearer | Team |
| `/clients` | GET, POST, GET/:id, PATCH/:id, DELETE/:id | bearer | CRM |
| `/appointments` | GET, POST, GET/:id, PATCH/:id | bearer | Bookings |
| `GET /availability` | GET `?date=&serviceId=&professionalId=` | bearer/public | Slot mock |
| `/policies` | GET, PUT | bearer | Cancellation / deposit |
| `/waitlist` | GET, POST, PATCH/:id | bearer | Join / manage |
| `/storefront` | GET, PUT | bearer | Provider branding |
| `GET /public/v/:slug` | GET | public | Vitrina + gallery/reviews |
| `GET /cash/day` | GET `?date=` | bearer | Day cash summary |
| `/reminders` | GET templates, POST jobs | bearer | Templates + jobs |
| `POST /honorarios/quote` | POST `{ brutoClp }` | bearer/public | Chile 2026 retention |
| `/team/invites` | GET, POST, POST /:code/accept, DELETE /:id | bearer | Empresa |
| `/notifications` | GET, PATCH /:id/read, PUT /preferences | bearer | Inbox |
| `/reviews` | GET, POST, PATCH /:id | bearer/public GET | Ratings |
| `/gallery` | GET, POST, PATCH /:id, DELETE /:id | bearer | Work gallery |

### Auth headers
```
Authorization: Bearer mock:<role>:<userId>
# or
X-Mock-User: {"id":"usr_…","role":"empresa","businessId":"biz_…"}
```

Envelope: `{ data, meta? }` success · `{ error: { code, message, details? } }` failure.

## Files
- `types.ts` — DTOs + envelopes
- `index.ts` — re-exports
- `ROLE_SCREENS.md` — UI role matrix ↔ screens

## PoC mapping
| DTO | Store / lib / API |
|-----|-------------------|
| `Service`, `Appointment`, … | `store` + `/services` etc. |
| `CancellationPolicy` | `cancellationPolicy` / `/policies` |
| `WaitlistEntry[]` | `waitlist` / `/waitlist` |
| `PublicStorefront` | `storefront` / `/storefront`, `/public/v/:slug` |
| `DayCashSummary` | `computeDayCash` / `/cash/day` |
| `HonorariosQuote` | `quoteHonorarios` / `/honorarios/quote` |
| `Review[]` / `GalleryItem[]` | store + public vitrina |
