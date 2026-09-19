import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useThemeTokens } from '@/store/useTheme';
import { fontSize, radius, shadow, spacing } from '@/theme/colors';

interface Props {
  greeting?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
  style?: ViewStyle;
  compact?: boolean;
}

export function HeroHeader({
  greeting,
  title,
  subtitle,
  right,
  children,
  style,
  compact,
}: Props) {
  const theme = useThemeTokens();

  return (
    <LinearGradient
      colors={theme.heroGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, compact && styles.compact, shadow.md, style]}
    >
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          {greeting ? <Text style={styles.greeting}>{greeting}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  compact: {
    paddingVertical: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
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
    letterSpacing: -0.3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: fontSize.md,
    fontWeight: '500',
    marginTop: 6,
    lineHeight: 20,
  },
});
