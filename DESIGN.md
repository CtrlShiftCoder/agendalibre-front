# AgendaLibre — Design system (PoC)

## Principios
- **Rápido y humano**: menos de 60s para agendar; copy en español (Chile), tuteo cálido.
- **Pulgar primero**: targets ≥ 48px, CTA sticky abajo, tipografía clara.
- **Sin grilla mensual al inicio**: próximos días + franjas Mañana / Tarde; destacar primer cupo.
- **Confirmación = ticket** compartible (boarding-pass).
- Temas cambian **acentos**, no la estructura.
- **Flujo layout + Uber-friendly green**: mint-white surface, green primary `#059669`, soft white cards, timeline cronograma.

## Hoy = Flujo 1:1 reference
La pantalla **Hoy** (`app/(tabs)/index.tsx`) es un clon visual del HTML mock Flujo.
Especificación pixel: `design-refs/flujo-hoy-pixel-spec.md` · notas: `design-refs/flujo-style-notes.md`.

Secciones (orden fijo):
1. Header glass h-64: wordmark + “Agenda”, search 44px, avatar 32px
2. Fecha uppercase primary + pill “Ritmo óptimo” (secondary-container + bolt)
3. ¡Hola, {firstName}! ☀️ — solo primer nombre del perfil
4. “Tienes **N** citas programadas para hoy. Tu agenda fluye en balance.”
5. 3 metric cards altas: Estimado / Pausa libre / Eficiencia (icon+delta, label, valor)
6. Mes + “Mes completo →” · WeekCarousel Lun–Dom (selected primary + glow + scale 1.05 + HOY + dot)
7. Cronograma del Día + badge “N restantes” + tune · TimelineItem Flujo anatomy

## Palette (default look)
Flujo layout structure + Uber-inspired friendly green (clean, approachable — not harsh neon). Fuente: **Plus Jakarta Sans** 400/500/600/700.

| Token | Valor |
|-------|--------|
| primary | `#059669` (AA white-on-primary large) |
| primaryContainer | `#047857` |
| primaryFixed | `#D1FAE5` |
| surface | `#F7FAF8` |
| onSurface | `#141414` |
| onSurfaceVariant / textMuted | `#35453E` |
| surfaceContainerLowest | `#FFFFFF` |
| surfaceContainerLow | `#F0FDF4` |
| surfaceContainer | `#ECFDF5` |
| surfaceContainerHigh | `#D1FAE5` |
| secondary | `#2F3D36` |
| secondaryContainer | `#E8F5EE` |
| tertiary | `#047857` |
| tertiaryFixed | `#ECFDF5` |
| outline | `#5F7067` |
| primaryText | `#047857` |
| placeholder | `#55665E` |
| Radios | `sm` 12 · `md` 16 · `lg` 24 · `xl` 28 · `xxl` 32 |
| Gutter Hoy | 16px |
| Max content (web) | ~520px centered (`ResponsiveShell` / `layout.maxContentWidth`) |
| Sombras | preferir `sm` (soft); selected day `primaryGlow` rgba(6,193,103,…) |

Código: `flujo` + `baseColors` en `theme/colors.ts`.

## Responsive
- Header / tabs: full width; main content capped ~480–560px on wide web.
- Stat chips: 3-col; shrink padding/font on narrow; wrap/stack if width &lt; 360.
- Week carousel: horizontal layout OK; servicios cards full width within max container.
- Avoid horizontal overflow; use `flexWrap` where grids break.
- No Reanimated `width` % animations.

## Stack visual
| Lib | Uso |
|-----|-----|
| `expo-linear-gradient` | CTA primary, covers (Perfil / reservar) |
| `expo-blur` | Header glass Hoy + tab bar frosted |
| `expo-haptics` | Feedback ligero en botón primary |
| `lucide-react-native` + `react-native-svg` | Iconografía |
| `react-native-reanimated` (~4.5) | Entering (`FadeIn` / `FadeInUp` / `FadeInDown` / `SlideInRight` / `ZoomIn`), `Layout` spring, press scale, ping “En curso” |
| `reanimated` | Declarative wrappers (`FadeInView`, `StaggerItem`) over Reanimated — auth, onboarding steps, list stagger |
| `@expo-google-fonts/plus-jakarta-sans` | Tipografía Flujo |
| `react-native-gesture-handler` | `GestureHandlerRootView` en root |

