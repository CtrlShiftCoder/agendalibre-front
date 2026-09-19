import type { Appointment, BusinessHours } from './types';
import { buildAvailableSlots, resolveSlotHours } from '@/lib/availability';

export function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function formatTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export { formatClp } from '@/lib/money';

export function formatDateLabel(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Hoy';
  if (same(d, tomorrow)) return 'Mañana';
  return d.toLocaleDateString('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatLongDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** Next N working days with available slot info */
export function getUpcomingDays(
  hours: BusinessHours,
  count = 14,
  /** Skip these YYYY-MM-DD (e.g. blocked day-offs in booking pickers) */
  excludeDates?: string[] | null
): { date: string; label: string; dayOfWeek: number }[] {
  const excluded = new Set(excludeDates ?? []);
  const out: { date: string; label: string; dayOfWeek: number }[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  let guard = 0;
  while (out.length < count && guard < 40) {
    const dow = d.getDay();
    if (hours.days.includes(dow)) {
      const iso = d.toISOString().slice(0, 10);
      if (!excluded.has(iso)) {
        out.push({ date: iso, label: formatDateLabel(iso), dayOfWeek: dow });
      }
    }
    d.setDate(d.getDate() + 1);
    guard++;
  }
  return out;
}

export type Slot = {
  time: string;
  period: 'morning' | 'afternoon';
  available: boolean;
};

/**
 * Slot grid with professional double-booking blocked (duration-accurate).
 * Pass serviceDurationMin when appointment services vary in length.
 */
export function generateSlots(
  date: string,
  hours: BusinessHours,
  durationMin: number,
  appointments: Appointment[],
  professionalId: string | null,
  serviceDurationMin?: (serviceId: string) => number,
  /** When a professional is selected, clamp window to their workStart/workEnd. */
  professionalHours?: { workStart?: string; workEnd?: string } | null,
  blockedDates?: string[] | null
): Slot[] {
  const durationOf =
    serviceDurationMin ??
    ((_serviceId: string) => Math.max(durationMin, 30));
  // Always clamp to the business window; pro hours nest inside when selected.
  const effectiveHours = resolveSlotHours(
    hours,
    professionalId != null ? professionalHours : null
  );
  return buildAvailableSlots({
    date,
    hours: effectiveHours,
    durationMin,
    appointments,
    professionalId,
    serviceDurationMin: durationOf,
    blockedDates,
  });
}

export function firstAvailableSlot(slots: Slot[]): string | null {
  return slots.find((s) => s.available)?.time ?? null;
}


/** First free slot across the first N upcoming days (hoy / mañana priority). */
export function findFirstCupoHint(
  days: { date: string }[],
  getSlots: (date: string) => Slot[],
  maxDays = 2
): { date: string; time: string } | null {
  for (const d of days.slice(0, maxDays)) {
    const slots = getSlots(d.date);
    const time = firstAvailableSlot(slots);
    if (time) return { date: d.date, time };
  }
  // Fallback: first free in the rest of the strip
  for (const d of days.slice(maxDays)) {
    const slots = getSlots(d.date);
    const time = firstAvailableSlot(slots);
    if (time) return { date: d.date, time };
  }
  return null;
}
