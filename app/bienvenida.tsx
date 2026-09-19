import { router } from 'expo-router';
import { CalendarHeart, Sparkles, Star, Store } from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FadeInView, StaggerItem } from '@/components/motion';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { nicheHeroTip } from '@/lib/copyChile';
import { MOCK_PHOTO_PRESETS } from '@/lib/mockGalleryPhotos';
import { useAppStore } from '@/store/useAppStore';
import { useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

const LANDING_STRIP = MOCK_PHOTO_PRESETS.slice(0, 4);

export default function BienvenidaScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeTokens();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const niche = useAppStore((s) => s.profile.niche);
  const onboardingDone = useAppStore((s) => s.profile.onboardingDone);
  const gallery = useAppStore((s) => s.gallery);

  const resolved = useMemo(() => {
    if (!onboardingDone || !niche || niche === 'other') return nicheHeroTip(null);
    return nicheHeroTip(niche);
  }, [niche, onboardingDone]);
  const HeroIcon = resolved.icon;

  const stripItems = useMemo(() => {
    const fromStore = gallery
      .filter((g) => g.visible)
      .slice(0, 4)
      .map((g, i) => ({
        key: g.id,
        uri: g.imageUri || LANDING_STRIP[i % LANDING_STRIP.length]!.uri,
        emoji: g.emoji,
        color: g.placeholderColor,
        title: g.title,
      }));
    if (fromStore.length >= 2) return fromStore;
    return LANDING_STRIP.map((p) => ({
      key: p.id,
      uri: p.uri,
      emoji: '✨',
      color: theme.primary,
      title: p.label,
    }));
  }, [gallery, theme.primary]);

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <ResponsiveShell forceMax style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <FadeInView>
            <View style={styles.brandBlock}>
              <View style={[styles.logoMark, { backgroundColor: theme.primary }]}>
                <Text style={styles.logoEmoji}>📅</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.brand, { color: colors.onSurface }]}>
                  AgendaLibre
                </Text>
                <Text style={[styles.brandTag, { color: colors.onSurfaceVariant }]}>
                  Agenda · vitrina · WhatsApp · Chile
                </Text>
              </View>
              <View
                style={[
                  styles.starPill,
                  { backgroundColor: theme.surfaceTint },
                ]}
              >
                <Star size={12} color={theme.primary} fill={theme.primary} />
                <Text style={[styles.starText, { color: theme.primary }]}>
                  4.9
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.border + '66',
                },
              ]}
            >
              <View
                style={[styles.heroIcon, { backgroundColor: theme.primary }]}
              >
                <HeroIcon size={26} color="#fff" strokeWidth={2.2} />
              </View>
              <Text style={[styles.headline, { color: colors.onSurface }]}>
                {resolved.headline}
              </Text>
              <Text style={[styles.tag, { color: colors.onSurfaceVariant }]}>
                {resolved.body}
              </Text>
              <View style={styles.tipRow}>
                <Sparkles size={14} color={theme.primary} strokeWidth={2.2} />
                <Text style={[styles.tipText, { color: colors.onSurfaceVariant }]}>
                  Tip: tu link público + reseñas ★ en la vitrina
                </Text>
              </View>
            </View>

            <Text style={[styles.stripLabel, { color: colors.onSurfaceVariant }]}>
              Así se ve tu galería
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.stripRow}
            >
              {stripItems.map((item) => (
                <View
                  key={item.key}
                  style={[styles.stripTile, { backgroundColor: item.color }]}
                >
                  {item.uri ? (
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.stripImg}
                      accessibilityIgnoresInvertColors
                    />
                  ) : (
                    <Text style={styles.stripEmoji}>{item.emoji}</Text>
                  )}
                  <View style={styles.stripOverlay}>
                    <Text style={styles.stripTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </FadeInView>

          <StaggerItem index={0}>
            <Pressable
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.border + '55',
                },
              ]}
              onPress={() => router.push('/v/barberia-norte' as never)}
              accessibilityRole="button"
              accessibilityLabel={resolved.demoLabel}
            >
              <View
                style={[styles.cardIcon, { backgroundColor: theme.surfaceTint }]}
              >
                <Store size={20} color={theme.primary} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>
                  {resolved.demoLabel}
                </Text>
                <Text
                  style={[styles.cardSub, { color: colors.onSurfaceVariant }]}
                >
                  {resolved.demoSub}
                </Text>
              </View>
            </Pressable>
          </StaggerItem>

          <StaggerItem index={1}>
            <Pressable
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.border + '55',
                },
              ]}
              onPress={() => router.push('/reservar' as never)}
              accessibilityRole="button"
              accessibilityLabel="Reservar"
            >
              <View
                style={[styles.cardIcon, { backgroundColor: theme.surfaceTint }]}
              >
                <CalendarHeart
                  size={20}
                  color={theme.primary}
                  strokeWidth={2.2}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>
                  Reservar
                </Text>
                <Text
                  style={[styles.cardSub, { color: colors.onSurfaceVariant }]}
                >
                  {resolved.reserveSub}
                </Text>
              </View>
            </Pressable>
          </StaggerItem>

          <StaggerItem index={2}>
            <View style={styles.ctaRow}>
              <Button
                title="Entrar"
                onPress={() => router.push('/login')}
                style={{ flex: 1 }}
              />
              <Button
                title="Crear cuenta"
                variant="secondary"
                onPress={() => router.push('/registro')}
                style={{ flex: 1 }}
              />
            </View>
            <Button
              title="Reservar ahora"
              variant="ghost"
              onPress={() => router.push('/reservar' as never)}
              style={{ marginTop: spacing.sm }}
            />
            <Text style={[styles.ctaHint, { color: colors.onSurfaceVariant }]}>
              ¿Primera vez? Crear cuenta te lleva al onboarding en 1 minuto.
            </Text>
          </StaggerItem>

          <FadeInView delay={200}>
            <View style={styles.pillRow}>
              <Sparkles size={14} color={theme.primary} strokeWidth={2.2} />
              <Text style={[styles.pill, { color: colors.onSurfaceVariant }]}>
                Mock API · CLP · honorarios 2026 · sin pasarela real
              </Text>
            </View>
          </FadeInView>
        </ScrollView>
      </ResponsiveShell>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    scroll: { padding: spacing.xl, gap: spacing.md },
    brandBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    logoMark: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoEmoji: { fontSize: 22 },
    brand: {
      fontSize: fontSize.xxl ?? 28,
      fontFamily: fonts?.bold,
      fontWeight: '800',
      letterSpacing: -0.4,
    },
    brandTag: {
      marginTop: 2,
      fontSize: fontSize.xs,
      fontFamily: fonts?.medium,
      fontWeight: '500',
    },
    starPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radius.full,
      minHeight: 32,
    },
    starText: {
      fontSize: 13,
      fontFamily: fonts?.bold,
      fontWeight: '700',
    },
    heroCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.lg,
      marginBottom: spacing.sm,
    },
    heroIcon: {
      width: 52,
      height: 52,
      borderRadius: radius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    headline: {
      fontSize: fontSize.lg,
      fontFamily: fonts?.semibold,
      fontWeight: '700',
      marginBottom: spacing.sm,
    },
    tag: {
      fontSize: fontSize.md,
      lineHeight: 22,
      marginBottom: spacing.sm,
    },
    tipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    tipText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 16 },
    stripLabel: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginTop: spacing.sm,
      marginBottom: 6,
    },
    stripRow: { gap: 8, paddingRight: 8, marginBottom: spacing.md },
    stripTile: {
      width: 88,
      height: 88,
      borderRadius: radius.md,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    stripImg: { ...StyleSheet.absoluteFill, width: 88, height: 88 },
    stripEmoji: { fontSize: 28 },
    stripOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 6,
      paddingVertical: 4,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    stripTitle: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      marginBottom: spacing.sm,
      minHeight: 72,
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitle: { fontSize: fontSize.md, fontWeight: '700' },
    cardSub: { fontSize: fontSize.sm, marginTop: 2 },
    ctaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    ctaHint: {
      fontSize: 12,
      textAlign: 'center',
      marginTop: spacing.sm,
      lineHeight: 16,
    },
    pillRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: spacing.xl,
      justifyContent: 'center',
    },
    pill: { fontSize: 12 },
  });
}
