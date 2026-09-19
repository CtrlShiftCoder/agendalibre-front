import type { CancellationPolicy } from '@/contracts';
import { formatClp } from '@/lib/money';

/** Fields needed to render Chile-Spanish policy copy (draft or saved). */
export type PolicyCopyInput = Pick<
  CancellationPolicy,
  | 'cancelBeforeHours'
  | 'depositPercentDefault'
  | 'noShowFeePercent'
  | 'noShowFeeFixedClp'
  | 'keepDepositOnNoShow'
  | 'policyText'
>;

export type PolicySummaryCopy = {
  /** Short bullets for cards / confirm steps. */
  bullets: string[];
  /** Free-text paragraph (policyText or a composed fallback). */
  paragraph: string;
};

/**
 * Pure helper: CancellationPolicy → plain Chile Spanish bullets + paragraph.
 * Safe for draft form state (null / empty / 0 handled).
 */
export function policyToSummary(policy: PolicyCopyInput): PolicySummaryCopy {
  const hours = Math.max(0, Math.round(policy.cancelBeforeHours) || 0);
  const bullets: string[] = [];

  if (hours <= 0) {
    bullets.push('Cancelación: avisa lo antes posible; puede haber cargo.');
  } else if (hours === 1) {
    bullets.push('Puedes cancelar hasta 1 hora antes sin cargo.');
  } else {
    bullets.push(`Puedes cancelar hasta ${hours} horas antes sin cargo.`);
  }

  if (policy.depositPercentDefault != null && policy.depositPercentDefault > 0) {
    bullets.push(
      `Seña por defecto: ${policy.depositPercentDefault}% del servicio.`
    );
  } else {
    bullets.push('Sin seña por defecto (salvo que el servicio indique otra).');
  }

  const feeParts: string[] = [];
  if (policy.noShowFeePercent != null && policy.noShowFeePercent > 0) {
    feeParts.push(`${policy.noShowFeePercent}% del servicio`);
  }
  if (policy.noShowFeeFixedClp != null && policy.noShowFeeFixedClp > 0) {
    feeParts.push(formatClp(policy.noShowFeeFixedClp));
  }
  if (feeParts.length > 0) {
    bullets.push(`Cargo por no-show: ${feeParts.join(' o ')}.`);
  } else {
    bullets.push('Sin cargo fijo por no-show (revisa la seña).');
  }

  if (policy.keepDepositOnNoShow) {
    bullets.push('En caso de no-show se retiene la seña.');
  } else {
    bullets.push('La seña no se retiene automáticamente por no-show.');
  }

  const trimmed = (policy.policyText ?? '').trim();
  const paragraph =
    trimmed.length > 0
      ? trimmed
      : bullets.join(' ');

  return { bullets, paragraph };
}

/** Convenience: join bullets with newlines for plain-text contexts. */
export function policyBulletsText(policy: PolicyCopyInput): string {
  return policyToSummary(policy).bullets.map((b) => `• ${b}`).join('\n');
}
