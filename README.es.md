# AgendaLibre

PoC de agendamiento multi-nicho (Expo + React Native + TypeScript).  
Tres perfiles: **cliente** (reserva horas), **empresa** (negocio) y **persona_natural** (profesional solo/a). Nicho semilla: barberías.

UI en **español (Chile)**, tuteo cálido. Sin backend: estado local con Zustand + AsyncStorage.

## Cómo correr

```bash
cd agenda-libre
npm install
npx expo start
```

Luego abre en Expo Go (iOS/Android) o pulsa `w` para web.

Scripts:
- `npm start` / `npx expo start`
- `npm run web`
- `npm run android` / `npm run ios` (si tienes emulador)

## Módulos

| Pantalla | Ruta | Descripción |
|----------|------|-------------|
| Onboarding | `/onboarding` | Cliente / Empresa / Persona natural → flujo por rol |
| Hoy / Inicio | `/(tabs)` | Proveedor: agenda del día · Cliente: mis reservas |
| Agenda | `/(tabs)/agenda` | Próximos días + chips Mañana/Tarde |
| Servicios | `/(tabs)/servicios` | CRUD local (nombre, duración, precio CLP) |
| Clientes | `/(tabs)/clientes` | Nombre + teléfono |
| Perfil | `/(tabs)/perfil` | Horario, tema, datos, reinicio PoC |
| Nueva cita | `/nueva-cita` | Wizard 4 pasos → ticket |
| Ticket | `/ticket/[id]` | Confirmación compartible + cancelar |
| Recordatorios | `/recordatorios` | CTA WhatsApp real (wa.me) + plantillas |
| Vista cliente | `/reservar` | Link público de reserva (guest) |

## Roles

- **cliente** — Inicio (próximas citas) · Reservar · Perfil
- **empresa** — Hoy · Agenda · Servicios · Clientes · Perfil (copy “negocio/equipo”)
- **persona_natural** — mismos tabs de proveedor (copy “consulta/mis servicios”)

## Temas

En **Perfil** (o al onboardear) puedes elegir:
- **Barbería** — charcoal + ámbar
- **Salud** — teal
- **Belleza** — rosa
- **Neutro** — teal suave

Ver `DESIGN.md` y `UX-STUDY.md`.

## Estructura

```
app/           # Expo Router (pantallas)
components/    # Button, Card, SlotChip, Ticket, …
theme/         # tokens y temas
store/         # Zustand + AsyncStorage
data/          # tipos, seeds por nicho, helpers de slots
```

## Datos de prueba

Al terminar el onboarding se siembran servicios, profesionales, clientes y citas según el nicho elegido.

## Sprint A / B (UI + producto)

**Sprint A — visual premium:** covers con avatar, menu cards de servicios, date strip ~52px, slots en grilla 3 columnas, empty states ilustrados, onboarding con mood por nicho, ticket boarding-pass.

**Sprint B — producto:** link de reserva (`/reservar`) desde Perfil (copiar / abrir), “Repetir cita” desde Hoy, WhatsApp `wa.me` en recordatorios y avisos, chips de stats del día.

Ver `DESIGN.md` y `ESTUDIO-MERCADO-DISENO.md`.

## Notas PoC

- Sin cuenta ni API.
- WhatsApp abre deep link real; automatización 24h/2h aún mock.
- TypeScript estricto; Expo SDK ~57 / Router.
- No animar `width: '%'` con Reanimated en web.
