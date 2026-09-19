import AsyncStorage from '@react-native-async-storage/async-storage';
import { X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { isProviderRole } from '@/data/types';
import {
  HOY_TIPS_DISMISSED_KEY,
  providerHoyTips,
} from '@/lib/copyChile';
import { useAppStore } from '@/store/useAppStore';
import { useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

/**
 * Short tip cards on first Hoy visit for providers.
 * Dismissible; persists via AsyncStorage key `hoyTipsDismissed`.
 */
export function HoyTips() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const profile = useAppStore((s) => s.profile);
  const [dismissed, setDismissed] = useState(true); // hide until storage read
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const v = await AsyncStorage.getItem(HOY_TIPS_DISMISSED_KEY);
        if (!cancelled) {
          setDismissed(v === '1' || v === 'true');
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setDismissed(false);
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tips = useMemo(
    () => providerHoyTips(profile.niche),
    [profile.niche]
  );

  if (!isProviderRole(profile.role) || !ready || dismissed) return null;

  const dismiss = async () => {
    setDismissed(true);
    try {
      await AsyncStorage.setItem(HOY_TIPS_DISMISSED_KEY, '1');
    } catch {
      // ignore — UI already hidden
    }
  };

  return (
    <View style={styles.wrap} accessibilityLabel="Consejos para empezar">
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Tips rápidos
        </Text>
        <Pressable
          onPress={dismiss}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Cerrar tips"
          style={styles.closeBtn}
        >
          <X size={16} color={colors.textMuted} strokeWidth={2.4} />
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {tips.map((t) => {
          const Icon = t.Icon;
          return (
            <View
              key={t.key}
              style={[
                styles.card,
                {
                  backgroundColor: colors.white,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: theme.surfaceTint },
                ]}
              >
                <Icon size={16} color={theme.primary} strokeWidth={2.2} />
              </View>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {t.title}
              </Text>
              <Text
                style={[styles.body, { color: colors.textMuted }]}
                numberOfLines={3}
              >
                {t.body}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    wrap: {
      marginBottom: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
      paddingHorizontal: 2,
    },
    headerTitle: {
      fontSize: fontSize.sm,
      fontFamily: fonts?.semibold,
      fontWeight: '700',
    },
    closeBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.cream,
    },
    row: {
      gap: spacing.sm,
      paddingRight: spacing.md,
    },
    card: {
      width: 168,
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.md,
      gap: 6,
    },
    iconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    title: {
      fontSize: fontSize.sm,
      fontFamily: fonts?.semibold,
      fontWeight: '700',
    },
    body: {
      fontSize: 12,
      lineHeight: 16,
    },
  });
}
