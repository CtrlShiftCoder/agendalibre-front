import { CheckCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

import { prefersReducedMotion } from '@/lib/reduceMotion';
import { useColors, useThemeTokens } from '@/store/useTheme';

// Small checkmark JSON (~2KB)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const successSource = require('../assets/lottie/success-check.json');

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
  /** Play once then hold last frame (default true) */
  autoPlay?: boolean;
};

function FallbackCheck({
  size,
  style,
}: {
  size: number;
  style?: StyleProp<ViewStyle>;
}) {
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

/**
 * Native success check (mouredev-style Lottie).
 * Web uses `SuccessLottie.web.tsx` (Lucide) — never bundles DotLottie.
 */
export function SuccessLottie({ size = 96, style, autoPlay = true }: Props) {
  const reduce = prefersReducedMotion();
  const [failed, setFailed] = useState(false);

  if (reduce || failed) {
    return <FallbackCheck size={size} style={style} />;
  }

  return (
    <View
      style={[styles.wrap, { width: size, height: size }, style]}
      accessibilityRole="image"
      accessibilityLabel="Éxito"
    >
      <LottieView
        source={successSource}
        autoPlay={autoPlay}
        loop={false}
        style={{ width: size, height: size }}
        onAnimationFailure={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
