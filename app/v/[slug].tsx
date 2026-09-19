import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import React, {useEffect, useMemo, useState} from 'react';
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
import { Card } from '@/components/Card';
import { FadeInView, StaggerItem } from '@/components/motion';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { nicheLabel } from '@/lib/bookingLink';
import { formatClp } from '@/lib/cash';
import { averageRating, starsLabel } from '@/lib/reviews';
import type { PublicStorefrontView } from '@/contracts';
import { storefrontApi, ApiClientError } from '@/api';
import { isApiModeEnabled } from '@/lib/apiMode';
import { useAppStore } from '@/store/useAppStore';
import {useThemeTokens, useColors} from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

export default function PublicStorefrontScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const storefront = useAppStore((s) => s.storefront);
  const servicesAll = useAppStore((s) => s.services);
  const services = useMemo(() => servicesAll.filter((x) => x.active), [servicesAll]);
  const professionalsAll = useAppStore((s) => s.professionals);
  const professionals = useMemo(
    () => professionalsAll.filter((p) => p.active !== false),
    [professionalsAll]
  );
  const policy = useAppStore((s) => s.cancellationPolicy);
  const reviewsAll = useAppStore((s) => s.reviews);
  const galleryAll = useAppStore((s) => s.gallery);
  const gallery = useMemo(() => galleryAll.filter((g) => g.visible), [galleryAll]);

  const [apiView, setApiView] = useState<PublicStorefrontView | null>(null);
  const [apiTried, setApiTried] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!slug || !isApiModeEnabled()) {
        setApiTried(true);
        return;
      }
      try {
        const res = await storefrontApi.publicBySlug(String(slug));
        if (!cancelled) setApiView(res.data);
      } catch (e) {
        if (!cancelled) {
          // Offline / API down → keep Zustand fallback
          if (!(e instanceof ApiClientError)) {
            console.warn('[vitrina] API fallback', e);
          }
          setApiView(null);
        }
      } finally {
        if (!cancelled) setApiTried(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const effectiveStorefront = apiView?.storefront ?? storefront;
  const effectiveServices = apiView?.services ?? services;
  const effectivePros = apiView?.professionals ?? professionals;
  // Visible reviews only; prefer local store so new reseñas update the average live
  const effectiveReviews = useMemo(() => {
    const localVisible = reviewsAll.filter((r) => r.visible);
    if (!apiView) return localVisible;
    const byId = new Map(
      (apiView.reviews ?? [])
        .filter((r) => r.visible)
        .map((r) => [r.id, r] as const)
    );
    for (const r of localVisible) {
      byId.set(r.id, r);
    }
    return Array.from(byId.values()).sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
  }, [apiView, reviewsAll]);
  const effectiveGallery = apiView?.gallery ?? gallery;
  const effectivePolicy = apiView?.policySummary
    ? {
        ...policy,
        cancelBeforeHours: apiView.policySummary.cancelBeforeHours,
        depositPercentDefault: apiView.policySummary.depositPercentDefault,
        policyText: apiView.policySummary.policyText,
      }
    : policy;
  const avg = averageRating(effectiveReviews);


  void apiTried;
  const match =
    !slug ||
    effectiveStorefront.slug === slug ||
    effectiveStorefront.slug === decodeURIComponent(String(slug));

  const team = useMemo(
    () => (effectiveStorefront.showTeam ? effectivePros : []),
    [effectiveStorefront.showTeam, effectivePros]
  );

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ResponsiveShell style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
        >
          <FadeInView>
            <Pressable onPress={() => router.back()} style={styles.backRow}>
              <ArrowLeft size={20} color={colors.onSurface} strokeWidth={2.4} />
              <Text style={styles.backText}>Volver</Text>
            </Pressable>

            {!match ? (
              <Card style={styles.card}>
                <Text style={styles.title}>Vitrina no encontrada</Text>
                <Text style={styles.sub}>
                  No hay un negocio con slug “{slug}” en esta demo local.
                </Text>
                <Button
                  title="Ir a reservar"
                  onPress={() => router.push('/reservar')}
                  style={{ marginTop: spacing.md }}
                />
              </Card>
            ) : (
              <>
                <View
                  style={[
                    styles.cover,
                    {
                      backgroundColor:
                        effectiveStorefront.coverColor ?? theme.primary,
                    },
                  ]}
                >
                  <View style={styles.coverBrandRow}>
                    <View style={styles.coverLogo}>
                      <Text style={styles.coverEmoji}>
                        {effectiveStorefront.coverEmoji ?? '📅'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.coverBrand}>AgendaLibre</Text>
                      <Text style={styles.coverNiche}>
                        {nicheLabel(effectiveStorefront.niche)} · vitrina pública
                      </Text>
                    </View>
                    {avg != null ? (
                      <View style={styles.coverStar}>
                        <Text style={styles.coverStarText}>{avg}★</Text>
                      </View>
                    ) : (
                      <View style={styles.coverStar}>
                        <Text style={styles.coverStarText}>★</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.coverTitle}>{effectiveStorefront.displayName}</Text>
                  <Text style={styles.coverTip}>
                    Tip: reserva en 1 tap · reseñas visibles · galería real (mock)
                  </Text>
                </View>

                <Text style={styles.bio}>{effectiveStorefront.bio}</Text>

                {avg != null ? (
                  <View style={styles.ratingRow}>
                    <Text style={[styles.ratingAvg, { color: theme.primary }]}>
                      {avg}★
                    </Text>
                    <Text style={styles.ratingMeta}>
                      {starsLabel(avg)} · {effectiveReviews.length} reseña
                      {effectiveReviews.length === 1 ? '' : 's'}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.addrRow}>
                  <MapPin
                    size={16}
                    color={colors.onSurfaceVariant}
                    strokeWidth={2.2}
                  />
                  <Text style={styles.addr}>{effectiveStorefront.address}</Text>
                </View>

                {effectiveGallery.length > 0 ? (
                  <>
                    <Text style={styles.section}>Trabajos</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.galRow}
                    >
                      {effectiveGallery.map((g) => (
                        <View
                          key={g.id}
                          style={[
                            styles.galCard,
                            { backgroundColor: g.placeholderColor },
                          ]}
                        >
                          {g.imageUri ? (
                            <Image
                              source={{ uri: g.imageUri }}
                              style={styles.galImg}
                              accessibilityLabel={g.title}
                            />
                          ) : (
                            <Text style={styles.galEmoji}>{g.emoji}</Text>
                          )}
                          <View style={styles.galOverlay}>
                            <Text style={styles.galTitle} numberOfLines={2}>
                              {g.title}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </>
                ) : null}

                {effectiveReviews.length > 0 ? (
                  <>
                    <Text style={styles.section}>Reseñas</Text>
                    {effectiveReviews.slice(0, 3).map((r) => (
                      <Card key={r.id} style={styles.revCard} elevated>
                        <Text style={styles.revHead}>
                          {r.clientName} · {r.rating}★
                        </Text>
                        <Text style={styles.revBody}>
                          {r.comment || 'Sin comentario'}
                        </Text>
                        {r.reply ? (
                          <Text style={styles.revReply}>Respuesta: {r.reply}</Text>
                        ) : null}
                      </Card>
                    ))}
                  </>
                ) : null}

                <Text style={styles.section}>Servicios</Text>
                {effectiveServices.map((s, i) => (
                  <StaggerItem key={s.id} index={i}>
                    <Card style={styles.svcCard} elevated>
                      <Text style={styles.svcName}>{s.name}</Text>
                      <Text style={styles.svcMeta}>
                        {s.durationMin} min
                        {effectiveStorefront.showPrices
                          ? ` · ${formatClp(s.priceClp)}`
                          : ''}
                      </Text>
                    </Card>
                  </StaggerItem>
                ))}

                {team.length > 0 ? (
                  <>
                    <Text style={styles.section}>Equipo</Text>
                    {team.map((p) => (
                      <View key={p.id} style={styles.teamRow}>
                        <View
                          style={[
                            styles.avatar,
                            { backgroundColor: p.color ?? theme.primary },
                          ]}
                        >
                          <Text style={styles.avatarText}>
                            {(p.name[0] ?? '?').toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.teamName}>{p.name}</Text>
                          <Text style={styles.teamRole}>{p.role}</Text>
                        </View>
                      </View>
                    ))}
                  </>
                ) : null}

                <Card style={styles.policyCard}>
                  <Text style={styles.policyLabel}>Política</Text>
                  <Text style={styles.policyText}>{effectivePolicy.policyText}</Text>
                </Card>

                <Button
                  title="Reservar"
                  onPress={() => router.push('/reservar')}
                  style={{ marginTop: spacing.lg }}
                />
                <View style={styles.ctaRow}>
                  <Button
                    title="Entrar"
                    variant="secondary"
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
                  title="Lista de espera"
                  variant="ghost"
                  onPress={() => router.push('/lista-espera')}
                  style={{ marginTop: spacing.sm }}
                />
              </>
            )}
          </FadeInView>
        </ScrollView>
      </ResponsiveShell>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.surface },
  scroll: { padding: spacing.xl },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
    minHeight: 44,
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  cover: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  coverBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginBottom: spacing.md,
  },
  coverLogo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEmoji: { fontSize: 24 },
  coverBrand: {
    fontFamily: fonts.bold,
    fontWeight: '800',
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  coverStar: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  coverStarText: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontWeight: '800',
    fontSize: 13,
  },
  coverTitle: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
  },
  coverNiche: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.9)',
  },
  coverTip: {
    marginTop: 10,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    lineHeight: 16,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  bio: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: c.onSurface,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  addrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xl,
  },
  addr: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  section: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.md,
    color: c.onSurface,
    marginBottom: spacing.sm,
  },
  svcCard: { marginBottom: spacing.sm },
  svcName: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.md,
    color: c.onSurface,
  },
  svcMeta: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: c.white,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  teamName: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  teamRole: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: c.onSurfaceVariant,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  ratingAvg: {
    fontFamily: fonts.bold,
    fontWeight: '800',
    fontSize: fontSize.lg,
  },
  ratingMeta: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  galRow: { gap: spacing.sm, paddingBottom: spacing.md },
  galCard: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
    marginRight: spacing.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galImg: {
    ...StyleSheet.absoluteFill,
    width: 120,
    height: 120,
  },
  galEmoji: { fontSize: 28 },
  galOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  galTitle: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.xs,
    color: '#fff',
  },
  revCard: { marginBottom: spacing.sm },
  revHead: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  revBody: {
    marginTop: 4,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  revReply: {
    marginTop: 6,
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: c.primaryText,
  },
  policyCard: { marginTop: spacing.lg },
  policyLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: c.primaryText,
    marginBottom: 6,
  },
  policyText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurface,
    lineHeight: 20,
  },
  card: { marginTop: spacing.md },
  title: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: 22,
    color: c.onSurface,
  },
  sub: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
});
}

