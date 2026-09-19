import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FadeInView } from '@/components/motion';
import { FirstCupoChip } from '@/components/FirstCupoChip';
import { SuccessLottie } from '@/components/SuccessLottie';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { DepositInfoCard } from '@/components/DepositInfoCard';
import { DepositFlowMpMock } from '@/components/DepositFlowMpMock';
import { PolicySummaryCard } from '@/components/PolicySummaryCard';
import { TextField } from '@/components/TextField';
import { CoverHero } from '@/components/CoverHero';
import { DateStrip } from '@/components/DateStrip';
import { ServiceMenuCard } from '@/components/ServiceMenuCard';
import { SlotChip } from '@/components/SlotChip';
import { Ticket } from '@/components/Ticket';
import { ToastBanner } from '@/components/ToastBanner';
import {
  findFirstCupoHint,
  firstAvailableSlot,
  formatDateLabel,
  formatLongDate,
  getUpcomingDays,
} from '@/data/slots';
import { localAvailabilitySlots } from '@/lib/fetchAvailability';
import { nicheLabel } from '@/lib/bookingLink';
import { averageRating, starsLabel } from '@/lib/reviews';
import { isSlotFree } from '@/lib/availability';
import { findBookingConflict, formatConflictMessage } from '@/lib/bookingLock';
import { useAvailabilitySlots } from '@/lib/useAvailabilitySlots';
import { notifyClientMessage, openWhatsApp } from '@/lib/whatsapp';
import { offerWaAutoMessage } from '@/lib/waAuto';
import { resolveSuggestedDeposit } from '@/lib/deposit';
import { hapticSuccess } from '@/lib/haptics';
import {
  apiCreateAppointment,
  apiCreateClient,
  apiUpdateClient,
} from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import { useColors, useThemeTokens } from '@/store/useTheme';
import { fontSize, radius, spacing, type AppColors } from '@/theme/colors';

const steps = ['Servicio', 'Profesional', 'Horario', 'Tus datos'];

/**
 * Vista cliente / link público de reserva.
 * Flujo: servicio → pro → horario → datos → ticket.
 * Branding con nombre y tema del negocio.
 */
