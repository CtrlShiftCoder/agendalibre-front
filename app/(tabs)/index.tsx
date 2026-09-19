import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Bell, Plus, Search, SlidersHorizontal, Sun, Zap } from 'lucide-react-native';
import React, {useMemo, useState} from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ClienteHome } from '@/components/ClienteHome';
import { HoyShortcuts } from '@/components/HoyShortcuts';
import { HoyDaySummary } from '@/components/HoyDaySummary';
import { HoyGalleryStrip } from '@/components/HoyGalleryStrip';
import { HoyNextChip } from '@/components/HoyNextChip';
import { HoyTips } from '@/components/HoyTips';
import { StaggerItem } from '@/components/motion';
import { EmptyState } from '@/components/EmptyState';
import { ListSkeleton, useListBoot } from '@/components/Skeleton';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { Screen } from '@/components/Screen';
import { StatChips } from '@/components/StatChips';
import { StatusLegend } from '@/components/StatusLegend';
import {
  TimelineItem,
  type TimelinePhase,
} from '@/components/TimelineItem';
import { WeekCarousel } from '@/components/WeekCarousel';
import {
  formatLongDate,
  parseTime,
} from '@/data/slots';
import { isProviderRole, providerNoun } from '@/data/types';
import { isDateBlocked } from '@/lib/availability';
import { formatUnreadBadge, unreadInboxCount } from '@/lib/reviews';
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import {
  filterAppointmentsForActivePro,
  getActiveProfessional,
  isEmpresaAdmin,
} from '@/lib/team';
import {
  notifyClientMessage,
  openWhatsApp,
} from '@/lib/whatsapp';
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? 'A';
  const b = parts[1]?.[0] ?? '';
  return (a + b).toUpperCase();
}

