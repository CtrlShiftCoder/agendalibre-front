import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/store/useTheme';
import { fonts } from '@/theme/colors';

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return ((parts[0][0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

type Props = { name: string; size?: number; color?: string; ring?: boolean };

/** Avatar circular con iniciales (sin imágenes remotas). */
export function Avatar({ name, size = 44, color, ring }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color ?? colors.primaryContainer,
        },
        ring && { borderWidth: 2, borderColor: colors.accent },
      ]}
      accessibilityLabel={`Avatar de ${name}`}
    >
      <Text style={[styles.txt, { fontSize: Math.round(size * 0.36) }]}>{initialsOf(name)}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  txt: { color: '#fff', fontFamily: fonts.bold, fontWeight: '700' },
});
