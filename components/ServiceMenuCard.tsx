import { Clock, Heart, Scissors, Sparkles } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatClp } from '@/lib/money';
import { useAppStore } from '@/store/useAppStore';
import { useColors, useThemeTokens } from '@/store/useTheme';
import { fontSize, radius, shadow, spacing } from '@/theme/colors';

interface Props {
  name: string;
  durationMin: number;
  priceClp: number;
  selected?: boolean;
  onPress?: () => void;
  footer?: React.ReactNode;
}

export function ServiceMenuCard({
  name,
  durationMin,
  priceClp,
  selected,
  onPress,
  footer,
}: Props) {
  const theme = useThemeTokens();
  const colors = useColors();
  const niche = useAppStore((s) => s.profile.niche);
  const Icon =
    niche === 'health' ? Heart : niche === 'beauty' ? Sparkles : Scissors;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        shadow.md,
        {
                    },
        selected && {
          borderColor: theme.primary,
          backgroundColor: theme.surfaceTint,
        },
      ]}
    >
      <View style={[styles.thumb, { backgroundColor: theme.primary + '14' }]}>
        <Icon size={26} color={theme.primary} strokeWidth={2} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {name}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.durationBadge, { backgroundColor: theme.surfaceTint }]}>
            <Clock size={12} color={colors.primaryText} strokeWidth={2.5} />
            <Text style={[styles.durationText, { color: colors.primaryText }]}>
              {durationMin} min
            </Text>
          </View>
        </View>
        {footer}
      </View>
      <View style={styles.priceCol}>
        <Text style={[styles.price, { color: colors.primaryText }]}>
          {formatClp(priceClp)}
        </Text>
        <Text style={[styles.priceHint, { color: colors.textMuted }]}>CLP</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.md,
    marginBottom: spacing.md,
    minHeight: 88,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 6 },
  name: {
    fontSize: fontSize.md + 1,
    fontWeight: '700',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  durationText: { fontSize: fontSize.xs, fontWeight: '700' },
  priceCol: { alignItems: 'flex-end', minWidth: 88 },
  price: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  priceHint: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 2,
  },
});
