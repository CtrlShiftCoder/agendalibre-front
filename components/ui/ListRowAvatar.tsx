import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

type Props = {
  name: string;
  title?: string;
  subtitle?: string;
  meta?: string;
  color?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  avatarSize?: number;
};

/** Fila de lista con avatar (equipo, clientes, solicitudes). */
export function ListRowAvatar({ name, title, subtitle, meta, color, right, onPress, chevron, avatarSize = 44 }: Props) {
  const c = useColors();
  const body = (
    <View style={[styles.row, { backgroundColor: c.surfaceContainerLowest, borderColor: c.surfaceContainerHigh }]}>
      <Avatar name={name} color={color} size={avatarSize} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.t, { color: c.onSurface }]} numberOfLines={1}>{title ?? name}</Text>
        {subtitle ? <Text style={[styles.s, { color: c.onSurfaceVariant }]} numberOfLines={1}>{subtitle}</Text> : null}
        {meta ? <Text style={[styles.m, { color: c.primaryText }]} numberOfLines={1}>{meta}</Text> : null}
      </View>
      {right}
      {chevron || (onPress && !right) ? <ChevronRight size={18} color={c.onSurfaceVariant} /> : null}
    </View>
  );
  if (!onPress) return body;
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title ?? name}>{body}</Pressable>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.sm },
  t: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.md },
  s: { fontFamily: fonts.medium, fontSize: fontSize.sm, marginTop: 1 },
  m: { fontFamily: fonts.labelSemibold, fontSize: 12, marginTop: 2 },
});
