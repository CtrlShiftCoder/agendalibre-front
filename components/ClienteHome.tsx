import { router } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppointmentCard } from '@/components/AppointmentCard';
import { Button } from '@/components/Button';
import { FirstCupoChip } from '@/components/FirstCupoChip';
import { EmptyState } from '@/components/EmptyState';
import { HoyNextChip } from '@/components/HoyNextChip';
import { HoyShortcuts } from '@/components/HoyShortcuts';
import { Screen } from '@/components/Screen';
import {
  findFirstCupoHint,
  formatLongDate,
  getUpcomingDays,
} from '@/data/slots';
import { localAvailabilitySlots } from '@/lib/fetchAvailability';
import { openWhatsApp } from '@/lib/whatsapp';
import { pendingReviewAppointments } from '@/lib/reviews';
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
 * Inicio del perfil Cliente: próximas citas propias + CTA a /reservar.
 */
export function ClienteHome() {
  const theme = useThemeTokens();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const profile = useAppStore((s) => s.profile);
  const appointments = useAppStore((s) => s.appointments);
  const services = useAppStore((s) => s.services);
  const professionals = useAppStore((s) => s.professionals);
  const linkedClientId = profile.linkedClientId;
  const reviews = useAppStore((s) => s.reviews);

  const myApts = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return appointments
      .filter(
        (a) =>
          a.clientId === linkedClientId &&
          a.status !== 'cancelada' &&
          a.date >= today
      )
      .sort((a, b) =>
        a.date === b.date
          ? a.startTime.localeCompare(b.startTime)
          : a.date.localeCompare(b.date)
      );
  }, [appointments, linkedClientId]);

  const pendingReviews = useMemo(
    () =>
      pendingReviewAppointments({
        appointments,
        reviews,
        linkedClientId,
      }),
    [appointments, reviews, linkedClientId]
  );

  const firstCupoHint = useMemo(() => {
    const active = services.filter((s) => s.active);
    const svc = active[0];
    if (!svc) return null;
    const days = getUpcomingDays(profile.hours, 4, profile.blockedDates);
    return findFirstCupoHint(days, (d) =>
      localAvailabilitySlots({
        date: d,
        hours: profile.hours,
        durationMin: svc.durationMin,
        appointments,
        professionalId: null,
        blockedDates: profile.blockedDates,
      })
    );
  }, [services, profile.hours, profile.blockedDates, appointments]);

  const firstName =
    profile.name.trim().split(/\s+/)[0] || 'hola';

  return (
    <Screen edges={['top']} fade constrainContent>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.brand, { color: colors.primaryText }]}>AgendaLibre</Text>
        <Text style={styles.h1}>¡Hola, {firstName}!</Text>
        <Text style={styles.sub}>Tus próximas reservas</Text>

        <HoyNextChip appointments={myApts} services={services} />

        <HoyShortcuts />

        <FirstCupoChip
          hint={firstCupoHint}
          onPress={(h) =>
            router.push({
              pathname: '/reservar',
              params: { date: h.date, time: h.time },
            } as never)
          }
        />

        <View style={[styles.ctaCard, { borderColor: theme.primary + '33' }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>¿Necesitas una hora?</Text>
            <Text style={styles.ctaSub}>
              Reserva en el demo (barbería / consulta sembrada)
            </Text>
          </View>
          <Button
            title="Reservar"
            onPress={() => router.push('/reservar' as const)}
            fullWidth={false}
            style={{ paddingHorizontal: spacing.lg }}
          />
        </View>


        {pendingReviews.length > 0 ? (
          <View style={[styles.ctaCard, { borderColor: theme.primary + '33', marginBottom: spacing.lg }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>¿Cómo estuvo tu cita?</Text>
              <Text style={styles.ctaSub}>
                Tienes {pendingReviews.length} reseña
                {pendingReviews.length === 1 ? '' : 's'} pendiente
                {pendingReviews.length === 1 ? '' : 's'}
              </Text>
            </View>
            <Button
              title="Dejar reseña"
              onPress={() =>
                router.push(
                  `/resena/${pendingReviews[0].id}` as `/resena/${string}`
                )
              }
              fullWidth={false}
              style={{ paddingHorizontal: spacing.lg }}
            />
          </View>
        ) : null}

        {myApts.length === 0 ? (
          <EmptyState
            icon="calendarHeart"
            title="Aún no tienes reservas"
            subtitle="Cuando reserves una hora, aparece acá. Prueba el flujo demo."
            actionLabel="Reservar ahora"
            onAction={() => router.push('/reservar' as const)}
          />
        ) : (
          myApts.map((a) => {
            const svc = services.find((s) => s.id === a.serviceId);
            const pro = professionals.find((p) => p.id === a.professionalId);
            return (
              <View key={a.id} style={styles.cardWrap}>
                <Text style={styles.dateHint}>{formatLongDate(a.date)}</Text>
                <AppointmentCard
                  time={a.startTime}
                  clientName={profile.name}
                  serviceName={svc?.name ?? 'Servicio'}
                  professionalName={pro?.name ?? profile.name}
                  status={a.status}
                  phone={profile.phone}
                  onPress={() => router.push(`/ticket/${a.id}`)}
                  showRebook
                  onRebook={() => router.push('/reservar' as const)}
                  onWhatsApp={() => {
                    void openWhatsApp(
                      `Hola, soy ${profile.name}. Tengo una reserva ${a.code} el ${formatLongDate(a.date)} a las ${a.startTime}.`,
                      undefined
                    );
                  }}
                />
              </View>
            );
          })
        )}

        {myApts.length === 0 ? (
          <Button
            title="Ir a reservar"
            onPress={() => router.push('/reservar' as const)}
            style={{ marginTop: spacing.lg }}
          />
        ) : (
          <Button
            title="Reservar otra hora"
            variant="secondary"
            onPress={() => router.push('/reservar' as const)}
            style={{ marginTop: spacing.lg }}
          />
        )}

        <View style={styles.hintRow}>
          <MessageCircle size={16} color={colors.textMuted} strokeWidth={2.2} />
          <Text style={styles.hintText}>
            Desde cada cita puedes reabrir el ticket o avisar por WhatsApp.
          </Text>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </Screen>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  scroll: { padding: spacing.xl, paddingBottom: 100 },
  brand: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  h1: {
    fontSize: fontSize.hero - 2,
    fontFamily: fonts.bold,
    fontWeight: '800',
    color: c.onSurface,
    marginTop: spacing.sm,
    letterSpacing: -0.4,
  },
  sub: {
    color: c.onSurfaceVariant,
    marginBottom: spacing.xl,
    marginTop: 4,
    fontFamily: fonts.medium,
    fontWeight: '500',
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: c.surfaceContainerLow,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  ctaTitle: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.md,
    color: c.onSurface,
  },
  ctaSub: {
    marginTop: 2,
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
    fontFamily: fonts.medium,
    fontWeight: '500',
  },
  cardWrap: { marginBottom: spacing.md },
  dateHint: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    color: c.onSurfaceVariant,
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: spacing.lg,
  },
  hintText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: c.textMuted,
    lineHeight: 20,
  },
});
}

