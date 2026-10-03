import { BadgeCheck } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

type Props = { name: string; role?: string; status?: string; chips?: string[]; verified?: boolean; color?: string; children?: React.ReactNode };

/** Cabecera de perfil: avatar + insignia verificada + rol + chips. */
export function ProfileHeader({ name, role, status, chips, verified = true, color, children }: Props) {
  const c = useColors();
  return (
    <View style={[styles.card, { backgroundColor: c.surfaceContainerLowest, borderColor: c.surfaceContainerHigh }]}>
      <Avatar name={name} size={76} color={color} ring />
      <View style={styles.nameRow}>
        <Text style={[styles.name, { color: c.onSurface }]} accessibilityRole="header">{name}</Text>
        {verified ? <BadgeCheck size={20} color={c.accent} strokeWidth={2.4} /> : null}
      </View>
      {role ? <Text style={[styles.role, { color: c.onSurfaceVariant }]}>{role}</Text> : null}
      {status ? <Badge label={status} tone="success" /> : null}
      {chips?.length ? (
        <View style={styles.chips}>{chips.map((t) => <Badge key={t} label={t} tone="neutral" />)}</View>
      ) : null}
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: 6, padding: spacing.xl, borderRadius: radius.xl, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.lg },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  name: { fontFamily: fonts.bold, fontWeight: '700', fontSize: 22 },
  role: { fontFamily: fonts.medium, fontSize: fontSize.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 4 },
});
