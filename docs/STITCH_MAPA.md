# Mapa Stitch → App

Proyecto Stitch: `projects/10532440561160556567` ("Mobile Scheduling MVP UX"). Solo se **leyó** (list/get). 
Estado: **N** = ruta nueva · **R** = UI reemplazada · **A** = ajustada (nuevo tema + componentes) 

## Tokens

| | Empresa (admin) | Profesional (persona_natural) |
|---|---|---|
| Design system | Modern Editorial Multi-Theme Engine (`assets/24b81c8005e14348a1f9b0cdf2938c2e`) | Soloist Modern (`assets/fb61437a1cba42cea0cffe9596e40d81`) |
| primary / container | #2A14B4 / #4338CA | #00685F / #008378 |
| secondary / accent | #006A61 (teal) · container #86F2E4 | ámbar (acento Soloist) |
| surface | #FAF8FF | #F8F9FF |
| texto / variante | #131B2E / #464554 (outline #777586 → #6B6A7C por AA) | idem escala azul‑gris |
| error | #BA1A1A | #BA1A1A |
| Tipografía | Plus Jakarta Sans | Plus Jakarta Sans + Space Grotesk (cifras) |
| Radio | ROUND_EIGHT (8–16 px) | ROUND_EIGHT |

Cliente conserva la paleta teal actual. Se elige en `store/useTheme.ts → usePaletteId()` (indigo solo para `empresa` admin).
Modo oscuro: Stitch no define oscuro; se derivó (`indigoDark` y `darkColors` en `theme/colors.ts`) con contraste ≥ AA.

## ADMIN (empresa)

| Stitch (id) | Pantalla | Ruta app | Estado |
|---|---|---|---|
| a5fb0806 | Agenda Diaria Multi‑Paleta | `/` (tab Hoy) | A + `HoyProBlock` |
| ac472b4b | Agenda General del Negocio | `/agenda` (tab Calendario) | A (cita → `/cita/[id]`) |
| f1f741f9 | Detalle de Cita y Registro de Pago | `/cita/[id]` | N |
| 143b891f | Verificar Pago por Transferencia | `/verificar-pago` | N |
| c703708b | Solicitudes y Aprobación de Citas | `/solicitudes` | N |
| a6956335 | Nueva Cita Paso 1 | `/nueva-cita` | A |
| 6e4db829 | Directorio de Clientes | `/clientes` | A (métricas, WhatsApp, Agendar) |
| f2def061 | Ficha de Cliente e Historial | `/cliente/[id]` | A |
| cbd4ffbb | Catálogo de Servicios y Duraciones | `/servicios` | A |
| 4a05b1e0 | Crear/Configurar Servicio (4 pasos) | `/servicio/[id]` (`nuevo` = crear) | N (reemplaza el modal) |
| 1b4aa026 | Gestión de Equipo y Espacios | `/equipo` | A (+ botón Permisos, Reglas de ocupación) |
| e3d49f40 | Perfil del Profesional | `/profesional/[id]` | N |
| 41a6efd5 | Permisos y Notificaciones de Personal | `/profesional/permisos` | N |
| 7d11c2c3 | Desvincular Profesional (3 pasos) | `/profesional/desvincular` | N |
| 50af622a | Mi Disponibilidad – Slots | `/disponibilidad` | N |
| ff524922 | Escanear QR y Enrolar Profesional | `/enrolar` | N |
| dc9a2a51 | Mi Pase QR Enrolamiento | `/qr-pase` | N |
| 3f33ddf6 | [Barbero] Mi QR y Ficha | `/qr-pase` | N (misma pantalla) |
| b6518793 | Configuración del Negocio | `/perfil` (tab Negocio) → `NegocioScreen` | R |

## PROFESIONAL (persona_natural)

| Stitch (id) | Pantalla | Ruta app | Estado |
|---|---|---|---|
| 1e1c1d9d | Agenda Diaria Profesional Independiente | `/` (Hoy) | A + `HoyProBlock` (link público + meta diaria) |
| d640b51e | [Barbero – Hoy] Mi Día | `/` (Hoy) | A |
| 24aac161 | Mi Perfil, Horarios y Link | `/perfil` → `MiPerfilProScreen` | R |
| 883885b8 | Horarios y Disponibilidad | `/disponibilidad` | N |
| 9fe1d8ed | Enviar Propuesta de Horarios | `/propuesta-horarios` | N |
| 861df280 | [Admin] Revisar y Aprobar Propuesta | `/propuesta-horarios` (paso de revisión) | N |
| b1cfa216 | Generar Pase QR | `/qr-pase` | N |
| cc4b78b9 | Detalle de Turno / Upselling / Cobro | `/cita/[id]` | N |
| fb88bf7f | Configuración de Perfil y Notificaciones | `/ajustes-perfil` | N |
| ffa4aa82 | Mis Finanzas | `/finanzas` (tab) | N |
| 9ffc6852 | Nueva Cita Manual | `/nueva-cita` | A |
| 33ab61e0 | Onboarding Unirse a Negocio / Arrendar Sillón | `/unirse` | N |
| 6e1b05b6 | Perfil y Desenrolamiento de Recinto (botón rojo) | `/desenrolar` | N |
| 7fe1d7bc | Mis Clientes & Fórmulas | `/clientes` | A |
| 64bcd49e | Aprobación de Reservas | `/solicitudes` | N |
| 6d7df600 | Honorarios (generada antes del cambio) | `/honorarios` | R |
| d33471a3 | Caja | `/caja` | R |
| 529cebb8 | Servicios | `/servicios` + `/servicio/[id]` | R/N |
| 9ea32274 | Ficha de cliente | `/cliente/[id]` | A |
| d1f4c89d | Seña y abonos | `/sena` | N |
| 37333c9b | Vitrina con galería | `/vitrina` + `/galeria` | A |

## Componentes nuevos (`components/ui/`, exportados por `index.ts`)
Toast/ToastHost, Avatar, Badge, ScreenHeader, PageScaffold, HeroSummaryCard, StatCard, BarChartMini, LineChartMini, ListRowAvatar, ToggleRow, FormSection, QRCard, ProfileHeader, DangerButton, ConfirmationScreen, FilterChips, InfoBanner. Fuera de `ui/`: `HoyProBlock`, `NegocioScreen`, `MiPerfilProScreen`, barra inferior por perfil en `app/(tabs)/_layout.tsx`.

## Diferencias conocidas
- Las categorías de servicio de Stitch (Barbería, Cuidado Facial…) son ejemplos de un nicho; la app usa las 3 categorías del modelo (Servicio / Paquete / Promoción).
- El QR es una imagen mock determinista (no escaneable).
- Honorarios: Stitch muestra "bruto + propina"; la app mantiene el cálculo existente (propina sobre el líquido; el cliente paga la retención al SII aparte).
- Datos mock: sin fotos remotas (iniciales en avatares).
