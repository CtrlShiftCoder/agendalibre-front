import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useThemeTokens } from '@/store/useTheme';
import { radius, shadow } from '@/theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  size?: number;
  style?: ViewStyle;
  variant?: 'soft' | 'solid' | 'ghost';
  accessibilityLabel?: string;
}

export function IconButton({
  children,
  onPress,
  size = 44,
  style,
  variant = 'soft',
  accessibilityLabel,
}: Props) {
  const theme = useThemeTokens();
  const scale = useSharedValue(1);
  /** Enforce ≥44×44 hit target (WCAG / Apple HIG) */
  const hit = Math.max(44, size);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bg =
    variant === 'solid'
      ? theme.primary
      : variant === 'ghost'
        ? 'transparent'
        : theme.primary + '18';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 300 });
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={hit < 48 ? 4 : 0}
      style={[
        styles.btn,
        {
          width: hit,
          height: hit,
          borderRadius: hit / 2,
          backgroundColor: bg,
          minWidth: 44,
          minHeight: 44,
        },
        variant === 'solid' && shadow.sm,
        animStyle,
        style,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
