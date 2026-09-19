# Flujo Hoy — especificación 1:1 (del HTML del usuario)

## Global
- bg: #fff8f5 (surface)
- font: Plus Jakarta Sans
- padding horizontal: 16px (gutter)
- pb bottom nav ~112px
- header fixed h-64px + safe, bg surface/85 blur-xl, shadow 0 1px 8px rgba(0,0,0,0.03)

## Header
- Left: logo img 32px + "Flujo" headline-sm 18/600 + "Agenda" label-sm 10/700 muted
- Right: search circle 44px + avatar 32px round

## Greeting
- Row: date label-md 12/600 uppercase tracking-wider PRIMARY + pill secondary-container "bolt Ritmo óptimo"
- H1 headline-lg 28/700: ¡Hola, {FirstName}! + sun emoji
- Body: Tienes **N citas programadas** para hoy. Tu agenda fluye en balance.

## Stats (grid 3, gap 8)
Each card: p-12, rounded-2xl (32px), bg white, shadow-sm
1. payments icon primary · +12% tertiary · "Estimado" · $185.00 style (use CLP)
2. timelapse secondary · "Hoy" · "Pausa libre" · 2h 15m
3. check_circle tertiary · green dot · "Eficiencia" · 94%

## Week
- Title "Octubre 2024" (or current month) + "Mes completo →" primary
- 7 day buttons flex-1 min-w 44
- Inactive: rounded-2xl bg surface-container-low, day abbr + number
- Selected: rounded-2xl bg primary, text on-primary, shadow 0 8px 20px -4px rgba(159,60,22,0.35), scale 1.05, "HOY" label + number + white dot

## Cronograma
- Title "Cronograma del Día" + badge "4 restantes" + tune button
- Timeline rows: time rail w-48 (time bold + AM/PM + vertical line) + card
- Completed card: opacity 0.85, service title, avatar+name, price, pill tertiary-fixed Completado
- In progress: left bar 6px primary, stronger shadow, ping "En curso", "Finaliza en 25 min", Gestionar btn
- Break: coffee emoji circle, "Almuerzo & Descanso", duration pill secondary
- Upcoming: Confirmado secondary-container pill, call + more icon buttons, timer duration

## Colors exact
primary #9f3c16, primary-fixed #ffdbcf, on-primary #fff
secondary #476176, secondary-container #c7e3fb
tertiary #006952, tertiary-fixed #8ff6d4
surface-container-lowest #ffffff, surface-container-low #fcf2eb
on-surface #1f1b17, on-surface-variant #57423b, outline #8a726a
