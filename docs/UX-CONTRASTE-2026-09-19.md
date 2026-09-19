# UX contraste + centrado web · 2026-09-19

Sweep AA (light + soft-dark) y centrado wide-web para Ignacio. Sin Nest / Prisma / pagos reales / Moti / Skia.

## Deltas de tokens (hex before → after)

### Light (`flujo` / `baseColors`)

| Token | Before | After | Nota |
|-------|--------|-------|------|
| `primary` | `#06C167` | `#059669` | Blanco sobre primary ≈3.77:1 (AA large / CTA bold 16+) |
| `primaryContainer` | `#00A878` | `#047857` | Gradiente CTA + fills fuertes; blanco ≈5.48:1 |
| `primaryText` | `#047857` | `#047857` | Sin cambio — links/precios/meta chica AA |
| `onSurfaceVariant` / `textMuted` | `#3F4F47` | `#35453E` | Más “alcance” sobre cream/mint |
| `secondary` | `#3D4F46` | `#2F3D36` | Labels / tab inactive / leyenda |
| `outline` / `border` | `#7A8B82` | `#5F7067` | Bordes visibles (≥3:1 UI) |
| `placeholder` | `#6B7A72` | `#55665E` | Placeholder AA (≥4.5:1) en blanco/mint |

### Soft dark (`softDark` / `darkColors` / `darkBase`)

| Token | Before | After | Nota |
|-------|--------|-------|------|
| `primary` | `#06C167` | `#059669` | CTA alineado light |
| `primaryContainer` | `#00A878` | `#047857` | Fills fuertes |
| `onSurfaceVariant` / `textMuted` | `#B0BDB6` | `#C5D0CA` | Meta/labels no se pierden |
| `secondary` | `#A8B5AE` | `#C5D0CA` | Tab inactive / leyenda |
| `outline` | `#5A6B62` | `#8A9B92` | Bordes legibles en soft-dark |
| `placeholder` | `#96A59D` | `#AEBBB4` | Inputs AA sobre surface |

`primary` brillante `#06C167` queda solo como acento decorativo (glow) — **no** como color de texto chico ni único fill de CTA.

## Layout / centrado

- `ResponsiveShell` + `forceMax` en: AuthShell, bienvenida, onboarding, buscar, caja, reservar, ticket, nueva-cita, servicios.
- Tabs siguen con `Screen` (`constrainContent`) → max ~520 centrado en web ancha; mobile full-width.
- Sticky CTAs de booking/ticket quedan dentro del shell (no full-bleed ultrawide).

## Componentes tocados (además de tokens)

- `OfflineBanner`, `EmptyState`, `ToastBanner` — texto secondary (no se lava en mint/dark)
- `StatusLegend`, `SectionHeader` — labels secondary + leyenda `sm`
- `Button` — danger via `colors.danger`
- `TimelineItem` — meta/activo en `primaryText` (no primary fill)
- `ClienteHome`, `caja`, `HoyDaySummary` — marcas/valores en `primaryText`
- `ServiceCatalogCard` — thumb track tokenizado
- `app/(tabs)/_layout` — inactive tint = `secondary`
- `DESIGN.md` — fila primary/AA actualizada

## Verify

- `npx tsc --noEmit` → ver reporte
- Expo routes 200: `/login` `/onboarding` `/bienvenida` `/(tabs)` `/perfil` `/servicios` `/caja` `/buscar`
- Selectores `useAppStore`: sin `.filter/.map/.find` dentro del selector

## Pantallas aún débiles (si aplica)

- Iconos decorativos `theme.primary` sobre mint en listas densas (buscar/galería) — OK a ≥3:1 UI con primary nuevo; texto sigue `primaryText`.
- Blanco sobre primary en chips muy chicos (<14px) — preferir `primaryContainer` o tipografía bold ≥14 si aparece regresión.
