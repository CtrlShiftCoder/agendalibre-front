import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';

import { prefersReducedMotion } from '@/lib/reduceMotion';

type Preset = 'fade' | 'fadeDown' | 'fadeUp' | 'slideRight' | 'zoom';

const ENTERING = {
  fade: FadeIn,
  fadeDown: FadeInDown,
  fadeUp: FadeInUp,
  slideRight: SlideInRight,
  zoom: ZoomIn,
} as const;

interface FadeInViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  duration?: number;
  preset?: Preset;
}

/** Soft enter via Reanimated only (opacity + transform — never animated %). */
export function FadeInView({
  children,
  style,
  delay = 0,
  duration = 380,
  preset = 'fadeUp',
}: FadeInViewProps) {
  // Skip enter animations when reduce-motion is preferred
  if (prefersReducedMotion()) {
    return <View style={style}>{children}</View>;
  }
  const Entering = ENTERING[preset] ?? FadeInUp;
  return (
    <Animated.View
      entering={Entering.duration(duration).delay(delay)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  index: number;
  style?: StyleProp<ViewStyle>;
  baseDelay?: number;
  step?: number;
  duration?: number;
}

export function StaggerItem({
  children,
  index,
  style,
  baseDelay = 40,
  step = 55,
  duration = 360,
}: StaggerItemProps) {
  // Heavy stagger skipped under reduce-motion (no per-index delay)
  if (prefersReducedMotion()) {
    return <View style={style}>{children}</View>;
  }
  return (
    <FadeInView
      preset="fadeUp"
      delay={baseDelay + index * step}
      duration={duration}
      style={style}
    >
      {children}
    </FadeInView>
  );
}

export const entering = {
  fade: FadeIn,
  fadeDown: FadeInDown,
  fadeUp: FadeInUp,
  slideRight: SlideInRight,
  zoom: ZoomIn,
};

export const layoutSpring = Layout.springify().damping(18).stiffness(180);
