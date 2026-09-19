# AgendaLibre — Revisión exhaustiva
2026-09-11

## A. Dolores de industria (más allá de reseñas de marca)

1. No-shows 10–30% → seña %, card-on-file, reminders 24h + 2h con reagendar
2. Doble booking / duración mal calculada (color + corte, etc.)
3. Disponibilidad falsa / stale
4. Waitlist cuando no hay cupo
5. Multi-servicio en una cita
6. Recursos (silla/sala) además de persona
7. Historial cliente + alergias/notas clínicas ligeras
8. Upsell / add-ons en checkout
9. Comisiones de staff / liquidación
10. Inventario / productos (POS) — no core v1
11. Sync Google Calendar (evitar doble agenda personal)
12. Booking 24/7 desde IG / Google Business

## B. Chile-específico

1. Seña con **Flow** o **Mercado Pago** (plata local, no solo Stripe USD)
2. Boleta de honorarios / SII (Encuadrado/AgendaPro lo venden duro a independientes)
3. WhatsApp como canal #1 (no email)
4. Precios CLP + IVA claro
5. Retención honorarios 15,25% (2026) — calculadora líquido vs bruto ayuda a persona natural
6. Evitar freemium con comisión oculta sobre señas (dolor Turnito-like)

## C. Auditoría PoC actual (qué hay / qué falta)

### Ya hay (valor)
- 3 roles: cliente / empresa / persona_natural
- Equipo admin + trabajadores
- Link `/reservar`, rebook, wa.me
- Servicios con seña % (UI), cronograma Flujo, motion Moti
- Auth UI mock Google, a11y TextField, responsive center
- Temas nicho, ticket

### Mock / incompleto
- Auth real (Gmail OAuth)
- Backend / multi-dispositivo / sync
- Recordatorios automáticos (solo UI)
- Cobro seña real (Flow/MP)
- Política no-show enforceable
- Waitlist
- Google Calendar sync
- Notificaciones push
- Boletas SII
- Multi-sucursal
- POS / inventario
- Reportes serios / export
- Landing pública branded (parcial)
- Permisos trabajador más finos (hoy filtro agenda)

### Riesgos técnicos PoC
- Todo en AsyncStorage local
- Seeds demo mezclados con rol cliente
- Sin tests automatizados visibles
- Web vs nativo: cuidado animaciones width %

## D. Prioridad valor agregado (siguiente trimestre producto)

### P0 — anti-reclamo + diferenciación
1. Promesa + producto: **sin comisión por cliente propio**
2. Seña Flow/MP + cancelación auto si no paga
3. Recordatorios WA confiables (precio transparente)
4. Auth real + backend mínimo
5. App móvil estable (TestFlight / Play)

### P1 — ops que pagan
6. Política no-show + flag “cliente riesgoso”
7. Waitlist + aviso cupo liberado
8. Google Calendar sync
9. Calculadora honorarios / tip boleta (persona natural Chile)
10. Landing pública con marca (foto, mapa, reviews)

### P2 — crecer
11. Multi-sucursal light
12. Comisiones equipo
13. POS simple
14. AI receptionist / chat booking (largo plazo)

## E. Mensaje comercial reforzado
> No te cobramos por el cliente que ya te conoce. Seña local (Flow/MP). WhatsApp sin sorpresas. Móvil que no se cae. Empresa con equipo. Persona natural con honorarios en mente.
