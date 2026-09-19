/**
 * No-show / cancel → waitlist "cupo liberado" simulator.
 */
import type { Appointment, WaitlistEntry } from '@/contracts';

export type CupoCandidate = {
  entry: WaitlistEntry;
  score: number;
  reason: string;
};

/** Rank waiting entries that match liberated slot preferences. */
export function rankWaitlistForLiberatedSlot(opts: {
  waitlist: WaitlistEntry[];
  appointment: Appointment;
}): CupoCandidate[] {
  const { waitlist, appointment } = opts;
  const out: CupoCandidate[] = [];
  for (const entry of waitlist) {
    if (entry.status !== 'waiting') continue;
    let score = 10;
    const reasons: string[] = [];
    if (entry.serviceId && entry.serviceId === appointment.serviceId) {
      score += 40;
      reasons.push('mismo servicio');
    }
    if (
      entry.professionalId &&
      appointment.professionalId &&
      entry.professionalId === appointment.professionalId
    ) {
      score += 30;
      reasons.push('mismo profesional');
    }
    if (entry.preferredDate === appointment.date) {
      score += 25;
      reasons.push('misma fecha');
    } else if (!entry.preferredDate) {
      score += 5;
    }
    const hour = parseInt(appointment.startTime.slice(0, 2), 10);
    const period =
      hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'afternoon';
    if (entry.preferredPeriod === 'any' || entry.preferredPeriod === period) {
      score += 15;
      reasons.push('periodo ok');
    }
    out.push({
      entry,
      score,
      reason: reasons.join(' · ') || 'en espera',
    });
  }
  return out.sort((a, b) => b.score - a.score || a.entry.createdAt.localeCompare(b.entry.createdAt));
}

export function buildCupoLiberadoMessage(opts: {
  clientName: string;
  businessName: string;
  date: string;
  startTime: string;
  serviceName?: string;
}): string {
  const svc = opts.serviceName ? ` (${opts.serviceName})` : '';
  return (
    `Hola ${opts.clientName}! Se liberó un cupo${svc} en ${opts.businessName}.\n` +
    `${opts.date} a las ${opts.startTime}.\n` +
    `¿Lo tomas? Responde YA para confirmar.`
  );
}
