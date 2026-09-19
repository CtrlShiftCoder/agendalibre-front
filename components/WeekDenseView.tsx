import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getWeekDays, type WeekDay } from '@/components/WeekCarousel';
import { useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  shadow,
  spacing,
  type AppColors,
} from '@/theme/colors';

const DOW_ABBR = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export type WeekAptMini = {
  id: string;
  date: string;
  startTime: string;
  clientName?: string;
};

interface Props {
  selectedDate: string;
  onSelect: (date: string) => void;
  /** Non-cancelled appointments for the visible week */
  appointments: WeekAptMini[];
  /** Counts per ISO date (optional; derived from appointments if omitted) */
  counts?: Record<string, number>;
  anchorDate?: string;
}

/**
 * Denser week overview for Agenda — 7 day columns with count chips + mini time blocks.
 * Tap a day to focus that date (parent owns selectedDate).
 */
export function WeekDenseView({
  selectedDate,
  onSelect,
  appointments,
  counts: countsProp,
  anchorDate,
}: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();

  const days = useMemo(() => {
    const anchor = anchorDate
      ? new Date(anchorDate + 'T12:00:00')
      : selectedDate
        ? new Date(selectedDate + 'T12:00:00')
        : new Date();
    return getWeekDays(anchor);
  }, [anchorDate, selectedDate]);

  const byDate = useMemo(() => {
    const map: Record<string, WeekAptMini[]> = {};
    for (const a of appointments) {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((x, y) => x.startTime.localeCompare(y.startTime));
    }
    return map;
  }, [appointments]);

  const counts = useMemo(() => {
    if (countsProp) return countsProp;
    const map: Record<string, number> = {};
    for (const a of appointments) {
      map[a.date] = (map[a.date] ?? 0) + 1;
    }
    return map;
  }, [appointments, countsProp]);

  const weekTotal = useMemo(
    () => days.reduce((n, d) => n + (counts[d.date] ?? 0), 0),
    [days, counts]
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {days.map((d) => (
          <DayColumn
            key={d.date}
            day={d}
            selected={d.date === selectedDate}
            count={counts[d.date] ?? 0}
            minis={(byDate[d.date] ?? []).slice(0, 4)}
            onSelect={onSelect}
            styles={styles}
            theme={theme}
            colors={colors}
          />
        ))}
      </View>
      {weekTotal === 0 ? (
        <View
          style={[
            styles.emptyBanner,
            { backgroundColor: colors.surfaceContainerLow },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
            Semana libre
          </Text>
          <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>
            Sin citas esta semana. Usa Lista para ver cupos o crea una cita.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function DayColumn({
  day,
  selected,
  count,
  minis,
  onSelect,
  styles,
  theme,
  colors,
}: {
  day: WeekDay;
  selected: boolean;
  count: number;
  minis: WeekAptMini[];
  onSelect: (date: string) => void;
  styles: ReturnType<typeof createStyles>;
  theme: { primary: string; onPrimary: string; surfaceTint: string };
  colors: AppColors;
}) {
  return (
    <Pressable
      onPress={() => onSelect(day.date)}
      style={[
        styles.col,
        {
          backgroundColor: selected
            ? theme.primary
            : colors.surfaceContainerLow,
        },
        selected && { ...shadow.primaryGlow, zIndex: 2 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${DOW_ABBR[day.dayOfWeek]} ${day.dayNum}, ${count} citas`}
    >
      <Text
        style={[
          styles.dow,
          selected && { color: theme.onPrimary, opacity: 0.9 },
        ]}
      >
        {day.isToday ? 'Hoy' : DOW_ABBR[day.dayOfWeek]}
      </Text>
      <Text
        style={[
          styles.dayNum,
          { color: selected ? theme.onPrimary : colors.onSurface },
        ]}
      >
        {day.dayNum}
      </Text>

      <View
        style={[
          styles.countChip,
          {
            backgroundColor: selected
              ? 'rgba(255,255,255,0.22)'
              : theme.surfaceTint,
          },
        ]}
      >
        <Text
          style={[
            styles.countText,
            { color: selected ? theme.onPrimary : theme.primary },
          ]}
        >
          {count > 0 ? count : '·'}
        </Text>
      </View>

      <View style={styles.miniStack}>
        {minis.length === 0 ? (
          <View style={styles.miniPlaceholder} />
        ) : (
          minis.map((m) => (
            <View
              key={m.id}
              style={[
                styles.miniBlock,
                {
                  backgroundColor: selected
                    ? 'rgba(255,255,255,0.35)'
                    : theme.primary + '33',
                },
              ]}
            >
              <Text
                style={[
                  styles.miniTime,
                  { color: selected ? theme.onPrimary : colors.primaryText },
                ]}
                numberOfLines={1}
              >
                {m.startTime.slice(0, 5)}
              </Text>
            </View>
          ))
        )}
        {count > 4 ? (
          <Text
            style={[
              styles.moreHint,
              { color: selected ? theme.onPrimary : colors.onSurfaceVariant },
            ]}
          >
            +{count - 4}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    wrap: {
      marginBottom: spacing.lg,
    },
    emptyBanner: {
      marginTop: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      alignItems: 'center',
      gap: 4,
    },
    emptyTitle: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.sm,
    },
    emptySub: {
      fontFamily: fonts.medium,
      fontWeight: '500',
      fontSize: fontSize.xs,
      textAlign: 'center',
      lineHeight: 16,
    },
    row: {
      flexDirection: 'row',
      gap: 6,
      paddingVertical: 4,
    },
    col: {
      flex: 1,
      minWidth: 40,
      minHeight: 132,
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: 2,
      borderRadius: radius.md,
      gap: 4,
    },
    dow: {
      fontSize: 9,
      fontFamily: fonts.bold,
      fontWeight: '700',
      color: c.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    dayNum: {
      fontSize: fontSize.lg,
      fontFamily: fonts.bold,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    countChip: {
      minWidth: 22,
      height: 20,
      paddingHorizontal: 6,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countText: {
      fontSize: 10,
      fontFamily: fonts.bold,
      fontWeight: '700',
    },
    miniStack: {
      width: '100%',
      alignItems: 'stretch',
      gap: 3,
      marginTop: 2,
      paddingHorizontal: 2,
      minHeight: 36,
    },
    miniBlock: {
      borderRadius: 4,
      paddingVertical: 2,
      paddingHorizontal: 2,
      alignItems: 'center',
    },
    miniTime: {
      fontSize: 8,
      fontFamily: fonts.semibold,
      fontWeight: '600',
      letterSpacing: -0.2,
    },
    miniPlaceholder: {
      height: 8,
    },
    moreHint: {
      fontSize: 8,
      fontFamily: fonts.bold,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 1,
    },
  });
}
