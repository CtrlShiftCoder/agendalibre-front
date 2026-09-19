# AgendaLibre

**Proof of Concept** — Multi-role appointment scheduling app built with Expo + React Native + TypeScript.

Three user roles: **cliente** (customer — books appointments), **empresa** (business), and **persona_natural** (solo professional). Initial niche: barbershops.

## Features

- 🎯 **Three-role architecture**: Customer, business, and solo professional workflows
- 📱 **Cross-platform**: iOS, Android, and Web via Expo
- 🎨 **Theme system**: Barbershop, health, beauty, and neutral themes
- 🇨🇱 **Spanish (Chile)**: Warm, conversational UI copy
- 💾 **Local-first**: Zustand + AsyncStorage (no backend required for PoC)
- 📅 **Smart scheduling**: Time slot management, availability tracking
- 🎫 **Shareable bookings**: QR codes and public booking links
- 📲 **WhatsApp integration**: Real `wa.me` deep links for reminders

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start

# Then:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Press 'w' for web browser
# - Scan QR code with Expo Go app on your device
```

## Project Structure

```
app/           # Expo Router screens
  ├── (tabs)/  # Main app tabs (Hoy, Agenda, Servicios, etc.)
  ├── onboarding/
  ├── nueva-cita/
  └── ticket/
components/    # Reusable UI components (Button, Card, SlotChip, Ticket, etc.)
theme/         # Design tokens and theme definitions
store/         # Zustand state management + AsyncStorage persistence
data/          # TypeScript types, seed data by niche, slot helpers
lib/           # Utilities and helpers
api/           # API client (for future backend integration)
```

## Companion API

This PoC currently runs in **mock mode** with local state. A companion API repository is available for future integration:

🔗 **[CtrlShiftCoder/api-agendalibre](https://github.com/CtrlShiftCoder/api-agendalibre)**

The companion API runs on port **8787** and provides:
- Appointment management endpoints
- Service catalog API
- Client data persistence
- Business logic for multi-role workflows

**Note**: Real backend integration with Nest.js, Prisma, and payment processing is **out of scope** for this PoC. Current implementation uses mock data and local storage only.

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# API endpoint (default: mock server on localhost:8787)
EXPO_PUBLIC_API_URL=http://localhost:8787

# Use mock data (true) or connect to real API (false)
EXPO_PUBLIC_USE_MOCK_API=true
```

## User Roles

### Cliente (Customer)
- View upcoming appointments
- Book appointments via public links
- Manage personal profile

### Empresa (Business)
- Today view: daily agenda and stats
- Weekly agenda with morning/afternoon filters
- Service catalog management (CRUD)
- Client management
- Business profile and availability settings

### Persona Natural (Solo Professional)
- Same provider features as empresa
- Optimized UI copy for independent professionals

## Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Onboarding | `/onboarding` | Role selection flow |
| Home / Today | `/(tabs)` | Provider: daily agenda · Customer: my bookings |
| Agenda | `/(tabs)/agenda` | Multi-day view with time filters |
| Services | `/(tabs)/servicios` | CRUD for services (name, duration, price CLP) |
| Clients | `/(tabs)/clientes` | Name + phone directory |
| Profile | `/(tabs)/perfil` | Schedule, theme, settings, PoC reset |
| New Appointment | `/nueva-cita` | 4-step wizard → confirmation ticket |
| Ticket | `/ticket/[id]` | Shareable confirmation + cancellation |
| Reminders | `/recordatorios` | WhatsApp templates and sending |
| Public Booking | `/reservar` | Guest-accessible booking page |

## Themes

Select in **Profile** or during onboarding:
- **Barbershop** — Charcoal + amber
- **Health** — Teal
- **Beauty** — Pink
- **Neutral** — Soft teal

See `DESIGN.md` and `UX-STUDY.md` for design system details.

## Seed Data

After completing onboarding, the app automatically seeds:
- Services for the selected niche
- Sample professionals
- Demo clients
- Example appointments

## Development Scripts

```bash
npm start              # Start Expo dev server
npm run android        # Open in Android emulator
npm run ios            # Open in iOS simulator
npm run web            # Open in web browser
npm run typecheck      # Run TypeScript checks
```

## Technology Stack

- **Expo SDK ~57** — Cross-platform app framework
- **Expo Router** — File-based routing
- **React Native 0.86** — UI framework
- **TypeScript 6** — Type safety
- **Zustand 5** — State management
- **AsyncStorage** — Local persistence
- **React Native Reanimated** — Smooth animations
- **Lucide React Native** — Icon system
- **QR Code SVG** — Shareable booking codes

## PoC Scope & Limitations

✅ **In Scope:**
- Multi-role appointment workflows
- Local state management with persistence
- Cross-platform UI (iOS, Android, Web)
- WhatsApp deep link integration (real `wa.me` URLs)
- Shareable booking links and QR codes
- Theme system with niche-specific branding

❌ **Out of Scope:**
- Real backend API with Nest.js + Prisma
- User authentication and accounts
- Payment processing integration
- Real-time sync across devices
- Automated reminder scheduling (24h/2h notifications are mocked)
- Production deployment configuration

## Notes

- TypeScript strict mode enabled
- Don't animate `width: '%'` with Reanimated on web (known limitation)
- WhatsApp links open real messaging app but automation is mocked
- All monetary values in Chilean Pesos (CLP)

## Documentation

- `DESIGN.md` — Visual design system and UI guidelines
- `UX-STUDY.md` — User experience research and decisions
- `ESTUDIO-MERCADO-DISENO.md` — Market research and competitive analysis
- `README.es.md` — Spanish version of this README

## License

See [LICENSE](LICENSE) file for details.
