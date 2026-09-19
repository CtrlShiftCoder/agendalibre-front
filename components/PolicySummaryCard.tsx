import { Shield } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import {
  policyToSummary,
  type PolicyCopyInput,
} from '@/lib/policyCopy';
import { useColors } from '@/store/useTheme';
import { fontSize, radius, spacing, type AppColors } from '@/theme/colors';

interface Props {
  policy: PolicyCopyInput;
  /** Optional title override (default: Política de cancelación). */
  title?: string;
  /** Hide free-text paragraph; show bullets only. */
  bulletsOnly?: boolean;
  style?: ViewStyle;
}

/**
 * Read-only summary of cancellation / deposit / no-show policy.
 * Uses useColors — works in provider preview and client confirm steps.
 */
export function PolicySummaryCard({
  policy,
  title = 'Política de cancelación',
  bulletsOnly = false,
  style,
}: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { bullets, paragraph } = useMemo(
    () => policyToSummary(policy),
    [policy]
  );

  const a11y = `${title}. ${bullets.join(' ')}`;

  return (
    <View
      style={[styles.card, style]}
      accessibilityRole="summary"
      accessibilityLabel={a11y}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Shield size={18} color={colors.primaryText} strokeWidth={2.2} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.bullets}>
        {bullets.map((line) => (
          <View key={line} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{line}</Text>
          </View>
        ))}
      </View>

      {!bulletsOnly && paragraph ? (
        <Text style={styles.paragraph}>{paragraph}</Text>
      ) : null}
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      flex: 1,
      fontSize: fontSize.sm + 1,
      fontWeight: '700',
      color: c.primaryText,
    },
    bullets: { gap: 6 },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    bulletDot: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: c.primaryText,
      lineHeight: 20,
      width: 12,
    },
    bulletText: {
      flex: 1,
      fontSize: fontSize.sm,
      color: c.onSurface,
      lineHeight: 20,
      fontWeight: '500',
    },
    paragraph: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.border,
      fontSize: fontSize.sm,
      color: c.onSurfaceVariant,
      lineHeight: 20,
    },
  });
}
