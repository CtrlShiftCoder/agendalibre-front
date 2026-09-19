import { Stack, router } from 'expo-router';
import { ArrowLeft, ListOrdered } from 'lucide-react-native';
import React, {useMemo, useState} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ListSkeleton, useListBoot } from '@/components/Skeleton';
import { FadeInView, StaggerItem } from '@/components/motion';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { TextField } from '@/components/TextField';
import type { WaitlistPeriod } from '@/contracts';
import { canAccess, screenAccess } from '@/lib/access';
import { relativeTime } from '@/lib/relativeTime';
import { scheduleLocal } from '@/lib/notifications';
import { openWhatsApp } from '@/lib/whatsapp';
import { apiAddWaitlist, apiSetWaitlistStatus } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import {useThemeTokens, useColors} from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

/** Rough ETA preference shown in chips + list (Chile copy). */
const PERIOD_LABEL: Record<WaitlistPeriod, string> = {
  morning: 'Mañana AM',
  afternoon: 'Tarde',
  any: 'Cualquiera',
};

export default function ListaEsperaScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const booting = useListBoot();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const services = useAppStore((s) => s.services);
  const waitlist = useAppStore((s) => s.waitlist);
  const addNotification = useAppStore((s) => s.addNotification);

  const state = useMemo(
    () => ({ profile, professionals }),
    [profile, professionals]
  );
  const access = screenAccess('listaEspera', state);
  const canManage = access === 'manage';
  const canJoin = access === 'join';
  const canClaim = access === 'claim' || canManage;
  const allowed = canAccess('listaEspera', state);

  const [name, setName] = useState(
    profile.role === 'cliente' ? profile.name : ''
  );
  const [phone, setPhone] = useState(
    profile.role === 'cliente' ? profile.phone ?? '+569' : '+569'
  );
  const [period, setPeriod] = useState<WaitlistPeriod>('any');
  const [notes, setNotes] = useState('');

  const active = useMemo(
    () =>
      waitlist
        .filter((w) => w.status === 'waiting' || w.status === 'notified')
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [waitlist]
  );

  const join = () => {
    if (!canJoin && !canManage) return;
    if (!name.trim() || phone.trim().length < 6) {
      Alert.alert('Datos incompletos', 'Nombre y teléfono son obligatorios.');
      return;
    }
    const clientId =
      profile.linkedClientId ??
      useAppStore.getState().clients.find((c) => c.phone === phone.trim())?.id ??
      `guest_${Date.now()}`;
    void apiAddWaitlist({
      clientId,
      clientName: name.trim(),
      clientPhone: phone.trim(),
      preferredPeriod: period,
      notes: notes.trim() || undefined,
    });
    setNotes('');
    Alert.alert('Listo', 'Quedaste en la lista de espera.');
  };

  const waitlistCupoMessage = (clientName: string) => {
    const biz = profile.name || 'nuestro local';
    return `Hola ${clientName}! Se liberó un cupo en ${biz}. ¿Quieres tomarlo? Responde YA.`;
  };

  const notify = (id: string, clientName: string, clientPhone: string) => {
    const msg = waitlistCupoMessage(clientName);
    Alert.alert('Vista previa WhatsApp', msg, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Enviar',
        onPress: () => {
          void apiSetWaitlistStatus(id, 'notified');
          void openWhatsApp(msg, clientPhone);
        },
      },
    ]);
  };

  /** Provider simulator: preview WA → confirm → notify waiting + inbox */
  const simulateSlotFreed = () => {
    if (!canManage) return;
    const waiting = [...waitlist]
      .filter((w) => w.status === 'waiting')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (waiting.length === 0) {
      Alert.alert('Lista vacía', 'No hay personas en espera para avisar.');
      return;
    }
    const first = waiting[0];
    const msg = waitlistCupoMessage(first.clientName);
    const preview =
      waiting.length > 1
        ? `${msg}\n\n(+${waiting.length - 1} más en cola · se marcan avisadas)`
        : msg;
    Alert.alert('Vista previa WhatsApp', preview, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Enviar',
        onPress: () => {
          const biz = profile.name || 'nuestro local';
          for (const w of waiting) {
            void apiSetWaitlistStatus(w.id, 'notified');
          }
          void openWhatsApp(msg, first.clientPhone);
          const body = `Se liberó un cupo en ${biz}. Avisamos a ${waiting.length} persona(s) en lista de espera.`;
          addNotification({
            userRoleTarget: 'all',
            title: 'Se liberó un cupo',
            body,
            kind: 'waitlist',
          });
          void scheduleLocal({ title: 'Se liberó un cupo', body, seconds: 2 });
        },
      },
    ]);
  };

  if (!allowed) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ResponsiveShell style={{ flex: 1, padding: spacing.xl }}>
          <Text style={styles.title}>Sin acceso</Text>
          <Button title="Volver" onPress={() => router.back()} />
        </ResponsiveShell>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ResponsiveShell style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <FadeInView>
            <Pressable onPress={() => router.back()} style={styles.backRow}>
              <ArrowLeft size={20} color={colors.onSurface} strokeWidth={2.4} />
              <Text style={styles.backText}>Volver</Text>
            </Pressable>

            <View style={styles.headerRow}>
              <View style={[styles.headerIcon, { backgroundColor: theme.primary }]}>
                <ListOrdered size={20} color="#fff" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Lista de espera</Text>
                <Text style={styles.sub}>
                  {canJoin
                    ? 'Únete si no hay cupos'
                    : canManage
                      ? 'Gestiona y avisa por WhatsApp'
                      : 'Revisa y reclama cupos liberados'}
                </Text>
              </View>
            </View>

            {canManage && profile.role !== 'cliente' ? (
              <Button
                title="Se liberó un cupo (simular)"
                variant="secondary"
                onPress={simulateSlotFreed}
                style={{ marginBottom: spacing.md }}
              />
            ) : null}

            {canJoin ? (
              <Card style={styles.joinCard} elevated>
                <Text style={styles.sectionTitle}>Unirme a la lista</Text>
                <TextField label="Nombre" value={name} onChangeText={setName} />
                <TextField
                  label="Teléfono"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <Text style={styles.fieldLabel}>Preferencia / ETA</Text>
                <View style={styles.chips}>
                  {(Object.keys(PERIOD_LABEL) as WaitlistPeriod[]).map((p) => {
                    const on = period === p;
                    return (
                      <Pressable
                        key={p}
                        onPress={() => setPeriod(p)}
                        style={[
                          styles.chip,
                          on && {
                            backgroundColor: theme.primary,
                            borderColor: theme.primary,
                          },
                        ]}
                      >
                        <Text style={[styles.chipText, on && { color: '#fff' }]}>
                          {PERIOD_LABEL[p]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <TextField
                  label="Notas (opcional)"
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Ej. solo sábados"
                />
                <Button title="Unirme" onPress={join} />
              </Card>
            ) : null}

            {canManage && profile.role !== 'cliente' ? (
              <Card style={styles.joinCard} elevated>
                <Text style={styles.sectionTitle}>Agregar a la lista</Text>
                <TextField label="Nombre" value={name} onChangeText={setName} placeholder="Cliente" />
                <TextField
                  label="Teléfono"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <Text style={styles.fieldLabel}>Preferencia / ETA</Text>
                <View style={styles.chips}>
                  {(Object.keys(PERIOD_LABEL) as WaitlistPeriod[]).map((p) => {
                    const on = period === p;
                    return (
                      <Pressable
                        key={p}
                        onPress={() => setPeriod(p)}
                        style={[
                          styles.chip,
                          on && {
                            backgroundColor: theme.primary,
                            borderColor: theme.primary,
                          },
                        ]}
                      >
                        <Text style={[styles.chipText, on && { color: '#fff' }]}>
                          {PERIOD_LABEL[p]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Button title="Agregar" onPress={join} />
              </Card>
            ) : null}

            {booting ? (
              <ListSkeleton rows={3} variant="card" />
            ) : active.length === 0 ? (
              <EmptyState
                icon="list"
                title="Lista vacía"
                subtitle="Cuando alguien se una o liberes un cupo, avísale por WhatsApp."
              />
            ) : (
              active.map((w, i) => {
                const svc = services.find((s) => s.id === w.serviceId);
                return (
                  <StaggerItem key={w.id} index={i}>
                    <Card style={styles.item} elevated>
                      <View style={styles.itemTop}>
                        <Text style={styles.itemName}>{w.clientName}</Text>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor:
                                w.status === 'notified'
                                  ? theme.surfaceTint
                                  : colors.surfaceContainer,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              {
                                color:
                                  w.status === 'notified'
                                    ? colors.primaryText
                                    : colors.onSurfaceVariant,
                              },
                            ]}
                          >
                            {w.status === 'notified' ? 'Avisado' : 'Esperando'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.itemMeta}>
                        {w.clientPhone}
                        {svc ? ` · ${svc.name}` : ''}
                        {' · '}
                        {relativeTime(w.createdAt)}
                      </Text>
                      <Text style={styles.etaText}>
                        ETA ~ {PERIOD_LABEL[w.preferredPeriod]}
                      </Text>
                      {w.notes ? (
                        <Text style={styles.itemNotes}>{w.notes}</Text>
                      ) : null}
                      {canClaim ? (
                        <View style={styles.actions}>
                          <Button
                            title="Avisar WA"
                            fullWidth={false}
                            style={{ flex: 1 }}
                            onPress={() =>
                              notify(w.id, w.clientName, w.clientPhone)
                            }
                          />
                          {canManage ? (
                            <>
                              <Button
                                title="Agendó"
                                variant="secondary"
                                fullWidth={false}
                                style={{ flex: 1 }}
                                onPress={() => void apiSetWaitlistStatus(w.id, 'booked')}
                              />
                              <Pressable
                                onPress={() =>
                                  void apiSetWaitlistStatus(w.id, 'cancelled')
                                }
                                style={styles.cancelBtn}
                              >
                                <Text style={styles.cancelText}>Quitar</Text>
                              </Pressable>
                            </>
                          ) : (
                            <Button
                              title="Reclamar"
                              variant="secondary"
                              fullWidth={false}
                              style={{ flex: 1 }}
                              onPress={() => {
                                void apiSetWaitlistStatus(w.id, 'booked');
                                Alert.alert(
                                  'Cupo reclamado',
                                  'Marcado como agendado. Crea la cita en Nueva cita.'
                                );
                              }}
                            />
                          )}
                        </View>
                      ) : null}
                    </Card>
                  </StaggerItem>
                );
              })
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
  headerRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: 22,
    color: c.onSurface,
  },
  sub: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  joinCard: { marginBottom: spacing.lg, gap: 4 },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
    color: c.onSurface,
  },
  fieldLabel: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.xs,
    color: c.onSurfaceVariant,
    marginBottom: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.white,
    minHeight: 44,
  },
  chipText: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  item: { marginBottom: spacing.md },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemName: {
    flex: 1,
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.md,
    color: c.onSurface,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  itemMeta: {
    marginTop: 4,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  itemNotes: {
    marginTop: 6,
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: c.placeholder,
  },
  etaText: {
    marginTop: 6,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
    color: c.primaryText,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  cancelBtn: { paddingHorizontal: 12, minHeight: 44, justifyContent: 'center' },
  cancelText: {
    color: c.danger,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
});
}

