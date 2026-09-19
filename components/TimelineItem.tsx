import { MessageCircle, MoreHorizontal, Phone, Timer } from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { AppointmentStatus } from '@/contracts/types';
import { formatClp, parseTime } from '@/data/slots';
import { statusTone } from '@/lib/statusColors';
import { useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  shadow,
  spacing,
  type AppColors,
} from '@/theme/colors';

export type TimelineKind = 'appointment' | 'break';
export type TimelinePhase = 'completed' | 'in_progress' | 'upcoming';

export interface TimelineAppointmentProps {
  kind?: 'appointment';
  time: string; // HH:mm
  endTime?: string;
  clientName: string;
  serviceName: string;
  priceClp?: number;
  durationMin?: number;
  phase: TimelinePhase;
  endsInMin?: number;
  /** Flujo: pendiente → badge + Confirmar WhatsApp */
  pending?: boolean;
  /** Appointment status — drives pill colors (aligned with StatusLegend). */
  status?: AppointmentStatus;
  onPress?: () => void;
  onManage?: () => void;
  onRebook?: () => void;
  onWhatsApp?: () => void;
  onConfirmWhatsApp?: () => void;
  onCall?: () => void;
}

export interface TimelineBreakProps {
  kind: 'break';
  time: string;
  label?: string;
  durationMin?: number;
}

type Props = TimelineAppointmentProps | TimelineBreakProps;

function splitAmPm(hhmm: string): { clock: string; ampm: string } {
  const mins = parseTime(hhmm);
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return {
    clock: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
    ampm,
  };
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '';
  const b = parts[1]?.[0] ?? '';
  return (a + b).toUpperCase() || '?';
}

function PingDot({ color }: { color: string }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.8, { duration: 1100, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1100, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
  }, [opacity, scale]);

  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.pingWrap}>
      <Animated.View
        style={[styles.pingRing, { backgroundColor: color }, ring]}
      />
      <View style={[styles.pingCore, { backgroundColor: color }]} />
    </View>
  );
}

function TimeRail({
  time,
  active,
  showLine = true,
}: {
  time: string;
  active?: boolean;
  showLine?: boolean;
}) {
  const theme = useThemeTokens();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { clock, ampm } = splitAmPm(time);
  return (
    <View style={styles.rail}>
      <Text
        style={[
          styles.railClock,
          active && { color: colors.primaryText, fontFamily: fonts.bold },
        ]}
      >
        {clock}
      </Text>
      <Text
        style={[
          styles.railAmPm,
          active && { color: colors.primaryText },
        ]}
      >
        {ampm}
      </Text>
      {showLine ? <View style={styles.railLine} /> : null}
    </View>
  );
}

/**
 * Flujo timeline card anatomy — completed / in_progress / break / upcoming.
 */
