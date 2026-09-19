import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DepositStatus } from '@/contracts';
import {
  PROVIDER_DEPOSIT_STATUSES,
  depositStatusLabel,
} from '@/lib/deposit';
import { useColors } from '@/store/useTheme';
import { fontSize, radius, spacing, type AppColors } from '@/theme/colors';

interface Props {
  status: DepositStatus;
  onChange: (next: DepositStatus) => void;
  /** Hide when seña not required */
  visible?: boolean;
}

/**
 * Provider-only local mock toggles — pending / paid / forfeited.
 * Never hits a payment API.
 */
export function DepositStatusActions({
  status,
  onChange,
  visible = true,
}: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!visible) return null;

  return (
    <View style={styles.wrap} accessibilityRole="radiogroup">
      <Text style={styles.title}>Estado seña (mock — sin cobro)</Text>
      <View style={styles.row}>
        {PROVIDER_DEPOSIT_STATUSES.map((s) => {
          const selected = status === s;
          return (
            <Pressable
              key={s}
              onPress={() => onChange(s)}
              style={[
                styles.chip,
                selected && {
                  backgroundColor: colors.primaryText,
                  borderColor: colors.primaryText,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`Seña ${depositStatusLabel(s)}`}
            >
              <Text
                style={[
                  styles.chipText,
                  selected && { color: '#fff' },
                ]}
              >
                {depositStatusLabel(s)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    wrap: {
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    title: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: c.text,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceContainerLowest,
      minHeight: 44,
      justifyContent: 'center',
    },
    chipText: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: c.primaryText,
    },
  });
}
