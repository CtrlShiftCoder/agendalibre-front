import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

type Props = { title: string; icon?: React.ReactNode; hint?: string; children: React.ReactNode; right?: React.ReactNode };

/** Tarjeta de formulario con título + icono (secciones de "Configuración", "Crear servicio"). */
export function FormSection({ title, icon, hint, children, right }: Props) {
  const c = useColors();
  return (
    <View style={[styles.card, { backgroundColor: c.surfaceContainerLowest, borderColor: c.surfaceContainerHigh }]}>
      <View style={styles.head}>
        {icon ? <View style={[styles.icon, { backgroundColor: c.primaryFixed }]}>{icon}</View> : null}
        <Text style={[styles.title, { color: c.onSurface }]} accessibilityRole="header">{title}</Text>
        {right}
      </View>
      {hint ? <Text style={[styles.hint, { color: c.onSurfaceVariant }]}>{hint}</Text> : null}
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, marginBottom: spacing.lg },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  icon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.lg },
  hint: { fontFamily: fonts.medium, fontSize: fontSize.sm, marginBottom: spacing.sm, lineHeight: 18 },
});
