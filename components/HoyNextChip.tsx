import { router } from 'expo-router';
import { ChevronRight, Clock3 } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  resolveNextTodayAppointment,
  type ServiceRef,
} from '@/lib/nextAppointment';
import type { Appointment } from '@/data/types';
import { useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  shadow,
  spacing,
  type AppColors,
} from '@/theme/colors';

type Props = {
  /** Already role/pro/client-scoped appointments. */
  appointments: Appointment[];
  services: ServiceRef[];
};

/**
 * Hoy chip: "Próxima cita en Xh Ym" | "Ahora · servicio" → ticket.
 * Soft empty when nothing remains today.
 */
export function HoyNextChip({ appointments, services }: Props) {
  const colors = useColors();
  const theme = useThemeTokens();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const next = useMemo(
    () => resolveNextTodayAppointment(appointments, services),
    // tick forces re-resolve so countdown stays fresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointments, services, tick]
  );

  if (!next) {
    return (
      <View
        style={styles.empty}
        accessibilityRole="text"
        accessibilityLabel="Sin más citas hoy"
      >
        <Clock3 size={16} color={colors.onSurfaceVariant} strokeWidth={2.2} />
        <Text style={styles.emptyText}>Sin más citas hoy</Text>
      </View>
    );
  }

  const isNow = next.kind === 'now';

  return (
    <Pressable
      onPress={() => router.push(`/ticket/${next.appointmentId}`)}
      style={[
        styles.chip,
        shadow.sm,
        {
          backgroundColor: isNow ? theme.primary : colors.surfaceContainerLowest,
          borderColor: isNow ? theme.primary : colors.outline + '55',
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={next.label}
      accessibilityHint="Abre el ticket de la cita"
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: isNow
              ? 'rgba(255,255,255,0.22)'
              : theme.surfaceTint,
          },
        ]}
      >
        <Clock3
          size={18}
          color={isNow ? '#fff' : theme.primary}
          strokeWidth={2.4}
        />
      </View>
      <View style={styles.copy}>
        <Text
          style={[styles.label, { color: isNow ? '#fff' : colors.onSurface }]}
          numberOfLines={1}
        >
          {next.label}
        </Text>
        {!isNow ? (
          <Text style={styles.sub} numberOfLines={1}>
            {next.startTime} · {next.serviceName}
          </Text>
        ) : (
          <Text style={styles.subNow} numberOfLines={1}>
            En curso · toca para ver el ticket
          </Text>
        )}
      </View>
      <ChevronRight
        size={18}
        color={isNow ? 'rgba(255,255,255,0.85)' : colors.onSurfaceVariant}
        strokeWidth={2.4}
      />
    </Pressable>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      paddingVertical: 12,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      minHeight: 56,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    copy: { flex: 1, minWidth: 0 },
    label: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.md,
      letterSpacing: -0.2,
    },
    sub: {
      marginTop: 2,
      fontFamily: fonts.medium,
      fontWeight: '500',
      fontSize: fontSize.xs,
      color: c.onSurfaceVariant,
    },
    subNow: {
      marginTop: 2,
      fontFamily: fonts.medium,
      fontWeight: '500',
      fontSize: fontSize.xs,
      color: 'rgba(255,255,255,0.85)',
    },
    empty: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: c.surfaceContainerLow,
      minHeight: 48,
    },
    emptyText: {
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.sm,
      color: c.onSurfaceVariant,
    },
  });
}
