import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/store/useTheme';
import { fonts, radius, spacing } from '@/theme/colors';

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/** Matriz 21×21 determinista (mock visual, NO es un QR escaneable). */
function matrix(value: string, n = 21): boolean[][] {
  let seed = hash(value) || 1;
  const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
  const m = Array.from({ length: n }, () => Array.from({ length: n }, () => rnd() > 0.5));
  const finder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
      const edge = r === 0 || c === 0 || r === 6 || c === 6;
      const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      m[r0 + r][c0 + c] = edge || core;
    }
  };
  finder(0, 0); finder(0, n - 7); finder(n - 7, 0);
  return m;
}

type Props = { value: string; size?: number; caption?: string; expires?: string; code?: string };

/** Pase QR (mock visual determinista) con caption y código de respaldo. */
export function QRCard({ value, size = 200, caption, expires, code }: Props) {
  const c = useColors();
  const m = useMemo(() => matrix(value), [value]);
  const cell = size / m.length;
  return (
    <View style={[styles.card, { backgroundColor: c.surfaceContainerLowest, borderColor: c.surfaceContainerHigh }]} testID="qr-card">
      <View
        style={[styles.qr, { width: size + 24, height: size + 24, backgroundColor: '#fff' }]}
        accessibilityRole="image"
        accessibilityLabel={caption ?? 'Código QR de enrolamiento (demo)'}
      >
        {m.map((row, r) => (
          <View key={r} style={{ flexDirection: 'row' }}>
            {row.map((on, k) => (
              <View key={k} style={{ width: cell, height: cell, backgroundColor: on ? '#0F172A' : '#fff' }} />
            ))}
          </View>
        ))}
      </View>
      {caption ? <Text style={[styles.cap, { color: c.onSurface }]}>{caption}</Text> : null}
      {expires ? <Text style={[styles.exp, { color: c.primaryText }]}>{expires}</Text> : null}
      {code ? (
        <View style={[styles.code, { backgroundColor: c.surfaceContainerLow }]}>
          <Text style={[styles.codeL, { color: c.onSurfaceVariant }]}>Código de respaldo</Text>
          <Text style={[styles.codeV, { color: c.onSurface }]}>{code}</Text>
        </View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', padding: spacing.xl, marginBottom: spacing.lg },
  qr: { padding: 12, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  cap: { fontFamily: fonts.bold, fontWeight: '700', fontSize: 16, marginTop: spacing.md, textAlign: 'center' },
  exp: { fontFamily: fonts.labelSemibold, fontSize: 13, marginTop: 4 },
  code: { marginTop: spacing.md, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, alignItems: 'center' },
  codeL: { fontFamily: fonts.medium, fontSize: 11 },
  codeV: { fontFamily: fonts.labelBold, fontSize: 20, letterSpacing: 2 },
});
