import { LinearGradient } from 'expo-linear-gradient';
import {
  Heart,
  Scissors,
  Sparkles,
  type LucideIcon,
} from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { coverGradient, nicheMoodLabel } from '@/lib/nicheVisuals';
import { useAppStore } from '@/store/useAppStore';
import { useThemeTokens } from '@/store/useTheme';
import { fontSize, radius, shadow, spacing } from '@/theme/colors';
import type { Niche } from '@/data/types';

interface NextChip {
  time: string;
  detail: string;
}

interface Props {
  greeting?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  next?: NextChip | null;
  avatarLetter?: string;
  showAvatar?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
  compact?: boolean;
}

function nicheIcon(niche: Niche): LucideIcon {
  if (niche === 'health') return Heart;
  if (niche === 'beauty') return Sparkles;
  return Scissors;
}

export function CoverHero({
  greeting,
  title,
  subtitle,
  right,
  next,
  avatarLetter,
  showAvatar = true,
  children,
  style,
  compact,
}: Props) {
  const theme = useThemeTokens();
  const niche = useAppStore((s) => s.profile.niche);
  const themeId = useAppStore((s) => s.profile.theme);
  const Icon = nicheIcon(niche);
  const colors = coverGradient(themeId);
  const letter = (avatarLetter || title).slice(0, 1).toUpperCase() || 'A';

  return (
    <View style={[styles.wrap, shadow.lg, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cover, compact && styles.compact]}
      >
        {/* Decorative icon collage */}
        <View style={styles.collage} pointerEvents="none">
          <View style={[styles.blob, styles.blobA]}>
            <Icon size={36} color="rgba(255,255,255,0.18)" strokeWidth={1.5} />
          </View>
          <View style={[styles.blob, styles.blobB]}>
            <Sparkles size={28} color="rgba(255,255,255,0.14)" strokeWidth={1.5} />
          </View>
          <View style={[styles.blob, styles.blobC]}>
            <Heart size={22} color="rgba(255,255,255,0.12)" strokeWidth={1.5} />
          </View>
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.35)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            {greeting ? <Text style={styles.greeting}>{greeting}</Text> : null}
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle}>{subtitle}</Text>
            ) : (
              <Text style={styles.mood}>{nicheMoodLabel(niche)}</Text>
            )}
          </View>
          {right}
        </View>

        {showAvatar ? (
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { borderColor: theme.accent }]}>
              <Text style={styles.avatarText}>{letter}</Text>
            </View>
            <View style={[styles.moodPill, { backgroundColor: theme.accent }]}>
              <Icon size={12} color="#fff" strokeWidth={2.5} />
              <Text style={styles.moodPillText}>{nicheMoodLabel(niche)}</Text>
            </View>
          </View>
        ) : null}

        {next ? (
          <View style={styles.nextChip}>
            <Text style={styles.nextLabel}>Próxima cita</Text>
            <Text style={styles.nextTime}>{next.time}</Text>
            <Text style={styles.nextDetail} numberOfLines={1}>
              {next.detail}
            </Text>
          </View>
        ) : null}

        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  cover: {
    padding: spacing.xl,
    minHeight: 168,
    overflow: 'hidden',
  },
  compact: {
    minHeight: 140,
    paddingVertical: spacing.lg,
  },
  collage: {
    ...StyleSheet.absoluteFill,
  },
  blob: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blobA: { top: 12, right: 20, width: 64, height: 64 },
  blobB: { bottom: 40, right: 72, width: 48, height: 48 },
  blobC: { top: 48, right: 100, width: 40, height: 40 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    zIndex: 1,
  },
  greeting: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: fontSize.xxl,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: fontSize.md,
    fontWeight: '500',
    marginTop: 6,
    lineHeight: 20,
  },
  mood: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: 6,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    zIndex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  moodPillText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  nextChip: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    zIndex: 1,
  },
  nextLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nextTime: {
    color: '#fff',
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginTop: 4,
  },
  nextDetail: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.sm,
    marginTop: 2,
    fontWeight: '500',
  },
});
