import type {
  Appointment,
  Client,
  Niche,
  Professional,
  Service,
  ServiceCategory,
  ServiceIconKey,
} from './types';

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function todayOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function code(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'AL-';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function minsToHHMM(mins: number): string {
  const day = 24 * 60;
  const m = ((Math.round(mins) % day) + day) % day;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

type SeedSvc = Omit<Service, 'id' | 'active'> & {
  depositPercent?: number | null;
  popular?: boolean;
  category?: ServiceCategory;
  iconKey?: ServiceIconKey;
};

const servicesByNiche: Record<Niche, SeedSvc[]> = {
  barber: [
    {
      name: 'Corte Clásico + Barba',
      durationMin: 45,
      priceClp: 18000,
      depositPercent: 30,
      popular: true,
      category: 'servicio',
      iconKey: 'cut',
    },
    {
      name: 'Fade Premium',
      durationMin: 40,
      priceClp: 15000,
      depositPercent: null,
      category: 'servicio',
      iconKey: 'bolt',
    },
    {
      name: 'Paquete Ritual Completo',
      durationMin: 90,
      priceClp: 35000,
      depositPercent: 50,
      category: 'paquete',
      iconKey: 'all',
    },
    {
      name: 'Promo Barba Express',
      durationMin: 20,
      priceClp: 8000,
      depositPercent: null,
      category: 'promo',
      iconKey: 'cut',
    },
  ],
  health: [
    {
      name: 'Consulta Podológica',
      durationMin: 40,
      priceClp: 35000,
      depositPercent: 20,
      popular: true,
      category: 'servicio',
      iconKey: 'spa',
    },
    {
      name: 'Quiropodia',
      durationMin: 50,
      priceClp: 42000,
      depositPercent: null,
      category: 'servicio',
      iconKey: 'bolt',
    },
    {
      name: 'Paquete Evaluación + Control',
      durationMin: 85,
      priceClp: 65000,
      depositPercent: 40,
      category: 'paquete',
      iconKey: 'all',
    },
    {
      name: 'Promo Control Express',
      durationMin: 25,
      priceClp: 22000,
      depositPercent: null,
      category: 'promo',
      iconKey: 'spa',
    },
  ],
  beauty: [
    {
      name: 'Limpieza Facial Express',
      durationMin: 45,
      priceClp: 28000,
      depositPercent: 30,
      popular: true,
      category: 'servicio',
      iconKey: 'spa',
    },
    {
      name: 'Manicure Premium',
      durationMin: 50,
      priceClp: 22000,
      depositPercent: null,
      category: 'servicio',
      iconKey: 'bolt',
    },
    {
      name: 'Paquete Spa Día',
      durationMin: 120,
      priceClp: 55000,
      depositPercent: 50,
      category: 'paquete',
      iconKey: 'all',
    },
    {
      name: 'Promo Cejas + Labios',
      durationMin: 30,
      priceClp: 12000,
      depositPercent: null,
      category: 'promo',
      iconKey: 'cut',
    },
  ],
  other: [
    {
      name: 'Sesión Estándar',
      durationMin: 45,
      priceClp: 25000,
      depositPercent: 25,
      popular: true,
      category: 'servicio',
      iconKey: 'bolt',
    },
    {
      name: 'Consulta Rápida',
      durationMin: 20,
      priceClp: 15000,
      depositPercent: null,
      category: 'servicio',
      iconKey: 'cut',
    },
    {
      name: 'Paquete Mensual',
      durationMin: 60,
      priceClp: 80000,
      depositPercent: 40,
      category: 'paquete',
      iconKey: 'all',
    },
    {
      name: 'Promo Primera Visita',
      durationMin: 40,
      priceClp: 18000,
      depositPercent: null,
      category: 'promo',
      iconKey: 'spa',
    },
  ],
};

const prosByNiche: Record<Niche, Omit<Professional, 'id'>[]> = {
  barber: [
    { name: 'Diego', role: 'Barbero', teamRole: 'trabajador', active: true, color: '#06C167', workStart: '09:00', workEnd: '19:00' },
    { name: 'Camila', role: 'Barbera', teamRole: 'trabajador', active: true, color: '#059669', workStart: '10:00', workEnd: '18:00' },
  ],
  health: [
    { name: 'Dra. Soto', role: 'Podóloga', teamRole: 'admin', active: true, color: '#047857' },
  ],
  beauty: [
    { name: 'Valentina', role: 'Estilista', teamRole: 'trabajador', active: true, color: '#0D9488', workStart: '09:00', workEnd: '19:00' },
    { name: 'Fernanda', role: 'Manicurista', teamRole: 'trabajador', active: true, color: '#65A30D', workStart: '11:00', workEnd: '20:00' },
  ],
  other: [
    { name: 'Tú', role: 'Profesional', teamRole: 'admin', active: true, color: '#06C167' },
  ],
};

const sampleClients: Array<Pick<Client, 'name' | 'phone'>> = [
  { name: 'Juan Pérez', phone: '+56912345678' },
  { name: 'María González', phone: '+56987654321' },
  { name: 'Pedro Rojas', phone: '+56955551234' },
  { name: 'Ana Muñoz', phone: '+56944449876' },
  { name: 'Luis Contreras', phone: '+56933332109' },
];

/**
 * Seeds a Flujo-like day: 1 completed morning, 1 in_progress (around now),
 * gap ≥ 45m (break card), 1 upcoming confirmada, 1 pendiente (WhatsApp CTA).
 */
export function seedForNiche(niche: Niche): {
  services: Service[];
  professionals: Professional[];
  clients: Client[];
  appointments: Appointment[];
} {
  const services: Service[] = servicesByNiche[niche].map((s) => ({
    ...s,
    id: id('svc'),
    active: true,
  }));
  const professionals: Professional[] = prosByNiche[niche].map((p) => ({
    ...p,
    id: id('pro'),
    teamRole: p.teamRole ?? 'trabajador',
    active: p.active ?? true,
    color: p.color,
  }));
  const clientTags: (string[] | undefined)[] = [
    ['VIP', 'recurrente'],
    ['alergia'],
    ['nuevo'],
    ['VIP'],
    undefined,
  ];
  const clients: Client[] = sampleClients.map((c, i) => ({
    ...c,
    id: id('cli'),
    noShowCount: i === 1 ? 1 : 0,
    completedCount: i === 0 ? 2 : i === 1 ? 1 : 0,
    riskFlag: i === 1 ? 'watch' : 'ok',
    tags: clientTags[i],
  }));

  const appointments: Appointment[] = [];
  const nowIso = new Date().toISOString();
  const today = todayOffset(0);

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const inProgressSvc = services[1] ?? services[0];
  const inProgressDur = inProgressSvc?.durationMin ?? 45;
  const inProgressStart = nowMins - 20;
  const completedSvc = services[0];
  const completedStart = inProgressStart - 100;
  const upcomingSvc = services[2] ?? services[0];
  const upcomingStart = inProgressStart + inProgressDur + 60;
  const pendingSvc = services[0];
  const pendingStart = upcomingStart + 75;

  if (clients[0] && completedSvc) {
    appointments.push({
      id: id('apt'),
      serviceId: completedSvc.id,
      professionalId: professionals[0]?.id ?? null,
      clientId: clients[0].id,
      date: today,
      startTime: minsToHHMM(completedStart),
      status: 'completada',
      code: code(),
      createdAt: nowIso,
    });
  }

  if (clients[1] && inProgressSvc) {
    appointments.push({
      id: id('apt'),
      serviceId: inProgressSvc.id,
      professionalId: professionals[0]?.id ?? null,
      clientId: clients[1].id,
      date: today,
      startTime: minsToHHMM(inProgressStart),
      status: 'confirmada',
      code: code(),
      createdAt: nowIso,
    });
  }

  if (clients[2] && upcomingSvc && upcomingStart < 23 * 60) {
    appointments.push({
      id: id('apt'),
      serviceId: upcomingSvc.id,
      professionalId:
        professionals[professionals.length > 1 ? 1 : 0]?.id ?? null,
      clientId: clients[2].id,
      date: today,
      startTime: minsToHHMM(upcomingStart),
      status: 'confirmada',
      code: code(),
      createdAt: nowIso,
    });
  }

  if (clients[3] && pendingSvc && pendingStart < 23 * 60) {
    appointments.push({
      id: id('apt'),
      serviceId: pendingSvc.id,
      professionalId: professionals[0]?.id ?? null,
      clientId: clients[3].id,
      date: today,
      startTime: minsToHHMM(pendingStart),
      status: 'pendiente',
      code: code(),
      createdAt: nowIso,
    });
  }

  if (clients[3] && (services[2] ?? services[0])) {
    const svc = services[2] ?? services[0];
    appointments.push({
      id: id('apt'),
      serviceId: svc.id,
      professionalId: null,
      clientId: clients[3].id,
      date: todayOffset(1),
      startTime: '09:30',
      status: 'confirmada',
      code: code(),
      createdAt: nowIso,
    });
  }
  if (clients[4] && services[0]) {
    appointments.push({
      id: id('apt'),
      serviceId: services[0].id,
      professionalId: professionals[0]?.id ?? null,
      clientId: clients[4].id,
      date: todayOffset(2),
      startTime: '16:00',
      status: 'pendiente',
      code: code(),
      createdAt: nowIso,
    });
  }

  return { services, professionals, clients, appointments };
}

export { code as generateCode, id as generateId, todayOffset };
