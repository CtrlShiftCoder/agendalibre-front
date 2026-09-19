import { Banknote, CheckCircle2, Timer } from 'lucide-react-native';
import React, {useMemo} from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useResponsiveLayout } from '@/components/ResponsiveShell';
import { formatClp } from '@/data/slots';
import {useThemeTokens, useColors} from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  shadow,
  spacing,
  type AppColors,
} from '@/theme/colors';

interface Props {
  /** Estimated revenue for the day (CLP) */
  estimado: number;
  /** Free pause minutes */
  pausaLibreMin: number;
  /** Efficiency percentage 0–100 */
  eficiencia: number;
}

function formatPausa(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  if (rem === 0) return `${h}h`;
  return `${h}h ${String(rem).padStart(2, '0')}m`;
}

/**
 * Flujo tall metric cards — icon+delta row, label, big value.
 * Estimado / Pausa libre / Eficiencia
 * 3-col by default; shrink padding/font when tight; stack if width < 360.
 */
export function StatChips({ estimado, pausaLibreMin, eficiencia }: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const { isNarrow, contentWidth } = useResponsiveLayout();
  const compact = !isNarrow && contentWidth < 420;

  const cards = [
    {
      key: 'estimado',
      label: 'Estimado',
      value: formatClp(estimado),
      Icon: Banknote,
      iconColor: theme.primary,
      delta: (
        <Text style={[styles.deltaText, { color: colors.tertiary }]}>
          +12%
        </Text>
      ),
    },
    {
      key: 'pausa',
      label: 'Pausa libre',
      value: formatPausa(pausaLibreMin),
      Icon: Timer,
      iconColor: colors.secondary,
      delta: (
        <Text style={[styles.deltaText, { color: colors.onSurfaceVariant }]}>
          Hoy
        </Text>
      ),
    },
    {
      key: 'eficiencia',
      label: 'Eficiencia',
      value: `${Math.round(eficiencia)}%`,
      Icon: CheckCircle2,
      iconColor: colors.tertiary,
      delta: <View style={styles.greenDot} />,
    },
  ] as const;

  return (
    <View style={[styles.row, isNarrow && styles.rowWrap]}>
      {cards.map(({ key, label, value, Icon, iconColor, delta }) => (
        <View
          key={key}
          style={[
            styles.card,
            shadow.sm,
            isNarrow ? styles.cardStacked : styles.cardFlex,
            (isNarrow || compact) && styles.cardCompact,
          ]}
        >
          <View style={styles.topRow}>
            <Icon
              size={isNarrow || compact ? 16 : 18}
              color={iconColor}
              strokeWidth={2.2}
            />
            {delta}
          </View>
          <Text
            style={[
              styles.label,
              (isNarrow || compact) && styles.labelCompact,
            ]}
          >
            {label}
          </Text>
          <Text
            style={[
              styles.value,
              (isNarrow || compact) && styles.valueCompact,
            ]}
            numberOfLines={1}
          >
            {value}
          </Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  rowWrap: {
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: c.surfaceContainerLowest,
    borderRadius: radius.xxl,
    padding: spacing.md,
    minHeight: 108,
  },
  cardFlex: {
    flex: 1,
    minWidth: 0,
  },
  cardStacked: {
    width: '100%',
    minHeight: 88,
  },
  cardCompact: {
    padding: spacing.sm + 2,
    minHeight: 96,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  deltaText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.tertiary,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    color: c.onSurfaceVariant,
    marginBottom: 4,
  },
  labelCompact: {
    fontSize: 10,
  },
  value: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: c.onSurface,
    letterSpacing: -0.4,
  },
  valueCompact: {
    fontSize: fontSize.md,
  },
});
}

