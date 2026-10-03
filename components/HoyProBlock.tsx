import { router } from 'expo-router';
import { Copy, Send, Users } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, HeroSummaryCard, LineChartMini, StatCard, toast } from '@/components/ui';
import { bookingShareUrl } from '@/lib/bookingLink';
import { formatClp } from '@/lib/cash';
import { addDaysIso, todayIso } from '@/lib/uiFormat';
import { copyOrShare, openWhatsApp } from '@/lib/whatsapp';
import { useAppStore, usePref } from '@/store/useAppStore';
import { useColors, usePaletteId } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

/**
 * Bloque superior de "Hoy" según Stitch:
 *  - persona_natural / trabajador: "Link público" + "Facturación de hoy" con meta diaria.
 *  - admin empresa: tarjeta morada "Recaudado hoy" + métricas (solicitudes, equipo, caja) + tendencia semanal.
 */
export function HoyProBlock() {
  const c = useColors();
  const admin = usePaletteId() === 'indigo';
  const apts = useAppStore((s) => s.appointments);
  const seed = useAppStore((s) => s.seedMockRequests);
  React.useEffect(() => { seed(); }, [seed, apts]);
  const services = useAppStore((s) => s.services);
  const pros = useAppStore((s) => s.professionals);
  const storefront = useAppStore((s) => s.storefront);
  const [goal] = usePref<number>('hoy.goal', 80000);
  const url = bookingShareUrl({ slug: storefront.slug, bookingPath: storefront.bookingPath || `/v/${storefront.slug}`, name: storefront.displayName });
  const price = (id: string) => services.find((s) => s.id === id)?.priceClp ?? 0;

  const d = useMemo(() => {
    const t = todayIso();
    const today = apts.filter((a) => a.date === t && a.status !== 'cancelada');
    const cobrado = today.filter((a) => a.status === 'completada').reduce((n, a) => n + price(a.serviceId), 0);
    const estimado = today.reduce((n, a) => n + price(a.serviceId), 0);
    const pendientes = apts.filter((a) => a.status === 'pendiente').length;
    const trend = Array.from({ length: 7 }, (_, i) => {
      const day = addDaysIso(t, i - 6);
      return apts.filter((a) => a.date === day && a.status === 'completada').reduce((n, a) => n + price(a.serviceId), 0);
    });
    return { today, cobrado, estimado, pendientes, trend };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apts, services]);

  if (admin) {
    const hasTrend = d.trend.some((v) => v > 0);
    return (
      <View>
        <HeroSummaryCard
          label="Recaudado hoy"
          value={formatClp(d.cobrado)}
          caption={`Proyectado del día: ${formatClp(d.estimado)}`}
          chips={[`${d.today.length} citas`, `${pros.filter((p) => p.active).length} profesionales activos`]}
        >
          {hasTrend ? <View style={{ marginTop: spacing.md }}><LineChartMini values={d.trend} /></View> : null}
        </HeroSummaryCard>
        <View style={styles.stats}>
          <StatCard label="Por aprobar" value={d.pendientes} tone={d.pendientes ? 'warn' : 'plain'} onPress={() => router.push('/solicitudes')} />
          <StatCard label="Equipo" value={pros.filter((p) => p.active).length} tone="primary" onPress={() => router.push('/equipo')} icon={<Users size={14} color={c.primaryText} />} />
          <StatCard label="Caja" value="Abrir" onPress={() => router.push('/caja')} />
        </View>
      </View>
    );
  }

  const pct = goal > 0 ? Math.min(100, Math.round((d.cobrado / goal) * 100)) : 0;
  return (
    <View>
      <View style={[styles.link, { backgroundColor: c.surfaceContainerLowest, borderColor: c.surfaceContainerHigh }]}>
        <View style={styles.linkTop}>
          <Text style={[styles.lt, { color: c.onSurface }]}>Link público de reservas</Text>
          <Badge label="En vivo" tone="success" />
        </View>
        <Text style={[styles.url, { color: c.primaryText }]} numberOfLines={1}>{url.replace(/^https?:\/\//, '')}</Text>
        <View style={styles.two}>
          <Pressable onPress={async () => { await copyOrShare(url, 'Link'); toast('Link copiado'); }} accessibilityRole="button" accessibilityLabel="Copiar link"
            style={[styles.btn, { backgroundColor: c.surfaceContainerLow }]}><Copy size={16} color={c.primaryText} /><Text style={[styles.bt, { color: c.primaryText }]}>Copiar link</Text></Pressable>
          <Pressable onPress={() => { void openWhatsApp(`Reserva conmigo: ${url}`); toast('Compartiendo por WhatsApp'); }} accessibilityRole="button" accessibilityLabel="Compartir por WhatsApp"
            style={[styles.btn, { backgroundColor: c.primary }]}><Send size={16} color="#fff" /><Text style={[styles.bt, { color: '#fff' }]}>Compartir WA</Text></Pressable>
        </View>
      </View>
      <HeroSummaryCard
        label="Facturación de hoy"
        value={formatClp(d.cobrado)}
        caption={`Meta diaria ${formatClp(goal)} · ${pct}% completado`}
        chips={[`${d.today.filter((a) => a.status === 'completada').length} cobradas`, `${d.today.filter((a) => a.status !== 'completada').length} pendientes`]}
      >
        <View style={styles.track}><View style={[styles.fill, { width: `${pct}%` }]} /></View>
      </HeroSummaryCard>
    </View>
  );
}
const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  link: { borderRadius: radius.xl, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, marginBottom: spacing.md, gap: 6 },
  linkTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lt: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.md },
  url: { fontFamily: fonts.labelSemibold, fontSize: fontSize.sm },
  two: { flexDirection: 'row', gap: spacing.sm, marginTop: 6 },
  btn: { flex: 1, minHeight: 44, borderRadius: radius.md, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  bt: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.sm },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: spacing.md, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: '#fff' },
});
