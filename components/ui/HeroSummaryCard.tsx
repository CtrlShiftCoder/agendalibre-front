import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

type Props = {
  label: string;
  value: string;
  caption?: string;
  chips?: string[];
  children?: React.ReactNode;
};

/** Tarjeta destacada con degradado del perfil (Stitch: "tarjeta oscura" arriba del dashboard). Texto blanco AA. */
export function HeroSummaryCard({ label, value, caption, chips, children }: Props) {
  const c = useColors();
  return (
    <LinearGradient colors={[c.heroFrom, c.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text style={styles.value} accessibilityRole="header">{value}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      {chips?.length ? (
        <View style={styles.chips}>
          {chips.map((t) => (
            <View key={t} style={styles.chip}><Text style={styles.chipTxt}>{t}</Text></View>
          ))}
        </View>
      ) : null}
      {children}
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg },
  label: { fontFamily: fonts.labelSemibold, fontSize: 11, letterSpacing: 1.2, color: '#fff', opacity: 0.9 },
  value: { fontFamily: fonts.labelBold, fontWeight: '700', fontSize: 34, color: '#fff', marginTop: 4 },
  caption: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: '#fff', opacity: 0.92, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  chip: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  chipTxt: { fontFamily: fonts.labelSemibold, fontSize: 12, color: '#fff' },
});