**No Skia / Rive** (custom native / heavy). Lottie optional — not in PoC.

### Reanimatedon stack
Helpers: `components/reanimatedon.tsx` → `FadeInView`, `StaggerItem`, `entering.*`, `layoutSpring`.

| Superficie | Efecto |
|------------|--------|
| Auth (`AuthShell` / Google) | Brand `FadeInDown`; fields staggered; Google press `scale` spring |
| Onboarding | Step content `FadeIn` / `SlideInRight` on change; progress via **`scaleX`** (no animated `width %`) |
| Hoy / Servicios / Agenda | List rows `FadeInUp` stagger; cards `Layout` spring |
| `Screen` | Reanimated `entering` fade |
| Stack modals | `fade_from_bottom`; cards `slide_from_right`; tabs `animation: 'fade'` |

**Reanimatedon rule (web):** nunca animar `width` con `%` vía Reanimated (max-update-depth). Preferir **opacity + transform** (`scale` / `translate` / `scaleX` con `transformOrigin: left`).

## Temas (`theme/colors.ts`)
| ID | Primario | Uso |
|----|----------|-----|
| `neutral` | Green `#06C167` | Default Uber-friendly |
| `barber` | Green + acento amber | Barberías (mismas superficies mint) |
| `health` | Deeper green `#059669` | Podología / salud |
| `beauty` | Green primary + rose accent `#F472B6` | Belleza (tabs/botones verdes) |

Nichos tintan accent; **misma jerarquía de superficies y layout verde**.

## Componentes
- `Screen` — SafeArea + Reanimated `entering` fade, fondo `surface`; opcional `ResponsiveShell`
- `reanimatedon` — `FadeInView` / `StaggerItem` (Reanimated) + Reanimated entering presets
- `ResponsiveShell` — max-width ~520 centered on wide web
- `WeekCarousel` — Lun–Dom estilo Flujo (flex-1, HOY + dot)
- `DateStrip` — misma lengua de chips (Agenda)
- `StatChips` — metric cards altas Estimado / Pausa libre / Eficiencia
- `TimelineItem` — completed / en curso / break / upcoming (anatomía Flujo)
- `AppointmentCard` — filas Agenda + Repetir / WhatsApp
- `CoverHero` — covers en Perfil / reservar (Hoy ya no usa cover oscuro)
- `Button` — primary green CTA, ghost/secondary labels en `primaryText`
- `TextField` — label siempre visible, input ≥16 / minH 52, outline + focus `primaryText`
- `Card` — white, radio `lg`, shadow `sm`

## Accesibilidad / visión
Objetivo: **WCAG AA** en formularios y texto pequeño sobre mint/blanco, sin romper CTAs verdes Flujo.

| Problema | Antes | Después |
|----------|-------|---------|
| Labels / muted sobre `#F7FAF8` o blanco | `#5C6B63` (~4.3:1 borderline / fatiga) | `onSurfaceVariant` / `textMuted` `#3F4F47` (más contraste, menos esfuerzo) |
| Placeholders | mismo muted que body | `placeholder` `#6B7A72` (≥3:1 large/placeholder; más suave que body) |
| Bordes de input (mint-on-mint) | `outline` `#A7B5AD` / `border` mint | `outline` `#7A8B82` |
| Links, precios, duración, labels verdes como texto pequeño | `primary` `#06C167` falla AA sobre mint/blanco | `primaryText` / `tertiary` `#047857` |
| CTA relleno | — | `#059669` + texto blanco (`onPrimary`, AA large ≥3:1) |
| Chips de categoría inactivos | texto/verde claro sobre `surfaceContainerHigh` | `onSurfaceVariant` sobre `surfaceContainerLow` |
| Ghost / secondary Button | label `primary` brillante | label + borde `primaryText` |

Reglas prácticas:
- Inputs siempre con **label visible** (`TextField`), no solo placeholder.
- `fontSize` de input ≥ 16; `minHeight` ≥ 52; error en `danger` ≥ 13.
- Fondo de campo: `surfaceContainerLowest` (blanco).
- No usar `#06C167` como color de texto pequeño sobre superficies claras.

