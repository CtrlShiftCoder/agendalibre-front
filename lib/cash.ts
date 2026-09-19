import type { Appointment, Service } from '@/data/types';
import type { DayCashSummary, PaymentMethod } from '@/contracts';

export type { PaymentMethod };

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'cash',
  'transfer',
  'card',
  'other',
] as const;

export function paymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'cash':
      return 'Efectivo';
    case 'transfer':
      return 'Transferencia';
    case 'card':
      return 'Tarjeta';
    case 'other':
      return 'Otro';
  }
}

function emptyByMethod(): NonNullable<DayCashSummary['byMethod']> {
  return { cash: 0, transfer: 0, card: 0, other: 0 };
}

function heuristicByMethod(
  grossClp: number
): NonNullable<DayCashSummary['byMethod']> {
  return {
    cash: Math.round(grossClp * 0.4),
    transfer: Math.round(grossClp * 0.35),
    card: Math.round(grossClp * 0.2),
    other: Math.max(
      0,
      grossClp -
        Math.round(grossClp * 0.4) -
        Math.round(grossClp * 0.35) -
        Math.round(grossClp * 0.2)
    ),
  };
}

export type ComputeDayCashOpts = {
  professionalId?: string | null;
  /**
   * Local overrides: appointmentId → payment method.
   * When provided, `byMethod` is summed from tagged completed appointments
   * (untagged completed do not contribute). When omitted, keeps heuristic split.
   */
  methodByAppointmentId?: Record<string, PaymentMethod>;
};

/**
 * Pure day cash summary from appointments + services.
 * grossClp = sum of completed service prices.
 * depositsHeldClp ≈ sum of deposit% * price for non-cancelled (heuristic PoC).
 */
export function computeDayCash(
  date: string,
  appointments: Appointment[],
  services: Service[],
  opts?: ComputeDayCashOpts
): DayCashSummary {
  const svcMap = new Map(services.map((s) => [s.id, s]));
  let list = appointments.filter((a) => a.date === date);
  if (opts?.professionalId) {
    list = list.filter(
      (a) =>
        a.professionalId === opts.professionalId || a.professionalId === null
    );
  }

  let completedCount = 0;
  let cancelledCount = 0;
  let noShowCount = 0;
  let grossClp = 0;
  let depositsHeldClp = 0;
  const byProfessionalId: Record<string, number> = {};
  const useOverrides = opts?.methodByAppointmentId !== undefined;
  const byMethod = emptyByMethod();

  for (const a of list) {
    const svc = svcMap.get(a.serviceId);
    const price = svc?.priceClp ?? 0;
    const depositPct = svc?.depositPercent ?? null;

    if (a.status === 'completada') {
      completedCount += 1;
      grossClp += price;
      const key = a.professionalId ?? '_unassigned';
      byProfessionalId[key] = (byProfessionalId[key] ?? 0) + price;
      if (useOverrides) {
        const method = opts!.methodByAppointmentId![a.id];
        if (method) {
          byMethod[method] += price;
        }
      }
    } else if (a.status === 'cancelada') {
      cancelledCount += 1;
    } else if (a.status === 'noshow') {
      noShowCount += 1;
    }

    if (
      a.status !== 'cancelada' &&
      depositPct != null &&
      depositPct > 0
    ) {
      depositsHeldClp += Math.round((price * depositPct) / 100);
    }
  }

  return {
    date,
    currency: 'CLP',
    appointmentsCount: list.length,
    completedCount,
    cancelledCount,
    noShowCount,
    grossClp,
    depositsHeldClp,
    byMethod: useOverrides ? byMethod : heuristicByMethod(grossClp),
    byProfessionalId,
  };
}

export { formatClp } from '@/lib/money';
