/**
 * CLP display helpers — Chilean pesos with thousands separators.
 * Use this everywhere prices are shown (cards, ticket, caja, …).
 */

/** Format integer CLP as `$12.500` (es-CL thousands). */
export function formatClp(n: number): string {
  const value = Number.isFinite(n) ? Math.round(n) : 0;
  return `$${value.toLocaleString('es-CL')}`;
}

/** Strip non-digits from a price field (for TextInput). */
export function parseClpInput(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return 0;
  return Number(digits) || 0;
}
