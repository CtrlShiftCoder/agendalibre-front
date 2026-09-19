import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView, StaggerItem } from '@/components/motion';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { useColors } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  flujo,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

/**
 * Shared chrome for Login / Registro: brand, green Flujo palette, centered column.
 * Brand FadeInDown + staggered form fields.
 */
export function AuthShell({ title, subtitle, children }: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const items = React.Children.toArray(children);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ResponsiveShell forceMax style={styles.shell}>
            <FadeInView preset="fadeDown" delay={40} duration={420}>
              <View style={styles.brandRow}>
                <View style={styles.logoMark}>
                  <Text style={styles.logoLetter}>A</Text>
                </View>
                <Text style={styles.brand}>AgendaLibre</Text>
              </View>
            </FadeInView>

            <FadeInView preset="fadeDown" delay={100} duration={400}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </FadeInView>

            <View style={styles.body}>
              {items.map((child, i) => (
                <StaggerItem key={i} index={i} baseDelay={160} step={60}>
                  {child}
                </StaggerItem>
              ))}
            </View>
          </ResponsiveShell>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Divider with “o continúa con” copy */
export function AuthDivider({ label = 'o continúa con' }: { label?: string }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.dividerRow} accessibilityRole="text">
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: c.surface,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    justifyContent: 'center',
  },
  shell: {
    width: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: flujo.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.lg,
  },
  brand: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.lg,
    color: c.onSurface,
    letterSpacing: -0.3,
  },
  title: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.hero,
    color: c.onSurface,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: fontSize.md,
    color: c.onSurfaceVariant,
    lineHeight: 22,
  },
  body: {
    gap: 0,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: c.outline,
  },
  dividerText: {
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
});
}
