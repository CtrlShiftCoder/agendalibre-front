import React, {useMemo} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {useThemeTokens, useColors} from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  shadow,
  spacing,
  type AppColors,
} from '@/theme/colors';

const DOW_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const DOW_ABBR = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export type WeekDay = {
  date: string;
  dayOfWeek: number;
  dayNum: number;
  isToday: boolean;
};

interface Props {
  selectedDate: string;
  onSelect: (date: string) => void;
  /** Optional appointment counts */
  counts?: Record<string, number>;
  /** Anchor for the week (defaults to today) */
  anchorDate?: string;
}

/** Mon–Sun of the week containing `anchor` (defaults to today). */
export function getWeekDays(anchor = new Date()): WeekDay[] {
  const d = new Date(anchor);
  d.setHours(12, 0, 0, 0);
  const dow = d.getDay(); // 0=Sun
  // Start Monday
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);

  const todayIso = new Date().toISOString().slice(0, 10);
  const out: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const iso = day.toISOString().slice(0, 10);
    out.push({
      date: iso,
      dayOfWeek: day.getDay(),
      dayNum: day.getDate(),
      isToday: iso === todayIso,
    });
  }
  return out;
}

/**
 * Flujo week strip — flex-1 days, selected = primary fill + glow + scale 1.05,
 * HOY label + white/primary-fixed dot when today is selected.
 */
export function WeekCarousel({
  selectedDate,
  onSelect,
  counts: _counts,
  anchorDate,
}: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const days = useMemo(() => {
    const anchor = anchorDate
      ? new Date(anchorDate + 'T12:00:00')
      : new Date();
    return getWeekDays(anchor);
  }, [anchorDate]);

  return (
    <View style={styles.row}>
      {days.map((d) => {
        const sel = d.date === selectedDate;
        return (
          <Pressable
            key={d.date}
            onPress={() => onSelect(d.date)}
            style={[
              styles.chip,
              {
                backgroundColor: sel
                  ? theme.primary
                  : colors.surfaceContainerLow,
              },
              sel && {
                ...shadow.primaryGlow,
                transform: [{ scale: 1.05 }],
                zIndex: 2,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: sel }}
            accessibilityLabel={`${DOW_ABBR[d.dayOfWeek]} ${d.dayNum}${
              d.isToday ? ', hoy' : ''
            }`}
          >
            {sel && d.isToday ? (
              <Text style={[styles.hoyLabel, { color: theme.onPrimary }]}>
                HOY
              </Text>
            ) : (
              <Text
                style={[
                  styles.dow,
                  sel && { color: theme.onPrimary, opacity: 0.9 },
                ]}
              >
                {DOW_SHORT[d.dayOfWeek]}
              </Text>
            )}
            <Text
              style={[
                styles.dayNum,
                sel
                  ? { color: theme.onPrimary }
                  : { color: colors.onSurface },
              ]}
            >
              {d.dayNum}
            </Text>
            {sel ? (
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: d.isToday
                      ? '#fff'
                      : colors.primaryFixed,
                  },
                ]}
              />
            ) : (
              <View style={styles.dotPlaceholder} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    paddingVertical: 6,
  },
  chip: {
    flex: 1,
    minWidth: 44,
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    gap: 4,
  },
  dow: {
    fontSize: 10,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: c.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  hoyLabel: {
    fontSize: 9,
    fontFamily: fonts.bold,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  dayNum: {
    fontSize: fontSize.xl,
    fontFamily: fonts.bold,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  dotPlaceholder: {
    width: 6,
    height: 6,
    marginTop: 2,
  },
});
}

