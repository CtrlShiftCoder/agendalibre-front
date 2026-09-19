import type { AppointmentStatus } from '@/contracts/types';
import type { AppColors } from '@/theme/colors';

/** Legend statuses shown on Hoy / Agenda (matches product copy). */
export const LEGEND_STATUSES = [
  'confirmada',
  'completada',
  'cancelada',
  'noshow',
] as const satisfies readonly AppointmentStatus[];

export type LegendStatus = (typeof LEGEND_STATUSES)[number];

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  confirmada: 'Confirmada',
  pendiente: 'Pendiente',
  cancelada: 'Cancelada',
  noshow: 'No-show',
  completada: 'Completada',
};

export type StatusTone = {
  fg: string;
  bg: string;
  label: string;
};

/**
 * TimelineItem-aligned status tones.
 * Prefer solid theme containers (dark-mode safe) over fragile hex-alpha washes
 * when a container token exists.
 */
export function statusTone(
  status: AppointmentStatus,
  colors: AppColors,
  opts?: { accent?: string }
): StatusTone {
  switch (status) {
    case 'confirmada':
      return {
        fg: colors.secondary,
        bg: colors.secondaryContainer,
        label: STATUS_LABELS.confirmada,
      };
    case 'completada':
      return {
        fg: colors.tertiary,
        bg: colors.tertiaryFixed,
        label: STATUS_LABELS.completada,
      };
    case 'cancelada':
      return {
        fg: colors.danger,
        bg: colors.softRose,
        label: STATUS_LABELS.cancelada,
      };
    case 'noshow':
      return {
        fg: colors.amber,
        bg: colors.surfaceContainerHigh,
        label: STATUS_LABELS.noshow,
      };
    case 'pendiente': {
      const accent = opts?.accent ?? colors.primary;
      return {
        fg: accent,
        bg: accent + '18',
        label: STATUS_LABELS.pendiente,
      };
    }
  }
}
