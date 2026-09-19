import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { hapticLight } from '@/lib/haptics';
import { prefersReducedMotion } from '@/lib/reduceMotion';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useColors, useThemeTokens } from '@/store/useTheme';
import { fontSize, fonts, radius, shadow, spacing } from '@/theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
  /** Optional Lucide (or other) icon left of the label */
  icon?: React.ReactNode;
  /** Use gradient fill for primary (default true) */
  gradient?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  fullWidth = true,
  icon,
  gradient = true,
}: Props) {
  const theme = useThemeTokens();
  const colors = useColors();
  const scale = useSharedValue(1);
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';
  const useGradient = isPrimary && gradient && !disabled;
  const primary = theme?.primary ?? colors.primary;
  const onPrimary = theme?.onPrimary ?? '#FFFFFF';
  const gradientColors = theme?.gradient ?? [colors.primary, colors.primaryContainer];

  const bg = isPrimary
    ? primary
    : isDanger
      ? colors.danger
      : isGhost
        ? 'transparent'
        : colors.white;
  const color = isPrimary || isDanger ? onPrimary : colors.primaryText;
  const borderColor = isGhost || variant === 'secondary' ? colors.primaryText : bg;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const reduce = prefersReducedMotion();

  const handlePress = () => {
    if (isPrimary) void hapticLight();
    onPress?.();
  };

  const springIn = () => {
    if (reduce) return;
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };
  const springOut = () => {
    if (reduce) return;
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  const content = loading ? (
    <ActivityIndicator color={color} />
  ) : (
    <View style={styles.labelRow}>
      {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
      <Text style={[styles.label, { color }]}>{title}</Text>
    </View>
  );

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled || loading}
      onPressIn={springIn}
      onPressOut={springOut}
      style={[
        {
          width: fullWidth ? '100%' : undefined,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.45 : 1,
          borderRadius: radius.lg,
          overflow: 'hidden',
        },
        isPrimary && !disabled
          ? Platform.OS === 'web'
            ? ({ boxShadow: '0 1px 6px rgba(20, 20, 20, 0.06)' } as ViewStyle)
            : shadow.sm
          : null,
        animStyle,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}
    >
      {useGradient ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.base}
        >
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.base,
            {
              backgroundColor: bg,
              borderColor,
              borderWidth: 1.5,
            },
          ]}
        >
          {content}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSize.md + 1,
    fontFamily: fonts.bold,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