export default function ReservarScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    serviceId?: string;
    clientId?: string;
    professionalId?: string;
    date?: string;
    time?: string;
    reagendar?: string;
  }>();
  const isReagendar = params.reagendar === '1';
  const theme = useThemeTokens();
  const profile = useAppStore((s) => s.profile);
  const servicesAll = useAppStore((s) => s.services);
  const services = useMemo(() => servicesAll.filter((x) => x.active), [servicesAll]);
  const professionals = useAppStore((s) => s.professionals);
  const appointments = useAppStore((s) => s.appointments);
  const cancellationPolicy = useAppStore((s) => s.cancellationPolicy);
  const storefront = useAppStore((s) => s.storefront);
  const reviewsAll = useAppStore((s) => s.reviews);
  const galleryAll = useAppStore((s) => s.gallery);
  const reviews = useMemo(() => reviewsAll.filter((r) => r.visible), [reviewsAll]);
  const gallery = useMemo(() => galleryAll.filter((g) => g.visible), [galleryAll]);
  const avg = useMemo(() => averageRating(reviews), [reviews]);

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(
    params.serviceId || services[0]?.id || null
  );
  const [professionalId, setProfessionalId] = useState<string | null>(
    params.professionalId || null
  );
  const days = useMemo(
    () => getUpcomingDays(profile.hours, 10, profile.blockedDates),
    [profile.hours, profile.blockedDates]
  );
  const [date, setDate] = useState(params.date || days[0]?.date || '');
  const [time, setTime] = useState(params.time || '');
  const [newName, setNewName] = useState(
    profile.role === 'cliente' ? profile.name : ''
  );
  const [newPhone, setNewPhone] = useState(
    profile.role === 'cliente' && profile.phone ? profile.phone : '+569'
  );
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [conflictBanner, setConflictBanner] = useState<string | null>(null);

  // Prefill from reagendar: jump to horario
  useEffect(() => {
    if (params.serviceId && (params.clientId || isReagendar)) {
      setStep(2);
    }
  }, [params.serviceId, params.clientId, isReagendar]);

  const clients = useAppStore((s) => s.clients);

  const service = services.find((s) => s.id === serviceId);

  const suggestedDeposit = useMemo(
    () => resolveSuggestedDeposit(service, cancellationPolicy),
    [service, cancellationPolicy]
  );
  const serviceDurationMin = useMemo(
    () => (sid: string) =>
      servicesAll.find((s) => s.id === sid)?.durationMin ?? 30,
    [servicesAll]
  );
  const professionalHours = useMemo(() => {
    if (!professionalId) return null;
    const pro = professionals.find((p) => p.id === professionalId);
    if (!pro) return null;
    return { workStart: pro.workStart, workEnd: pro.workEnd };
  }, [professionalId, professionals]);
  const slots = useAvailabilitySlots({
    date,
    hours: profile.hours,
    durationMin: service?.durationMin ?? 30,
    appointments,
    professionalId,
    serviceId,
    businessId: profile.businessId,
    serviceDurationMin,
    professionalHours,
    blockedDates: profile.blockedDates,
    enabled: !!service,
  });
  const first = firstAvailableSlot(slots);
  const morning = slots.filter((s) => s.period === 'morning');
  const afternoon = slots.filter((s) => s.period === 'afternoon');

  const firstCupoHint = useMemo(() => {
    if (!service) return null;
    return findFirstCupoHint(days, (d) =>
      localAvailabilitySlots({
        date: d,
        hours: profile.hours,
        durationMin: service.durationMin,
        appointments,
        professionalId,
        serviceDurationMin,
        professionalHours,
        blockedDates: profile.blockedDates,
      })
    );
  }, [
    service,
    days,
    profile.hours,
    profile.blockedDates,
    appointments,
    professionalId,
    serviceDurationMin,
    professionalHours,
  ]);


  const demoProviderName =
    profile.niche === 'health'
      ? 'Consulta Demo'
      : profile.niche === 'beauty'
        ? 'Salón Demo'
        : 'Barbería Demo';
  const businessName =
    profile.role === 'cliente' ? demoProviderName : profile.name || 'AgendaLibre';

  useEffect(() => {
    if (step === 2 && !time && first) setTime(first);
  }, [step, first, time]);

  const created = useMemo(
    () => appointments.find((a) => a.id === ticketId),
    [appointments, ticketId]
  );

  const canNext = () => {
    if (step === 0) return !!serviceId;
    if (step === 1) return true;
    if (step === 2) return !!date && !!time;
    if (step === 3) return newName.trim().length > 1 && newPhone.trim().length > 5;
    return false;
  };

  const labelConflict = (slotTime: string) => {
    const conflict = findBookingConflict({
      appointments,
      date,
      startTime: slotTime,
      professionalId,
    });
    if (conflict) {
      const cli = clients.find((c) => c.id === conflict.clientId);
      return formatConflictMessage(conflict, cli?.name);
    }
    return 'Ese horario ya está tomado. Elige otro slot.';
  };

  const showTakenFeedback = (slotTime: string, alsoAlert = false) => {
    const msg = labelConflict(slotTime);
    setConflictBanner(msg);
    if (alsoAlert) {
      Alert.alert('Cupo ocupado', msg);
    }
  };

  const confirm = async () => {
    if (!serviceId || !date || !time) return;
    if (
      service &&
      !isSlotFree({
        date,
        startTime: time,
        durationMin: service.durationMin,
        professionalId,
        appointments,
        serviceDurationMin,
      })
    ) {
      showTakenFeedback(time, true);
      return;
    }
    let cid = profile.role === 'cliente' ? profile.linkedClientId ?? null : null;
    if (cid) {
      await apiUpdateClient(cid, {
        name: newName.trim(),
        phone: newPhone.trim(),
      });
      useAppStore.getState().updateProfile({
        name: newName.trim(),
        phone: newPhone.trim(),
      });
    } else {
      const createdClient = await apiCreateClient({
        name: newName.trim(),
        phone: newPhone.trim(),
      });
      cid = createdClient?.id ?? null;
      if (profile.role === 'cliente' && cid) {
        useAppStore.getState().updateProfile({ linkedClientId: cid });
      }
    }
    if (!cid) return;
    const conflict = findBookingConflict({
      appointments,
      date,
      startTime: time,
      professionalId: professionalId,
    });
    if (conflict) {
      const cli = clients.find((c) => c.id === conflict.clientId);
      const msg = formatConflictMessage(conflict, cli?.name);
      setConflictBanner(msg);
      Alert.alert('Cupo ocupado', msg);
      return;
    }
    try {
      const apt = await apiCreateAppointment({
        serviceId,
        professionalId: professionalId,
        clientId: cid,
        date,
        startTime: time,
      });
      void hapticSuccess();
      setTicketId(apt.id);
      {
        const st = useAppStore.getState();
        const cliCreated = st.clients.find((c) => c.id === cid);
        const svcName =
          st.services.find((s) => s.id === serviceId)?.name ?? 'Servicio';
        offerWaAutoMessage('confirm', {
          clientName: (cliCreated?.name ?? st.profile.name) || 'Cliente',
          clientPhone: cliCreated?.phone ?? st.profile.phone,
          serviceName: svcName,
          dateLabel: formatLongDate(apt.date),
          time: apt.startTime,
          place: st.profile.address,
          code: apt.code,
          businessName: st.profile.name,
        });
      }
    } catch (e) {
      Alert.alert(
        'No se pudo agendar',
        e instanceof Error ? e.message : 'Error desconocido'
      );
    }
  };

  if (!profile.onboardingDone) {
    return (
      <SafeAreaView style={styles.safe}>
        <ResponsiveShell forceMax style={{ flex: 1 }}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Agenda no lista</Text>
          <Text style={styles.emptySub}>
            Completa el onboarding para activar el link de reserva demo.
          </Text>
          <Button title="Ir al inicio" onPress={() => router.replace('/')} />
        </View>
        </ResponsiveShell>
      </SafeAreaView>
    );
  }

  if (ticketId && created && service) {
    const cli = useAppStore.getState().clients.find((c) => c.id === created.clientId);
    const pro = professionals.find((p) => p.id === created.professionalId);
    return (
      <SafeAreaView style={styles.safe}>
        <ResponsiveShell forceMax style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <SuccessLottie size={88} style={{ marginBottom: spacing.md }} />
          <Ticket
            code={created.code}
            serviceName={service.name}
            professionalName={pro?.name ?? 'Primer disponible'}
            clientName={cli?.name ?? newName}
            date={created.date}
            startTime={created.startTime}
            durationMin={service.durationMin}
            priceClp={service.priceClp}
            place={profile.address}
            businessName={businessName}
            onWhatsApp={() => {
              const msg = notifyClientMessage({
                clientName: cli?.name ?? newName,
                serviceName: service.name,
                dateLabel: formatLongDate(created.date),
                time: created.startTime,
                place: profile.address,
                code: created.code,
                businessName,
              });
              void openWhatsApp(msg, cli?.phone ?? newPhone);
            }}
            onDone={() => router.replace('/(tabs)')}
          />
          <DepositInfoCard
            deposit={suggestedDeposit}
            style={{ marginTop: spacing.md }}
          />
          <DepositFlowMpMock
            appointmentId={created.id}
            visible={suggestedDeposit.required}
          />
        </ScrollView>
        </ResponsiveShell>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ResponsiveShell forceMax style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <CoverHero
          greeting="Reserva online"
          title={
            profile.role === 'cliente'
              ? storefront.displayName || 'AgendaLibre Demo'
              : profile.name || storefront.displayName || 'AgendaLibre'
          }
          subtitle={
            profile.role === 'cliente'
              ? storefront.bio?.slice(0, 80) || 'Reserva en el proveedor demo sembrado'
              : `${nicheLabel(profile.niche)} · ${profile.address}`
          }
          compact
        />

        {(storefront.bio || avg != null || gallery.length > 0) && step === 0 ? (
          <View style={styles.brandStrip}>
            {storefront.bio ? (
              <Text style={styles.brandBio}>{storefront.bio}</Text>
            ) : null}
            {avg != null ? (
              <Text style={[styles.brandRating, { color: theme.primary }]}>
                {avg}★ · {starsLabel(avg)} · {reviews.length} reseñas
              </Text>
            ) : null}
            {gallery.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galRow}
              >
                {gallery.slice(0, 8).map((g) => (
                  <View
                    key={g.id}
                    style={[styles.galCard, { backgroundColor: g.placeholderColor }]}
                  >
                    <Text style={styles.galEmoji}>{g.emoji}</Text>
                    <Text style={styles.galTitle} numberOfLines={1}>
                      {g.title}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>
        ) : null}

        <View style={styles.steps}>
          {steps.map((label, i) => {
            const active = i === step;
            const done = i < step;
            const fillWidth = done || active ? ('100%' as const) : ('0%' as const);
            return (
              <View key={label} style={styles.stepItem}>
                <View style={styles.stepTrack}>
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: done || active ? theme.primary : colors.border,
                        width: fillWidth,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: active ? colors.text : colors.textMuted,
                      fontWeight: active ? '800' : '600',
                    },
                  ]}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>

        {step === 0 && (
          <FadeInView key="r-step-0" preset="fadeUp" duration={320}>
          <View>
            <Text style={styles.q}>Elige un servicio</Text>
            {services.map((s) => (
              <ServiceMenuCard
                key={s.id}
                name={s.name}
                durationMin={s.durationMin}
                priceClp={s.priceClp}
                selected={serviceId === s.id}
                onPress={() => setServiceId(s.id)}
              />
            ))}
          </View>
          </FadeInView>
        )}

        {step === 1 && (
          <FadeInView key="r-step-1" preset="slideRight" duration={320}>
          <View>
            <Text style={styles.q}>¿Con quién?</Text>
            <Text style={styles.hint}>Opcional — puedes dejar “Primer disponible”</Text>
            <Pressable
              onPress={() => setProfessionalId(null)}
              style={[
                styles.option,
                professionalId === null && {
                  borderColor: theme.primary,
                  backgroundColor: theme.primary + '10',
                },
              ]}
            >
              <Text style={styles.optionTitle}>⚡ Primer disponible</Text>
              <Text style={styles.optionMeta}>Te asignamos el primer cupo libre</Text>
            </Pressable>
            {professionals.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setProfessionalId(p.id)}
                style={[
                  styles.option,
                  professionalId === p.id && {
                    borderColor: theme.primary,
                    backgroundColor: theme.primary + '10',
                  },
                ]}
              >
                <Text style={styles.optionTitle}>{p.name}</Text>
                <Text style={styles.optionMeta}>{p.role}</Text>
              </Pressable>
            ))}
          </View>
          </FadeInView>
        )}

        {step === 2 && (
          <FadeInView key="r-step-2" preset="fadeUp" duration={320}>
          <View>
            <Text style={styles.q}>¿Cuándo te acomoda?</Text>
            {isReagendar ? (
              <View
                style={{
                  marginBottom: 12,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: theme.surfaceTint,
                }}
              >
                <Text style={{ fontWeight: '700', color: theme.primary, fontSize: 14 }}>
                  Reagendar cita
                </Text>
                <Text style={{ marginTop: 4, color: colors.onSurfaceVariant, fontSize: 13 }}>
                  Misma reserva: servicio y pro listos. Elige nueva fecha u hora.
                </Text>
              </View>
            ) : null}
            <ToastBanner
              visible={!!conflictBanner}
              message={conflictBanner ?? ''}
              variant="warning"
              onDismiss={() => setConflictBanner(null)}
            />
            <FirstCupoChip
              hint={firstCupoHint}
              onPress={(h) => {
                setDate(h.date);
                setTime(h.time);
                setConflictBanner(null);
              }}
            />
            <DateStrip
              days={days}
              selectedDate={date}
              onSelect={(d) => {
                setDate(d);
                setTime('');
                setConflictBanner(null);
              }}
            />
            <Text style={styles.period}>Mañana</Text>
            <View style={styles.grid}>
              {morning.map((s) => (
                <SlotChip
                  key={s.time}
                  time={s.time}
                  available={s.available}
                  selected={time === s.time}
                  highlight={s.time === first}
                  grid
                  onPress={() => {
                    setConflictBanner(null);
                    setTime(s.time);
                  }}
                  onUnavailablePress={() => showTakenFeedback(s.time)}
                />
              ))}
            </View>
            <Text style={styles.period}>Tarde</Text>
            <View style={styles.grid}>
              {afternoon.map((s) => (
                <SlotChip
                  key={s.time}
                  time={s.time}
                  available={s.available}
                  selected={time === s.time}
                  highlight={s.time === first}
                  grid
                  onPress={() => {
                    setConflictBanner(null);
                    setTime(s.time);
                  }}
                  onUnavailablePress={() => showTakenFeedback(s.time)}
                />
              ))}
            </View>
            {!first ? (
              <Text style={styles.hint}>No quedan cupos este día. Prueba otro.</Text>
            ) : null}
          </View>
          </FadeInView>
        )}

        {step === 3 && (
          <FadeInView key="r-step-3" preset="fadeUp" duration={320}>
          <View>
            <Text style={styles.q}>Tus datos</Text>
            <ToastBanner
              visible={!!conflictBanner}
              message={conflictBanner ?? ''}
              variant="warning"
              onDismiss={() => setConflictBanner(null)}
            />
            <Text style={styles.hint}>
              {formatDateLabel(date)} · {time} · {service?.name}
            </Text>
            <TextField
              label="Tu nombre"
              placeholder="Ej. Camila Soto"
              value={newName}
              onChangeText={setNewName}
              autoComplete="name"
            />
            <TextField
              label="WhatsApp / teléfono"
              placeholder="+569..."
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <Text style={styles.guestNote}>
              Sin cuenta obligatoria — solo lo necesario para confirmarte.
            </Text>
            <DepositInfoCard
              deposit={suggestedDeposit}
              style={{ marginTop: spacing.md }}
            />
            <PolicySummaryCard
              policy={cancellationPolicy}
              style={{ marginTop: spacing.md }}
            />
          </View>
          </FadeInView>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <View style={styles.footerRow}>
          {step > 0 ? (
            <Button
              title="Atrás"
              variant="ghost"
              gradient={false}
              onPress={() => setStep((s) => s - 1)}
              fullWidth={false}
              style={{ flex: 1 }}
            />
          ) : (
            <Button
              title="Salir"
              variant="ghost"
              gradient={false}
              onPress={() => router.back()}
              fullWidth={false}
              style={{ flex: 1 }}
            />
          )}
          <View style={{ flex: 2 }}>
            {step < 3 ? (
              <Button
                title="Continuar"
                disabled={!canNext()}
                onPress={() => setStep((s) => s + 1)}
              />
            ) : (
              <>
                <DepositInfoCard
                  deposit={suggestedDeposit}
                  style={{ marginBottom: spacing.md }}
                />
                <PolicySummaryCard
                  policy={cancellationPolicy}
                  bulletsOnly
                  style={{ marginBottom: spacing.md }}
                />
                <Button
                  title="Confirmar reserva"
                  disabled={!canNext()}
                  onPress={confirm}
                />
              </>
            )}
          </View>
        </View>
      </View>
      </ResponsiveShell>
    </SafeAreaView>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({

  safe: { flex: 1, backgroundColor: c.cream },
  scroll: { padding: spacing.xl, paddingBottom: 40 },
  emptyWrap: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: c.text,
    textAlign: 'center',
  },
  emptySub: {
    color: c.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  steps: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: 4,
  },
  stepItem: { flex: 1, alignItems: 'center', gap: 6 },
  stepTrack: {
    height: 5,
    width: '100%',
    borderRadius: 3,
    backgroundColor: c.border,
    overflow: 'hidden',
  },
  stepDot: { height: 5, borderRadius: 3 },
  stepLabel: { fontSize: 10, fontWeight: '600' },
  q: { fontSize: 22, fontWeight: '800', color: c.text, marginBottom: spacing.md },
  hint: { color: c.textMuted, marginBottom: spacing.lg },
  option: {
    backgroundColor: c.white,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: c.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 64,
  },
  optionTitle: { fontSize: 16, fontWeight: '700', color: c.text },
  optionMeta: { color: c.textMuted, marginTop: 4 },
  period: {
    fontSize: 14,
    fontWeight: '700',
    color: c.textMuted,
    marginBottom: spacing.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  input: {
    borderWidth: 1.5,
    borderColor: c.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 52,
    color: c.text,
    backgroundColor: c.white,
    marginBottom: spacing.sm,
  },
  guestNote: {
    color: c.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    backgroundColor: c.cream,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  footerRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },

  brandStrip: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  brandBio: {
    fontSize: fontSize.sm + 1,
    color: c.textMuted,
    lineHeight: 20,
  },
  brandRating: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  galRow: { gap: 8, paddingVertical: 4 },
  galCard: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    padding: 8,
    justifyContent: 'flex-end',
    marginRight: 8,
  },
  galEmoji: { fontSize: 22, marginBottom: 4 },
  galTitle: { fontSize: 10, fontWeight: '700', color: '#fff' },
});
}

