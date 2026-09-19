import { Stack, router } from 'expo-router';
import { ArrowLeft, Bell, CheckCheck } from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
import type { PushPreference } from '@/contracts';
import { requestPermissions } from '@/lib/notifications';
import { relativeTime } from '@/lib/relativeTime';
import {
  filterInboxNotifications,
  preferenceLabel,
} from '@/lib/reviews';
import {
  apiMarkAllNotificationsRead,
  apiMarkNotificationRead,
  apiUpdatePushPreferences,
} from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import { useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing, type AppColors } from '@/theme/colors';

const PREF_KEYS: (keyof PushPreference)[] = [
  'bookingConfirm',
  'reminder24h',
  'reminder2h',
  'waitlistOpen',
  'reviewRequest',
  'teamInvite',
  'marketing',
];

export default function NotificacionesScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const booting = useListBoot();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const notifications = useAppStore((s) => s.notifications);
  const pushPreferences = useAppStore((s) => s.pushPreferences);

  const inbox = useMemo(
    () =>
      filterInboxNotifications(notifications, { profile, professionals }),
    [notifications, profile, professionals]
  );

  const unread = inbox.filter((n) => !n.read).length;

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ResponsiveShell style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
        >
          <FadeInView>
            <Pressable onPress={() => router.back()} style={styles.backRow}>
              <ArrowLeft size={20} color={colors.onSurface} strokeWidth={2.4} />
              <Text style={styles.backText}>Volver</Text>
            </Pressable>

            <View style={styles.headerRow}>
              <View style={[styles.headerIcon, { backgroundColor: theme.primary }]}>
                <Bell size={20} color="#fff" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Notificaciones</Text>
                <Text style={styles.sub}>
                  {unread > 0
                    ? `${unread} sin leer · inbox local (sin FCM)`
                    : 'Inbox y preferencias · PoC local'}
                </Text>
              </View>
            </View>

            <Button
              title="Activar avisos del dispositivo"
              variant="secondary"
              onPress={() => {
                void requestPermissions();
              }}
              style={{ marginBottom: spacing.md }}
            />

            <View style={styles.sectionHead}>
              <Text style={styles.section}>Preferencias</Text>
            </View>
            {PREF_KEYS.map((key) => (
              <View key={key} style={styles.switchRow}>
                <Text style={styles.switchLabel}>{preferenceLabel(key)}</Text>
                <Switch
                  value={pushPreferences[key]}
                  onValueChange={(v) => void apiUpdatePushPreferences({ [key]: v })}
                  trackColor={{ false: colors.outline, true: theme.primary }}
                  thumbColor="#fff"
                />
              </View>
            ))}

            <View style={[styles.sectionHead, { marginTop: spacing.lg }]}>
              <Text style={styles.section}>Bandeja</Text>
              {unread > 0 ? (
                <Pressable onPress={() => void apiMarkAllNotificationsRead()} hitSlop={8}>
                  <View style={styles.markAll}>
                    <CheckCheck size={16} color={theme.primary} strokeWidth={2.4} />
                    <Text style={[styles.markAllText, { color: theme.primary }]}>
                      Marcar leídas
                    </Text>
                  </View>
                </Pressable>
              ) : null}
            </View>

            {booting ? (
              <ListSkeleton rows={4} variant="row" />
            ) : inbox.length === 0 ? (
              <EmptyState
                icon="bell"
                title="Sin notificaciones"
                subtitle="Todo tranquilo — cuando confirmes citas o pidamos reseña, aparece acá."
              />
            ) : (
              inbox.map((n, i) => (
                <StaggerItem key={n.id} index={i}>
                  <Pressable
                    onPress={() => {
                      if (!n.read) void apiMarkNotificationRead(n.id);
                      if (
                        n.kind === 'review_request' &&
                        n.relatedAppointmentId &&
                        profile.role === 'cliente'
                      ) {
                        router.push(
                          `/resena/${n.relatedAppointmentId}` as never
                        );
                      }
                    }}
                  >
                    <Card
                      style={{
                        ...styles.card,
                        ...(!n.read
                          ? {
                              borderColor: theme.primary + '55',
                              borderWidth: 1.5,
                            }
                          : null),
                      }}
                      elevated={!n.read}
                    >
                      <Text style={styles.cardTitle}>{n.title}</Text>
                      <Text style={styles.cardBody}>{n.body}</Text>
                      <Text style={styles.cardMeta}>
                        {relativeTime(n.createdAt)}
                        {!n.read ? ' · Nueva' : ''}
                      </Text>
                    </Card>
                  </Pressable>
                </StaggerItem>
              ))
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
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  section: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.md,
    color: c.onSurface,
  },
  markAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  markAllText: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 52,
  },
  switchLabel: {
    flex: 1,
    paddingRight: spacing.md,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  card: { marginBottom: spacing.sm },
  cardTitle: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.md,
    color: c.onSurface,
  },
  cardBody: {
    marginTop: 4,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
    lineHeight: 20,
  },
  cardMeta: {
    marginTop: 8,
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    color: c.textMuted,
  },
});
}