## Sprint B — producto
1. Link de reserva / vista cliente (`/reservar`)
2. Rebook (“Repetir cita”)
3. WhatsApp real vía `https://wa.me/?text=`
4. Stats del día

Helpers: `lib/whatsapp.ts`, `lib/bookingLink.ts`, `lib/nicheVisuals.ts`.


## Perfiles de usuario (roles)
Tres perfiles claros en onboarding (`UserRole` en `data/types.ts`):

| Rol | Quién | Experiencia |
|-----|-------|-------------|
| `cliente` | Quien reserva horas | Tabs **Inicio · Reservar · Perfil**. Inicio lista citas del `linkedClientId`. |
| `empresa` | Negocio (barbería, salón, clínica) | Tabs **Hoy · Agenda · Servicios · Clientes · Perfil**. Equipo (admin + trabajadores). Copy “negocio/equipo”. |
| `persona_natural` | Profesional solo/a | Mismos tabs de proveedor. Copy “consulta/mis servicios”. |

Onboarding: paso 1 elige perfil → cliente (nombre + tel opcional) o proveedor (nicho → nombre → tema).  
Perfil muestra badge del rol y “Cambiar perfil” (reset → onboarding).  
PoC: el rol `cliente` también siembra un proveedor demo local para que `/reservar` funcione.

## Equipo (empresa)
Solo `role === 'empresa'` tiene equipo con sub-perfiles (`Professional.teamRole`: **Admin** | **Trabajador**).

| Concepto | Detalle |
|----------|---------|
| Admin | Dueño: servicios, clientes, horas, link, CRUD trabajadores, switch de contexto |
| Trabajador | Ve su agenda, cambia estado, WhatsApp cliente; sin borrar negocio ni gestionar otros |
| `activeProfessionalId` | Sub-perfil “logueado”; Hoy/Agenda filtran si es trabajador |
| UI | **Perfil → Equipo** (`app/equipo.tsx`) + tarjeta “Actuando como…” |
| persona_natural | Sigue solo (sin UI de equipo) · cliente sin cambios |

Store: `addTeamMember` / `updateTeamMember` / `removeTeamMember` (bloquea último admin) / `setActiveProfessional`. Helpers en `lib/team.ts`.


## Auth UI mock — backend pending
Pantallas `app/login.tsx` y `app/registro.tsx` (UI only). Google = botón mock que setea `profile.authDone` / `authProvider` en Zustand — **sin** `expo-auth-session`, client IDs, Firebase ni Supabase.
- Index: `!authDone` → `/login` · `!onboardingDone` → `/onboarding` · else `/(tabs)`
- Store: `signInMock` / `signOutMock`; logout limpia solo flags de auth; Cambiar perfil / `resetAll` los preserva
- Componentes: `GoogleButton`, `AuthShell`

## Mensajes
- Loading: “Revisando la agenda…”
- Vacío hoy: “Día libre por ahora”
- Sin cupos: “No quedan cupos este día. Prueba otro.”

## Backend contracts (DTO bible)
Fuente de verdad TypeScript para un backend futuro: carpeta **`contracts/`**.
- `contracts/types.ts` — DTOs (UUID-ready, ISO dates, CLP enteros)
- `contracts/README.md` — mapa REST `/policies`, `/waitlist`, `/clients/:id`, `/storefront`, `/cash/day`, `/reminders`, `/honorarios/quote`, `/team/invites`
- `contracts/ROLE_SCREENS.md` — matriz rol × pantalla
- PoC: mismos shapes en Zustand + `lib/cash.ts` + `lib/honorarios.ts`

## Pantallas de alto valor (rol-gated)
| Ruta | Uso |
|------|-----|
| `/politica` | Política no-show/seña |
| `/lista-espera` | Waitlist join/manage/claim |
| `/cliente/[id]` | Ficha cliente + riesgo |
| `/vitrina` · `/v/[slug]` | Editar / visitar vitrina |
| `/caja` | Caja del día (CLP) |
| `/recordatorios` | Plantillas + WhatsApp |
| `/honorarios` | Calculadora boleta 15.25% 2026 |
| `/equipo` | + Invitar trabajador (código) |

Acceso vía **Perfil** (botones según `lib/access.ts`). Entrypoints también en Clientes / ClienteHome / reservar (política al confirmar).
