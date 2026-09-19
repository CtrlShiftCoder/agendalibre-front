import type {
  AppNotification,
  CancellationPolicy,
  GalleryItem,
  PublicStorefront,
  PushPreference,
  ReminderTemplate,
  Review,
  TeamInvite,
  WaitlistEntry,
} from '@/contracts';
import { DEFAULT_REMINDER_TEMPLATES } from '@/lib/reminders';
import { slugFromName } from '@/lib/bookingLink';
import type { Niche, Profile } from '@/data/types';
import { generateId } from '@/data/seeds';

export function defaultCancellationPolicy(
  businessId?: string
): CancellationPolicy {
  return {
    id: generateId('pol'),
    businessId,
    cancelBeforeHours: 24,
    depositPercentDefault: 30,
    noShowFeePercent: 50,
    noShowFeeFixedClp: null,
    keepDepositOnNoShow: true,
    policyText:
      'Puedes cancelar hasta 24 horas antes sin cargo. Si no asistes (no-show), ' +
      'se cobra el 50% del servicio o se retiene la seña. Las señas se aplican al total.',
    updatedAt: new Date().toISOString(),
  };
}

export function defaultStorefront(profile: Profile): PublicStorefront {
  const slug = slugFromName(profile.name || 'mi-negocio');
  return {
    slug,
    displayName: profile.name || 'Mi negocio',
    bio: 'Agenda fácil, sin vueltas. Reserva tu hora en segundos.',
    niche: profile.niche,
    address: profile.address,
    coverEmoji:
      profile.niche === 'barber'
        ? '💈'
        : profile.niche === 'health'
          ? '🩺'
          : profile.niche === 'beauty'
            ? '✨'
            : '📅',
    coverColor: '#06C167',
    showPrices: true,
    showTeam: profile.role === 'empresa',
    bookingPath: `/v/${slug}`,
  };
}

export function defaultReminderTemplates(): ReminderTemplate[] {
  return DEFAULT_REMINDER_TEMPLATES.map((t) => ({ ...t }));
}

export function defaultPushPreferences(): PushPreference {
  return {
    bookingConfirm: true,
    reminder24h: true,
    reminder2h: true,
    waitlistOpen: true,
    reviewRequest: true,
    teamInvite: true,
    marketing: false,
  };
}

const GALLERY_BY_NICHE: Record<
  Niche,
  Array<
    Pick<
      GalleryItem,
      'title' | 'caption' | 'placeholderColor' | 'emoji' | 'imageUri'
    >
  >
> = {
  barber: [
    {
      title: 'Fade + diseño',
      caption: 'Trabajo reciente en salon',
      placeholderColor: '#06C167',
      emoji: '✂️',
      imageUri: 'https://picsum.photos/seed/agendalibre-fade/400/400',
    },
    {
      title: 'Barba premium',
      caption: 'Toalla caliente + perfilado',
      placeholderColor: '#047857',
      emoji: '🧔',
      imageUri: 'https://picsum.photos/seed/agendalibre-barba/400/400',
    },
  ],
  health: [
    {
      title: 'Evaluación podológica',
      caption: 'Antes / después control',
      placeholderColor: '#0D9488',
      emoji: '🦶',
      imageUri: 'https://picsum.photos/seed/agendalibre-consulta/400/400',
    },
    {
      title: 'Quiropodia',
      caption: 'Sesión completa',
      placeholderColor: '#059669',
      emoji: '🩺',
      imageUri: 'https://picsum.photos/seed/agendalibre-salon/400/400',
    },
  ],
  beauty: [
    {
      title: 'Limpieza facial',
      caption: 'Glow natural',
      placeholderColor: '#10B981',
      emoji: '✨',
      imageUri: 'https://picsum.photos/seed/agendalibre-glow/400/400',
    },
    {
      title: 'Manicure gel',
      caption: 'Diseño suave',
      placeholderColor: '#34D399',
      emoji: '💅',
      imageUri: 'https://picsum.photos/seed/agendalibre-manos/400/400',
    },
  ],
  other: [
    {
      title: 'Trabajo reciente',
      caption: 'Ejemplo de galería',
      placeholderColor: '#06C167',
      emoji: '📷',
      imageUri: 'https://picsum.photos/seed/agendalibre-salon/400/400',
    },
    {
      title: 'Resultado cliente',
      caption: 'Demo PoC',
      placeholderColor: '#047857',
      emoji: '⭐',
      imageUri: null,
    },
  ],
};

