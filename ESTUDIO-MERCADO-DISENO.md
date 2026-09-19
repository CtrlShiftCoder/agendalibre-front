# AgendaLibre — Estudio de mercado + benchmark de diseño
Fecha: 2026-09-11 · Mercado: Chile / LATAM · Nicho: barberías + solos (podología, belleza)

## 1. Mapa competitivo

### Global / marketplace (cliente busca + reserva)
| Producto | Fuerza | Diseño / sensación |
|----------|--------|-------------------|
| **Fresha** | Marketplace + ops; discovery, rebook, búsqueda por disponibilidad | Premium “beauty retail”: fotos grandes, venue cards, map/list, tipografía limpia |
| **Booksy** | App cliente + Biz; móvil excelente | Perfiles con portfolio, ratings, chips de servicio, dark/light moderno |
| **Treatwell** | Flujo de reserva muy estudiado | Momentum: nunca bloquea — ofrece “primer disponible”; fotos vibrantes |
| **GlossGenius** | Solos / equipos chicos | UI más intuitiva del segmento; branding personalizable |

### LATAM / Chile (dueño gestiona agenda)
| Producto | Precio ref. | Fuerza | Gap de diseño típico |
|----------|-------------|--------|----------------------|
| **AgendaPro** | ~$15.900+ IVA/mes (1 pro) | WhatsApp auto, marketing, escala 20k+ negocios | Robusto pero “denso” / enterprise |
| **Qando** | ~$9.990 IVA incl. | POS + caja sin add-ons | Más simple, menos “wow” visual |
| **Turnito** | Freemium | Link público, sin cuenta cliente | Funcional, poco diferenciación estética |
| **AgendaBarber** | Local barberías | Anticipo Flow, WhatsApp manual, reseñas | Nicho estrecho, UI utilitaria |
| **Citalo** | Local | WhatsApp nativo, especialidades | Menos premium que global |

### Lectura de mercado
- Chile ya tiene **incumbentes funcionales** (AgendaPro, Qando, Turnito). Entrar solo con “agenda CRUD” es commodity.
- La diferencia que paga: **diseño que inspire confianza + WhatsApp + link público + anticipos + rebook en 1 tap**.
- Dos productos en uno: **vista dueño** (hoy) y **vista cliente / link de reserva** (aún débil en AgendaLibre).
- Solo/a (mamá podóloga) odia complejidad AgendaPro → quiere **GlossGenius-simple** con look de clínica seria.

## 2. Patrones UX que ganan (benchmark)

1. **Servicio → profesional (o primer disponible) → horario → datos → ticket**
2. **No grilla mensual primero** — strip horizontal de días + Mañana/Tarde
3. **Guest checkout** + cuenta opcional al final
4. **Confirmación = ticket** (add to calendar, compartir, reagendar)
5. **Fotos / portfolio** en perfil y servicios (Fresha/Booksy)
6. **Urgencia suave**: “3 cupos hoy”, “próximo en 40 min”
7. **Empty states con ilustración** y CTA clara
8. **Rebook** desde última cita (Fresha home)

## 3. Tendencias visuales 2025–2026 (booking)

- Minimalismo **con profundidad**: no flat grisáceo — capas, glass en chrome, sombras suaves
- **Tipografía bold** en heroes; jerarquía clara precio/duración
- **Date strip** + **slot cards** (no lista aburrida)
- Gradientes contenidos (CTA / hero), no arcoíris
- Microinteracciones: press, step progress, confetti/check al confirmar
- Temas por nicho (barber dark/amber, health teal/cream, beauty soft rose)
- Evitar glassmorphism extremo en salud (legibilidad > moda)

## 4. Gaps de AgendaLibre vs líderes

| Área | Hoy | Líderes | Prioridad |
|------|-----|---------|-----------|
| Fotos / cover del negocio | No | Fresha/Booksy | P0 |
| Home con “próxima cita” hero + stats del día | Básico | Fresha / GlossGenius | P0 |
| Date strip visual (días como chips grandes) | Medio | Behance / Treatwell | P0 |
| Link público / branding cliente | No | Todos | P0 producto |
| Portfolio / “antes-después” | No | Booksy | P1 |
| WhatsApp reminders | Mock | AgendaPro/Citalo | P1 |
| Anticipo / depósito | No | AgendaBarber/Fresha | P1 |
| Dark mode barber cinematic | Parcial (tema) | Booksy/Squire | P1 |
| Ilustraciones empty | Íconos simples | GlossGenius | P1 |
| Motion / page transitions | Limitado (crash web %) | Apps nativas | P2 |

**Diagnóstico:** el PoC ya tiene flujo correcto, pero **se siente “formulario con tokens”**, no producto de belleza/salud. Falta **contenido visual (fotos), ritmo de home, y pantalla cliente**.

## 5. Dirección de diseño recomendada (“AgendaLibre v2 look”)

### Posicionamiento
> “La agenda más linda y rápida para quien trabaja con las manos” — barbero o podóloga: misma app, tema distinto.

### Sistema visual v2
- **Base:** cream `#F7F4EF` + superficies elevadas blancas con borde 1px y sombra md
- **Hero Hoy:** cover image (placeholder por nicho) + overlay gradient + saludo + chip “próxima cita”
- **Servicios:** cards con thumb, duración badge, precio grande CLP
- **Agenda:** date strip (círculos 52px), slots en grid 3 columnas, “Primero” pill
- **Ticket:** estilo boarding pass + QR fake + share
- **Tipografía:** Inter / system; títulos 28–32 weight 800; body 15
- **Motion:** solo scale/opacity/translateY (evitar width % animado en web)

### Moodboards por nicho
- **Barber:** charcoal, ámber, texturas wood/metal, tipografía condensada
- **Health/Podología:** teal, crema, mucho whitespace, iconografía médica soft
- **Beauty:** rose, soft gradients, fotos de trabajo

## 6. Roadmap de diseño (siguiente sprint PoC)

### Sprint A — “deja de verse simple” (UI only)
1. Cover + avatar en Hoy / Perfil
2. Rediseño servicios como menu cards con precio hero
3. Date strip premium + slot grid
4. Empty states ilustrados (SVG simples)
5. Onboarding con fotos de mood por nicho

### Sprint B — producto que compite en Chile
1. Pantalla **Link de reserva** (vista cliente)
2. Rebook desde última cita
3. WhatsApp deep-link real (abrir wa.me con texto)
4. Stats del día (citas / libres / ingresos mock)

## 7. Fuentes
- Fresha product case (Jessica Zoller)
- Treatwell booking reverse-engineering (Medium)
- Salon booking UI patterns (VP0 / AppyPie)
- Chile: Qando vs AgendaPro, Turnito, AgendaBarber, Citalo roundups 2026
- UI trends reservation 2025 (Medium / Behance booking calendars)
