import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native';
import { Screen } from '@/components/Screen';

import { AppointmentCard } from '@/components/AppointmentCard';
import { StaggerItem } from '@/components/motion';
import { DateStrip } from '@/components/DateStrip';
import { EmptyState } from '@/components/EmptyState';
import { ListSkeleton, useListBoot } from '@/components/Skeleton';
import { SectionHeader } from '@/components/SectionHeader';
import { StatusLegend } from '@/components/StatusLegend';
import { SlotChip } from '@/components/SlotChip';
import { WeekDenseView } from '@/components/WeekDenseView';
import {
  firstAvailableSlot,
  formatDateLabel,
  getUpcomingDays,
} from '@/data/slots';
import { isDateBlocked } from '@/lib/availability';
import { CHILE_TIMEZONE } from '@/lib/chileTime';
import { useAvailabilitySlots } from '@/lib/useAvailabilitySlots';
import {
  filterAppointmentsForActivePro,
  getActiveProfessional,
  isEmpresaAdmin,
} from '@/lib/team';
import { useAppStore } from '@/store/useAppStore';
import { useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

type AgendaMode = 'lista' | 'semana';

export default function AgendaScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const booting = useListBoot(280);
  const profile = useAppStore((s) => s.profile);
  const appointmentsRaw = useAppStore((s) => s.appointments);
  const services = useAppStore((s) => s.services);
  const clients = useAppStore((s) => s.clients);
  const professionals = useAppStore((s) => s.professionals);

  const days = useMemo(() => getUpcomingDays(profile.hours, 10), [profile.hours]);
  const [selectedDate, setSelectedDate] = useState(days[0]?.date ?? '');
  const [adminFilterId, setAdminFilterId] = useState<string | null>(null);
  const [mode, setMode] = useState<AgendaMode>('lista');

  const teamState = useMemo(
    () => ({ profile, professionals }),
    [profile, professionals]
  );
  const activePro = useMemo(
    () => getActiveProfessional(teamState),
    [teamState]
  );
  const adminMode = isEmpresaAdmin(teamState);
  const appointments = useMemo(
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

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of appointments) {
      if (a.status === 'cancelada') continue;
      map[a.date] = (map[a.date] ?? 0) + 1;
    }
    return map;
  }, [appointments]);

  const dayApts = appointments
    .filter((a) => a.date === selectedDate && a.status !== 'cancelada')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const weekMinis = useMemo(
    () =>
      appointments
        .filter((a) => a.status !== 'cancelada')
        .map((a) => ({
          id: a.id,
          date: a.date,
          startTime: a.startTime,
          clientName: clients.find((c) => c.id === a.clientId)?.name,
        })),
    [appointments, clients]
  );

  const defaultDuration = services.find((s) => s.active)?.durationMin ?? 30;
  const serviceDurationMin = useMemo(
    () => (sid: string) =>
      services.find((s) => s.id === sid)?.durationMin ?? 30,
    [services]
  );
  const slotProId = adminMode
    ? adminFilterId
    : activePro?.teamRole === 'trabajador'
      ? activePro.id
      : null;
  const professionalHours = useMemo(() => {
    if (!slotProId) return null;
    const pro = professionals.find((p) => p.id === slotProId);
    if (!pro) return null;
    return { workStart: pro.workStart, workEnd: pro.workEnd };
  }, [slotProId, professionals]);
  const dayBlocked = isDateBlocked(selectedDate, profile.blockedDates);
  const slots = useAvailabilitySlots({
    date: selectedDate,
    hours: profile.hours,
    durationMin: defaultDuration,
    appointments,
    professionalId: slotProId,
    businessId: profile.businessId,
    serviceDurationMin,
    professionalHours,
    blockedDates: profile.blockedDates,
  });
  const first = firstAvailableSlot(slots);
  const morning = slots.filter((s) => s.period === 'morning');
  const afternoon = slots.filter((s) => s.period === 'afternoon');

  return (
    <Screen edges={['top']} fade padded={false} constrainContent>
      <ScrollView contentContainerStyle={[styles.scroll, { width: '100%', alignItems: 'stretch' }]} style={{ flex: 1 }}>
        <Text style={styles.title}>Agenda</Text>
        <Text style={styles.sub}>Próximos días con cupos — sin grilla mensual</Text>
        <Text style={styles.tzHint}>
          Horario Chile · {profile.hours.open}–{profile.hours.close} · {CHILE_TIMEZONE}
        </Text>

        <View style={styles.modeToggle}>
          <Pressable
            onPress={() => setMode('lista')}
            style={[
              styles.modeChip,
              mode === 'lista' && {
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'lista' }}
            accessibilityLabel="Vista lista"
          >
            <Text
              style={[
                styles.modeChipText,
                mode === 'lista' && { color: theme.onPrimary },
              ]}
            >
              Lista
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('semana')}
            style={[
              styles.modeChip,
              mode === 'semana' && {
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'semana' }}
            accessibilityLabel="Vista semana"
          >
            <Text
              style={[
                styles.modeChipText,
                mode === 'semana' && { color: theme.onPrimary },
              ]}
            >
              Semana
            </Text>
          </Pressable>
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
              { backgroundColor: theme.surfaceTint, borderColor: colors.danger + '55', borderWidth: 1 },
            ]}
            accessibilityRole="alert"
            accessibilityLabel="Día bloqueado"
          >
            <Text
              style={[
                styles.blockedBannerText,
                { color: colors.danger },
              ]}
            >
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

        {mode === 'lista' ? (
          <DateStrip
            days={days}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            counts={counts}
          />
        ) : (
          <WeekDenseView
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            appointments={weekMinis}
            counts={counts}
            anchorDate={selectedDate || days[0]?.date}
          />
        )}

        {mode === 'lista' ? (
          <>
            <SectionHeader
              title={`Cupos · ${formatDateLabel(selectedDate)}`}
              subtitle={first ? `Primer disponible: ${first}` : 'Sin cupos libres'}
            />

            <Text style={styles.period}>Mañana</Text>
            <View style={styles.grid}>
              {morning.length === 0 ? (
                <Text style={styles.emptyHint}>Sin horarios en la mañana</Text>
              ) : (
                morning.map((s) => (
                  <SlotChip
                    key={s.time}
                    time={s.time}
                    available={s.available}
                    highlight={s.time === first}
                    grid
                    onPress={() =>
                      router.push({
                        pathname: '/nueva-cita',
                        params: { date: selectedDate, time: s.time },
                      })
                    }
                  />
                ))
              )}
            </View>

            <Text style={styles.period}>Tarde</Text>
            <View style={styles.grid}>
              {afternoon.length === 0 ? (
                <Text style={styles.emptyHint}>Sin horarios en la tarde</Text>
              ) : (
                afternoon.map((s) => (
                  <SlotChip
                    key={s.time}
                    time={s.time}
                    available={s.available}
                    highlight={s.time === first}
                    grid
                    onPress={() =>
                      router.push({
                        pathname: '/nueva-cita',
                        params: { date: selectedDate, time: s.time },
                      })
                    }
                  />
                ))
              )}
            </View>
          </>
        ) : null}

        <SectionHeader
          title={
            mode === 'semana'
              ? `Citas · ${formatDateLabel(selectedDate)}`
              : 'Citas del día'
          }
        />
        <StatusLegend />
        {booting ? (
          <ListSkeleton rows={3} variant="card" />
        ) : dayApts.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Nadie agendado este día"
            subtitle="Toca un cupo libre o crea una cita en segundos."
            actionLabel="Nueva cita"
            onAction={() => router.push('/nueva-cita')}
          />
        ) : (
          dayApts.map((a, i) => {
            const svc = services.find((s) => s.id === a.serviceId);
            const cli = clients.find((c) => c.id === a.clientId);
            const pro = professionals.find((p) => p.id === a.professionalId);
            return (
              <StaggerItem key={a.id} index={i}>
                <AppointmentCard
                  time={a.startTime}
                  clientName={cli?.name ?? 'Cliente'}
                  serviceName={svc?.name ?? 'Servicio'}
                  professionalName={pro?.name ?? 'Primer disponible'}
                  status={a.status}
                  onPress={() => router.push(`/ticket/${a.id}`)}
                />
              </StaggerItem>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.cream },
  scroll: { padding: spacing.xl, paddingBottom: 100 },
  title: {
    fontSize: fontSize.hero,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: c.text,
    letterSpacing: -0.5,
  },
  sub: {
    color: c.textMuted,
    marginBottom: spacing.xs,
    marginTop: 4,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: fontSize.sm,
  },
  tzHint: {
    color: c.textMuted,
    marginBottom: spacing.md,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: fontSize.xs,
  },
  modeToggle: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: spacing.md,
  },
  modeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: c.outline,
    backgroundColor: c.white,
  },
  modeChipText: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.xs,
    color: c.onSurface,
  },
  teamBanner: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: c.outline,
    backgroundColor: c.white,
  },
  filterChipText: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: 12,
    color: c.onSurface,
  },
  period: {
    fontSize: 14,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: c.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  emptyHint: {
    color: c.textMuted,
    marginBottom: spacing.md,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: fontSize.sm,
  },
});
}
