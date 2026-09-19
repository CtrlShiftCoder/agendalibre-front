import { parseTime } from '@/data/slots';
import type { Appointment } from '@/data/types';

export type ServiceRef = {
  id: string;
  name: string;
  durationMin: number;
};

export type NextAppointmentInfo = {
  appointmentId: string;
  serviceName: string;
  startTime: string;
  /** `now` = currently in progress; `upcoming` = starts later today */
  kind: 'now' | 'upcoming';
  /** Minutes until start (0 when kind is `now`) */
  minutesUntilStart: number;
  /** Chip label: "Ahora · servicio" | "Próxima cita en Xh Ym" */
  label: string;
};

/** Format countdown as "Xh Ym", "Xh", or "Ym". */
export function formatCountdown(totalMin: number): string {
  const m = Math.max(0, Math.round(totalMin));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  if (rem === 0) return `${h}h`;
  return `${h}h ${rem}m`;
}

function todayIso(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function nowMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Next remaining appointment for *today* among the given list
 * (caller scopes by role / pro / client). Skips cancelada, completada, and past.
 */
export function resolveNextTodayAppointment(
  appointments: Appointment[],
  services: ServiceRef[],
  now: Date = new Date()
): NextAppointmentInfo | null {
  const today = todayIso(now);
  const nowMins = nowMinutes(now);
  const defaultDur = 30;

  const todays = appointments
    .filter(
      (a) =>
        a.date === today &&
        a.status !== 'cancelada' &&
        a.status !== 'completada'
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  for (const a of todays) {
    const svc = services.find((s) => s.id === a.serviceId);
    const dur = svc?.durationMin ?? defaultDur;
    const start = parseTime(a.startTime);
    const end = start + dur;
    if (nowMins >= start && nowMins < end) {
      const serviceName = svc?.name ?? 'Servicio';
      return {
        appointmentId: a.id,
        serviceName,
        startTime: a.startTime,
        kind: 'now',
        minutesUntilStart: 0,
        label: `Ahora · ${serviceName}`,
      };
    }
  }

  for (const a of todays) {
    const svc = services.find((s) => s.id === a.serviceId);
    const start = parseTime(a.startTime);
    if (nowMins < start) {
      const serviceName = svc?.name ?? 'Servicio';
      const minutesUntilStart = start - nowMins;
      return {
        appointmentId: a.id,
        serviceName,
        startTime: a.startTime,
        kind: 'upcoming',
        minutesUntilStart,
        label: `Próxima cita en ${formatCountdown(minutesUntilStart)}`,
      };
    }
  }

  return null;
}
