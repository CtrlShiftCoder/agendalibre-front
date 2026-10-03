import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius } from '@/theme/colors';

type Props = { title: string; onPress: () => void; icon?: React.ReactNode; outline?: boolean };

/** Botón destructivo (rojo). Contraste: blanco sobre #BA1A1A = 6.5:1; outline usa texto danger. */
export function DangerButton({ title, onPress, icon, outline }: Props) {
  const c = useColors();
  const solid = !outline;
  const bg = solid ? (c.danger === '#BA1A1A' ? '#BA1A1A' : '#93000A') : 'transparent';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[styles.btn, { backgroundColor: bg, borderColor: c.danger, borderWidth: outline ? 1.5 : 0 }]}
    >
      {icon}
      <Text style={[styles.txt, { color: solid ? '#fff' : c.danger }]}>{title}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  btn: { minHeight: 52, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
  txt: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.md },
});
