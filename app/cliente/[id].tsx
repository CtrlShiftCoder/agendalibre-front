import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, User, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { formatLongDate } from '@/data/slots';
import { screenAccess } from '@/lib/access';
import { filterAppointmentsForActivePro } from '@/lib/team';
import { apiUpdateClient } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import { useThemeTokens, useColors } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

const RISK_LABEL = {
  ok: 'OK',
  watch: 'Vigilancia',
  high: 'Alto riesgo',
} as const;

const TAG_PRESETS = ['VIP', 'nuevo', 'alergia', 'recurrente'] as const;

function normalizeTag(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export default function ClienteFichaScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const clients = useAppStore((s) => s.clients);
  const appointments = useAppStore((s) => s.appointments);
  const services = useAppStore((s) => s.services);

  const state = useMemo(
    () => ({ profile, professionals }),
    [profile, professionals]
  );
  const access = screenAccess('fichaCliente', state);

  const client = clients.find((c) => c.id === id);

  const visibleApts = useMemo(() => {
    if (!client) return [];
    let list = appointments.filter((a) => a.clientId === client.id);
    if (access === 'own' && profile.role === 'cliente') {
      if (profile.linkedClientId !== client.id) return [];
    }
    if (access === 'own' && profile.role === 'empresa') {
      list = filterAppointmentsForActivePro(state, list);
    }
    return [...list].sort((a, b) =>
      a.date === b.date
        ? b.startTime.localeCompare(a.startTime)
        : b.date.localeCompare(a.date)
    );
  }, [client, appointments, access, profile, state]);

  const canEdit =
    access === 'full' ||
    (access === 'own' &&
      profile.role === 'cliente' &&
      profile.linkedClientId === id);

  const canEditStaff =
    canEdit && (access === 'full' || profile.role !== 'cliente');

  const denied =
    !client ||
    access === 'none' ||
    (profile.role === 'cliente' && profile.linkedClientId !== id) ||
    (access === 'own' &&
      profile.role === 'empresa' &&
      !appointments.some(
        (a) =>
          a.clientId === id &&
          (a.professionalId === profile.activeProfessionalId ||
            a.professionalId === null)
      ));

  const [notes, setNotes] = useState(client?.notes ?? '');
  const [email, setEmail] = useState(client?.email ?? '');
  const [tags, setTags] = useState<string[]>(client?.tags ?? []);
  const [customTag, setCustomTag] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!client) return;
    setNotes(client.notes ?? '');
    setEmail(client.email ?? '');
    setTags(client.tags ?? []);
  }, [client?.id]);

  const addTag = (raw: string) => {
    const t = normalizeTag(raw);
    if (!t) return;
    const exists = tags.some((x) => x.toLowerCase() === t.toLowerCase());
    if (exists) return;
    setTags((prev) => [...prev, t]);
  };

  const removeTag = (t: string) => {
    setTags((prev) => prev.filter((x) => x !== t));
  };

  const save = async () => {
    if (!client || !canEdit) return;
    setSaving(true);
    try {
      await apiUpdateClient(client.id, {
        notes: notes.trim() || undefined,
        email: email.trim() || undefined,
        tags,
      });
      Alert.alert('Listo', 'Ficha actualizada.');
    } finally {
      setSaving(false);
    }
  };

  if (denied || !client) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ResponsiveShell style={{ flex: 1, padding: spacing.xl }}>
          <Text style={styles.title}>Cliente no disponible</Text>
          <Text style={styles.sub}>
            No tienes acceso a esta ficha o no existe.
          </Text>
          <Button
            title="Volver"
            onPress={() => router.back()}
            style={{ marginTop: spacing.lg }}
          />
        </ResponsiveShell>
      </View>
    );
  }

  const risk = client.riskFlag ?? 'ok';
  const unusedPresets = TAG_PRESETS.filter(
    (p) => !tags.some((t) => t.toLowerCase() === p.toLowerCase())
  );

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
      >
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
              <View
                style={[styles.headerIcon, { backgroundColor: theme.primary }]}
              >
                <User size={20} color="#fff" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{client.name}</Text>
                <Text style={styles.sub}>{client.phone}</Text>
              </View>
            </View>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statVal}>{client.completedCount}</Text>
                <Text style={styles.statLabel}>Completadas</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statVal}>{client.noShowCount}</Text>
                <Text style={styles.statLabel}>No-show</Text>
              </View>
              <View style={styles.stat}>
                <Text
                  style={[
                    styles.statVal,
                    {
                      color:
                        risk === 'high'
                          ? colors.danger
                          : risk === 'watch'
                            ? '#CA8A04'
                            : colors.primaryText,
                      fontSize: 14,
                    },
                  ]}
                >
                  {RISK_LABEL[risk]}
                </Text>
                <Text style={styles.statLabel}>Riesgo</Text>
              </View>
            </View>

            {canEditStaff ? (
              <>
                <Text style={styles.section}>Etiquetas</Text>
                <View style={styles.tags}>
                  {tags.length === 0 ? (
                    <Text style={styles.hint}>Sin etiquetas aún.</Text>
                  ) : (
                    tags.map((t) => (
                      <Pressable
                        key={t}
                        onPress={() => removeTag(t)}
                        accessibilityRole="button"
                        accessibilityLabel={`Quitar etiqueta ${t}`}
                        style={[
                          styles.tag,
                          styles.tagActive,
                          { backgroundColor: theme.surfaceTint },
                        ]}
                      >
                        <Text
                          style={[styles.tagText, { color: theme.primary }]}
                        >
                          {t}
                        </Text>
                        <X size={12} color={theme.primary} strokeWidth={2.5} />
                      </Pressable>
                    ))
                  )}
                </View>
                {unusedPresets.length > 0 ? (
                  <View style={styles.presetRow}>
                    {unusedPresets.map((p) => (
                      <Pressable
                        key={p}
                        onPress={() => addTag(p)}
                        accessibilityRole="button"
                        accessibilityLabel={`Agregar etiqueta ${p}`}
                        style={styles.presetChip}
                      >
                        <Text style={styles.presetChipText}>+ {p}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
                <View style={styles.customRow}>
                  <TextField
                    label="Etiqueta custom"
                    value={customTag}
                    onChangeText={setCustomTag}
                    placeholder="Ej. colorista"
                    containerStyle={{ flex: 1, marginBottom: 0 }}
                    onSubmitEditing={() => {
                      addTag(customTag);
                      setCustomTag('');
                    }}
                    returnKeyType="done"
                  />
                  <Button
                    title="Añadir"
                    variant="secondary"
                    onPress={() => {
                      addTag(customTag);
                      setCustomTag('');
                    }}
                    style={styles.addTagBtn}
                  />
                </View>

                <TextField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={canEdit && access === 'full'}
                />
                <TextField
                  label="Notas"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  placeholder="Alergias, preferencias, recordatorios…"
                  inputStyle={{ minHeight: 80, textAlignVertical: 'top' }}
                  editable={canEdit}
                />
                <Button
                  title={saving ? 'Guardando…' : 'Guardar ficha'}
                  onPress={save}
                  disabled={saving}
                />
              </>
            ) : (
              <>
                {tags.length ? (
                  <View style={styles.tags}>
                    {tags.map((t) => (
                      <View
                        key={t}
                        style={[
                          styles.tag,
                          { backgroundColor: theme.surfaceTint },
                        ]}
                      >
                        <Text
                          style={[styles.tagText, { color: theme.primary }]}
                        >
                          {t}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                {client.notes ? (
                  <Card style={styles.card}>
                    <Text style={styles.section}>Notas</Text>
                    <Text style={styles.notes}>{client.notes}</Text>
                  </Card>
                ) : null}
              </>
            )}

            <Text style={[styles.section, { marginTop: spacing.lg }]}>
              Historial ({visibleApts.length})
            </Text>
            {visibleApts.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="Sin citas visibles"
                subtitle="Agenda la primera hora con este cliente altiro."
                actionLabel="Nueva cita"
                onAction={() =>
                  router.push({
                    pathname: '/nueva-cita',
                    params: { clientId: client.id },
                  })
                }
              />
            ) : (
              visibleApts.map((a) => {
                const svc = services.find((s) => s.id === a.serviceId);
                return (
                  <Card key={a.id} style={styles.aptCard} elevated>
                    <Text style={styles.aptTitle}>
                      {svc?.name ?? 'Servicio'} · {a.startTime}
                    </Text>
                    <Text style={styles.aptMeta}>
                      {formatLongDate(a.date)} · {a.status} · {a.code}
                    </Text>
                  </Card>
                );
              })
            )}
          </FadeInView>
        </ScrollView>
      </ResponsiveShell>
      </KeyboardAvoidingView>
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
    headerRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
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
    hint: {
      fontFamily: fonts.medium,
      fontSize: fontSize.sm,
      color: c.onSurfaceVariant,
    },
    stats: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
    stat: {
      flex: 1,
      backgroundColor: c.white,
      borderRadius: radius.md,
      paddingVertical: 12,
      alignItems: 'center',
    },
    statVal: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: 20,
      color: c.onSurface,
    },
    statLabel: {
      fontSize: 11,
      fontFamily: fonts.medium,
      color: c.onSurfaceVariant,
      marginTop: 2,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: spacing.sm,
      alignItems: 'center',
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.full,
    },
    tagActive: { minHeight: 32 },
    tagText: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.xs,
    },
    presetRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: spacing.md,
    },
    presetChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.white,
      minHeight: 36,
      justifyContent: 'center',
    },
    presetChipText: {
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.xs,
      color: c.onSurface,
    },
    customRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: spacing.md,
    },
    addTagBtn: { marginBottom: 0, paddingHorizontal: 14 },
    section: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.md,
      color: c.onSurface,
      marginBottom: spacing.sm,
    },
    card: { marginBottom: spacing.md },
    notes: {
      fontFamily: fonts.medium,
      fontSize: fontSize.sm,
      color: c.onSurface,
      lineHeight: 20,
    },
    aptCard: { marginBottom: spacing.sm },
    aptTitle: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.sm,
      color: c.onSurface,
    },
    aptMeta: {
      marginTop: 2,
      fontFamily: fonts.medium,
      fontSize: fontSize.xs,
      color: c.onSurfaceVariant,
    },
  });
}
