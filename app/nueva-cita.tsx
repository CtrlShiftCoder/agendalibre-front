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
import { isSlotFree } from '@/lib/availability';
import { findBookingConflict, formatConflictMessage } from '@/lib/bookingLock';
import { useAvailabilitySlots } from '@/lib/useAvailabilitySlots';
import { notifyClientMessage, openWhatsApp } from '@/lib/whatsapp';
import { offerWaAutoMessage } from '@/lib/waAuto';
import { resolveSuggestedDeposit } from '@/lib/deposit';
import { hapticSuccess } from '@/lib/haptics';
import { apiCreateAppointment, apiCreateClient } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import { useColors, useThemeTokens } from '@/store/useTheme';
import { radius, spacing, type AppColors } from '@/theme/colors';

const steps = ['Servicio', 'Profesional', 'Horario', 'Datos'];

export default function NuevaCitaScreen() {
  const params = useLocalSearchParams<{
    date?: string;
    time?: string;
    serviceId?: string;
    clientId?: string;
    professionalId?: string;
    reagendar?: string;
  }>();
  const isReagendar = params.reagendar === '1';
  const theme = useThemeTokens();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const servicesAll = useAppStore((s) => s.services);
  const services = useMemo(() => servicesAll.filter((x) => x.active), [servicesAll]);
  const professionals = useAppStore((s) => s.professionals);
  const clients = useAppStore((s) => s.clients);
  const appointments = useAppStore((s) => s.appointments);
  const cancellationPolicy = useAppStore((s) => s.cancellationPolicy);

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
  const [clientId, setClientId] = useState<string | null>(params.clientId || null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+569');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [conflictBanner, setConflictBanner] = useState<string | null>(null);


  // Prefill from rebook / reagendar: jump to schedule when service+client given
  useEffect(() => {
    if (params.serviceId && params.clientId) {
      setStep(2);
    }
  }, [params.serviceId, params.clientId]);

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
    if (step === 3) return !!clientId || newName.trim().length > 1;
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
    const svc = services.find((s) => s.id === serviceId);
    if (
      svc &&
      !isSlotFree({
        date,
        startTime: time,
        durationMin: svc.durationMin,
        professionalId,
        appointments,
        serviceDurationMin,
      })
    ) {
      showTakenFeedback(time, true);
      return;
    }
    let cid = clientId;
    if (!cid) {
      const createdClient = await apiCreateClient({
        name: newName.trim(),
        phone: newPhone.trim(),
      });
      cid = createdClient?.id ?? null;
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
          clientName: (cliCreated?.name ?? newName.trim()) || 'Cliente',
          clientPhone: cliCreated?.phone ?? newPhone.trim(),
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
            businessName={profile.name}
            onWhatsApp={() => {
              const msg = notifyClientMessage({
                clientName: cli?.name ?? newName,
                serviceName: service.name,
                dateLabel: formatLongDate(created.date),
                time: created.startTime,
                place: profile.address,
                code: created.code,
                businessName: profile.name,
              });
              void openWhatsApp(msg, cli?.phone);
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
      <View style={styles.topBar}>
        <Pressable onPress={() => (step === 0 ? router.back() : setStep((s) => s - 1))}>
          <Text style={[styles.back, { color: colors.primaryText }]}>
            {step === 0 ? 'Cerrar' : 'Atrás'}
          </Text>
        </Pressable>
        <Text style={styles.topTitle}>{isReagendar ? 'Reagendar' : 'Nueva cita'}</Text>
        <Text style={styles.stepCount}>{step + 1}/4</Text>
      </View>

      <StepProgress step={step} labels={steps} accent={theme.primary} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <FadeInView key="n-step-0" preset="fadeUp" duration={320}>
          <View>
            <Text style={styles.q}>¿Qué servicio?</Text>
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
          <FadeInView key="n-step-1" preset="slideRight" duration={320}>
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
          <FadeInView key="n-step-2" preset="fadeUp" duration={320}>
          <View>
            <Text style={styles.q}>¿Cuándo?</Text>
            {isReagendar ? (
              <View
                style={{
                  marginBottom: 12,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: theme.surfaceTint,
                }}
              >
                <Text
                  style={{
                    fontWeight: '700',
                    color: theme.primary,
                    fontSize: 14,
                  }}
                >
                  Reagendar cita
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    color: colors.onSurfaceVariant,
                    fontSize: 13,
                  }}
                >
                  Traemos servicio, profesional, fecha y hora. Elige el nuevo
                  cupo — se crea una cita nueva (dual-write mock).
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
          <FadeInView key="n-step-3" preset="fadeUp" duration={320}>
          <View>
            <Text style={styles.q}>Datos del cliente</Text>
            <ToastBanner
              visible={!!conflictBanner}
              message={conflictBanner ?? ''}
              variant="warning"
              onDismiss={() => setConflictBanner(null)}
            />
            <Text style={styles.hint}>
              {formatDateLabel(date)} · {time} · {service?.name}
            </Text>
            <DepositInfoCard
              deposit={suggestedDeposit}
              style={{ marginTop: spacing.md, marginBottom: spacing.sm }}
            />
            <PolicySummaryCard
              policy={cancellationPolicy}
              style={{ marginBottom: spacing.md }}
            />

            <Text style={styles.period}>Cliente existente</Text>
            {clients.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => {
                  setClientId(c.id);
                  setNewName('');
                }}
                style={[
                  styles.option,
                  clientId === c.id && {
                    borderColor: theme.primary,
                    backgroundColor: theme.primary + '10',
                  },
                ]}
              >
                <Text style={styles.optionTitle}>{c.name}</Text>
                <Text style={styles.optionMeta}>{c.phone}</Text>
              </Pressable>
            ))}

            <Text style={[styles.period, { marginTop: spacing.lg }]}>O uno nuevo</Text>
            <TextField
              label="Nombre"
              placeholder="Ej. Juan Pérez"
              value={newName}
              onChangeText={(t) => {
                setNewName(t);
                setClientId(null);
              }}
            />
            <TextField
              label="Teléfono"
              placeholder="+569..."
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
            />
          </View>
          </FadeInView>
        )}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        {step < 3 ? (
          <Button
            title="Continuar"
            disabled={!canNext()}
            onPress={() => setStep((s) => s + 1)}
          />
        ) : (
          <Button title="Confirmar cita" disabled={!canNext()} onPress={confirm} />
        )}
      </View>
      </ResponsiveShell>
    </SafeAreaView>
  );
}

function StepProgress({
  step,
  labels,
  accent,
}: {
  step: number;
  labels: string[];
  accent: string;
}) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.steps}>
      {labels.map((label, i) => (
        <StepItem key={label} label={label} index={i} step={step} accent={accent} />
      ))}
    </View>
  );
}

function StepItem({
  label,
  index,
  step,
  accent,
}: {
  label: string;
  index: number;
  step: number;
  accent: string;
}) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const active = index === step;
  const done = index < step;
  // Static width from React state — never animate % with Reanimated
  const fillWidth = done || active ? ('100%' as const) : ('0%' as const);

  return (
    <View style={styles.stepItem}>
      <View style={styles.stepTrack}>
        <View
          style={[
            styles.stepDot,
            { backgroundColor: done || active ? accent : colors.border, width: fillWidth },
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
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.cream },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  back: { fontWeight: '700', fontSize: 16, minWidth: 64 },
  topTitle: { fontWeight: '800', fontSize: 17, color: c.text },
  stepCount: { color: c.textMuted, fontWeight: '600', minWidth: 64, textAlign: 'right' },
  steps: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
  scroll: { padding: spacing.xl, paddingBottom: 120 },
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
});
}

