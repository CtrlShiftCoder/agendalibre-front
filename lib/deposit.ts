/**
 * Suggested deposit (seña) — informational / status-mock only.
 * Never calls Flow, Mercado Pago, or any payment gateway.
 */
import type {
  CancellationPolicy,
  DepositProvider,
  DepositRequirement,
  DepositStatus,
  Service,
} from '@/contracts';
import { formatClp } from '@/lib/money';

export type SuggestedDeposit = DepositRequirement & {
  /** Computed CLP to show (from % of price, or fixedClp). */
  amountClp: number;
  required: boolean;
  /** Card copy: “Seña sugerida: $X (mock — sin cobro)” */
  label: string;
};

/**
 * Resolve deposit from service.depositPercent, else policy.depositPercentDefault.
 * Amount is the fixed CLP suggestion (percent × price). No gateway.
 */
export function resolveSuggestedDeposit(
  service:
    | Pick<Service, 'id' | 'priceClp' | 'depositPercent'>
    | null
    | undefined,
  policy: Pick<CancellationPolicy, 'depositPercentDefault'> | null | undefined,
  opts?: { fixedClp?: number | null }
): SuggestedDeposit {
  const serviceId = service?.id ?? '';
  const price = service?.priceClp ?? 0;

  const servicePct =
    service?.depositPercent != null && service.depositPercent > 0
      ? service.depositPercent
      : null;
  const policyPct =
    policy?.depositPercentDefault != null && policy.depositPercentDefault > 0
      ? policy.depositPercentDefault
      : null;
  const percent = servicePct ?? policyPct;

  const fixedClp =
    opts?.fixedClp != null && opts.fixedClp > 0 ? opts.fixedClp : null;

  let amountClp = 0;
  if (fixedClp != null) {
    amountClp = fixedClp;
  } else if (percent != null) {
    amountClp = Math.round((price * percent) / 100);
  }

  const required = amountClp > 0;
  const provider: DepositProvider = 'none';
  const status: DepositStatus = required ? 'pending' : 'not_required';

  const label = required
    ? `Seña sugerida: ${formatClp(amountClp)} (mock — sin cobro)`
    : 'Sin seña sugerida (mock — sin cobro)';

  return {
    serviceId,
    percent: fixedClp != null ? null : percent,
    fixedClp,
    provider,
    status,
    amountClp,
    required,
    label,
  };
}

export function depositStatusLabel(status: DepositStatus): string {
  switch (status) {
    case 'not_required':
      return 'No requiere';
    case 'pending':
      return 'Pendiente';
    case 'paid':
      return 'Pagada';
    case 'refunded':
      return 'Devuelta';
    case 'forfeited':
      return 'Retenida';
    default:
      return status;
  }
}

/** Statuses a provider can set locally (mock). */
export const PROVIDER_DEPOSIT_STATUSES: DepositStatus[] = [
  'pending',
  'paid',
  'forfeited',
];

export function initialDepositStatus(required: boolean): DepositStatus {
  return required ? 'pending' : 'not_required';
}
