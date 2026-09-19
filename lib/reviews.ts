import type { AppNotification, Review } from '@/contracts';
import type { Profile } from '@/data/types';
import { isEmpresaAdmin } from '@/lib/team';
import type { Professional } from '@/data/types';

export function averageRating(reviews: Review[]): number | null {
  const visible = reviews.filter((r) => r.visible);
  if (visible.length === 0) return null;
  const sum = visible.reduce((a, r) => a + r.rating, 0);
  return Math.round((sum / visible.length) * 10) / 10;
}

export function starsLabel(rating: number): string {
  const full = Math.round(rating);
  return '★'.repeat(Math.min(5, Math.max(0, full))) + '☆'.repeat(Math.max(0, 5 - full));
}

export function filterInboxNotifications(
  notifications: AppNotification[],
  state: { profile: Profile; professionals: Professional[] }
): AppNotification[] {
  const role = state.profile.role;
  const admin = role === 'empresa' && isEmpresaAdmin(state);

  return notifications.filter((n) => {
    const target = n.userRoleTarget ?? 'all';
    if (target === 'all') return true;
    if (admin) {
      // business + own: empresa-targeted + ops kinds
      if (target === 'empresa') return true;
      return (
        n.kind === 'review_received' ||
        n.kind === 'team_invite' ||
        n.kind === 'waitlist'
      );
    }
    return target === role;
  });
}


export function unreadInboxCount(
  notifications: AppNotification[],
  state: { profile: Profile; professionals: Professional[] }
): number {
  return filterInboxNotifications(notifications, state).filter((n) => !n.read)
    .length;
}

/** Badge label capped at 9+; undefined when zero. */
export function formatUnreadBadge(count: number): string | undefined {
  if (count <= 0) return undefined;
  return count > 9 ? '9+' : String(count);
}

export function pendingReviewAppointments(input: {
  appointments: Array<{
    id: string;
    clientId: string;
    status: string;
    date: string;
  }>;
  reviews: Review[];
  linkedClientId: string | null | undefined;
}) {
  const reviewed = new Set(input.reviews.map((r) => r.appointmentId));
  return input.appointments.filter(
    (a) =>
      a.clientId === input.linkedClientId &&
      a.status === 'completada' &&
      !reviewed.has(a.id)
  );
}

export function preferenceLabel(
  key: keyof import('@/contracts').PushPreference
): string {
  const map: Record<keyof import('@/contracts').PushPreference, string> = {
    bookingConfirm: 'Confirmación de reserva',
    reminder24h: 'Recordatorio 24 h',
    reminder2h: 'Recordatorio 2 h',
    waitlistOpen: 'Cupo en lista de espera',
    reviewRequest: 'Pedir reseña tras la cita',
    teamInvite: 'Invitaciones de equipo',
    marketing: 'Novedades y tips',
  };
  return map[key];
}
