import { CHILE_TIMEZONE } from '@/lib/chileTime';

/** Chile wall-clock parts for an Instant (America/Santiago). */
function chileParts(d: Date): {
  y: number;
  m: number;
  day: number;
  hour: number;
  minute: number;
  ymd: string;
  hm: string;
} {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: CHILE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = fmt.formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '0';
  const y = Number(get('year'));
  const m = Number(get('month'));
  const day = Number(get('day'));
  let hour = Number(get('hour'));
  // Some engines still emit 24:xx under h23 — normalize.
  if (hour === 24) hour = 0;
  const minute = Number(get('minute'));
  const ymd = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const hm = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return { y, m, day, hour, minute, ymd, hm };
}

function chileDayIndex(ymd: string): number {
  // Civil day ordinal from YYYY-MM-DD (proleptic Gregorian) — timezone-free.
  const [y, m, d] = ymd.split('-').map(Number);
  // Rata Die-ish via UTC noon
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

function shortDateChile(d: Date): string {
  return d.toLocaleDateString('es-CL', {
    timeZone: CHILE_TIMEZONE,
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Chile Spanish relative labels for ISO timestamps.
 *
 * Examples: `ahora`, `hace 2 min`, `hace 3 h`, `hoy 14:30`, `ayer`,
 * `ayer 09:15`, `10 sep`.
 *
 * Day boundaries use `America/Santiago`. Invalid ISO → `''`.
 */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';

  const diffMs = now.getTime() - then.getTime();
  const thenP = chileParts(then);
  const nowP = chileParts(now);

  // Future → absolute short (no “en X” yet)
  if (diffMs < -30_000) {
    return `${shortDateChile(then)} ${thenP.hm}`;
  }

  const absMin = Math.floor(Math.abs(diffMs) / 60_000);
  if (absMin < 1) return 'ahora';
  if (absMin < 60) return `hace ${absMin} min`;

  const absH = Math.floor(absMin / 60);
  const dayDelta = chileDayIndex(nowP.ymd) - chileDayIndex(thenP.ymd);

  if (dayDelta === 0) {
    // Same Chile day: prefer “hace N h” for the first few hours, else “hoy HH:mm”
    if (absH < 6) return `hace ${absH} h`;
    return `hoy ${thenP.hm}`;
  }

  if (dayDelta === 1) {
    // Yesterday — keep time when it helps scanning lists
    return absH < 36 ? `ayer ${thenP.hm}` : 'ayer';
  }

  if (dayDelta > 1 && dayDelta < 7) {
    return `hace ${dayDelta} días`;
  }

  // Older / far future already handled: short date (+ year if not current)
  if (thenP.y !== nowP.y) {
    return then.toLocaleDateString('es-CL', {
      timeZone: CHILE_TIMEZONE,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  return shortDateChile(then);
}

/** Alias matching Chilean product copy style. */
export const relativeTimeChile = relativeTime;
