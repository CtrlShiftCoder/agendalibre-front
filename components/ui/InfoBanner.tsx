import { Info } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

type Props = { title?: string; text: string; icon?: React.ReactNode };
export function InfoBanner({ title, text, icon }: Props) {
  const c = useColors();
  return (
    <View style={[styles.b, { backgroundColor: c.primaryFixed }]}>
      {icon ?? <Info size={20} color={c.primaryText} strokeWidth={2.4} />}
      <Text style={[styles.t, { color: c.onSurface }]}>
        {title ? <Text style={{ fontFamily: fonts.bold, fontWeight: '700' }}>{title} </Text> : null}
        {text}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  b: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  t: { flex: 1, fontFamily: fonts.medium, fontSize: fontSize.sm, lineHeight: 20 },
});
