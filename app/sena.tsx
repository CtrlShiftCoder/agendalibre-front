import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Avatar, Badge, FormSection, InfoBanner, PageScaffold, ScreenHeader, StatCard, ToggleRow, toast } from '@/components/ui';
import { formatClp } from '@/lib/cash';
import { longDate } from '@/lib/uiFormat';
import { useAppStore, usePref } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';
import { Pressable } from 'react-native';

const PCTS = [0, 20, 30, 50, 100];

/** Seña y abonos — configuración y seguimiento (diseño propio en Stitch "[Persona natural] Seña y abonos"). */
export default function Sena() {
  const c = useColors();
  const policy = useAppStore((s) => s.cancellationPolicy);
  const updatePolicy = useAppStore((s) => s.updateCancellationPolicy);
  const apts = useAppStore((s) => s.appointments);
  const services = useAppStore((s) => s.services);
  const clients = useAppStore((s) => s.clients);
  const statuses = useAppStore((s) => s.depositStatuses);
  const setDeposit = useAppStore((s) => s.setDepositStatus);
  const [keep, setKeep] = usePref<boolean>('sena.keepNoShow', policy.keepDepositOnNoShow);
  const pct = policy.depositPercentDefault ?? 0;

  const rows = apts.filter((a) => a.status === 'confirmada' || a.status === 'pendiente').slice(0, 12).map((a) => {
    const svc = services.find((s) => s.id === a.serviceId);
    const p = svc?.depositPercent ?? pct;
    return { a, svc, cli: clients.find((x) => x.id === a.clientId), amount: Math.round(((svc?.priceClp ?? 0) * p) / 100), st: statuses[a.id] ?? 'pending' };
  }).filter((r) => r.amount > 0);
  const held = rows.filter((r) => r.st === 'paid').reduce((n, r) => n + r.amount, 0);
  const pend = rows.filter((r) => r.st === 'pending').reduce((n, r) => n + r.amount, 0);

  return (
    <PageScaffold>
      <ScreenHeader title="Seña y abonos" subtitle="Protege tu agenda contra no-shows" actions />
      <View style={styles.stats}>
        <StatCard label="Retenido" value={formatClp(held)} tone="success" />
        <StatCard label="Por cobrar" value={formatClp(pend)} tone="warn" />
        <StatCard label="Seña base" value={`${pct}%`} tone="primary" />
      </View>
      <FormSection title="Seña por defecto" hint="Se aplica a servicios sin seña propia.">
        <View style={styles.chips}>
          {PCTS.map((p) => (
            <Pressable key={p} onPress={() => { updatePolicy({ depositPercentDefault: p || null }); toast(p ? `Seña base ${p}%` : 'Sin seña obligatoria'); }}
              accessibilityRole="radio" accessibilityState={{ selected: pct === p }} style={[styles.chip, { backgroundColor: pct === p ? c.primary : c.surfaceContainerLow }]}>
              <Text style={[styles.chipT, { color: pct === p ? '#fff' : c.onSurfaceVariant }]}>{p === 0 ? 'Sin seña' : `${p}%`}</Text>
            </Pressable>
          ))}
        </View>
        <ToggleRow title="Retener seña en no-show" description="Si el cliente no llega, la seña queda a tu favor." value={keep} onValueChange={(v) => { setKeep(v); updatePolicy({ keepDepositOnNoShow: v }); toast(v ? 'Se retendrá la seña' : 'Se devolverá la seña'); }} />
      </FormSection>

      <FormSection title="Seguimiento de abonos" hint="Citas próximas con seña requerida">
        {rows.length === 0 ? <Text style={[styles.d, { color: c.onSurfaceVariant }]}>No hay abonos pendientes. Define una seña base o una por servicio.</Text> : null}
        {rows.map(({ a, svc, cli, amount, st }) => (
          <View key={a.id} style={[styles.row, { borderBottomColor: c.surfaceContainerHigh }]}>
            <Avatar name={cli?.name ?? 'Cliente'} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.t, { color: c.onSurface }]}>{cli?.name}</Text>
              <Text style={[styles.d, { color: c.onSurfaceVariant }]}>{svc?.name} · {longDate(a.date)} {a.startTime}</Text>
              <Text style={[styles.v, { color: c.primaryText }]}>{formatClp(amount)}</Text>
            </View>
            {st === 'paid' ? (
              <View style={{ gap: 4, alignItems: 'flex-end' }}><Badge label="Pagada" tone="success" />
                <Pressable onPress={() => { setDeposit(a.id, 'refunded'); toast('Seña reembolsada'); }} accessibilityRole="button" accessibilityLabel={`Reembolsar seña de ${cli?.name}`}><Text style={[styles.link, { color: c.primaryText }]}>Reembolsar</Text></Pressable></View>
            ) : st === 'pending' ? (
              <Pressable onPress={() => { setDeposit(a.id, 'paid'); toast('Seña marcada como pagada'); }} accessibilityRole="button" accessibilityLabel={`Marcar seña pagada de ${cli?.name}`} style={[styles.pay, { backgroundColor: c.primary }]}><Text style={styles.payT}>Marcar pagada</Text></Pressable>
            ) : <Badge label={st === 'refunded' ? 'Reembolsada' : 'Retenida'} tone="neutral" />}
          </View>
        ))}
      </FormSection>
      <Button title="Política de cancelación" variant="secondary" gradient={false} onPress={() => router.push('/politica')} />
      <View style={{ height: spacing.md }} />
      <InfoBanner text="Los abonos pagados se descuentan del total al cobrar y se reflejan en la Caja del día." />
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm },
  chip: { paddingHorizontal: 16, minHeight: 40, borderRadius: 999, justifyContent: 'center' },
  chipT: { fontFamily: fonts.labelSemibold, fontSize: fontSize.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  t: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.md },
  d: { fontFamily: fonts.medium, fontSize: fontSize.sm },
  v: { fontFamily: fonts.labelBold, fontSize: fontSize.md, marginTop: 2 },
  link: { fontFamily: fonts.semibold, fontSize: fontSize.sm },
  pay: { paddingHorizontal: 12, minHeight: 40, borderRadius: radius.md, justifyContent: 'center' },
  payT: { color: '#fff', fontFamily: fonts.bold, fontWeight: '700', fontSize: 12 },
});
