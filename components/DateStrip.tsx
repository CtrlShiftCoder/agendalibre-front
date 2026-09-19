import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  shadow,
  spacing,
} from '@/theme/colors';

export type DateStripDay = {
  date: string;
  label: string;
  dayOfWeek: number;
};

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

interface Props {
  days: DateStripDay[];
  selectedDate: string;
  onSelect: (date: string) => void;
  /** Optional count of appointments per date */
  counts?: Record<string, number>;
}

function dayNumber(iso: string): string {
  return String(Number(iso.slice(8, 10)));
}

export function DateStrip({ days, selectedDate, onSelect, counts }: Props) {
  const theme = useThemeTokens();
  const colors = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {days.map((d) => {
        const sel = d.date === selectedDate;
        const count = counts?.[d.date] ?? 0;
        const isHoy = d.label === 'Hoy';
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
              sel && { ...shadow.primaryGlow, transform: [{ scale: 1.05 }] },
            ]}
          >
            <Text
              style={[
                styles.dow,
                {
                  color: sel ? theme.onPrimary : colors.onSurfaceVariant,
                  opacity: sel ? 0.9 : 1,
                },
              ]}
            >
              {isHoy ? 'Hoy' : DOW[d.dayOfWeek]}
            </Text>
            <Text
              style={[
                styles.dayNum,
                { color: sel ? theme.onPrimary : colors.onSurface },
              ]}
            >
              {dayNumber(d.date)}
            </Text>
            {sel && isHoy ? (
              <View style={styles.hoyPill}>
                <Text style={styles.hoyPillText}>Hoy</Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.count,
                  {
                    color: sel ? theme.onPrimary : colors.onSurfaceVariant,
                    opacity: sel ? 0.85 : 1,
                  },
                ]}
              >
                {count ? `${count}` : '·'}
              </Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: spacing.lg },
  row: {
    paddingRight: spacing.xl,
    paddingVertical: 6,
    gap: spacing.sm,
  },
  chip: {
    width: 56,
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    marginRight: 2,
  },
  dow: {
    fontSize: 10,
    fontFamily: fonts.bold,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  dayNum: {
    fontSize: fontSize.xl,
    fontFamily: fonts.bold,
    fontWeight: '800',
  },
  count: {
    marginTop: 6,
    fontSize: 10,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
  hoyPill: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  hoyPillText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
});
