import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LEGEND_STATUSES, statusTone } from '@/lib/statusColors';
import { useColors } from '@/store/useTheme';
import { fontSize, fonts, spacing, type AppColors } from '@/theme/colors';

/**
 * Compact status color key for Hoy cronograma / Agenda citas.
 * Colors match TimelineItem via `statusTone`.
 */
export function StatusLegend() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={styles.wrap}
      accessibilityRole="summary"
      accessibilityLabel="Leyenda de estados: confirmada, completada, cancelada, no-show"
    >
      {LEGEND_STATUSES.map((status) => {
        const tone = statusTone(status, colors);
        return (
          <View key={status} style={styles.item}>
            <View style={[styles.dot, { backgroundColor: tone.fg }]} />
            <Text style={styles.label}>{tone.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: spacing.sm + 2,
      marginBottom: spacing.md,
      paddingVertical: 2,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    label: {
      fontSize: fontSize.sm,
      fontFamily: fonts.semibold,
      fontWeight: '600',
      color: c.secondary,
    },
  });
}