export function seedGalleryForNiche(
  niche: Niche,
  professionalId: string | null
): GalleryItem[] {
  const now = new Date().toISOString();
  return GALLERY_BY_NICHE[niche].map((g, i) => ({
    id: generateId('gal'),
    professionalId: i === 0 ? professionalId : null,
    title: g.title,
    caption: g.caption,
    imageUri: g.imageUri ?? null,
    placeholderColor: g.placeholderColor,
    emoji: g.emoji,
    serviceId: null,
    createdAt: now,
    visible: true,
  }));
}

export function seedReviewsForOnboarding(input: {
  niche: Niche;
  clients: Array<{ id: string; name: string }>;
  appointments: Array<{
    id: string;
    clientId: string;
    professionalId: string | null;
    serviceId: string;
    status: string;
  }>;
}): Review[] {
  const completed = input.appointments.filter((a) => a.status === 'completada');
  const samples: Array<{ rating: 1 | 2 | 3 | 4 | 5; comment: string }> =
    input.niche === 'barber'
      ? [
          { rating: 5, comment: 'Excelente corte, muy puntual. ¡Recomendado!' },
          { rating: 4, comment: 'Buen ambiente y atención. Volveré.' },
        ]
      : input.niche === 'health'
        ? [
            {
              rating: 5,
              comment: 'Consulta clara y profesional. Me sentí en confianza.',
            },
            { rating: 5, comment: 'Muy buena evaluación, salí con plan claro.' },
          ]
        : input.niche === 'beauty'
          ? [
              { rating: 5, comment: 'Quedé encantada con el resultado ✨' },
              { rating: 4, comment: 'Atención cálida y espacio impecable.' },
            ]
          : [
              { rating: 5, comment: 'Muy buena experiencia, todo fluido.' },
              { rating: 4, comment: 'Recomiendo, agenda fácil.' },
            ];

  const now = Date.now();
  const reviews: Review[] = [];
  for (let i = 0; i < Math.min(2, samples.length); i++) {
    const apt = completed[i] ?? input.appointments[i];
    if (!apt) continue;
    const client =
      input.clients.find((c) => c.id === apt.clientId) ?? input.clients[i];
    if (!client) continue;
    reviews.push({
      id: generateId('rev'),
      appointmentId: apt.id,
      clientId: client.id,
      clientName: client.name,
      professionalId: apt.professionalId,
      serviceId: apt.serviceId,
      rating: samples[i].rating,
      comment: samples[i].comment,
      createdAt: new Date(now - (i + 1) * 86400000).toISOString(),
      reply: i === 0 ? '¡Gracias por tu comentario! Te esperamos.' : null,
      replyAt:
        i === 0 ? new Date(now - i * 86400000).toISOString() : null,
      visible: true,
    });
  }
  return reviews;
}

export type HighValueDefaults = {
  cancellationPolicy: CancellationPolicy;
  waitlist: WaitlistEntry[];
  storefront: PublicStorefront;
  reminderTemplates: ReminderTemplate[];
  teamInvites: TeamInvite[];
  pushPreferences: PushPreference;
  notifications: AppNotification[];
  reviews: Review[];
  gallery: GalleryItem[];
};

export function buildHighValueDefaults(profile: Profile): HighValueDefaults {
  return {
    cancellationPolicy: defaultCancellationPolicy(),
    waitlist: [],
    storefront: defaultStorefront(profile),
    reminderTemplates: defaultReminderTemplates(),
    teamInvites: [],
    pushPreferences: defaultPushPreferences(),
    notifications: [],
    reviews: [],
    gallery: [],
  };
}

export function migrateClientShape(
  c: Partial<{
    id: string;
    name: string;
    phone: string;
    notes?: string;
    email?: string;
    tags?: string[];
    noShowCount?: number;
    completedCount?: number;
    lastVisitAt?: string;
    riskFlag?: 'ok' | 'watch' | 'high';
  }>
) {
  return {
    id: c.id ?? generateId('cli'),
    name: c.name ?? 'Cliente',
    phone: c.phone ?? '+56900000000',
    notes: c.notes,
    email: c.email,
    tags: c.tags,
    noShowCount: c.noShowCount ?? 0,
    completedCount: c.completedCount ?? 0,
    lastVisitAt: c.lastVisitAt,
    riskFlag: c.riskFlag ?? 'ok',
  };
}
