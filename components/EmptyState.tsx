import {
  Bell,
  Calendar,
  CalendarHeart,
  Clock,
  Coffee,
  Heart,
  Image as ImageIcon,
  Inbox,
  ListOrdered,
  Scissors,
  Search,
  Sparkles,
  Star,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FadeInView } from '@/components/motion';
import { useColors, useThemeTokens } from '@/store/useTheme';
import { fontSize, fonts, radius, spacing } from '@/theme/colors';

type IconName =
  | 'coffee'
  | 'calendar'
  | 'calendarHeart'
  | 'scissors'
  | 'users'
  | 'sparkles'
  | 'heart'
  | 'inbox'
  | 'wallet'
  | 'bell'
  | 'image'
  | 'star'
  | 'search'
  | 'list'
  | 'clock';

interface Props {
  emoji?: string;
  icon?: IconName;
  title: string;
  subtitle?: string;
  /** Chile one-liner CTA label — only when an action exists */
  actionLabel?: string;
  onAction?: () => void;
}

const iconMap: Record<IconName, LucideIcon> = {
  coffee: Coffee,
  calendar: Calendar,
  calendarHeart: CalendarHeart,
  scissors: Scissors,
  users: Users,
  sparkles: Sparkles,
  heart: Heart,
  inbox: Inbox,
  wallet: Wallet,
  bell: Bell,
  image: ImageIcon,
  star: Star,
  search: Search,
  list: ListOrdered,
  clock: Clock,
};

/** Secondary icons for rich multi-icon compositions */
const companions: Record<IconName, LucideIcon[]> = {
  coffee: [Sparkles, Calendar],
  calendar: [Coffee, Sparkles],
  calendarHeart: [Heart, Sparkles],
  scissors: [Sparkles, Heart],
  users: [Heart, Sparkles],
  sparkles: [Heart, Scissors],
  heart: [Sparkles, Calendar],
  inbox: [Bell, Sparkles],
  wallet: [Sparkles, Calendar],
  bell: [Inbox, Sparkles],
  image: [Sparkles, Heart],
  star: [Heart, Sparkles],
  search: [Sparkles, Inbox],
  list: [Clock, Users],
  clock: [Bell, Calendar],
};

export function EmptyState({
  emoji,
  icon = 'sparkles',
  title,
  subtitle,
  actionLabel,
  onAction,
}: Props) {
  const theme = useThemeTokens();
  const colors = useColors();
  const Icon = iconMap[icon] ?? Sparkles;
  const [SideA, SideB] = companions[icon] ?? [Sparkles, Heart];
  const showAction = Boolean(actionLabel && onAction);

  return (
    <FadeInView style={styles.wrap}>
      <View style={styles.illustration}>
        <View style={[styles.ringOuter, { borderColor: theme.surfaceTint }]} />
        <View style={[styles.circle, { backgroundColor: theme.surfaceTint }]}>
          {emoji ? (
            <Text style={styles.emoji}>{emoji}</Text>
          ) : (
            <Icon size={32} color={theme.primary} strokeWidth={2} />
          )}
        </View>
        <View
          style={[
            styles.sat,
            styles.satA,
            { backgroundColor: theme.primary + '18', borderColor: colors.white },
          ]}
        >
          <SideA size={14} color={theme.primary} strokeWidth={2.2} />
        </View>
        <View
          style={[
            styles.sat,
            styles.satB,
            { backgroundColor: theme.accent + '22', borderColor: colors.white },
          ]}
        >
          <SideB size={12} color={theme.accent} strokeWidth={2.2} />
        </View>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.secondary }]}>{subtitle}</Text>
      ) : null}
      {showAction ? (
        <View style={styles.ctaWrap}>
          <Button
            title={actionLabel!}
            onPress={onAction}
            fullWidth={false}
            style={styles.ctaBtn}
          />
        </View>
      ) : null}
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  illustration: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  ringOuter: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 8,
    opacity: 0.55,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: radius.xxl + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sat: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  satA: { top: 4, right: 8 },
  satB: { bottom: 10, left: 4 },
  emoji: { fontSize: 34 },
  title: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.sm + 1,
    fontFamily: fonts.medium,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
    maxWidth: 280,
  },
  ctaWrap: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  ctaBtn: {
    paddingHorizontal: spacing.xl,
    minWidth: 160,
  },
});
