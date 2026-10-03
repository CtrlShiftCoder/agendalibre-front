import { CheckCircle2 } from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { create } from 'zustand';

import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing, type AppColors } from '@/theme/colors';

type ToastState = {
  id: number;
  message: string | null;
  tone: 'ok' | 'warn';
  show: (message: string, tone?: 'ok' | 'warn') => void;
  hide: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  id: 0,
  message: null,
  tone: 'ok',
  show: (message, tone = 'ok') => set((s) => ({ id: s.id + 1, message, tone })),
  hide: () => set({ message: null }),
}));

/** Feedback inline para acciones mock ("Guardado", "Copiado"…). Funciona en web y nativo. */
export function toast(message: string, tone: 'ok' | 'warn' = 'ok') {
  useToastStore.getState().show(message, tone);
}

export function ToastHost() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id, message, tone, hide } = useToastStore();
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(hide, 2600);
    return () => clearTimeout(t);
  }, [id, message, hide]);
  if (!message) return null;
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View
        key={id}
        entering={FadeInDown.duration(180)}
        exiting={FadeOut.duration(150)}
        style={[styles.toast, tone === 'warn' && { backgroundColor: colors.amber }]}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        testID="toast"
      >
        <CheckCircle2 size={18} color="#fff" strokeWidth={2.4} />
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    wrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 96,
      alignItems: 'center',
      zIndex: 9999,
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.charcoal === '#E6E8FF' || c.charcoal === '#EAF1FF' ? c.primaryContainer : '#0F172A',
      borderRadius: radius.full,
      paddingHorizontal: spacing.lg,
      paddingVertical: 12,
      maxWidth: 420,
      marginHorizontal: spacing.lg,
    },
    text: { color: '#fff', fontFamily: fonts.semibold, fontSize: fontSize.sm, flexShrink: 1 },
  });
}
