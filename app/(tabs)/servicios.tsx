import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import {
  CircleHelp,
  CirclePlus,
  Search,
  Store,
} from 'lucide-react-native';
import type { ServiceCategory } from '@/contracts';
import React, {useMemo, useState} from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { StaggerItem } from '@/components/motion';
import { TextField } from '@/components/TextField';
import { EmptyState } from '@/components/EmptyState';
import { ListSkeleton, useListBoot } from '@/components/Skeleton';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { Screen } from '@/components/Screen';
import { ServiceCatalogCard } from '@/components/ServiceCatalogCard';
import { ShareBookingCard } from '@/components/ShareBookingCard';
import {
  resolveServiceCategory,
  serviceCategoryLabel,
  uniqueServiceCategories,
} from '@/lib/serviceCategory';
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import { apiCreateService, apiUpdateService } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import { useColorScheme, useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  shadow,
  spacing,
  type AppColors,
} from '@/theme/colors';

type FilterId = 'todos' | 'populares' | ServiceCategory;

const DURATION_OPTIONS = [15, 30, 45, 60, 90] as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? 'A';
  const b = parts[1]?.[0] ?? '';
  return (a + b).toUpperCase();
}

function GlassHeader({
  subtitle,
  avatarInitials,
}: {
  subtitle: string;
  avatarInitials: string;
}) {
  const theme = useThemeTokens();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const bg =
    Platform.OS === 'web' ? (
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.glassWeb,
          {
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          } as object,
        ]}
      />
    ) : (
      <BlurView
        intensity={70}
        tint={scheme === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
    );

  return (
    <View
      style={[
        styles.header,
        shadow.header,
        { paddingTop: Math.max(insets.top, 8) },
      ]}
    >
      {bg}
      <View style={styles.headerInner}>
        <View style={styles.brandRow}>
          <View style={[styles.logoMark, { backgroundColor: theme.primary }]}>
            <Store size={14} color="#fff" strokeWidth={2.4} />
          </View>
          <View>
            <Text style={[styles.logo, { color: theme.primary }]}>
              AgendaLibre
            </Text>
            <Text style={styles.logoSub}>{subtitle}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => router.push('/agenda')}
            style={styles.searchBtn}
            accessibilityLabel="Buscar"
          >
            <Search size={20} color={colors.onSurface} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/perfil')}
            style={[styles.avatarBtn, { backgroundColor: theme.primary }]}
            accessibilityLabel="Perfil"
          >
            <Text style={styles.avatarBtnText}>{avatarInitials}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function ServiciosScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const booting = useListBoot();
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const services = useAppStore((s) => s.services);
  const storefront = useAppStore((s) => s.storefront);
  const isSolo = profile.role === 'persona_natural';
  // dual-write via apiActions

  const [filter, setFilter] = useState<FilterId>('todos');
  const { refreshControl } = usePullToRefresh();

  const activeCount = useMemo(
    () => services.filter((s) => s.active).length,
    [services]
  );

  const categories = useMemo(
    () => uniqueServiceCategories(services),
    [services]
  );

  const hasPopular = useMemo(
    () => services.some((s) => s.popular),
    [services]
  );

  /** Filter client-side — never inside useAppStore selector. */
  const filtered = useMemo(() => {
    if (filter === 'todos') return services;
    if (filter === 'populares') return services.filter((s) => s.popular);
    return services.filter((s) => resolveServiceCategory(s) === filter);
  }, [services, filter]);

  const chips = useMemo(() => {
    const list: { id: FilterId; label: string; count?: number }[] = [
      { id: 'todos', label: 'Todos', count: activeCount },
    ];
    if (hasPopular) {
      list.push({ id: 'populares', label: 'Populares' });
    }
    // Todos + categories present (field or derived from name)
    for (const cat of categories) {
      list.push({ id: cat, label: serviceCategoryLabel(cat) });
    }
    return list;
  }, [activeCount, hasPopular, categories]);

  const openNew = () => router.push('/servicio/nuevo' as never);
  const openEdit = (id: string) => router.push(`/servicio/${id}` as never);

  const headerOffset = Math.max(insets.top, 8) + 64;

  return (
    <Screen edges={[]} fade constrainContent={false}>
      <GlassHeader
        subtitle="Servicios Y Clientes"
        avatarInitials={initials(profile.name || 'AL')}
      />

      <ResponsiveShell forceMax style={styles.contentShell}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: headerOffset + spacing.md, paddingBottom: 112 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {/* Catalog micro-banner */}
        <View style={styles.banner}>
          <View
            style={[
              styles.bannerBlob,
              { backgroundColor: colors.primaryFixed },
            ]}
          />
          <View style={[styles.bannerIcon, { backgroundColor: theme.primary + '18' }]}>
            <Store size={20} color={theme.primary} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              {isSolo ? 'Mis servicios' : 'Catálogo de Servicios'}
            </Text>
            <Text style={styles.bannerSub}>
              {isSolo
                ? `${activeCount} activos · duración y precio en CLP`
                : `${activeCount} servicios activos · Configuración de turnos`}
            </Text>
          </View>
          <Pressable
            style={styles.helpBtn}
            accessibilityLabel="Ayuda del catálogo"
            hitSlop={8}
            onPress={() =>
              Alert.alert(
                'Catálogo',
                'Activa o pausa la visibilidad de cada servicio. Los clientes solo ven los que están activos.'
              )
            }
          >
            <CircleHelp
              size={20}
              color={colors.onSurfaceVariant}
              strokeWidth={2.1}
            />
          </Pressable>
        </View>

        {isSolo ? (
          <View style={{ marginBottom: spacing.md }}>
            <ShareBookingCard
              businessName={storefront.displayName || profile.name || 'Mi consulta'}
              link={{
                slug: storefront.slug,
                bookingPath: storefront.bookingPath || `/v/${storefront.slug}`,
                name: storefront.displayName || profile.name,
              }}
              subtitle="Tus clientes ven solo los servicios activos"
              previewPath={storefront.bookingPath || `/v/${storefront.slug}`}
            />
          </View>
        ) : null}

        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRail}
        >
          {chips.map((c) => {
            const on = filter === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setFilter(c.id)}
                style={[
                  styles.chip,
                  on
                    ? { backgroundColor: theme.primary }
                    : { backgroundColor: colors.surfaceContainerLow },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: on ? '#fff' : colors.onSurfaceVariant },
                  ]}
                >
                  {c.label}
                </Text>
                {c.count != null && on ? (
                  <View style={styles.chipBadge}>
                    <Text style={[styles.chipBadgeText, { color: colors.primaryText }]}>
                      {c.count}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Primary CTA */}
        <Pressable
          onPress={openNew}
          style={[styles.cta, { backgroundColor: theme.primary }, shadow.sm]}
          accessibilityRole="button"
          accessibilityLabel="Crear Nuevo Servicio"
        >
          <CirclePlus size={20} color="#fff" strokeWidth={2.4} />
          <Text style={styles.ctaText}>Crear Nuevo Servicio</Text>
        </Pressable>

        {booting ? (
              <ListSkeleton rows={4} variant="card" />
            ) : filtered.length === 0 ? (
          <EmptyState
            icon="scissors"
            title={
              services.length === 0
                ? 'Aún no tienes servicios'
                : 'Nada en este filtro'
            }
            subtitle={
              services.length === 0
                ? 'Crea el primero: duración, precio CLP y seña si aplica.'
                : 'Prueba con Todos o crea un servicio en esta categoría.'
            }
            actionLabel={services.length === 0 ? 'Crear servicio' : undefined}
            onAction={services.length === 0 ? openNew : undefined}
          />
        ) : (
          filtered.map((s, i) => (
            <StaggerItem key={s.id} index={i}>
              <ServiceCatalogCard
                service={s}
                onToggleActive={(active) => void apiUpdateService(s.id, { active })}
                onEdit={() => openEdit(s.id)}
              />
            </StaggerItem>
          ))
        )}
      </ScrollView>
      </ResponsiveShell>

    </Screen>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    overflow: 'hidden',
  },
  glassWeb: {
    backgroundColor:
      c.surface === '#121814' || c.surface === '#0F1412'
        ? 'rgba(18, 24, 20, 0.88)'
        : 'rgba(247, 250, 248, 0.85)',
  },
  headerInner: {
    height: 64,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 16,
    fontFamily: fonts.bold,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  logoSub: {
    fontSize: 10,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    color: c.onSurfaceVariant,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtnText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
  contentShell: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
  },
  banner: {
    backgroundColor: c.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  bannerBlob: {
    position: 'absolute',
    right: -24,
    top: -28,
    width: 110,
    height: 110,
    borderRadius: 55,
    opacity: 0.55,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: fontSize.md,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: c.onSurface,
  },
  bannerSub: {
    marginTop: 2,
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    fontWeight: '500',
    color: c.onSurfaceVariant,
  },
  helpBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  chipRail: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingRight: spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    minHeight: 40,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semibold,
    fontWeight: '600',
  },
  chipBadge: {
    backgroundColor: '#fff',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  chipBadgeText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
  cta: {
    height: 48,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.lg,
  },
  ctaText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: c.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    maxHeight: '92%',
  },
  modalScroll: {
    paddingBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    fontWeight: '800',
    marginBottom: spacing.lg,
    color: c.text,
  },
  label: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    color: c.textMuted,
    marginBottom: 6,
    marginTop: spacing.sm,
  },
  durationRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.sm,
  },
  durationChip: {
    minWidth: 58,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationChipText: {
    fontSize: fontSize.md,
    fontFamily: fonts.bold,
    fontWeight: '700',
    lineHeight: 18,
  },
  durationChipUnit: {
    fontSize: 10,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    marginTop: 1,
  },
  durationCustomHint: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    fontWeight: '500',
    color: c.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  activeRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: c.surfaceContainerLow,
  },
  activeLabel: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    color: c.onSurface,
  },
  activeHint: {
    marginTop: 2,
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    fontWeight: '500',
    color: c.onSurfaceVariant,
  },
  input: {
    borderWidth: 1.5,
    borderColor: c.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 48,
    color: c.text,
    backgroundColor: c.cream,
  },
});
}