export function TimelineItem(props: Props) {
  const theme = useThemeTokens();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (props.kind === 'break') {
    const mins = props.durationMin ?? 0;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const durLabel =
      h > 0
        ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim()
        : `${mins} min`;

    return (
      <View style={styles.row}>
        <TimeRail time={props.time} />
        <View style={[styles.breakCard, shadow.sm]}>
          <View style={styles.coffeeCircle}>
            <Text style={styles.coffeeEmoji}>☕</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.breakTitle}>
              {props.label ?? 'Almuerzo & Descanso'}
            </Text>
          </View>
          {mins > 0 ? (
            <View
              style={[
                styles.durationPill,
                { backgroundColor: colors.secondaryContainer },
              ]}
            >
              <Text
                style={[styles.durationPillText, { color: colors.secondary }]}
              >
                {durLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  const {
    time,
    clientName,
    serviceName,
    priceClp,
    durationMin,
    phase,
    endsInMin,
    pending,
    status,
    onPress,
    onManage,
    onWhatsApp,
    onConfirmWhatsApp,
    onCall,
  } = props;

  const resolvedStatus: AppointmentStatus =
    status ??
    (pending
      ? 'pendiente'
      : phase === 'completed'
        ? 'completada'
        : 'confirmada');

  const muted =
    phase === 'completed' ||
    resolvedStatus === 'cancelada' ||
    resolvedStatus === 'noshow';
  const active = phase === 'in_progress';
  const callHandler = onCall ?? onWhatsApp;

  const completedTone = statusTone(
    resolvedStatus === 'cancelada' || resolvedStatus === 'noshow'
      ? resolvedStatus
      : 'completada',
    colors
  );
  const confirmedTone = statusTone('confirmada', colors);
  const pendingTone = statusTone('pendiente', colors, {
    accent: theme.primary,
  });

  return (
    <View style={[styles.row, muted && { opacity: 0.85 }]}>
      <TimeRail time={time} active={active} />

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={[
          styles.card,
          shadow.sm,
          active && {
            ...shadow.md,
            borderLeftWidth: 6,
            borderLeftColor: theme.primary,
            paddingLeft: spacing.lg - 6,
          },
        ]}
      >
        {/* Completed */}
        {phase === 'completed' ? (
          <>
            <View style={styles.cardTop}>
              <Text style={styles.serviceTitle} numberOfLines={1}>
                {serviceName}
              </Text>
              {priceClp != null ? (
                <Text style={styles.price}>{formatClp(priceClp)}</Text>
              ) : null}
            </View>
            <View style={styles.clientRow}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: colors.surfaceContainerLow },
                ]}
              >
                <Text
                  style={[styles.avatarText, { color: colors.onSurfaceVariant }]}
                >
                  {initials(clientName)}
                </Text>
              </View>
              <Text style={styles.clientNameMuted} numberOfLines={1}>
                {clientName}
              </Text>
              <View
                style={[
                  styles.pill,
                  { backgroundColor: completedTone.bg },
                ]}
              >
                <Text style={[styles.pillText, { color: completedTone.fg }]}>
                  {completedTone.label}
                </Text>
              </View>
            </View>
          </>
        ) : null}

        {/* In progress */}
        {phase === 'in_progress' ? (
          <>
            <View style={styles.cardTop}>
              <View
                style={[styles.pill, { backgroundColor: theme.primary + '18' }]}
              >
                <PingDot color={theme.primary} />
                <Text style={[styles.pillText, { color: colors.primaryText }]}>
                  En curso
                </Text>
              </View>
              {priceClp != null ? (
                <Text style={styles.price}>{formatClp(priceClp)}</Text>
              ) : null}
            </View>
            <Text style={styles.serviceTitle} numberOfLines={1}>
              {serviceName}
            </Text>
            <View style={[styles.clientRow, { marginTop: spacing.sm }]}>
              <View
                style={[styles.avatar, { backgroundColor: theme.surfaceTint }]}
              >
                <Text style={[styles.avatarText, { color: colors.primaryText }]}>
                  {initials(clientName)}
                </Text>
              </View>
              <Text style={styles.clientName} numberOfLines={1}>
                {clientName}
              </Text>
            </View>
            {endsInMin != null ? (
              <Text style={[styles.endsIn, { color: colors.primaryText }]}>
                Finaliza en {endsInMin} min
              </Text>
            ) : null}
            {onManage ? (
              <Pressable
                onPress={onManage}
                style={[styles.manageBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.manageText}>Gestionar</Text>
              </Pressable>
            ) : null}
          </>
        ) : null}

        {/* Upcoming / Pending */}
        {phase === 'upcoming' ? (
          <>
            <View style={styles.cardTop}>
              <Text style={[styles.serviceTitle, { marginBottom: 0 }]} numberOfLines={1}>
                {serviceName}
              </Text>
              {priceClp != null ? (
                <Text style={styles.price}>{formatClp(priceClp)}</Text>
              ) : null}
            </View>
            <View style={[styles.clientRow, { marginTop: spacing.sm }]}>
              <View
                style={[styles.avatar, { backgroundColor: theme.surfaceTint }]}
              >
                <Text style={[styles.avatarText, { color: colors.primaryText }]}>
                  {initials(clientName)}
                </Text>
              </View>
              <Text style={[styles.clientName, { flex: 1 }]} numberOfLines={1}>
                {clientName}
              </Text>
              {pending || resolvedStatus === 'pendiente' ? (
                <View
                  style={[
                    styles.pill,
                    { backgroundColor: pendingTone.bg },
                  ]}
                >
                  <Text style={[styles.pillText, { color: pendingTone.fg }]}>
                    {pendingTone.label}
                  </Text>
                </View>
              ) : resolvedStatus === 'cancelada' ||
                resolvedStatus === 'noshow' ? (
                <View
                  style={[
                    styles.pill,
                    { backgroundColor: completedTone.bg },
                  ]}
                >
                  <Text style={[styles.pillText, { color: completedTone.fg }]}>
                    {completedTone.label}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.pill,
                    { backgroundColor: confirmedTone.bg },
                  ]}
                >
                  <Text
                    style={[styles.pillText, { color: confirmedTone.fg }]}
                  >
                    {confirmedTone.label}
                  </Text>
                </View>
              )}
              {!pending && callHandler ? (
                <Pressable
                  onPress={callHandler}
                  style={styles.iconRound}
                  accessibilityRole="button"
                  accessibilityLabel="Llamar / WhatsApp"
                >
                  <Phone
                    size={16}
                    color={colors.secondary}
                    strokeWidth={2.2}
                  />
                </Pressable>
              ) : null}
              {!pending ? (
                <Pressable
                  onPress={onPress}
                  style={styles.iconRound}
                  accessibilityRole="button"
                  accessibilityLabel="Más opciones"
                >
                  <MoreHorizontal
                    size={16}
                    color={colors.onSurfaceVariant}
                    strokeWidth={2.2}
                  />
                </Pressable>
              ) : null}
            </View>
            {durationMin && !pending ? (
              <View style={styles.durationRow}>
                <Timer
                  size={13}
                  color={colors.onSurfaceVariant}
                  strokeWidth={2.2}
                />
                <Text style={styles.durationText}>{durationMin} min</Text>
              </View>
            ) : null}
            {pending ? (
              <View style={styles.pendingActions}>
                <Text style={styles.sinReconfirmar}>Sin reconfirmar</Text>
                <Pressable
                  onPress={onConfirmWhatsApp ?? onWhatsApp}
                  style={styles.confirmWa}
                  accessibilityRole="button"
                  accessibilityLabel="Confirmar WhatsApp"
                >
                  <MessageCircle size={15} color="#fff" strokeWidth={2.4} />
                  <Text style={styles.confirmWaText}>Confirmar WhatsApp</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : null}
      </Pressable>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  rail: {
    width: 48,
    alignItems: 'flex-end',
    paddingTop: 12,
  },
  railClock: {
    fontSize: 12,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: c.onSurface,
    textAlign: 'right',
  },
  railAmPm: {
    fontSize: 9,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    color: c.onSurfaceVariant,
    textAlign: 'right',
    marginTop: 1,
  },
  railLine: {
    flex: 1,
    width: 2,
    backgroundColor: c.surfaceContainer,
    marginTop: 8,
    marginRight: 10,
    borderRadius: 1,
    minHeight: 24,
  },
  card: {
    flex: 1,
    backgroundColor: c.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  serviceTitle: {
    flex: 1,
    fontSize: fontSize.md + 1,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: c.onSurface,
    letterSpacing: -0.2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  pillText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
  price: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: c.onSurface,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
  clientName: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    color: c.onSurface,
  },
  clientNameMuted: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
    fontWeight: '500',
    color: c.onSurfaceVariant,
  },
  endsIn: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    fontFamily: fonts.semibold,
    fontWeight: '600',
  },
  manageBtn: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.full,
    minHeight: 40,
    justifyContent: 'center',
  },
  manageText: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  iconRound: {
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surfaceContainerLow,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  durationText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    fontWeight: '500',
    color: c.onSurfaceVariant,
  },
  breakCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: c.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  coffeeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coffeeEmoji: {
    fontSize: 18,
  },
  breakTitle: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    color: c.onSurfaceVariant,
  },
  durationPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  durationPillText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
  pingWrap: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pingRing: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pingCore: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pendingActions: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sinReconfirmar: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    fontWeight: '500',
    color: c.onSurfaceVariant,
  },
  confirmWa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: c.tertiary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    minHeight: 40,
  },
  confirmWaText: {
    color: '#fff',
    fontSize: fontSize.xs + 1,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
});
}

