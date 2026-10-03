import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/store/useTheme';
import { fonts } from '@/theme/colors';

type Tone = 'primary' | 'success' | 'warn' | 'danger' | 'neutral' | 'accent';
type Props = { label: string; tone?: Tone; icon?: React.ReactNode };

/** Pastilla de estado / insignia. Siempre texto sobre contenedor con contraste AA. */
export function Badge({ label, tone = 'primary', icon }: Props) {
  const c = useColors();
  const map: Record<Tone, { bg: string; fg: string }> = {
    primary: { bg: c.primaryFixed, fg: c.primaryText },
    success: { bg: c.tertiaryFixed, fg: c.tertiary },
    warn: { bg: c.surfaceContainerHigh, fg: c.amber },
    danger: { bg: c.softRose, fg: c.danger },
    neutral: { bg: c.surfaceContainer, fg: c.onSurfaceVariant },
    accent: { bg: c.accentSoft, fg: c.secondary },
  };
  const t = map[tone];
  return (
    <View style={[styles.b, { backgroundColor: t.bg }]}>
      {icon}
      <Text style={[styles.t, { color: t.fg }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  b: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  t: { fontFamily: fonts.labelSemibold, fontSize: 11, letterSpacing: 0.4 },
});
