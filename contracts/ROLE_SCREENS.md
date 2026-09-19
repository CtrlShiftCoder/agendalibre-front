# Role × screen matrix

Enforced in UI (and later API). Uses `UserRole`, `TeamMemberRole`, `isEmpresaAdmin`, `activeProfessionalId`.

| Screen | Route | cliente | empresa admin | empresa trabajador | persona_natural |
|--------|-------|---------|---------------|--------------------|-----------------|
| Política no-show/seña | `/politica` | view on booking | **edit** | **read** | **edit** |
| Lista de espera | `/lista-espera` | **join** | **manage** | view/claim | **manage** |
| Ficha cliente | `/cliente/[id]` | own history | **full** | own appts clients | **full** |
| Vitrina pública | `/vitrina` edit · `/v/[slug]` visit | visit | **edit** | — | **edit** |
| Caja del día | `/caja` | — | **full** | own revenue only | **full** |
| Recordatorios | `/recordatorios` | — (receives) | **send** | send own | **send** |
| Honorarios Chile | `/honorarios` | — | — | — | **yes** |
| Invitar trabajador | `/equipo` | — | **yes** | — | — |
| Notificaciones (prefs) | `/notificaciones` | **own** | **own** | **own** | **own** |
| Notificaciones (inbox) | `/notificaciones` | **own** | **business + own** | **own** | **own** |
| Dejar reseña | `/resena/[appointmentId]` | after completed | — | — | — |
| Ver / gestionar reseñas | `/resenas` · vitrina | view on vitrina | **manage/reply** | **read** | **manage/reply** |
| Galería trabajos | `/galeria` | view on vitrina | **edit** | optional upload own / admin | **edit** |

## Helpers
- `isEmpresaAdmin({ profile, professionals })` — empresa + admin (or no active = admin)
- Trabajador: filter by `activeProfessionalId` for cash, reminders, client fichas tied to their appointments
- Cliente: waitlist join + policy text on `/reservar`; ficha = own `linkedClientId`
- Reviews: cliente leaves after `completada`; providers reply / toggle visibility
- Gallery: PoC placeholders (color + emoji); public strip on `/v/[slug]`

> Rutas `/resenas` y `/resena/[id]` usan ASCII (sin ñ) por compatibilidad Metro/web; el copy de UI sigue en español Chile.
