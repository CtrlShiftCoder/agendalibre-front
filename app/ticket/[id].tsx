import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
  CalendarClock,
  CheckCircle2,
  CopyPlus,
  Star,
  UserX,
  XCircle,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { useColors } from '@/store/useTheme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { DepositInfoCard } from '@/components/DepositInfoCard';
import { DepositStatusActions } from '@/components/DepositStatusActions';
import { DepositFlowMpMock } from '@/components/DepositFlowMpMock';
import { Ticket } from '@/components/Ticket';
import { ToastBanner } from '@/components/ToastBanner';
import { formatLongDate } from '@/data/slots';
import {
  depositStatusLabel,
  initialDepositStatus,
  resolveSuggestedDeposit,
} from '@/lib/deposit';
import { Alert } from '@/lib/Alert';
import { hapticSuccess, hapticWarning } from '@/lib/haptics';
import { isProviderRole } from '@/data/types';
import { notifyClientMessage, openWhatsApp } from '@/lib/whatsapp';
import { offerWaAutoMessage } from '@/lib/waAuto';
import {
  apiSetDepositStatus,
  apiUpdateAppointmentStatus,
} from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import { spacing, type AppColors } from '@/theme/colors';

export default function TicketScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const appointments = useAppStore((s) => s.appointments);
  const services = useAppStore((s) => s.services);
  const clients = useAppStore((s) => s.clients);
  const professionals = useAppStore((s) => s.professionals);
  const profile = useAppStore((s) => s.profile);
  const simulateCupo = useAppStore((s) => s.simulateCupoLiberado);
  const reviews = useAppStore((s) => s.reviews);
  const cancellationPolicy = useAppStore((s) => s.cancellationPolicy);
  const depositStatuses = useAppStore((s) => s.depositStatuses);
  const pushPreferences = useAppStore((s) => s.pushPreferences);

  const appointment = React.useMemo(
    () => appointments.find((a) => a.id === id),
    [appointments, id]
  );
  const service = React.useMemo(
    () => services.find((x) => x.id === appointment?.serviceId),
    [services, appointment?.serviceId]
  );
  const suggestedDeposit = React.useMemo(
    () => resolveSuggestedDeposit(service, cancellationPolicy),
    [service, cancellationPolicy]
  );
  const depositStatus = React.useMemo(() => {
    if (!appointment) return suggestedDeposit.status;
    return (
      depositStatuses[appointment.id] ??
      initialDepositStatus(suggestedDeposit.required)
    );
  }, [appointment, depositStatuses, suggestedDeposit]);
  const isProvider = isProviderRole(profile.role);
  const client = React.useMemo(
    () => clients.find((x) => x.id === appointment?.clientId),
    [clients, appointment?.clientId]
  );
  const professional = React.useMemo(
    () => professionals.find((x) => x.id === appointment?.professionalId),
    [professionals, appointment?.professionalId]
  );
  const hasReview = React.useMemo(
    () => reviews.some((r) => r.appointmentId === id),
    [reviews, id]
  );

  const [undoCancelVisible, setUndoCancelVisible] = useState(false);
  const [reviewToastVisible, setReviewToastVisible] = useState(false);

  const dismissUndo = useCallback(() => setUndoCancelVisible(false), []);
  const dismissReviewToast = useCallback(() => setReviewToastVisible(false), []);

  const undoCancel = useCallback(() => {
    if (!appointment) return;
    void apiUpdateAppointmentStatus(appointment.id, 'confirmada');
    setUndoCancelVisible(false);
    void hapticSuccess();
  }, [appointment]);

  if (!appointment || !service) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ title: 'Ticket', headerShown: true }} />
        <ResponsiveShell forceMax style={{ flex: 1, padding: spacing.xl }}>
          <View style={styles.center}>
            <Text style={styles.missing}>No encontramos esta cita</Text>
            <Button title="Volver" onPress={() => router.back()} />
          </View>
        </ResponsiveShell>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: 'Ticket', headerShown: true, headerBackTitle: 'Atrás' }} />
      <ResponsiveShell forceMax style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Ticket
          code={appointment.code}
          serviceName={service.name}
          professionalName={professional?.name ?? 'Primer disponible'}
          clientName={client?.name ?? 'Cliente'}
          date={appointment.date}
          startTime={appointment.startTime}
          durationMin={service.durationMin}
          priceClp={service.priceClp}
          place={profile.address}
          businessName={profile.name}
          createdAt={appointment.createdAt}
          onWhatsApp={() => {
            const msg = notifyClientMessage({
              clientName: client?.name ?? 'Cliente',
              serviceName: service.name,
              dateLabel: formatLongDate(appointment.date),
              time: appointment.startTime,
              place: profile.address,
              code: appointment.code,
              businessName: profile.name,
            });
            void openWhatsApp(msg, client?.phone);
          }}
          onDone={() => router.back()}
        />

        <DepositInfoCard
          deposit={suggestedDeposit}
          style={{ marginTop: spacing.md }}
        />
        {suggestedDeposit.required && isProvider ? (
          <DepositStatusActions
            status={
              depositStatus === 'not_required' || depositStatus === 'refunded'
                ? 'pending'
                : depositStatus
            }
            onChange={(next) => {
              void apiSetDepositStatus(appointment.id, next);
              void hapticSuccess();
            }}
          />
        ) : suggestedDeposit.required ? (
          <Text style={styles.depositStatusHint}>
            Estado seña: {depositStatusLabel(depositStatus)}
          </Text>
        ) : null}

        <DepositFlowMpMock
          appointmentId={appointment.id}
          visible={suggestedDeposit.required}
        />

        <ToastBanner
          visible={undoCancelVisible}
          message="Cita cancelada"
          actionLabel="Deshacer"
          onAction={undoCancel}
          onDismiss={dismissUndo}
          autoHideMs={5000}
          variant="danger"
        />

        <ToastBanner
          visible={reviewToastVisible}
          message={
            profile.role === 'cliente'
              ? '¿Cómo estuvo tu cita?'
              : 'Se pidió reseña'
          }
          actionLabel={
            profile.role === 'cliente' &&
            profile.linkedClientId === appointment.clientId
              ? 'Pedir reseña'
              : undefined
          }
          onAction={
            profile.role === 'cliente' &&
            profile.linkedClientId === appointment.clientId
              ? () => {
                  setReviewToastVisible(false);
                  router.push(`/resena/${appointment.id}` as never);
                }
              : undefined
          }
          onDismiss={dismissReviewToast}
          autoHideMs={profile.role === 'cliente' ? 8000 : 5000}
          variant="success"
        />

        <Button
          title="Reagendar"
          icon={<CalendarClock size={18} color="#fff" strokeWidth={2.4} />}
          style={{ marginTop: spacing.md }}
          onPress={() => {
            const params: Record<string, string> = {
              serviceId: appointment.serviceId,
              clientId: appointment.clientId,
              date: appointment.date,
              time: appointment.startTime,
              reagendar: '1',
            };
            if (appointment.professionalId) {
              params.professionalId = appointment.professionalId;
            }
            if (profile.role === 'cliente') {
              router.push({ pathname: '/reservar', params } as never);
            } else {
              router.push({ pathname: '/nueva-cita', params } as never);
            }
          }}
        />
        <Text style={styles.reagendarHint}>
          1 tap: lleva servicio, pro, fecha y hora — elige el nuevo cupo.
        </Text>
        <Button
          title="Repetir en nueva cita"
          variant="secondary"
          gradient={false}
          icon={<CopyPlus size={18} color={colors.primaryText} strokeWidth={2.4} />}
          style={{ marginTop: spacing.sm }}
          onPress={() =>
            router.push({
              pathname: '/nueva-cita',
              params: {
                serviceId: appointment.serviceId,
                clientId: appointment.clientId,
                ...(appointment.professionalId
                  ? { professionalId: appointment.professionalId }
                  : {}),
              },
            })
          }
        />


        {appointment.status === 'completada' &&
        profile.role === 'cliente' &&
        profile.linkedClientId === appointment.clientId &&
        !hasReview ? (
          <Button
            title="Dejar reseña"
            icon={<Star size={18} color="#fff" strokeWidth={2.4} />}
            style={{ marginTop: spacing.md }}
            onPress={() =>
              router.push(`/resena/${appointment.id}` as never)
            }
          />
        ) : null}

        {appointment.status !== 'cancelada' &&
        appointment.status !== 'completada' &&
        appointment.status !== 'noshow' ? (
          <>
            <Button
              title="Marcar completada"
              variant="secondary"
              icon={<CheckCircle2 size={18} color={colors.primaryText} strokeWidth={2.4} />}
              style={{ marginTop: spacing.md }}
              onPress={() => {
                void hapticSuccess();
                void apiUpdateAppointmentStatus(appointment.id, 'completada');
                const wantReview =
                  pushPreferences.reviewRequest &&
                  !reviews.some((r) => r.appointmentId === appointment.id);
                if (wantReview) {
                  setUndoCancelVisible(false);
                  setReviewToastVisible(true);
                } else {
                  router.back();
                }
              }}
            />
            <Button
              title="Marcar no-show"
              variant="secondary"
              icon={<UserX size={18} color={colors.primaryText} strokeWidth={2.4} />}
              style={{ marginTop: spacing.sm }}
              onPress={() =>
                Alert.alert(
                  '¿No-show?',
                  'Suma al contador de riesgo del cliente.',
                  [
                    { text: 'No', style: 'cancel' },
                    {
                      text: 'Sí, no-show',
                      style: 'destructive',
                      onPress: () => {
                        void hapticWarning();
                        void apiUpdateAppointmentStatus(appointment.id, 'noshow');
                        offerWaAutoMessage('noshow_followup', {
                          clientName: client?.name ?? 'Cliente',
                          clientPhone: client?.phone,
                          serviceName: service.name,
                          dateLabel: formatLongDate(appointment.date),
                          time: appointment.startTime,
                          place: profile.address,
                          code: appointment.code,
                          businessName: profile.name,
                        });
                        router.back();
                      },
                    },
                  ]
                )
              }
            />
            <Button
              title="Cancelar cita"
              variant="danger"
              icon={<XCircle size={18} color="#fff" strokeWidth={2.4} />}
              style={{ marginTop: spacing.lg }}
              onPress={() =>
                Alert.confirm(
                  '¿Cancelar esta cita?',
                  'El cliente verá el estado cancelado. Podrás deshacer unos segundos.',
                  () => {
                    void hapticWarning();
                    void apiUpdateAppointmentStatus(appointment.id, 'cancelada');
                    setUndoCancelVisible(true);
                  },
                  { confirmText: 'Sí, cancelar', cancelText: 'No' }
                )
              }
            />
          </>
        ) : null}

        {(appointment.status === 'cancelada' ||
          appointment.status === 'noshow') && (
          <Button
            title="Simular aviso cupo liberado"
            variant="secondary"
            style={{ marginTop: spacing.lg }}
            onPress={() => {
              const r = simulateCupo(appointment.id);
              const waitMsg = r.notified
                ? `Avisamos a ${r.notified} en lista de espera` +
                  (r.topClientName ? ` (prioridad: ${r.topClientName})` : '')
                : 'No hay nadie en espera que calce con este cupo.';
              Alert.alert('Cupo liberado', waitMsg, [
                { text: 'OK', style: 'cancel' },
                ...(r.notified
                  ? [
                      {
                        text: 'Mensaje WA listo',
                        onPress: () => {
                          const top = useAppStore
                            .getState()
                            .waitlist.find(
                              (w) =>
                                w.status === 'notified' ||
                                w.clientName === r.topClientName
                            );
                          offerWaAutoMessage('cupo_liberado', {
                            clientName:
                              r.topClientName ?? top?.clientName ?? 'Cliente',
                            clientPhone: top?.clientPhone,
                            serviceName: service.name,
                            dateLabel: formatLongDate(appointment.date),
                            time: appointment.startTime,
                            place: profile.address,
                            code: appointment.code,
                            businessName: profile.name,
                          });
                        },
                      },
                    ]
                  : []),
              ]);
            }}
          />
        )}
      </ScrollView>
      </ResponsiveShell>
    </SafeAreaView>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.cream },
  scroll: { padding: spacing.xl },
  center: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  missing: { fontSize: 17, fontWeight: '700', textAlign: 'center', color: c.text },
  depositStatusHint: {
    marginTop: spacing.sm,
    fontSize: 13,
    fontWeight: '600',
    color: c.textMuted,
  },
  reagendarHint: {
    marginTop: 6,
    marginBottom: spacing.sm,
    fontSize: 12,
    fontWeight: '500',
    color: c.textMuted,
    textAlign: 'center',
  },
});
}

