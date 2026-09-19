import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { entering } from '@/components/motion';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { useColors } from '@/store/useTheme';
import { spacing } from '@/theme/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  padded?: boolean;
  fade?: boolean;
  /** Constrain inner content on wide web (default true) */
  constrainContent?: boolean;
}

export function Screen({
  children,
  style,
  contentStyle,
  edges = ['top'],
  padded = false,
  fade = true,
  constrainContent = true,
}: Props) {
  const colors = useColors();
  const inner = (
    <Animated.View
      entering={fade ? entering.fade : undefined}
      style={[
        styles.inner,
        padded && { padding: spacing.xl },
        contentStyle,
      ]}
    >
      {children}
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.surface }, style]}
      edges={edges}
    >
      {constrainContent ? (
        <ResponsiveShell style={styles.shellFlex}>{inner}</ResponsiveShell>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  shellFlex: { flex: 1 },
  inner: { flex: 1 },
});
