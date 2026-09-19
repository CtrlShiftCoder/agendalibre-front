import { router } from 'expo-router';
import { ChevronRight, Wallet } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Appointment, Service } from '@/data/types';
import { canAccess } from '@/lib/access';
import { formatClp } from '@/lib/money';
import {
  LEGEND_STATUSES,
  STATUS_LABELS,
  statusTone,
  type LegendStatus,
} from '@/lib/statusColors';
import { useAppStore } from '@/store/useAppStore';
import { useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  shadow,
  spacing,
  type AppColors,
} from '@/theme/colors';

type Props = {
  /** Already team/pro-scoped appointments. */
  appointments: Appointment[];
  services: Service[];
  /** Selected day (ISO yyyy-mm-dd) — usually today or WeekCarousel selection. */
  date: string;
};

type DayCounts = Record<LegendStatus, number>;

function emptyCounts(): DayCounts {
  return {
    confirmada: 0,
    completada: 0,
    cancelada: 0,
    noshow: 0,
  };
}

/**
 * Compact “Resumen del día” for Provider Hoy.
 * Status counts (confirmada / completada / cancelada / noshow) + gross CLP
 * from completed services. Tap → /caja (if allowed) or /agenda.
 */
export function HoyDaySummary({ appointments, services, date }: Props) {
  const colors = useColors();
  const theme = useThemeTokens();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);

  const teamState = useMemo(
    () => ({ profile, professionals }),
    [profile, professionals]
  );
  const goCaja = canAccess('caja', teamState);

  const { counts, grossClp, total } = useMemo(() => {
    const svcMap = new Map(services.map((s) => [s.id, s]));
    const day = appointments.filter((a) => a.date === date);
    const c = emptyCounts();
    let gross = 0;
    for (const a of day) {
      if (
        a.status === 'confirmada' ||
        a.status === 'completada' ||
        a.status === 'cancelada' ||
        a.status === 'noshow'
      ) {
        c[a.status] += 1;
      }
      if (a.status === 'completada') {
        gross += svcMap.get(a.serviceId)?.priceClp ?? 0;
      }
    }
    return {
      counts: c,
      grossClp: gross,
      total: c.confirmada + c.completada + c.cancelada + c.noshow,
    };
  }, [appointments, services, date]);

  const href = goCaja ? ('/caja' as const) : ('/agenda' as const);
  const hint = goCaja ? 'Abre la caja del día' : 'Abre la agenda';

  const a11yParts = LEGEND_STATUSES.map(
    (s) => `${STATUS_LABELS[s]} ${counts[s]}`
  );
  const a11yLabel = `Resumen del día: ${a11yParts.join(', ')}. Bruto ${formatClp(grossClp)}`;

  return (
    <Pressable
      onPress={() => router.push(href)}
      style={({ pressed }) => [
        styles.card,
        shadow.sm,
        { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
      ]}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityHint={hint}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View
            style={[styles.iconWrap, { backgroundColor: theme.surfaceTint }]}
          >
            <Wallet size={16} color={theme.primary} strokeWidth={2.4} />
          </View>
          <Text style={styles.title}>Resumen del día</Text>
          {total > 0 ? (
            <Text style={styles.totalBadge}>{total}</Text>
          ) : null}
        </View>
        <ChevronRight
          size={18}
          color={colors.onSurfaceVariant}
          strokeWidth={2.4}
        />
      </View>

      <View style={styles.countsRow}>
        {LEGEND_STATUSES.map((status) => {
          const tone = statusTone(status, colors);
          const n = counts[status];
          return (
            <View
              key={status}
              style={[styles.countChip, { backgroundColor: tone.bg }]}
            >
              <Text style={[styles.countNum, { color: tone.fg }]}>{n}</Text>
              <Text
                style={[styles.countLabel, { color: tone.fg }]}
                numberOfLines={1}
              >
                {shortLabel(status)}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerLabel}>Bruto completadas</Text>
        <Text style={[styles.footerValue, { color: colors.primaryText }]}>
          {formatClp(grossClp)}
        </Text>
      </View>
    </Pressable>
  );
}

function shortLabel(status: LegendStatus): string {
  switch (status) {
    case 'confirmada':
      return 'Conf.';
    case 'completada':
      return 'Compl.';
    case 'cancelada':
      return 'Canc.';
    case 'noshow':
      return 'No-show';
  }
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: radius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: c.outline + '40',
      minHeight: 44,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm + 2,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      minWidth: 0,
    },
    iconWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.md,
      color: c.onSurface,
      letterSpacing: -0.2,
    },
    totalBadge: {
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.xs,
      color: c.onSurfaceVariant,
    },
    countsRow: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: spacing.sm + 2,
    },
    countChip: {
      flex: 1,
      minWidth: 0,
      borderRadius: radius.md,
      paddingVertical: 8,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    countNum: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.lg,
      letterSpacing: -0.3,
      lineHeight: 22,
    },
    countLabel: {
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: 10,
      marginTop: 1,
      opacity: 0.9,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 2,
    },
    footerLabel: {
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.xs,
      color: c.onSurfaceVariant,
    },
    footerValue: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.md,
      letterSpacing: -0.3,
    },
  });
}
