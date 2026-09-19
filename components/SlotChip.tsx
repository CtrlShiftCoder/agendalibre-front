import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useColors, useThemeTokens } from '@/store/useTheme';
import { fontSize, radius, shadow, spacing } from '@/theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  time: string;
  selected?: boolean;
  available?: boolean;
  highlight?: boolean;
  onPress?: () => void;
  /** Fired when user taps a taken/disabled slot — show conflict feedback */
  onUnavailablePress?: () => void;
  /** When true, chip fills ~1/3 of row (3-column grid) */
  grid?: boolean;
}

export function SlotChip({
  time,
  selected,
  available = true,
  highlight,
  onPress,
  onUnavailablePress,
  grid,
}: Props) {
  const theme = useThemeTokens();
  const colors = useColors();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (selected) {
      scale.value = withSpring(1.04, { damping: 12, stiffness: 280 });
    } else {
      scale.value = withSpring(1, { damping: 14, stiffness: 260 });
    }
  }, [selected, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (available) {
      onPress?.();
      return;
    }
    onUnavailablePress?.();
  };

  const canPress = available ? !!onPress : !!onUnavailablePress;

  return (
    <AnimatedPressable
      onPress={canPress ? handlePress : undefined}
      disabled={!canPress}
      accessibilityState={{ disabled: !available, selected: !!selected }}
      accessibilityHint={
        available ? undefined : 'Horario ocupado. Toca para ver quién lo tomó.'
      }
      style={[
        styles.chip,
        grid && styles.gridChip,
        {
          backgroundColor: selected
            ? theme.primary
            : highlight
              ? theme.surfaceTint
              : available
                ? colors.white
                : colors.surfaceContainer,
          borderColor: selected
            ? theme.primary
            : highlight
              ? theme.accent
              : colors.border,
          opacity: available ? 1 : 0.55,
        },
        selected && shadow.sm,
        highlight && !selected && { borderWidth: 2 },
        animStyle,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? theme.onPrimary : colors.text },
        ]}
      >
        {time}
      </Text>
      {highlight && !selected ? (
        <View style={[styles.badge, { backgroundColor: theme.accent }]}>
          <Text style={styles.badgeText}>Primero</Text>
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minWidth: 80,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  gridChip: {
    width: '31.5%',
    minWidth: 0,
    marginRight: '2%',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
