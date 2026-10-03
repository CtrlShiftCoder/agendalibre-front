import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useColors } from '@/store/useTheme';
import { fonts } from '@/theme/colors';

type BarProps = { data: { label: string; value: number }[]; height?: number; highlightLast?: boolean };

/** Barras simples con Views (sin dependencias). Etiqueta accesible con los valores. */
export function BarChartMini({ data, height = 110, highlightLast = true }: BarProps) {
  const c = useColors();
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View
      style={[styles.bars, { height: height + 22 }]}
      accessibilityLabel={`Gráfico de barras: ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`}
    >
      {data.map((d, i) => {
        const last = i === data.length - 1;
        return (
          <View key={d.label + i} style={styles.col}>
            <View style={[styles.bar, {
              height: Math.max(4, (d.value / max) * height),
              backgroundColor: highlightLast && last ? c.primaryContainer : c.primaryFixed,
            }]} />
            <Text style={[styles.lbl, { color: c.onSurfaceVariant }]}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

type LineProps = { values: number[]; height?: number; width?: number };

/** Línea suave con react-native-svg. */
export function LineChartMini({ values, height = 90, width = 300 }: LineProps) {
  const c = useColors();
  const max = Math.max(1, ...values);
  const min = Math.min(...values, 0);
  const pts = values.map((v, i) => [
    (i / Math.max(1, values.length - 1)) * (width - 16) + 8,
    height - 8 - ((v - min) / Math.max(1, max - min)) * (height - 16),
  ]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1] ?? [0, 0];
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} accessibilityLabel={`Tendencia: ${values.join(', ')}`}>
      <Path d={d} stroke={c.primaryContainer} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last[0]} cy={last[1]} r={5} fill={c.accent} />
    </Svg>
  );
}
const styles = StyleSheet.create({
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  bar: { width: '100%', borderRadius: 8 },
  lbl: { fontFamily: fonts.labelSemibold, fontSize: 11 },
});
