import { X } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  selectShowOfflineBanner,
  useConnectivity,
} from '@/store/useConnectivity';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, spacing, type AppColors } from '@/theme/colors';

/** Slim dismissible banner when hydrate /health fails. */
export function OfflineBanner() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const visible = useConnectivity(selectShowOfflineBanner);
  const dismissBanner = useConnectivity((s) => s.dismissBanner);

  if (!visible) return null;

  return (
    <View
      style={styles.wrap}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.text} numberOfLines={1}>
        Modo local — API offline
      </Text>
      <Pressable
        onPress={dismissBanner}
        hitSlop={10}
        accessibilityLabel="Cerrar aviso de API offline"
        style={styles.close}
      >
        <X size={14} color={colors.secondary} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: 6,
      paddingHorizontal: spacing.md,
      backgroundColor: c.secondaryContainer,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.outline,
    },
    text: {
      flexShrink: 1,
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.xs,
      color: c.secondary,
      letterSpacing: 0.2,
    },
    close: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
