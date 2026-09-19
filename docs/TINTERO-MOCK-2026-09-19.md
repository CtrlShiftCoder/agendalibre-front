# Tintero mock · 2026-09-19 — Batch C + D (Chile mocks)

Changelog corto pa’ Ignacio. **Mocks only** — sin Nest / Prisma / Flow / MP / FCM / GCal OAuth / cloud photo upload / SII real.

Fecha local: **sáb 19 sep 2026 · America/Santiago (UTC-3)**.

---

## Landed this run (Batch C + D)

### C1 — Dual-write audit
Gaps wired through `store/apiActions.ts` (soft-fallback si API down):

| Mutación | Helper |
|----------|--------|
| Seña status (+ provider Flow/MP) | `apiSetDepositStatus` → PATCH `/appointments/:id` (`depositStatus` / `depositProvider`) |
| Preferencias push | `apiUpdatePushPreferences` |
| Crear reseña | `apiCreateReview` |
| (ya existían) services toggle/CRUD, clients, appointments status, gallery, reviews reply/vis, waitlist, policy, storefront, reminders, notifications read, team, blockedDates, hours | sin cambio de API |

UI call sites actualizados: ticket, notificaciones, resena, + Flow/MP en ticket / nueva-cita / reservar.

### C2 — OpenAPI from Zod
- `npm run openapi` → `tsx scripts/generate-openapi.ts` deriva requestBodies desde `src/modules/*/schemas.ts`.
- Escribe `openapi.json` + `openapi/openapi.json` + `agenda-libre/docs/openapi.json`.
- Marker `x-generated-from: "zod-schemas"`.
- `GET /openapi.json` (fallback a `openapi/`).
- Documentado en README API (sección OpenAPI from Zod).
- Smoke: valida Zod bodies + PATCH depositStatus.

### D3 — Seña Flow/MP UI mock
- Componente `DepositFlowMpMock`: botones **Simular pago Flow** / **Simular pago MP**.
- Solo flip `depositStatus=paid` + `depositProvider` local/API mock.
- Copy claro: **mock — sin cobro** · nunca llama gateways.
- En ticket + confirmación booking (`nueva-cita` / `reservar`).

### D4 — WA auto mock
- `lib/waAuto.ts`: preview `Alert` → “Abrir WhatsApp” con templates (`recordatorios` / cupo).
- Tras crear cita (`nueva-cita`, `reservar`), no-show y cupo liberado (ticket).
- Sin envío automático ni Meta/Twilio.

### D5 — GCal mock
- Perfil (proveedor): sección **Google Calendar (mock)** — toggle + “última sync” + “Simular sync ahora”.
- Campos `profile.gcalMockEnabled` / `gcalLastSyncAt`. **Sin OAuth.**

### D6 — Honorarios SII-ready mock
- Card **Boleta preview**: RUT placeholder, folio mock, retención 15,25%, líquido.
- Botón copiar/compartir texto (`formatBoletaShareText`) — puro UI/calc.
- Disclaimer: no sustituye boleta electrónica ni SII.

---

## Verify
- Front `npx tsc --noEmit` → **0**
- API `npm run typecheck` → **0**
- API `npm run test:smoke` → **9 passed** (health, openapi, login, services, honorarios, vitrina, idempotency, Zod bodies, PATCH depositStatus)
- Expo web `:8081` → **200** en `/bienvenida` `/ticket/…` `/honorarios` `/(tabs)/perfil` `/nueva-cita` `/reservar` `/notificaciones`
- Sin Nest/Prisma/Flow/MP/FCM/GCal OAuth/SII real

---

## Remains / leftover
- Upload real de fotos (sigue fuera — solo picsum)
- Preferencia explícita “no ofrecer WA auto” (hoy siempre ofrece preview; se puede silenciar con “Ahora no”)
- GCal sync no escribe eventos reales (solo timestamp UI)
- Boleta mock no genera PDF ni XML SII
- Dual-write: `deleteService` / revoke team invite si se usan en UI (hoy poco/no usados)
- OpenAPI responses siguen high-level (requestBodies sí desde Zod; responses = description strings)

## Prev batches (A + B)
Ver secciones A1–B3 en historial: category chips, brand landing, reagendar 1-tap, client filters, gallery picsum.

---

## UX / Motion free pack (same day)

Ver **`docs/UX-MOTION-2026-09-19.md`**. Resumen: Lottie success + Reanimated micro-motions + shimmer skeletons + “Primer cupo disponible” chip. Sin Moti/Skia/Tamagui/pagos.

