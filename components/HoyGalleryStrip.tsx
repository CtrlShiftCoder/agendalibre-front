import { router } from 'expo-router';
import { Images } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { isProviderRole } from '@/data/types';
import { canAccess } from '@/lib/access';
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
 * Compact gallery preview on Hoy for providers — links to /galeria.
 * PoC placeholders (emoji + color); no uploads.
 */
export function HoyGalleryStrip() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const gallery = useAppStore((s) => s.gallery);

  const access = canAccess('galeria', { profile, professionals });
  const items = useMemo(
    () => gallery.filter((g) => g.visible).slice(0, 8),
    [gallery]
  );

  if (!isProviderRole(profile.role) || !access) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Images size={16} color={theme.primary} strokeWidth={2.4} />
          <Text style={styles.title}>Galería</Text>
          {gallery.length > 0 ? (
            <Text style={styles.count}>{gallery.length}</Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => router.push('/galeria' as const)}
          hitSlop={8}
          accessibilityRole="link"
          accessibilityLabel="Abrir galería"
        >
          <Text style={[styles.link, { color: theme.primary }]}>
            {gallery.length === 0 ? 'Agregar →' : 'Ver todo →'}
          </Text>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <Pressable
          onPress={() => router.push('/galeria' as const)}
          style={[styles.empty, { backgroundColor: theme.surfaceTint }]}
          accessibilityRole="button"
          accessibilityLabel="Agregar trabajos a la galería"
        >
          <Text style={[styles.emptyText, { color: theme.primary }]}>
            Muestra tus trabajos en la vitrina (foto mock o emoji)
          </Text>
        </Pressable>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {items.map((g) => (
            <Pressable
              key={g.id}
              onPress={() => router.push('/galeria' as const)}
              style={[styles.tile, { backgroundColor: g.placeholderColor }]}
              accessibilityRole="button"
              accessibilityLabel={g.title}
            >
              {g.imageUri ? (
                <Image
                  source={{ uri: g.imageUri }}
                  style={styles.tileImg}
                  accessibilityLabel={g.title}
                />
              ) : (
                <Text style={styles.emoji}>{g.emoji}</Text>
              )}
              <Text style={styles.tileTitle} numberOfLines={1}>
                {g.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
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
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    title: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.md,
      color: c.onSurface,
      letterSpacing: -0.2,
    },
    count: {
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.xs,
      color: c.onSurfaceVariant,
      marginLeft: 2,
    },
    link: {
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.sm,
    },
    row: {
      flexDirection: 'row',
      gap: 8,
      paddingRight: 8,
    },
    tile: {
      width: 72,
      height: 72,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      paddingVertical: 6,
      overflow: 'hidden',
    },
    tileImg: {
      ...StyleSheet.absoluteFill,
      width: 72,
      height: 72,
    },
    emoji: {
      fontSize: 22,
      marginBottom: 2,
    },
    tileTitle: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: 9,
      color: '#fff',
      textAlign: 'center',
      zIndex: 1,
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    empty: {
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      minHeight: 44,
      justifyContent: 'center',
    },
    emptyText: {
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.sm,
    },
  });
}
