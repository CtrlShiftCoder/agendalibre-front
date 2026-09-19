import React, {useMemo} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useColors } from '@/store/useTheme';
import { fontSize, fonts, radius, shadow, spacing, type AppColors } from '@/theme/colors';

interface Props {
  onPress: () => void;
  label?: string;
}

/** Non-SVG Google "G" mark — multi-color circle + letter (web-safe, no Svg/Path). */
function GoogleMark({ size = 20 }: { size?: number }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const inner = Math.round(size * 0.62);
  return (
    <View
      style={[
        styles.markOuter,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      pointerEvents="none"
    >
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.markRow}>
          <View style={[styles.markQuad, { backgroundColor: '#EA4335' }]} />
          <View style={[styles.markQuad, { backgroundColor: '#4285F4' }]} />
        </View>
        <View style={styles.markRow}>
          <View style={[styles.markQuad, { backgroundColor: '#FBBC05' }]} />
          <View style={[styles.markQuad, { backgroundColor: '#34A853' }]} />
        </View>
      </View>
      <View
        style={[
          styles.markInner,
          {
            width: inner,
            height: inner,
            borderRadius: inner / 2,
          },
        ]}
      >
        <Text
          style={[
            styles.markLetter,
            {
              fontSize: Math.round(size * 0.52),
              lineHeight: Math.round(size * 0.58),
            },
          ]}
        >
          G
        </Text>
      </View>
    </View>
  );
}

const webShadow = {
  boxShadow: '0 1px 6px rgba(20, 20, 20, 0.06)',
} as ViewStyle;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * White-card “Continuar con Google” — UI mock only.
 * Does not call Google APIs / expo-auth-session.
 */
export function GoogleButton({
  onPress,
  label = 'Continuar con Google',
}: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 16, stiffness: 420 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 320 });
      }}
      style={[
        styles.btn,
        Platform.OS === 'web' ? webShadow : shadow.sm,
        animStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.markSlot}>
        <GoogleMark />
      </View>
      <Text style={styles.label}>{label}</Text>
    </AnimatedPressable>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: c.white,
    borderWidth: 1.5,
    borderColor: c.outline,
  },
  markSlot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markOuter: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markRow: {
    flex: 1,
    flexDirection: 'row',
  },
  markQuad: {
    flex: 1,
  },
  markInner: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markLetter: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: '#4285F4',
    textAlign: 'center',
  },
  label: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.md,
    color: c.onSurface,
  },
});
}

