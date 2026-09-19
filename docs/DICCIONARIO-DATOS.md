# Diccionario de datos — AgendaLibre

Fuente canónica de contratos: `contracts/types.ts` (front) · `agenda-libre-api/src/contracts/types.ts` (API mirror).  
Dinero siempre en **CLP entero** (sin decimales). Fechas de agenda `YYYY-MM-DD`; timestamps ISO-8601.

## Convenciones Chile

| Concepto | Nota |
|----------|------|
| Moneda | CLP integer (`priceClp`, `brutoClp`, …) |
| Teléfonos | E.164 preferido (`+569…`) |
| Zona horaria | `America/Santiago` — `hours.open`/`close` y `workStart`/`workEnd` en HH:mm local (**Horario Chile**) |
| Honorarios 2026 | Retención boleta **15.25%** (`HONORARIOS_RETENTION_2026`) |
| Pagos | `DepositProvider`: `none` \| `flow` \| `mercadopago` — **solo status mock**, sin SDK real |
| Slug vitrina | Público en `/public/v/:slug` y ruta Expo `/v/[slug]` |

## Enums

| Enum | Valores |
|------|---------|
| `Niche` | `barber` · `health` · `beauty` · `other` |
| `ThemeId` | `barber` · `health` · `beauty` · `neutral` |
| `ColorScheme` | `light` · `dark` |
| `UserRole` | `cliente` · `empresa` · `persona_natural` |
| `AppointmentStatus` | `confirmada` · `pendiente` · `cancelada` · `completada` · `noshow` |
| `ServiceCategory` | `servicio` · `paquete` · `promo` |
| `ServiceIconKey` | `cut` · `spa` · `bolt` · `all` |
| `TeamMemberRole` | `admin` · `trabajador` |
| `WaitlistPeriod` | `morning` · `afternoon` · `any` |
| `WaitlistStatus` | `waiting` · `notified` · `booked` · `cancelled` |
| `ClientRiskFlag` | `ok` · `watch` · `high` |
| `ReminderKind` | `confirm` · `reminder_24h` · `reminder_2h` · `noshow_followup` |
| `ReminderChannel` | `whatsapp` · `sms` · `email` |
| `ReminderJobStatus` | `pending` · `sent` · `failed` |
| `TeamInviteRole` | `trabajador` · `admin` |
| `TeamInviteStatus` | `pending` · `accepted` · `revoked` |
| `DepositProvider` | `none` · `flow` · `mercadopago` |
| `DepositStatus` | `not_required` · `pending` · `paid` · `refunded` · `forfeited` |
| `PaymentMethod` | `cash` · `transfer` · `card` · `other` (tags locales caja; sin gateway) |
| `AppNotificationKind` | `booking_confirm` · `reminder_24h` · `reminder_2h` · `waitlist` · `review_request` · `team_invite` · `review_received` · `generic` |

## Entidades

### AuthUser / AuthSession
| Campo | Tipo | Notas |
|-------|------|-------|
| id | string | `usr_…` |
| email | string | |
| name | string | |
| role | UserRole | |
| businessId | string \| null | null si cliente puro |
| professionalId | string \| null | |
| clientId | string \| null | |
| token | string | mock `mock:<role>:<userId>` |
| expiresAt | ISO string | |

### Business
Tenant multi-negocio. Relaciona services, professionals, policies, storefront.

### Profile (PoC Expo)
Extiende negocio + auth: `onboardingDone`, `activeProfessionalId`, `linkedClientId`, `colorScheme`, `auth*`.

### Service
`id`, `businessId?`, `name`, `durationMin`, `priceClp`, `active`, `depositPercent?`, `popular?`, `category?`, `iconKey?`.

### Professional
`id`, `businessId?`, `name`, `role` (cargo), `teamRole`, `phone?`, `active`, `color?`, `workStart?` / `workEnd?` (HH:mm, horario personal; fallback horario negocio).

### Client
`id`, `businessId?`, `name`, `phone`, `notes?`, `email?`, `tags?`, `noShowCount`, `completedCount`, `lastVisitAt?`, `riskFlag?`.

### Appointment
`id`, `businessId?`, `serviceId` → Service, `professionalId` → Professional \| null, `clientId` → Client, `date`, `startTime`, `status`, `code`, `createdAt`, `notes?`.  
**Double-booking lock**: mismo `date`+`startTime`+pro (o null) con status activo bloquea altas.

### CancellationPolicy
`cancelBeforeHours`, `depositPercentDefault`, `noShowFeePercent`, `noShowFeeFixedClp`, `keepDepositOnNoShow`, `policyText`.

### WaitlistEntry
Preferencias de cupo; al `noshow`/`cancelada` corre simulador **cupo liberado** → status `notified` + notificación.

### PublicStorefront / PublicStorefrontView
Branding + vista pública enriquecida (services, pros, reviews, gallery, policySummary).

### DayCashSummary
Resumen CLP del día; exportable CSV desde Caja. `byMethod` puede venir de tags locales (`PaymentMethod`) vía `computeDayCash({ methodByAppointmentId })`.

### ReminderTemplate / ReminderJob
Plantillas WhatsApp editables (`{{name}}` `{{time}}` `{{service}}` …) + jobs mock.

### HonorariosQuote
`brutoClp`, `retentionRate`, `retentionClp`, `liquidoClp`, `year: 2026`.

### TeamInvite
Códigos de invitación empresa.

### AppNotification / PushPreference
Bandeja in-app + preferencias.

### Review / GalleryItem
Prueba social + portfolio.

## Relaciones (ER resumido)

```
Business 1──* Service
Business 1──* Professional
Business 1──* Client
Business 1──* Appointment
Business 1──1 CancellationPolicy
Business 1──1 PublicStorefront
Business 1──* WaitlistEntry
Business 1──* ReminderTemplate
Business 1──* Review / GalleryItem / TeamInvite / AppNotification

Appointment *──1 Service
Appointment *──0..1 Professional
Appointment *──1 Client
Review 1──1 Appointment
```

## Envelope HTTP

Éxito: `{ data: T, meta?: { requestId, total, page, pageSize } }`  
Error: `{ error: { code, message, details? } }`  
Headers: `Authorization: Bearer …`, `X-Request-Id`, `X-Mock-User`.

## Feature flags (nicho / rol)

Ver `lib/featureFlags.ts`: honorarios (persona_natural), equipo (empresa), depósitos off en health, darkModeToggle, etc.

## Caché

- API: TTL ~30s en GET services / policies / storefront(+public); invalidate en mutaciones.
- Front: TTL ~45s en `api/cache.ts`; invalidate por prefijo de path.

## Front wiring note

Mutations from Expo screens go through `store/apiActions.ts` (dual-write). Entity shapes above stay the contract source; envelopes stay `{ data, meta? }` / `{ error }`.

