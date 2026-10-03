import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/store/useTheme';
import { fonts, radius, spacing } from '@/theme/colors';

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'plain' | 'primary' | 'success' | 'warn' | 'danger';
  onPress?: () => void;
  icon?: React.ReactNode;
};

/** Métrica compacta (valor grande en Space Grotesk + etiqueta). */
export function StatCard({ label, value, hint, tone = 'plain', onPress, icon }: Props) {
  const c = useColors();
  const map = {
    plain: { bg: c.surfaceContainerLowest, fg: c.onSurface },
    primary: { bg: c.primaryFixed, fg: c.primaryText },
    success: { bg: c.tertiaryFixed, fg: c.tertiary },
    warn: { bg: c.surfaceContainerHigh, fg: c.amber },
    danger: { bg: c.softRose, fg: c.danger },
  }[tone];
  const body = (
    <View style={[styles.card, { backgroundColor: map.bg, borderColor: c.surfaceContainerHigh }]}>
      {icon}
      <Text style={[styles.value, { color: map.fg }]}>{value}</Text>
      <Text style={[styles.label, { color: tone === 'plain' ? c.onSurfaceVariant : map.fg }]}>{label}</Text>
      {hint ? <Text style={[styles.hint, { color: c.onSurfaceVariant }]}>{hint}</Text> : null}
    </View>
  );
  if (!onPress) return <View style={{ flex: 1 }}>{body}</View>;
  return (
    <Pressable style={{ flex: 1 }} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}: ${value}`}>
      {body}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: { borderRadius: radius.md, padding: spacing.md, borderWidth: StyleSheet.hairlineWidth, minHeight: 78, justifyContent: 'center' },
  value: { fontFamily: fonts.labelBold, fontWeight: '700', fontSize: 20 },
  label: { fontFamily: fonts.labelSemibold, fontSize: 11, letterSpacing: 0.3, marginTop: 2 },
  hint: { fontFamily: fonts.medium, fontSize: 11, marginTop: 2 },
});
