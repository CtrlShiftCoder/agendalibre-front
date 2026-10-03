import { router } from 'expo-router';
import { ChevronRight, FileDown, FileText, PiggyBank, Receipt, Shield } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, BarChartMini, FormSection, HeroSummaryCard, InfoBanner, PageScaffold, ScreenHeader, StatCard, toast } from '@/components/ui';
import { formatClp } from '@/lib/cash';
import { addDaysIso, todayIso } from '@/lib/uiFormat';
import { useAppStore, usePref } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

const DAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

/** Stitch: "Mis Finanzas" (profesional) — pestaña Finanzas. */
export default function Finanzas() {
  const c = useColors();
  const apts = useAppStore((s) => s.appointments);
  const services = useAppStore((s) => s.services);
  const role = useAppStore((s) => s.profile.role);
  const [mode, setMode] = usePref<'indep' | 'canon' | 'comision'>('fin.mode', 'indep');
  const [canon] = usePref<number>('fin.canon', 0);

  const price = (id: string) => services.find((s) => s.id === id)?.priceClp ?? 0;
  const { month, days, pending, count } = useMemo(() => {
    const t = todayIso();
    const ym = t.slice(0, 7);
    const done = apts.filter((a) => a.status === 'completada');
    const month = done.filter((a) => a.date.startsWith(ym)).reduce((n, a) => n + price(a.serviceId), 0);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = addDaysIso(t, i - 6);
      const v = done.filter((a) => a.date === d).reduce((n, a) => n + price(a.serviceId), 0);
      return { label: DAYS[new Date(d + 'T12:00:00').getDay()], value: v };
    });
    const pending = apts.filter((a) => a.status === 'confirmada').reduce((n, a) => n + price(a.serviceId), 0);
    return { month, days, pending, count: done.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apts, services]);

  const insumos = mode === 'indep' ? Math.round(month * 0.08) : 0;
  const deduc = (mode === 'canon' ? canon || 320000 : 0) + insumos;
  const neto = month - deduc;
  const commissionBase = mode === 'comision' ? Math.round(month * 0.5) : 0;

  const links = [
    { t: 'Caja del día', d: 'Ingresos del día, métodos de pago y CSV', to: '/caja', icon: <Receipt size={18} color={c.primaryText} /> },
    ...(role === 'persona_natural' ? [{ t: 'Honorarios', d: 'Boleta de honorarios: bruto, retención y líquido', to: '/honorarios', icon: <FileText size={18} color={c.primaryText} /> }] : []),
    { t: 'Seña y abonos', d: 'Configura y sigue anticipos', to: '/sena', icon: <PiggyBank size={18} color={c.primaryText} /> },
    { t: 'Mis servicios y precios', d: 'Catálogo con duración y precio en CLP', to: '/servicios', icon: <Shield size={18} color={c.primaryText} /> },
  ];

  return (
    <PageScaffold tabbed>
      <ScreenHeader back={false} title="Mis finanzas" subtitle="Ganancias y modalidad" actions />
      <View style={styles.seg}>
        {([['indep', 'Independiente'], ['canon', 'Arriendo sillón'], ['comision', 'Staff comisión']] as const).map(([k, l]) => (
          <Pressable key={k} onPress={() => setMode(k)} accessibilityRole="radio" accessibilityState={{ selected: mode === k }}
            style={[styles.segBtn, { backgroundColor: mode === k ? c.primary : c.surfaceContainerLow }]}>
            <Text style={[styles.segT, { color: mode === k ? '#fff' : c.onSurfaceVariant }]}>{l}</Text>
          </Pressable>
        ))}
      </View>
      <InfoBanner text={mode === 'indep' ? 'Modelo independiente: cobras el 100% bruto de tus servicios, sin comisión de plataforma.' : mode === 'canon' ? 'Cobras el 100% y pagas un canon mensual fijo por el uso del espacio.' : 'Ganas un porcentaje de cada servicio; el local cobra y liquida por ti.'} />

      <HeroSummaryCard
        label="Ganancia neta disponible"
        value={formatClp(mode === 'comision' ? commissionBase : neto)}
        caption="Mes en curso · CLP"
        chips={[`Facturado ${formatClp(month)}`, ...(deduc ? [`Deducciones −${formatClp(deduc)}`] : []), `${count} atenciones`]}
      />

      <FormSection title="Últimos 7 días" hint="Ingresos de citas completadas">
        <BarChartMini data={days} />
      </FormSection>

      <View style={styles.stats}>
        <StatCard label="Por cobrar (confirmadas)" value={formatClp(pending)} tone="warn" />
        <StatCard label="Liquidación estimada" value={formatClp(Math.round((mode === 'comision' ? commissionBase : neto) / 2))} tone="primary" />
      </View>

      <FormSection title="Deducciones de operación" right={<Badge label={`−${formatClp(deduc)}`} tone="danger" />}>
        {mode === 'canon' ? <View style={styles.row}><Text style={[styles.d, { color: c.onSurface }]}>Canon arriendo sillón</Text><Text style={[styles.v, { color: c.danger }]}>−{formatClp(canon || 320000)}</Text></View> : null}
        <View style={styles.row}><Text style={[styles.d, { color: c.onSurface }]}>Insumos del mes (estimado 8%)</Text><Text style={[styles.v, { color: c.danger }]}>−{formatClp(insumos)}</Text></View>
        <Pressable onPress={() => { toast('Reporte mensual exportado (CSV demo)'); router.push('/caja'); }} accessibilityRole="button" accessibilityLabel="Exportar reporte" style={styles.exp}>
          <FileDown size={16} color={c.primaryText} /><Text style={[styles.d, { color: c.primaryText, fontFamily: fonts.semibold }]}>Exportar reporte (abre Caja)</Text>
        </Pressable>
      </FormSection>

      {links.map((r) => (
        <Pressable key={r.t} onPress={() => router.push(r.to as never)} accessibilityRole="button" accessibilityLabel={r.t}
          style={[styles.link, { backgroundColor: c.surfaceContainerLowest, borderColor: c.surfaceContainerHigh }]}>
          <View style={[styles.ic, { backgroundColor: c.primaryFixed }]}>{r.icon}</View>
          <View style={{ flex: 1 }}><Text style={[styles.t, { color: c.onSurface }]}>{r.t}</Text><Text style={[styles.d, { color: c.onSurfaceVariant }]}>{r.d}</Text></View>
          <ChevronRight size={18} color={c.onSurfaceVariant} />
        </Pressable>
      ))}
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  seg: { flexDirection: 'row', gap: 8, marginBottom: spacing.md, flexWrap: 'wrap' },
  segBtn: { paddingHorizontal: 14, minHeight: 40, borderRadius: 999, justifyContent: 'center' },
  segT: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.sm },
  stats: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  d: { fontFamily: fonts.medium, fontSize: fontSize.sm },
  v: { fontFamily: fonts.labelBold, fontSize: fontSize.md },
  t: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.md },
  exp: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingTop: spacing.sm, minHeight: 40 },
  link: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.sm },
  ic: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
