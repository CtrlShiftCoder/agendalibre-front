import type { Appointment, BusinessHours } from '@/data/types';

export type TimeRange = { startMin: number; endMin: number };

export function parseTimeMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function formatTimeMin(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Half-open interval overlap: [aStart, aEnd) ∩ [bStart, bEnd) */
export function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function appointmentRange(
  startTime: string,
  durationMin: number
): TimeRange {
  const startMin = parseTimeMin(startTime);
  return { startMin, endMin: startMin + Math.max(durationMin, 1) };
}

/**
 * Same professional (or shared "primer disponible" pool) → conflict candidate.
 * Conservative: null professional conflicts with any assigned pro on that day.
 */
export function sameProfessionalConflict(
  aProId: string | null,
  bProId: string | null
): boolean {
  if (aProId == null || bProId == null) return true;
  return aProId === bProId;
}

export function findOverlappingAppointment(input: {
  date: string;
  startTime: string;
  durationMin: number;
  professionalId: string | null;
  appointments: Appointment[];
  serviceDurationMin: (serviceId: string) => number;
  excludeId?: string;
}): Appointment | undefined {
  const candidate = appointmentRange(input.startTime, input.durationMin);
  return input.appointments.find((a) => {
    if (a.id === input.excludeId) return false;
    if (a.date !== input.date) return false;
    if (a.status === 'cancelada') return false;
    if (!sameProfessionalConflict(input.professionalId, a.professionalId)) {
      return false;
    }
    const dur = input.serviceDurationMin(a.serviceId) || 30;
    const existing = appointmentRange(a.startTime, dur);
    return rangesOverlap(
      candidate.startMin,
      candidate.endMin,
      existing.startMin,
      existing.endMin
    );
  });
}

export function isSlotFree(input: {
  date: string;
  startTime: string;
  durationMin: number;
  professionalId: string | null;
  appointments: Appointment[];
  serviceDurationMin: (serviceId: string) => number;
  excludeId?: string;
}): boolean {
  return !findOverlappingAppointment(input);
}



export function isDateBlocked(
  date: string,
  blockedDates?: string[] | null
): boolean {
  if (!blockedDates?.length) return false;
  return blockedDates.includes(date);
}

/** Clamp optional pro work window inside business hours (HH:mm). */
export function resolveSlotHours(
  businessHours: BusinessHours,
  pro?: { workStart?: string; workEnd?: string } | null
): BusinessHours {
  if (!pro?.workStart && !pro?.workEnd) return businessHours;
  const bizOpen = parseTimeMin(businessHours.open);
  const bizClose = parseTimeMin(businessHours.close);
  let open = pro.workStart ? parseTimeMin(pro.workStart) : bizOpen;
  let close = pro.workEnd ? parseTimeMin(pro.workEnd) : bizClose;
  if (Number.isNaN(open) || Number.isNaN(close)) return businessHours;
  open = Math.max(open, bizOpen);
  close = Math.min(close, bizClose);
  if (close <= open) return businessHours;
  return {
    ...businessHours,
    open: formatTimeMin(open),
    close: formatTimeMin(close),
  };
}

/** HH:mm slots with duration-based double-booking block for one professional. */
export function buildAvailableSlots(input: {
  date: string;
  hours: BusinessHours;
  durationMin: number;
  appointments: Appointment[];
  professionalId: string | null;
  serviceDurationMin: (serviceId: string) => number;
  stepMin?: number;
  /** YYYY-MM-DD day-offs — returns no slots */
  blockedDates?: string[] | null;
}): { time: string; period: 'morning' | 'afternoon'; available: boolean }[] {
  if (isDateBlocked(input.date, input.blockedDates)) return [];

  const open = parseTimeMin(input.hours.open);
  const close = parseTimeMin(input.hours.close);
  const step = input.stepMin ?? 30;
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const out: {
    time: string;
    period: 'morning' | 'afternoon';
    available: boolean;
  }[] = [];

  for (let t = open; t + input.durationMin <= close; t += step) {
    const time = formatTimeMin(t);
    const past = input.date === todayIso && t <= nowMins;
    const free = isSlotFree({
      date: input.date,
      startTime: time,
      durationMin: input.durationMin,
      professionalId: input.professionalId,
      appointments: input.appointments,
      serviceDurationMin: input.serviceDurationMin,
    });
    out.push({
      time,
      period: t < 13 * 60 ? 'morning' : 'afternoon',
      available: free && !past,
    });
  }
  return out;
}
