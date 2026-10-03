import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { useColors } from '@/store/useTheme';
import { fonts, fontSize, spacing } from '@/theme/colors';

type Chip = { id: string; label: string; count?: number };
type Props = { chips: Chip[]; value: string; onChange: (id: string) => void };

/** Chips de filtro horizontales (Todos 3 · Sillones 2 …). Seleccionado: fondo primary + texto blanco (AA). */
export function FilterChips({ chips, value, onChange }: Props) {
  const c = useColors();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} accessibilityRole="radiogroup">
      {chips.map((ch) => {
        const on = ch.id === value;
        return (
          <Pressable
            key={ch.id}
            onPress={() => onChange(ch.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on, checked: on }}
            style={[styles.chip, { backgroundColor: on ? c.primary : c.surfaceContainerLow }]}
          >
            <Text style={[styles.txt, { color: on ? '#fff' : c.onSurfaceVariant }]}>
              {ch.label}{ch.count != null ? `  ${ch.count}` : ''}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  rail: { gap: spacing.sm, paddingVertical: spacing.xs, marginBottom: spacing.md },
  chip: { paddingHorizontal: 14, minHeight: 38, borderRadius: 999, justifyContent: 'center' },
  txt: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.sm },
});
