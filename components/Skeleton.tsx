import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { prefersReducedMotion } from '@/lib/reduceMotion';
import { useColors } from '@/store/useTheme';
import { radius, spacing } from '@/theme/colors';

type BoneProps = {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
  radius?: number;
};

function Bone({ width = '100%', height = 14, style, radius: r = radius.sm }: BoneProps) {
  const colors = useColors();
  const reduce = prefersReducedMotion();
  const opacity = useSharedValue(reduce ? 0.55 : 0.4);

  useEffect(() => {
    if (reduce) {
      opacity.value = 0.55;
      return;
    }
    opacity.value = withRepeat(
      withTiming(0.92, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity, reduce]);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: r,
          backgroundColor: colors.surfaceContainerHigh,
        },
        anim,
        style,
      ]}
    />
  );
}

/** Soft shimmer block — opacity pulse; skipped under reduce-motion. */
export function Skeleton(props: BoneProps) {
  return <Bone {...props} />;
}

export function ListSkeleton({
  rows = 4,
  variant = 'card',
}: {
  rows?: number;
  variant?: 'card' | 'row' | 'timeline';
}) {
  const colors = useColors();
  const items = useMemo(() => Array.from({ length: rows }, (_, i) => i), [rows]);

  if (variant === 'timeline') {
    return (
      <View style={styles.wrap}>
        {items.map((i) => (
          <View key={i} style={[styles.timelineRow, { borderColor: colors.border }]}>
            <Bone width={44} height={44} radius={22} />
            <View style={{ flex: 1, gap: 8 }}>
              <Bone width="40%" height={12} />
              <Bone width="70%" height={16} />
              <Bone width="55%" height={12} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (variant === 'row') {
    return (
      <View style={styles.wrap}>
        {items.map((i) => (
          <View key={i} style={styles.row}>
            <Bone width={40} height={40} radius={20} />
            <View style={{ flex: 1, gap: 8 }}>
              <Bone width="55%" height={14} />
              <Bone width="35%" height={11} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {items.map((i) => (
        <View
          key={i}
          style={[
            styles.card,
            { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.border },
          ]}
        >
          <Bone width="60%" height={16} />
          <Bone width="40%" height={12} style={{ marginTop: 10 }} />
          <Bone width="80%" height={12} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  );
}

/** Brief boot shimmer for list screens (PoC — no Moti/Skia). */
export function useListBoot(ms = 320): boolean {
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return booting;
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md, paddingVertical: spacing.sm },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    minHeight: 88,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
