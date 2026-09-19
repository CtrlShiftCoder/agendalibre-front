import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDateLabel } from '@/data/slots';
import { hapticSelection } from '@/lib/haptics';
import { useColors, useThemeTokens } from '@/store/useTheme';
import { fontSize, fonts, radius, spacing } from '@/theme/colors';

export type FirstCupoHint = {
  date: string;
  time: string;
};

type Props = {
  hint: FirstCupoHint | null;
  onPress: (hint: FirstCupoHint) => void;
};

/**
 * Cliente UX: highlight “Primer cupo disponible” (hoy/mañana) above the date strip.
 */
export function FirstCupoChip({ hint, onPress }: Props) {
  const theme = useThemeTokens();
  const colors = useColors();
  if (!hint) return null;

  const dayLabel = formatDateLabel(hint.date);

  return (
    <Pressable
      onPress={() => {
        void hapticSelection();
        onPress(hint);
      }}
      style={[
        styles.chip,
        {
          backgroundColor: (theme?.primary ?? colors.primary) + '14',
          borderColor: (theme?.primary ?? colors.primary) + '44',
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Primer cupo disponible ${dayLabel} a las ${hint.time}`}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: theme?.primary ?? colors.primary },
        ]}
      >
        <Sparkles size={14} color="#fff" strokeWidth={2.4} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.title,
            { color: colors.primaryText },
          ]}
        >
          Primer cupo disponible
        </Text>
        <Text style={[styles.sub, { color: colors.onSurfaceVariant }]}>
          {dayLabel} · {hint.time}
        </Text>
      </View>
      <Text
        style={[
          styles.cta,
          { color: colors.primaryText },
        ]}
      >
        Elegir
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    minHeight: 52,
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
    fontSize: fontSize.sm,
  },
  sub: {
    marginTop: 1,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: fontSize.xs,
  },
  cta: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
});
