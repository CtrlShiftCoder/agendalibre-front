import { AlertCircle, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing, type AppColors } from '@/theme/colors';

type Variant = 'warning' | 'danger' | 'success';

interface Props {
  visible: boolean;
  message: string;
  /** Optional action (e.g. Deshacer) */
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  /** Auto-hide after ms (0 = stay until dismissed) */
  autoHideMs?: number;
  variant?: Variant;
}

/**
 * Minimal inline toast / banner — View only, no new deps.
 * Used for booking conflicts and soft-undo after cancel.
 */
export function ToastBanner({
  visible,
  message,
  actionLabel,
  onAction,
  onDismiss,
  autoHideMs = 0,
  variant = 'warning',
}: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!visible || !autoHideMs || !onDismiss) return;
    timerRef.current = setTimeout(() => {
      onDismiss();
    }, autoHideMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, autoHideMs, onDismiss, message]);

  if (!visible) return null;

  const accent =
    variant === 'danger'
      ? colors.danger
      : variant === 'success'
        ? colors.success
        : colors.amber;

  return (
    <View
      style={[styles.wrap, { borderColor: accent + '55', backgroundColor: accent + '14' }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <AlertCircle size={18} color={accent} strokeWidth={2.4} />
      <Text style={[styles.text, { color: colors.text }]} numberOfLines={3}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={styles.action}
        >
          <Text style={[styles.actionText, { color: accent }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          hitSlop={10}
          accessibilityLabel="Cerrar aviso"
          style={styles.close}
        >
          <X size={14} color={colors.secondary} strokeWidth={2.4} />
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1.5,
      marginBottom: spacing.md,
    },
    text: {
      flex: 1,
      flexShrink: 1,
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.sm,
      lineHeight: 20,
    },
    action: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      minHeight: 32,
      justifyContent: 'center',
    },
    actionText: {
      fontFamily: fonts.bold,
      fontWeight: '800',
      fontSize: fontSize.sm,
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
