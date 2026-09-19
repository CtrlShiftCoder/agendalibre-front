# AgendaLibre — Estudio UX/UI (PoC)

## Contexto
App Expo de agendamiento. Nicho semilla: barberías. Debe servir igual a personas naturales (ej. podóloga) y otros negocios de citas.

## Cómo se siente cómoda la gente
- **Menos de 30–60s** para reservar. Flujo corto, sin cuenta obligatoria al inicio.
- **Servicio primero** (define duración y precio) → profesional opcional / “primer disponible” → horario → datos mínimos → confirmación tipo “ticket”.
- **No abrir en grilla mensual**: mostrar próximos días con cupos, primer slot disponible destacado, franjas Mañana / Tarde.
- **Targets grandes** (pulgar), CTA sticky abajo, tipografía clara, contraste alto.
- **Confirmación = ticket** que se guarda/comparte (servicio, hora, lugar, código).
- **Reagendar/cancelar en 1 tap** desde recordatorios (reduce no-shows más que cualquier otro feature).
- Mensajes humanos: “Revisando la agenda…” no jerga de sistema.

## Colores (multi-nicho)
Base calm-trust (sirve a salud y belleza):
- Fondo: `#F7F4EF` (crema cálida)
- Superficie: `#FFFFFF`
- Texto: `#1C1917`
- Primario: `#0F766E` (teal confianza — podología / salud)
- Acento barbería (tema): `#B45309` + charcoal `#292524`
- Éxito / disponible: `#15803D`
- Alerta / no-show: `#B91C1C`
- Bordes suaves, radios 12–16, sombras muy sutiles

Temas por nicho (PoC): `barber` | `health` | `beauty` | `neutral` — cambian acento, no la estructura.

## Información que la gente quiere ver
Cliente: qué, cuánto dura, cuánto cuesta, con quién, cuándo, dónde, política de cancelación.
Profesional/dueño: quién viene hoy, a qué hora, servicio, teléfono, estado (confirmada / pendiente / cancelada), huecos libres.

## Módulos PoC v1
1. **Onboarding** — tipo: negocio / persona natural; nicho; nombre.
2. **Hoy** — agenda del día + atajo “Nueva cita”.
3. **Servicios** — nombre, duración, precio; CRUD simple (local).
4. **Clientes** — nombre, teléfono; historial básico.
5. **Agenda** — días próximos + slots por franja.
6. **Nueva cita** — flujo 4 pasos + ticket de confirmación.
7. **Negocio / Perfil** — horario laboral, tema visual, datos básicos.
8. **Recordatorios** — UI mock (SMS/WhatsApp “próximamente”).

## Roles
- **Cliente** (reserva)
- **Profesional / dueño** (gestiona agenda) — PoC prioriza vista profesional + flujo de reserva embebido.

## Datos PoC
Mock local (AsyncStorage / estado en memoria). Sin backend aún.
