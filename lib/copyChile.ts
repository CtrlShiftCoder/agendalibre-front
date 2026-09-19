import type { LucideIcon } from 'lucide-react-native';
import {
  CalendarHeart,
  Heart,
  Link2,
  MessageCircle,
  Scissors,
  Sparkles,
  Wallet,
} from 'lucide-react-native';

import type { Niche, UserRole } from '@/data/types';

/** Role picker: title + Chile-friendly benefit one-liner (less jargon). */
export function roleChoiceCopy(role: UserRole): { title: string; subtitle: string } {
  switch (role) {
    case 'cliente':
      return {
        title: 'Cliente',
        subtitle: 'Reservo horas · Encuentro cupos y confirmo al tiro',
      };
    case 'empresa':
      return {
        title: 'Empresa',
        subtitle: 'Tengo local o equipo · Agenda, caja y WhatsApp juntos',
      };
    case 'persona_natural':
      return {
        title: 'Persona natural',
        subtitle: 'Atiendo por mi cuenta · Consulta clara y link para compartir',
      };
  }
}

export type NicheHeroTip = {
  icon: LucideIcon;
  headline: string;
  body: string;
  demoLabel: string;
  demoSub: string;
  reserveLabel: string;
  reserveSub: string;
};

/** Bienvenida hero tips by niche; `other` / missing → generic Chile copy. */
export function nicheHeroTip(niche?: Niche | null): NicheHeroTip {
  switch (niche) {
    case 'barber':
      return {
        icon: Scissors,
        headline: 'Barbería sin fricción',
        body: 'Cupos claros, link público y WhatsApp — sin comisión por conocerte. Ideal para barberías en Chile.',
        demoLabel: 'Ver vitrina demo',
        demoSub: 'Barbería Norte — cortes, galería y reservas',
        reserveLabel: 'Reservar un corte',
        reserveSub: 'Elige servicio, barbero y hora',
      };
    case 'health':
      return {
        icon: Heart,
        headline: 'Consultas con calma',
        body: 'Agenda de salud y podología: horarios claros, recordatorios y link para tus pacientes — sin jerga ni apps caras.',
        demoLabel: 'Ver vitrina demo',
        demoSub: 'Consulta demo — servicios, reseñas y cupos',
        reserveLabel: 'Reservar consulta',
        reserveSub: 'Elige atención, profesional y hora',
      };
    case 'beauty':
      return {
        icon: Sparkles,
        headline: 'Belleza, a tu ritmo',
        body: 'Salón o freestyle: muestra tu trabajo, recibe reservas y confirma por WhatsApp. Hecho para Chile.',
        demoLabel: 'Ver vitrina demo',
        demoSub: 'Salón demo — galería, reseñas y cupos',
        reserveLabel: 'Reservar servicio',
        reserveSub: 'Elige tratamiento, pro y hora',
      };
    default:
      return {
        icon: CalendarHeart,
        headline: 'Tu agenda en Chile',
        body: 'Sin comisión por conocerte. Link público, WhatsApp sin cupos escondidos — empresa o persona natural.',
        demoLabel: 'Ver vitrina demo',
        demoSub: 'Galería, reseñas y reservas públicas',
        reserveLabel: 'Reservar ahora',
        reserveSub: 'Elige servicio, pro y cupo',
      };
  }
}

export type HoyTip = {
  key: string;
  title: string;
  body: string;
  Icon: LucideIcon;
};

/** First-visit tips on Hoy for providers (empresa / persona_natural). */
export function providerHoyTips(niche?: Niche | null): HoyTip[] {
  const base: HoyTip[] = [
    {
      key: 'link',
      title: 'Comparte tu link',
      body: 'Mándalo por WhatsApp: tus clientes reservan solos, sin ida y vuelta.',
      Icon: Link2,
    },
    {
      key: 'wa',
      title: 'Confirma altiro',
      body: 'Un toque abre WhatsApp con el mensaje listo para el cliente.',
      Icon: MessageCircle,
    },
    {
      key: 'caja',
      title: 'Cierra con caja',
      body: 'Al final del día revisa lo estimado vs. lo cobrado en Caja.',
      Icon: Wallet,
    },
  ];

  if (niche === 'barber') {
    base[0] = {
      ...base[0],
      body: 'Comparte el link de la barbería: cortes y barba sin chats eternos.',
    };
  } else if (niche === 'health') {
    base[0] = {
      ...base[0],
      body: 'Comparte el link de tu consulta: pacientes eligen cupo sin llamarte.',
    };
  } else if (niche === 'beauty') {
    base[0] = {
      ...base[0],
      body: 'Comparte el link del salón: clientas ven servicios y reservan solas.',
    };
  }

  return base;
}

export const HOY_TIPS_DISMISSED_KEY = 'hoyTipsDismissed';
