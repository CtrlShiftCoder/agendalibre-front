import { CheckCircle2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, spacing } from '@/theme/colors';

type Props = { title: string; message: string; primaryLabel: string; onPrimary: () => void; secondaryLabel?: string; onSecondary?: () => void };

/** Pantalla/estado de confirmación ("Acción completada con éxito"). */
export function ConfirmationScreen({ title, message, primaryLabel, onPrimary, secondaryLabel, onSecondary }: Props) {
  const c = useColors();
  return (
    <View style={styles.wrap} testID="confirmation">
      <View style={[styles.circle, { backgroundColor: c.accentSoft }]}>
        <CheckCircle2 size={48} color={c.accent === '#6BD8CB' ? '#6BD8CB' : c.accent} strokeWidth={2.2} />
      </View>
      <Text style={[styles.t, { color: c.onSurface }]} accessibilityRole="header">{title}</Text>
      <Text style={[styles.m, { color: c.onSurfaceVariant }]}>{message}</Text>
      <View style={{ width: '100%', gap: spacing.sm, marginTop: spacing.xl }}>
        <Button title={primaryLabel} onPress={onPrimary} />
        {secondaryLabel && onSecondary ? <Button title={secondaryLabel} variant="secondary" gradient={false} onPress={onSecondary} /> : null}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  circle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  t: { fontFamily: fonts.bold, fontWeight: '700', fontSize: 22, textAlign: 'center' },
  m: { fontFamily: fonts.medium, fontSize: fontSize.md, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
});
