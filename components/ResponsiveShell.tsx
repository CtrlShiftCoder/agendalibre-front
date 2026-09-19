import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';

import { layout } from '@/theme/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  /** When true, always center with max width (useful for scroll content) */
  forceMax?: boolean;
}

/**
 * Centers main content on wide web (~520px) so cards don't stretch ultrawide.
 * On native / narrow web, fills available width.
 */
export function ResponsiveShell({ children, style, forceMax = false }: Props) {
  const { width } = useWindowDimensions();
  const constrain =
    forceMax ||
    (Platform.OS === 'web' && width > layout.maxContentWidth);

  return (
    <View
      style={[
        styles.shell,
        constrain && styles.constrained,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Hook for responsive layout helpers used by chips / grids */
export function useResponsiveLayout() {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(
    width,
    Platform.OS === 'web' ? layout.maxContentWidth : width
  );
  const isNarrow = contentWidth < layout.narrowBreakpoint;
  const isWideWeb = Platform.OS === 'web' && width > layout.maxContentWidth;

  return {
    width,
    contentWidth,
    isNarrow,
    isWideWeb,
    maxContentWidth: layout.maxContentWidth,
  };
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    alignSelf: 'stretch',
  },
  constrained: {
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    // ScrollView/web often ignores alignSelf alone — pin center explicitly
    ...(Platform.OS === 'web'
      ? ({ marginLeft: 'auto', marginRight: 'auto' } as object)
      : null),
  },
});
