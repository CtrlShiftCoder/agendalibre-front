# Flujos de navegación (pantalla → destinos)

Cada botón/tarjeta/ítem navega a una ruta o ejecuta una acción mock con feedback (toast `testID="toast"` o diálogo). Los interruptores se guardan en el store (`prefs`, persistido en localStorage) y sobreviven a recargar.
Verificado con `/tmp/shot/audit.js` (clic real en cada elemento interactivo, ver resultados en el reporte final).

## Barra inferior por perfil
| Perfil | Pestañas (ruta) |
|---|---|
| Empresa (admin) | Hoy `/` · Calendario `/agenda` · Servicios `/servicios` · Clientes `/clientes` · Negocio `/perfil` |
| Profesional / trabajador | Hoy `/` · Agenda `/agenda` · Clientes `/clientes` · Finanzas `/finanzas` · Perfil `/perfil` |
| Cliente | Inicio `/` · Reservar · Mis citas · Perfil (sin cambios) |

## EMPRESA (admin)
| Pantalla | Destinos / acciones |
|---|---|
| Hoy `/` | Búsqueda `/buscar`; campana `/notificaciones`; chips Nueva cita `/nueva-cita`, Solicitudes `/solicitudes`, Lista espera `/lista-espera`, Caja `/caja`; tarjetas "Por aprobar" `/solicitudes`, "Equipo" `/equipo`, "Caja" `/caja`; cita → `/cita/[id]`; "Ajustar vista" `/agenda`; WhatsApp (abre wa.me); FAB `/nueva-cita` |
| Calendario `/agenda` | cita → `/cita/[id]`; Nueva cita `/nueva-cita` |
| Cita `/cita/[id]` | Ficha cliente `/cliente/[id]`; Ticket `/ticket/[id]`; Reagendar `/nueva-cita?clientId`; Verificar transferencia `/verificar-pago?id`; cobrar (método, propina/upselling, vuelto), completar, cancelar → toast + estado en store |
| Solicitudes `/solicitudes` | Aprobar / Rechazar (estado + toast); Proponer otro horario `/nueva-cita?clientId`; ver detalle `/cita/[id]` |
| Verificar pago `/verificar-pago` | Confirmar / Rechazar comprobante (toast, actualiza cita); volver |
| Servicios `/servicios` | Nuevo `/servicio/nuevo`; tarjeta → `/servicio/[id]`; activar/pausar (store) |
| Servicio `/servicio/[id]` | 4 pasos (Básicos, Precios, Tiempos, Boxes & Staff); Guardar y publicar / borrador → vuelve + toast |
| Clientes `/clientes` | Nuevo (modal), filtros, tarjeta → `/cliente/[id]`, WhatsApp, Agendar `/nueva-cita?clientId`, Lista espera `/lista-espera` |
| Negocio `/perfil` | Equipo `/equipo`, Solicitudes, Caja, Verificar transferencias, Enrolar `/enrolar`, Vitrina `/vitrina`, Galería `/galeria`, Reseñas `/resenas`, Recordatorios `/recordatorios`, Lista espera, Disponibilidad `/disponibilidad`, Mi QR `/qr-pase`, Cuenta `/ajustes` |
| Equipo `/equipo` | Permisos → `/profesional/[id]`; Editar (modal); Quitar; Invitar (copiar/WhatsApp); Reglas de ocupación (3 toggles persistentes) |
| Profesional `/profesional/[id]` | Disponibilidad `/disponibilidad`; Permisos `/profesional/permisos?id`; Desvincular `/profesional/desvincular?id`; Guardar (toast) |
| Permisos `/profesional/permisos` | toggles de permisos y notificaciones (persisten); Guardar |
| Desvincular `/profesional/desvincular` | 3 pasos → confirmar → `/equipo` |
| Enrolar `/enrolar` | Escanear/simular QR → confirmar → `/equipo`; Cancelar → `/perfil` |
| Caja `/caja`, Vitrina, Galería, Reseñas | acciones con toast; Vitrina → vista pública `/v/[slug]` |

## PROFESIONAL (persona_natural)
| Pantalla | Destinos / acciones |
|---|---|
| Hoy `/` | Tarjeta "Link público": Copiar (toast), Compartir WhatsApp; "Facturación de hoy" con meta; chips (Nueva cita, Solicitudes, Lista espera, Caja, Notificaciones); cita → `/cita/[id]`; FAB `/nueva-cita` |
| Agenda `/agenda` | cita → `/cita/[id]`; Nueva cita |
| Clientes `/clientes` | igual que empresa (cartera): ficha, WhatsApp, Agendar |
| Finanzas `/finanzas` | Caja `/caja`, Honorarios `/honorarios`, Seña y abonos `/sena`, Mis servicios `/servicios` |
| Perfil `/perfil` | Disponibilidad, Vitrina, Galería, Recinto `/unirse`, QR `/qr-pase`, Config `/ajustes-perfil`, Cuenta `/ajustes` |
| Disponibilidad `/disponibilidad` | días/slots (persisten); Enviar propuesta `/propuesta-horarios` |
| Propuesta `/propuesta-horarios` | elegir horarios → enviar → confirmación; revisar/aprobar → toast |
| QR `/qr-pase` | Descargar/compartir (toast); Unirme `/unirse` |
| Unirse `/unirse` | pasos de onboarding → confirmación → `/perfil`; Desenrolar `/desenrolar` ; QR |
| Desenrolar `/desenrolar` | botón rojo (DangerButton) con confirmación → `/perfil`; Unirse a otro `/unirse` |
| Ajustes `/ajustes-perfil` | toggles de notificaciones y modo oscuro (persisten); Recordatorios `/recordatorios`; Cuenta `/ajustes` |
| Seña `/sena` | % de seña, activar (persisten); política `/politica` |