function nowMinutes(): number {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

function resolvePhase(
  date: string,
  startTime: string,
  durationMin: number,
  status: string
): { phase: TimelinePhase; endsInMin?: number } {
  const today = new Date().toISOString().slice(0, 10);
  if (
    status === 'completada' ||
    status === 'cancelada' ||
    status === 'noshow'
  ) {
    return { phase: 'completed' };
  }
  if (date < today) return { phase: 'completed' };
  if (date > today) return { phase: 'upcoming' };

  const start = parseTime(startTime);
  const end = start + durationMin;
  const now = nowMinutes();

  if (now >= end) {
    return { phase: 'completed' };
  }
  if (now >= start && now < end) {
    return { phase: 'in_progress', endsInMin: Math.max(1, end - now) };
  }
  return { phase: 'upcoming' };
}

function GlassHeader({
  avatarInitials,
  onSearch,
  onAvatar,
  unreadCount = 0,
}: {
  avatarInitials: string;
  onSearch?: () => void;
  onAvatar?: () => void;
  unreadCount?: number;
}) {
  const theme = useThemeTokens();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const badgeLabel = formatUnreadBadge(unreadCount);

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
        <View>
          <Text style={[styles.logo, { color: theme.primary }]}>
            AgendaLibre
          </Text>
          <Text style={styles.logoSub}>Agenda</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => router.push('/notificaciones' as const)}
            style={styles.searchBtn}
            accessibilityLabel={
              unreadCount > 0
                ? `Notificaciones, ${unreadCount} sin leer`
                : 'Notificaciones'
            }
          >
            <Bell size={20} color={colors.onSurface} strokeWidth={2.2} />
            {badgeLabel ? (
              <View style={[styles.bellBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.bellBadgeText}>{badgeLabel}</Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable
            onPress={onSearch ?? (() => router.push('/buscar' as const))}
            style={styles.searchBtn}
            accessibilityLabel="Buscar"
          >
            <Search size={20} color={colors.onSurface} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            onPress={onAvatar ?? (() => router.push('/perfil'))}
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

export default function HoyScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const profileRole = useAppStore((s) => s.profile.role);
  if (!isProviderRole(profileRole)) {
    return <ClienteHome />;
  }
  return <ProviderHoyScreen />;
}

function ProviderHoyScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const timelineBooting = useListBoot(360);
  const theme = useThemeTokens();
  const profile = useAppStore((s) => s.profile);
  const appointmentsRaw = useAppStore((s) => s.appointments);
  const professionals = useAppStore((s) => s.professionals);
  const services = useAppStore((s) => s.services);
  const clients = useAppStore((s) => s.clients);
  const notifications = useAppStore((s) => s.notifications);
  const unreadCount = useMemo(
    () => unreadInboxCount(notifications, { profile, professionals }),
    [notifications, profile, professionals]
  );
  const fabScale = useSharedValue(1);
  const insets = useSafeAreaInsets();
  const { refreshControl } = usePullToRefresh();

  const todayIso = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [adminFilterId, setAdminFilterId] = useState<string | null>(null);

  const teamState = useMemo(
    () => ({ profile, professionals }),
    [profile, professionals]
  );
  const activePro = useMemo(
    () => getActiveProfessional(teamState),
    [teamState]
  );
  const adminMode = isEmpresaAdmin(teamState);
  const scopedAppointments = useMemo(
    () =>
      filterAppointmentsForActivePro(teamState, appointmentsRaw, {
        adminFilterId: adminMode ? adminFilterId : null,
      }),
    [teamState, appointmentsRaw, adminMode, adminFilterId]
  );

  const workerBanner =
    profile.role === 'empresa' &&
    activePro &&
    activePro.teamRole === 'trabajador'
      ? `Viendo agenda de ${activePro.name}`
      : null;
  const dayBlocked = isDateBlocked(selectedDate, profile.blockedDates);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of scopedAppointments) {
      if (a.status === 'cancelada') continue;
      map[a.date] = (map[a.date] ?? 0) + 1;
    }
    return map;
  }, [scopedAppointments]);

  const dayApts = useMemo(
    () =>
      scopedAppointments
        .filter((a) => a.date === selectedDate && a.status !== 'cancelada')
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [scopedAppointments, selectedDate]
  );

  const defaultDuration = services.find((s) => s.active)?.durationMin ?? 30;

  const estimado = dayApts.reduce((sum, a) => {
    const svc = services.find((s) => s.id === a.serviceId);
    return sum + (svc?.priceClp ?? 0);
  }, 0);

  const openMins =
    parseTime(profile.hours.close) - parseTime(profile.hours.open);
  const bookedMins = dayApts.reduce((sum, a) => {
    const svc = services.find((s) => s.id === a.serviceId);
    return sum + (svc?.durationMin ?? defaultDuration);
  }, 0);
  const pausaLibreMin = Math.max(0, openMins - bookedMins);
  const eficiencia =
    openMins > 0 ? Math.min(100, Math.round((bookedMins / openMins) * 100)) : 0;

  const firstNameRaw = profile.name.trim().split(/\s+/)[0] ?? '';
  const nouns = providerNoun(profile.role);
  const firstName =
    !firstNameRaw || /^mi$/i.test(firstNameRaw)
      ? nouns.team
      : firstNameRaw;

  const dateLabel = useMemo(() => {
    const d = new Date(selectedDate + 'T12:00:00');
    return d
      .toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
      .toUpperCase();
  }, [selectedDate]);

  const monthTitle = useMemo(() => {
    const d = new Date(selectedDate + 'T12:00:00');
    const raw = d.toLocaleDateString('es-CL', {
      month: 'long',
      year: 'numeric',
    });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [selectedDate]);

  const timeline = useMemo(() => {
    type Row =
      | {
          type: 'apt';
          apt: (typeof dayApts)[0];
          phase: TimelinePhase;
          endsInMin?: number;
          duration: number;
        }
      | { type: 'break'; time: string; durationMin: number };

    const rows: Row[] = [];
    for (let i = 0; i < dayApts.length; i++) {
      const a = dayApts[i];
      const svc = services.find((s) => s.id === a.serviceId);
      const duration = svc?.durationMin ?? defaultDuration;
      const { phase, endsInMin } = resolvePhase(
        a.date,
        a.startTime,
        duration,
        a.status
      );
      rows.push({ type: 'apt', apt: a, phase, endsInMin, duration });

      const next = dayApts[i + 1];
      if (next) {
        const end = parseTime(a.startTime) + duration;
        const nextStart = parseTime(next.startTime);
        const gap = nextStart - end;
        if (gap >= 45) {
          const h = Math.floor(end / 60);
          const m = end % 60;
          rows.push({
            type: 'break',
            time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
            durationMin: gap,
          });
        }
      }
    }
    return rows;
  }, [dayApts, services, defaultDuration]);

  const remaining = useMemo(() => {
    return timeline.filter(
      (r) =>
        r.type === 'apt' &&
        (r.phase === 'upcoming' || r.phase === 'in_progress')
    ).length;
  }, [timeline]);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const headerOffset = Math.max(insets.top, 8) + 64;

  return (
    <Screen edges={[]} fade constrainContent={false}>
      <GlassHeader
        avatarInitials={initials(profile.name || 'AL')}
        unreadCount={unreadCount}
        onSearch={() => router.push('/buscar' as const)}
      />

      <ResponsiveShell style={styles.contentShell}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: headerOffset + spacing.md, paddingBottom: 112 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {/* Greeting */}
        <View style={styles.greetingTop}>
          <Text style={[styles.dateLabel, { color: theme.primary }]}>
            {dateLabel}
          </Text>
          <View
            style={[
              styles.ritmoPill,
              { backgroundColor: colors.secondaryContainer },
            ]}
          >
            <Zap
              size={12}
              color={colors.secondary}
              strokeWidth={2.6}
              fill={colors.secondary}
            />
            <Text style={[styles.ritmoText, { color: colors.secondary }]}>
              Ritmo óptimo
            </Text>
          </View>
        </View>

        {workerBanner ? (
          <View
            style={[
              styles.teamBanner,
              { backgroundColor: theme.surfaceTint },
            ]}
          >
            <Text style={[styles.teamBannerText, { color: theme.primary }]}>
              {workerBanner}
            </Text>
          </View>
        ) : null}

        {dayBlocked ? (
          <View
            style={[
              styles.blockedBanner,
              {
                backgroundColor: theme.surfaceTint,
                borderColor: colors.danger + '55',
                borderWidth: 1,
              },
            ]}
            accessibilityRole="alert"
            accessibilityLabel="Día bloqueado"
          >
            <Text style={[styles.blockedBannerText, { color: colors.danger }]}>
              Día bloqueado
            </Text>
          </View>
        ) : null}

        {profile.role === 'empresa' && adminMode && professionals.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <Pressable
              onPress={() => setAdminFilterId(null)}
              style={[
                styles.filterChip,
                adminFilterId === null && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  adminFilterId === null && { color: '#fff' },
                ]}
              >
                Todo el equipo
              </Text>
            </Pressable>
            {professionals
              .filter((p) => p.active)
              .map((p) => {
                const on = adminFilterId === p.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setAdminFilterId(p.id)}
                    style={[
                      styles.filterChip,
                      on && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        on && { color: '#fff' },
                      ]}
                    >
                      {p.name}
                    </Text>
                  </Pressable>
                );
              })}
          </ScrollView>
        ) : null}

        <View style={styles.h1Row}>
          <Text style={styles.h1}>¡Hola, {firstName}!</Text>
          <Sun size={28} color={theme.primary} strokeWidth={2.2} />
        </View>

        <Text style={styles.body}>
          {dayApts.length === 0 ? (
            'No tienes citas programadas para hoy. Tu agenda fluye en balance.'
          ) : (
            <>
              Tienes{' '}
              <Text style={[styles.bodyEmph, { color: theme.primary }]}>
                {dayApts.length}
              </Text>{' '}
              citas programadas para hoy. Tu agenda fluye en balance.
            </>
          )}
        </Text>

        <HoyNextChip appointments={scopedAppointments} services={services} />

        <StatChips
          estimado={estimado}
          pausaLibreMin={pausaLibreMin}
          eficiencia={eficiencia}
        />

        <HoyDaySummary
          appointments={scopedAppointments}
          services={services}
          date={selectedDate}
        />

        <HoyTips />

        <HoyShortcuts />

        <HoyGalleryStrip />

        {/* Week section */}
        <View style={styles.weekHeader}>
          <Text style={styles.sectionTitle}>{monthTitle}</Text>
          <Pressable
            onPress={() => router.push('/agenda')}
            hitSlop={8}
            accessibilityRole="link"
          >
            <Text style={[styles.mesCompleto, { color: theme.primary }]}>
              Mes completo →
            </Text>
          </Pressable>
        </View>
        <WeekCarousel
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          counts={counts}
          anchorDate={selectedDate}
        />

        {/* Cronograma */}
        <View style={styles.cronoHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0, flex: 1 }]}>
            Cronograma del Día
          </Text>
          {remaining > 0 ? (
            <View
              style={[
                styles.restantesBadge,
                { backgroundColor: theme.surfaceTint },
              ]}
            >
              <Text style={[styles.restantesText, { color: theme.primary }]}>
                {remaining} restantes
              </Text>
            </View>
          ) : null}
          <Pressable
            style={styles.tuneBtn}
            accessibilityLabel="Ajustar vista"
            hitSlop={8}
          >
            <SlidersHorizontal
              size={18}
              color={colors.onSurfaceVariant}
              strokeWidth={2.2}
            />
          </Pressable>
        </View>

        <StatusLegend />

        {timelineBooting ? (
          <ListSkeleton rows={4} variant="timeline" />
        ) : dayApts.length === 0 ? (
          <EmptyState
            icon="coffee"
            title="Día libre por ahora"
            subtitle="¿Libre? Agrega la primera cita del día altiro."
            actionLabel="Nueva cita"
            onAction={() => router.push('/nueva-cita')}
          />
        ) : (
          timeline.map((row, idx) => {
            if (row.type === 'break') {
              return (
                <StaggerItem key={`break-${idx}`} index={idx}>
                  <TimelineItem
                    kind="break"
                    time={row.time}
                    label="Almuerzo & Descanso"
                    durationMin={row.durationMin}
                  />
                </StaggerItem>
              );
            }
            const a = row.apt;
            const svc = services.find((s) => s.id === a.serviceId);
            const cli = clients.find((c) => c.id === a.clientId);
            return (
              <StaggerItem key={a.id} index={idx}>
                <TimelineItem
                  time={a.startTime}
                  clientName={cli?.name ?? 'Cliente'}
                  serviceName={svc?.name ?? 'Servicio'}
                  priceClp={svc?.priceClp}
                  durationMin={row.duration}
                  phase={row.phase}
                  endsInMin={row.endsInMin}
                  status={a.status}
                  pending={a.status === 'pendiente'}
                  onPress={() => router.push(`/ticket/${a.id}`)}
                  onManage={() => router.push(`/ticket/${a.id}`)}
                  onRebook={() =>
                    router.push({
                      pathname: '/nueva-cita',
                      params: {
                        serviceId: a.serviceId,
                        clientId: a.clientId,
                      },
                    })
                  }
                  onWhatsApp={() => {
                    const msg = notifyClientMessage({
                      clientName: cli?.name ?? 'Cliente',
                      serviceName: svc?.name ?? 'Servicio',
                      dateLabel: formatLongDate(a.date),
                      time: a.startTime,
                      place: profile.address,
                      code: a.code,
                      businessName: profile.name,
                    });
                    void openWhatsApp(msg, cli?.phone);
                  }}
                  onConfirmWhatsApp={() => {
                    const msg = notifyClientMessage({
                      clientName: cli?.name ?? 'Cliente',
                      serviceName: svc?.name ?? 'Servicio',
                      dateLabel: formatLongDate(a.date),
                      time: a.startTime,
                      place: profile.address,
                      code: a.code,
                      businessName: profile.name,
                    });
                    void openWhatsApp(msg, cli?.phone);
                  }}
                />
              </StaggerItem>
            );
          })
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <AnimatedPressable
        onPress={() => router.push('/nueva-cita')}
        onPressIn={() => {
          fabScale.value = withSpring(0.94, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          fabScale.value = withSpring(1, { damping: 12, stiffness: 300 });
        }}
        style={[fabStyle, styles.fabWrap]}
      >
        <View
          style={[
            styles.fab,
            shadow.fab,
            { backgroundColor: theme.primary },
          ]}
        >
          <Plus size={20} color="#fff" strokeWidth={2.8} />
          <Text style={styles.fabText}>Nueva cita</Text>
        </View>
      </AnimatedPressable>
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
  logo: {
    fontSize: 18,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  logoSub: {
    fontSize: 10,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: c.onSurfaceVariant,
    marginTop: -1,
    letterSpacing: 0.4,
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
    backgroundColor: c.surfaceContainerLow,
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: fonts.bold,
    fontWeight: '700',
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
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: 11,
  },
  contentShell: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
  },
  teamBanner: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 10,
  },
  teamBannerText: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.xs,
  },
  blockedBanner: {
    alignSelf: 'stretch',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    marginBottom: 10,
  },
  blockedBannerText: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: c.outline,
    backgroundColor: c.white,
    marginRight: 0,
  },
  filterChipText: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: 12,
    color: c.onSurface,
  },
  greetingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  ritmoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  ritmoText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
  h1Row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xs,
  },
  h1: {
    fontSize: fontSize.hero,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: c.onSurface,
    letterSpacing: -0.6,
  },
  body: {
    fontSize: fontSize.md,
    fontFamily: fonts.medium,
    fontWeight: '500',
    color: c.onSurfaceVariant,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  bodyEmph: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: c.onSurface,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  mesCompleto: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semibold,
    fontWeight: '600',
  },
  cronoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  restantesBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  restantesText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
  tuneBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surfaceContainerLow,
  },
  fabWrap: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 84,
  },
  fab: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fabText: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
});
}

