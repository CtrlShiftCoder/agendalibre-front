import { formatLongDate } from '@/data/slots';

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDaysIso(iso: string, n: number): string {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function endTime(start: string, durationMin: number): string {
  const [h, m] = start.split(':').map(Number);
  const t = h * 60 + m + durationMin;
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

export function longDate(iso: string): string {
  try {
    return formatLongDate(iso);
  } catch {
    return iso;
  }
}

/** "$22,5k" para cifras compactas. */
export function clpCompact(n: number): string {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace('.', ',')}k`;
  return `$${n}`;
}
