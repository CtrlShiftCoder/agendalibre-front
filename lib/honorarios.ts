import type { HonorariosQuote } from '@/contracts';

/** Retención boleta de honorarios Chile 2026 */
export const HONORARIOS_RETENTION_2026 = 0.1525;

/** Presets de bruto para chips UI (CLP). */
export const HONORARIOS_BRUTO_PRESETS = [30_000, 50_000, 80_000, 100_000] as const;

/** Presets de propina % sobre el líquido. */
export const HONORARIOS_TIP_PERCENT_PRESETS = [5, 10, 15] as const;

export type HonorariosTipMode = 'none' | 'percent' | 'fixed';

export type HonorariosTipInput = {
  mode: HonorariosTipMode;
  /** Porcentaje sobre el líquido (ej. 10 = 10%). */
  percent?: number;
  /** Monto fijo en CLP. */
  fixedClp?: number;
};

export type HonorariosBreakdown = HonorariosQuote & {
  tipClp: number;
  tipMode: HonorariosTipMode;
  /** Percent applied when mode=percent; otherwise null. */
  tipPercent: number | null;
  /** Líquido + propina — lo que el cliente paga. */
  totalClienteClp: number;
};

/**
 * Calcula retención y líquido para boleta de honorarios (Chile).
 * Year fixed to 2026 in PoC.
 */
export function quoteHonorarios(brutoClp: number): HonorariosQuote {
  const bruto = Math.max(0, Math.round(brutoClp));
  const retentionRate = HONORARIOS_RETENTION_2026;
  const retentionClp = Math.round(bruto * retentionRate);
  const liquidoClp = bruto - retentionClp;
  return {
    brutoClp: bruto,
    retentionRate,
    retentionClp,
    liquidoClp,
    year: 2026,
  };
}

/**
 * Propina opcional sobre el líquido: % o monto fijo.
 * Pure — no side effects. Tip never changes retención/bruto.
 */
export function applyHonorariosTip(
  liquidoClp: number,
  tip: HonorariosTipInput = { mode: 'none' }
): { tipClp: number; tipMode: HonorariosTipMode; tipPercent: number | null; totalClienteClp: number } {
  const liquido = Math.max(0, Math.round(liquidoClp));
  const mode = tip.mode ?? 'none';

  if (mode === 'percent') {
    const pct = Math.max(0, Math.min(100, tip.percent ?? 0));
    const tipClp = Math.round(liquido * (pct / 100));
    return {
      tipClp,
      tipMode: 'percent',
      tipPercent: pct,
      totalClienteClp: liquido + tipClp,
    };
  }

  if (mode === 'fixed') {
    const tipClp = Math.max(0, Math.round(tip.fixedClp ?? 0));
    return {
      tipClp,
      tipMode: 'fixed',
      tipPercent: null,
      totalClienteClp: liquido + tipClp,
    };
  }

  return {
    tipClp: 0,
    tipMode: 'none',
    tipPercent: null,
    totalClienteClp: liquido,
  };
}

/**
 * Bruto → retención 15,25 % → líquido → +propina = total cliente (Chile 2026).
 */
export function quoteHonorariosBreakdown(
  brutoClp: number,
  tip: HonorariosTipInput = { mode: 'none' }
): HonorariosBreakdown {
  const quote = quoteHonorarios(brutoClp);
  const tipPart = applyHonorariosTip(quote.liquidoClp, tip);
  return {
    ...quote,
    ...tipPart,
  };
}

/* ─── SII-ready boleta preview (mock UI/calc only) ─── */

export type BoletaPreview = {
  /** Placeholder RUT — never validated against SII */
  rutEmisor: string;
  folio: string;
  fechaEmision: string;
  brutoClp: number;
  retentionRate: number;
  retentionClp: number;
  liquidoClp: number;
  glosa: string;
};

/** Deterministic mock folio from bruto + day seed */
export function mockBoletaFolio(brutoClp: number, seed = Date.now()): string {
  const n = Math.abs((brutoClp * 31 + (seed % 100000)) % 900000) + 100000;
  return String(n);
}

export function buildBoletaPreview(opts: {
  brutoClp: number;
  rutEmisor?: string;
  glosa?: string;
  folioSeed?: number;
}): BoletaPreview {
  const quote = quoteHonorarios(opts.brutoClp);
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return {
    rutEmisor: opts.rutEmisor ?? '12.345.678-5',
    folio: mockBoletaFolio(quote.brutoClp, opts.folioSeed ?? Date.now()),
    fechaEmision: `${dd}/${mm}/${yyyy}`,
    brutoClp: quote.brutoClp,
    retentionRate: quote.retentionRate,
    retentionClp: quote.retentionClp,
    liquidoClp: quote.liquidoClp,
    glosa: opts.glosa ?? 'Servicios profesionales (mock AgendaLibre)',
  };
}

/** Plain-text boleta summary for copy/share — not a real SII document */
export function formatBoletaShareText(b: BoletaPreview): string {
  const pct = (b.retentionRate * 100).toFixed(2).replace('.', ',');
  return (
    `BOLETA DE HONORARIOS (mock — sin SII)\n` +
    `RUT emisor: ${b.rutEmisor}\n` +
    `Folio: ${b.folio}\n` +
    `Fecha: ${b.fechaEmision}\n` +
    `Glosa: ${b.glosa}\n` +
    `Bruto: $${b.brutoClp.toLocaleString('es-CL')}\n` +
    `Retención ${pct}%: $${b.retentionClp.toLocaleString('es-CL')}\n` +
    `Líquido: $${b.liquidoClp.toLocaleString('es-CL')}\n` +
    `\nReferencial Chile 2026 · no sustituye boleta electrónica.`
  );
}
