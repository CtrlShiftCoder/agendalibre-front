/**
 * Double-booking lock — detect overlapping slots for a professional/day.
 */
import type { Appointment } from '@/contracts';

const ACTIVE: Appointment['status'][] = ['confirmada', 'pendiente'];

export type BookingConflict = {
  appointmentId: string;
  startTime: string;
  code: string;
  clientId: string;
};

export function findBookingConflict(opts: {
  appointments: Appointment[];
  date: string;
  startTime: string;
  professionalId: string | null;
  /** Exclude when rescheduling */
  excludeAppointmentId?: string;
}): BookingConflict | null {
  const { appointments, date, startTime, professionalId, excludeAppointmentId } =
    opts;
  for (const a of appointments) {
    if (excludeAppointmentId && a.id === excludeAppointmentId) continue;
    if (a.date !== date) continue;
    if (a.startTime !== startTime) continue;
    if (!ACTIVE.includes(a.status)) continue;
    // Same pro, or either side is "primer disponible" (null) → conflict
    if (
      professionalId == null ||
      a.professionalId == null ||
      a.professionalId === professionalId
    ) {
      return {
        appointmentId: a.id,
        startTime: a.startTime,
        code: a.code,
        clientId: a.clientId,
      };
    }
  }
  return null;
}

/** Human message: "Ese horario ya está tomado por …" */
export function formatConflictMessage(
  conflict: BookingConflict,
  clientName?: string | null
): string {
  const who =
    (clientName && clientName.trim()) || `la cita ${conflict.code}`;
  return `Ese horario ya está tomado por ${who}`;
}

export function assertNoDoubleBooking(opts: Parameters<typeof findBookingConflict>[0]): void {
  const c = findBookingConflict(opts);
  if (c) {
    throw new Error(
      `Cupo ocupado (${c.startTime}) · cita ${c.code}. Elige otro horario.`
    );
  }
}
