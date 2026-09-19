import { CheckCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { prefersReducedMotion } from '@/lib/reduceMotion';
import { useColors, useThemeTokens } from '@/store/useTheme';

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
  autoPlay?: boolean;
};

/**
 * Web entry — Lucide fallback only.
 * Avoids pulling `lottie-react-native` (needs @lottiefiles/dotlottie-react).
 */
export function SuccessLottie({ size = 96, style }: Props) {
  const theme = useThemeTokens();
  const colors = useColors();
  const reduce = prefersReducedMotion();
  const Entering = reduce ? FadeIn.duration(200) : ZoomIn.duration(380);
  return (
    <Animated.View
      entering={Entering}
      style={[styles.wrap, { width: size, height: size }, style]}
      accessibilityRole="image"
      accessibilityLabel="Éxito"
    >
      <CheckCircle
        size={Math.round(size * 0.72)}
        color={theme?.primary ?? colors.primary}
        strokeWidth={2.2}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
