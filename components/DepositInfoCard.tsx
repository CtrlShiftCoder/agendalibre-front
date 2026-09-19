import { Banknote } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import type { SuggestedDeposit } from '@/lib/deposit';
import { useColors } from '@/store/useTheme';
import { fontSize, radius, spacing, type AppColors } from '@/theme/colors';

interface Props {
  deposit: SuggestedDeposit;
  /** Extra line under the main mock label (e.g. “30% del servicio”). */
  detail?: string | null;
  style?: ViewStyle;
}

/**
 * Informational only — never triggers payment.
 * Copy: “Seña sugerida: $X (mock — sin cobro)”
 */
export function DepositInfoCard({ deposit, detail, style }: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!deposit.required) return null;

  const pctHint =
    detail ??
    (deposit.percent != null
      ? `${deposit.percent}% del servicio`
      : deposit.fixedClp != null
        ? 'Monto fijo'
        : null);

  return (
    <View
      style={[styles.card, style]}
      accessibilityRole="text"
      accessibilityLabel={deposit.label}
    >
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Banknote size={18} color={colors.primaryText} strokeWidth={2.2} />
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>{deposit.label}</Text>
          {pctHint ? <Text style={styles.sub}>{pctHint}</Text> : null}
          <Text style={styles.mock}>Solo estado local · sin Flow / MP</Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1, gap: 2 },
    title: {
      fontSize: fontSize.sm + 1,
      fontWeight: '700',
      color: c.primaryText,
    },
    sub: {
      fontSize: fontSize.sm,
      color: c.textMuted,
      fontWeight: '500',
    },
    mock: {
      marginTop: 2,
      fontSize: fontSize.xs,
      color: c.textMuted,
      fontWeight: '600',
    },
  });
}
