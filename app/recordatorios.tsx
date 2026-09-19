import { Stack, router } from 'expo-router';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react-native';
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
import { FadeInView } from '@/components/motion';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { TextField } from '@/components/TextField';
import type { ReminderTemplate } from '@/contracts';
import { formatLongDate } from '@/data/slots';
import { canAccess, isEmpresaAdmin } from '@/lib/access';
import { scheduleLocal } from '@/lib/notifications';
import { fillReminderTemplate } from '@/lib/reminders';
import { filterAppointmentsForActivePro } from '@/lib/team';
import { openWhatsApp } from '@/lib/whatsapp';
import { apiUpdateReminderTemplate } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import {useThemeTokens, useColors} from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

const KIND_LABEL: Record<ReminderTemplate['kind'], string> = {
  confirm: 'Confirmación',
  reminder_24h: 'Recordatorio 24h',
  reminder_2h: 'Recordatorio 2h',
  noshow_followup: 'Seguimiento no-show',
};

export default function RecordatoriosScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const appointments = useAppStore((s) => s.appointments);
  const clients = useAppStore((s) => s.clients);
  const services = useAppStore((s) => s.services);
  const templates = useAppStore((s) => s.reminderTemplates);

  const state = useMemo(
    () => ({ profile, professionals }),
    [profile, professionals]
  );
  const allowed = canAccess('recordatorios', state);
  const admin = isEmpresaAdmin(state);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let list = appointments.filter(
      (a) => a.date >= today && a.status !== 'cancelada' && a.status !== 'noshow'
    );
    if (profile.role === 'empresa' && !admin) {
      list = filterAppointmentsForActivePro(state, list);
    }
    return list
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
      )
      .slice(0, 8);
  }, [appointments, profile.role, admin, state]);

  const sendWithTemplate = (tpl: ReminderTemplate, aptId?: string) => {
    const apt = aptId
      ? appointments.find((a) => a.id === aptId)
      : upcoming[0];
    if (!apt) {
      void openWhatsApp(
        fillReminderTemplate(tpl.body, {
          name: 'cliente',
          time: '10:00',
          service: 'servicio',
          date: 'mañana',
          place: profile.address,
          code: 'AL-XXXX',
          business: profile.name || 'AgendaLibre',
        })
      );
      return;
    }
    const cli = clients.find((c) => c.id === apt.clientId);
    const svc = services.find((s) => s.id === apt.serviceId);
    const msg = fillReminderTemplate(tpl.body, {
      name: cli?.name ?? 'cliente',
      time: apt.startTime,
      service: svc?.name ?? 'servicio',
      date: formatLongDate(apt.date),
      place: profile.address,
      code: apt.code,
      business: profile.name || 'AgendaLibre',
    });
    void openWhatsApp(msg, cli?.phone);
    const title =
      tpl.kind === 'confirm'
        ? 'Confirmación enviada'
        : tpl.kind === 'reminder_24h'
          ? 'Recordatorio 24 h'
          : tpl.kind === 'reminder_2h'
            ? 'Recordatorio 2 h'
            : 'Seguimiento';
    void scheduleLocal({ title, body: msg.slice(0, 120), seconds: 2 });
    const addNotification = useAppStore.getState().addNotification;
    const prefs = useAppStore.getState().pushPreferences;
    const kind =
      tpl.kind === 'reminder_24h'
        ? 'reminder_24h'
        : tpl.kind === 'reminder_2h'
          ? 'reminder_2h'
          : tpl.kind === 'confirm'
            ? 'booking_confirm'
            : 'generic';
    const prefOk =
      kind === 'reminder_24h'
        ? prefs.reminder24h
        : kind === 'reminder_2h'
          ? prefs.reminder2h
          : kind === 'booking_confirm'
            ? prefs.bookingConfirm
            : true;
    if (prefOk) {
      addNotification({
        userRoleTarget: 'cliente',
        title,
        body: msg.slice(0, 160),
        kind,
        relatedAppointmentId: apt.id,
      });
    }
  };

  const startEdit = (tpl: ReminderTemplate) => {
    setEditingId(tpl.id);
    setDraft(tpl.body);
  };

  const saveEdit = () => {
    if (!editingId) return;
    void apiUpdateReminderTemplate(editingId, { body: draft });
    setEditingId(null);
    Alert.alert('Listo', 'Plantilla guardada.');
  };

  if (!allowed) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ResponsiveShell style={{ flex: 1, padding: spacing.xl }}>
          <Text style={styles.title}>Recordatorios</Text>
          <Text style={styles.sub}>
            Como cliente recibes los avisos por WhatsApp; no envías desde acá.
          </Text>
          <Button title="Volver" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
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

            <Text style={styles.title}>Recordatorios</Text>
            <Text style={styles.sub}>
              Plantillas con {'{{name}}'} {'{{time}}'} {'{{service}}'} · envío por WhatsApp
            </Text>

            {upcoming.length === 0 ? (
              <EmptyState
                icon="clock"
                title="Sin citas próximas"
                subtitle="Cuando haya citas, envía el recordatorio por WhatsApp en 1 tap."
                actionLabel="Nueva cita"
                onAction={() => router.push('/nueva-cita')}
              />
            ) : (
              upcoming.slice(0, 3).map((a) => {
                const cli = clients.find((c) => c.id === a.clientId);
                const svc = services.find((s) => s.id === a.serviceId);
                return (
                  <Card key={a.id} style={styles.aptCard} elevated>
                    <View style={styles.row}>
                      <MessageCircle size={18} color="#128C7E" strokeWidth={2.3} />
                      <Text style={styles.itemTitle}>
                        {cli?.name ?? 'Cliente'} · {a.startTime}
                      </Text>
                    </View>
                    <Text style={styles.itemBody}>
                      {svc?.name} · {formatLongDate(a.date)}
                    </Text>
                    <Button
                      title="Enviar por WhatsApp"
                      onPress={() => {
                        const tpl =
                          templates.find((t) => t.kind === 'reminder_24h') ??
                          templates[0];
                        if (tpl) sendWithTemplate(tpl, a.id);
                      }}
                      style={{ marginTop: spacing.sm }}
                    />
                  </Card>
                );
              })
            )}

            <Text style={[styles.section, { marginTop: spacing.lg }]}>
              Plantillas
            </Text>
            {templates.map((tpl) => (
              <Card key={tpl.id} style={styles.card} elevated>
                <Text style={[styles.badge, { color: theme.accent }]}>
                  {KIND_LABEL[tpl.kind].toUpperCase()} · {tpl.channel}
                </Text>
                {editingId === tpl.id ? (
                  <>
                    <TextField
                      label="Cuerpo"
                      value={draft}
                      onChangeText={setDraft}
                      multiline
                      numberOfLines={5}
                      inputStyle={{ minHeight: 120, textAlignVertical: 'top' }}
                    />
                    <Text style={styles.previewLabel}>Vista previa</Text>
                    <View style={styles.previewBox}>
                      <Text style={styles.previewText}>
                        {fillReminderTemplate(draft, {
                          name: 'Camila',
                          time: '10:30',
                          service: 'Corte + barba',
                          date: 'sábado 12 de septiembre',
                          place: profile.address || 'Santiago',
                          code: 'AL-DEMO',
                          business: profile.name || 'AgendaLibre',
                        })}
                      </Text>
                    </View>
                    <View style={styles.editActions}>
                      <Button
                        title="Cancelar"
                        variant="secondary"
                        fullWidth={false}
                        style={{ flex: 1 }}
                        onPress={() => setEditingId(null)}
                      />
                      <Button
                        title="Guardar"
                        fullWidth={false}
                        style={{ flex: 1 }}
                        onPress={saveEdit}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.itemBody}>{tpl.body}</Text>
                    <View style={styles.editActions}>
                      <Pressable
                        onPress={() => startEdit(tpl)}
                        style={styles.linkBtn}
                      >
                        <Text style={styles.linkText}>Editar</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => sendWithTemplate(tpl)}
                        style={[styles.waChip, { backgroundColor: theme.primary }]}
                      >
                        <Send size={14} color="#fff" strokeWidth={2.4} />
                        <Text style={styles.waChipText}>Enviar WA</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </Card>
            ))}
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
  title: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: 22,
    color: c.onSurface,
  },
  sub: {
    marginTop: 4,
    marginBottom: spacing.lg,
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
  card: { marginBottom: spacing.md },
  aptCard: { marginBottom: spacing.md },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: c.text,
    flex: 1,
  },
  itemBody: {
    color: c.textMuted,
    marginTop: spacing.sm,
    lineHeight: 20,
    fontSize: fontSize.sm + 1,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.md,
  },
  linkBtn: { paddingHorizontal: 8, minHeight: 44, justifyContent: 'center' },
  linkText: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    color: c.primaryText,
    fontSize: fontSize.sm,
  },
  waChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    marginLeft: 'auto',
  },
  previewLabel: {
    marginTop: spacing.md,
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.xs,
    color: c.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  previewBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: c.surfaceContainer,
    borderWidth: 1,
    borderColor: c.border,
  },
  previewText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm + 1,
    color: c.onSurface,
    lineHeight: 20,
  },
  waChipText: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
});
}

