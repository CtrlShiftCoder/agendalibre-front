import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { layoutSpring } from '@/components/motion';
import { useColors, useThemeTokens } from '@/store/useTheme';
import { radius, shadow, spacing } from '@/theme/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padded?: boolean;
  /** Soft accent border glow */
  glow?: boolean;
  elevated?: boolean;
}

export function Card({
  children,
  style,
  onPress,
  padded = true,
  glow = false,
  elevated = true,
}: Props) {
  const theme = useThemeTokens();
  const colors = useColors();

  const content = (
    <Animated.View
      layout={layoutSpring}
      style={[
        styles.card,
        { backgroundColor: colors.surfaceContainerLowest },
        elevated && shadow.sm,
        padded && { padding: spacing.lg },
        glow && {
          borderColor: theme.accent + '40',
          borderWidth: 1,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          },
        ]}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 0,
  },
});
