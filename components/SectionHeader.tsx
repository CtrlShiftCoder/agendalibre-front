import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/store/useTheme';
import { fontSize, fonts, spacing } from '@/theme/colors';

interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: Props) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.secondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl - 1,
    fontFamily: fonts.bold,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
    marginTop: 2,
  },
});
