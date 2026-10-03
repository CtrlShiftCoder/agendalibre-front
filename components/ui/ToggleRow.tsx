import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { useColors } from '@/store/useTheme';
import { fonts, fontSize, spacing } from '@/theme/colors';

type Props = {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  badge?: React.ReactNode;
};

/** Fila con interruptor (ajustes/permisos). Persistir en el store desde la pantalla. */
export function ToggleRow({ title, description, value, onValueChange, disabled, badge }: Props) {
  const c = useColors();
  return (
    <View style={[styles.row, { borderBottomColor: c.surfaceContainerHigh }]}>
      <View style={{ flex: 1 }}>
        <View style={styles.tr}>
          <Text style={[styles.t, { color: c.onSurface }]}>{title}</Text>
          {badge}
        </View>
        {description ? <Text style={[styles.d, { color: c.onSurfaceVariant }]}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: c.surfaceContainerHigh, true: c.accent }}
        thumbColor="#fff"
        accessibilityLabel={title}
        accessibilityRole="switch"
      />
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  tr: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  t: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.md },
  d: { fontFamily: fonts.medium, fontSize: fontSize.sm, marginTop: 2, lineHeight: 18 },
});
