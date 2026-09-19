import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Search,
  User,
  X,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FadeInView, StaggerItem } from '@/components/motion';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { formatLongDate } from '@/data/slots';
import { isProviderRole } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';
import { useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function digits(s: string): string {
  return s.replace(/\D/g, '');
}

/**
 * Quick search (offline): clients by name/phone + today/upcoming appointments
 * by code or client name. Tap → cliente ficha or ticket.
 */
export default function BuscarScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const profile = useAppStore((s) => s.profile);
  const clients = useAppStore((s) => s.clients);
  const appointments = useAppStore((s) => s.appointments);
  const services = useAppStore((s) => s.services);
  const provider = isProviderRole(profile.role);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const q = normalize(query);
  const qDigits = digits(query);
  const active = q.length >= 1 || qDigits.length >= 2;

  const matchedClients = useMemo(() => {
    if (!provider || !active) return [];
    return clients
      .filter((c) => {
        const nameHit = q.length > 0 && normalize(c.name).includes(q);
        const phoneHit =
          qDigits.length >= 2 && digits(c.phone).includes(qDigits);
        return nameHit || phoneHit;
      })
      .slice(0, 20);
  }, [clients, provider, active, q, qDigits]);

  const matchedApts = useMemo(() => {
    if (!active) return [];
    const pool = appointments.filter((a) => {
      if (a.status === 'cancelada') return false;
      if (a.date < today) return false;
      if (!provider && profile.linkedClientId) {
        return a.clientId === profile.linkedClientId;
      }
      return true;
    });

    return pool
      .filter((a) => {
        const codeHit =
          q.length > 0 && normalize(a.code).includes(q.replace(/\s+/g, ''));
        const cli = clients.find((c) => c.id === a.clientId);
        const clientHit =
          q.length > 0 && cli ? normalize(cli.name).includes(q) : false;
        const phoneHit =
          qDigits.length >= 2 && cli
            ? digits(cli.phone).includes(qDigits)
            : false;
        return codeHit || clientHit || phoneHit;
      })
      .sort((a, b) =>
        a.date === b.date
          ? a.startTime.localeCompare(b.startTime)
          : a.date.localeCompare(b.date)
      )
      .slice(0, 30);
  }, [
    appointments,
    clients,
    active,
    q,
    qDigits,
    today,
    provider,
    profile.linkedClientId,
  ]);

  const empty =
    active && matchedClients.length === 0 && matchedApts.length === 0;

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ResponsiveShell forceMax style={{ flex: 1 }}>
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
                <Search size={20} color="#fff" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Buscar</Text>
                <Text style={styles.sub}>
                  {provider
                    ? 'Clientes y citas (hoy + próximas) · offline'
                    : 'Tus citas por código · offline'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.searchBox,
                { borderColor: colors.outline, backgroundColor: colors.surfaceContainerLowest },
              ]}
            >
              <Search
                size={18}
                color={colors.onSurfaceVariant}
                strokeWidth={2.2}
              />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={
                  provider
                    ? 'Nombre, teléfono o código…'
                    : 'Código de cita…'
                }
                placeholderTextColor={colors.placeholder}
                style={styles.input}
                autoFocus
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                accessibilityLabel="Buscar"
              />
              {query.length > 0 ? (
                <Pressable
                  onPress={() => setQuery('')}
                  hitSlop={8}
                  accessibilityLabel="Limpiar búsqueda"
                >
                  <X size={18} color={colors.onSurfaceVariant} strokeWidth={2.2} />
                </Pressable>
              ) : null}
            </View>
          </FadeInView>

          {!active ? (
            <EmptyState
              icon="search"
              title="Escribe para buscar"
              subtitle={
                provider
                  ? 'Busca por nombre, fono o código — rápido, sin vueltas.'
                  : 'Busca tus próximas citas por código.'
              }
            />
          ) : empty ? (
            <EmptyState
              icon="inbox"
              title="Sin resultados"
              subtitle="Sin match — prueba otro nombre, fono o código."
            />
          ) : (
            <>
              {matchedClients.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Clientes · {matchedClients.length}
                  </Text>
                  {matchedClients.map((c, i) => (
                    <StaggerItem key={c.id} index={i}>
                      <Card
                        style={styles.card}
                        onPress={() =>
                          router.push(`/cliente/${c.id}` as `/cliente/${string}`)
                        }
                      >
                        <View style={styles.row}>
                          <View
                            style={[
                              styles.avatar,
                              { backgroundColor: theme.surfaceTint },
                            ]}
                          >
                            <User
                              size={18}
                              color={theme.primary}
                              strokeWidth={2.4}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{c.name}</Text>
                            <Text style={styles.meta}>{c.phone}</Text>
                          </View>
                        </View>
                      </Card>
                    </StaggerItem>
                  ))}
                </View>
              ) : null}

              {matchedApts.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Citas · {matchedApts.length}
                  </Text>
                  {matchedApts.map((a, i) => {
                    const cli = clients.find((c) => c.id === a.clientId);
                    const svc = services.find((s) => s.id === a.serviceId);
                    return (
                      <StaggerItem
                        key={a.id}
                        index={matchedClients.length + i}
                      >
                        <Card
                          style={styles.card}
                          onPress={() =>
                            router.push(`/ticket/${a.id}` as `/ticket/${string}`)
                          }
                        >
                          <View style={styles.row}>
                            <View
                              style={[
                                styles.avatar,
                                { backgroundColor: theme.surfaceTint },
                              ]}
                            >
                              <Calendar
                                size={18}
                                color={theme.primary}
                                strokeWidth={2.4}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.name}>
                                {cli?.name ?? 'Cliente'} · {a.code}
                              </Text>
                              <Text style={styles.meta}>
                                {formatLongDate(a.date)} · {a.startTime}
                                {svc ? ` · ${svc.name}` : ''}
                              </Text>
                            </View>
                          </View>
                        </Card>
                      </StaggerItem>
                    );
                  })}
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </ResponsiveShell>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.surface,
    },
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
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
      fontSize: fontSize.md,
      color: c.onSurface,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
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
      fontSize: fontSize.xxl,
      color: c.onSurface,
      letterSpacing: -0.5,
    },
    sub: {
      marginTop: 2,
      fontFamily: fonts.medium,
      fontWeight: '500',
      fontSize: fontSize.sm,
      color: c.onSurfaceVariant,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1.5,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      minHeight: 52,
      marginBottom: spacing.xl,
    },
    input: {
      flex: 1,
      fontSize: 16,
      lineHeight: 22,
      color: c.onSurface,
      fontFamily: fonts.regular,
      paddingVertical: spacing.sm,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.sm,
      color: c.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: spacing.sm,
    },
    card: {
      marginBottom: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: {
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.md,
      color: c.onSurface,
    },
    meta: {
      marginTop: 2,
      fontFamily: fonts.medium,
      fontWeight: '500',
      fontSize: fontSize.sm,
      color: c.onSurfaceVariant,
    },
  });
}
