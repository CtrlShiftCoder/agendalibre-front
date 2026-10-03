import { router, useLocalSearchParams } from 'expo-router';
import { Armchair, Banknote, CalendarClock, CreditCard, Landmark, Lock, MessageCircle, Plus, Scissors, Timer, UserRound } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Avatar, Badge, DangerButton, FormSection, PageScaffold, ScreenHeader, toast } from '@/components/ui';
import { formatClp } from '@/lib/cash';
import { endTime, longDate } from '@/lib/uiFormat';
import { notifyClientMessage, openWhatsApp } from '@/lib/whatsapp';
import { apiUpdateAppointmentStatus } from '@/store/apiActions';
import { useAppStore, usePref } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

type Method = 'cash' | 'transfer' | 'card';
const UPSELL = [
  { id: 'prod1', label: 'Producto de cuidado', price: 8000 },
  { id: 'prod2', label: 'Kit post-atención', price: 12000 },
];

/** Stitch: "Detalle de Cita y Registro de Pago" (admin) / "Detalle de Turno, Upselling y Cobro" (profesional). */
export default function CitaDetalle() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const a = useAppStore((s) => s.appointments.find((x) => x.id === id));
  const svc = useAppStore((s) => s.services.find((x) => x.id === a?.serviceId));
  const cli = useAppStore((s) => s.clients.find((x) => x.id === a?.clientId));
  const pro = useAppStore((s) => s.professionals.find((x) => x.id === a?.professionalId));
  const role = useAppStore((s) => s.profile.role);
  const [, setMethods] = usePref<Record<string, Method>>('pay.methods', {});
  const [methods] = usePref<Record<string, Method>>('pay.methods', {});
  const [method, setMethod] = useState<Method>(methods[id ?? ''] ?? 'cash');
  const [extras, setExtras] = useState<string[]>([]);
  const [received, setReceived] = useState('');
  const [wa, setWa] = useState(true);

  const extra = extras.reduce((n, e) => n + (UPSELL.find((u) => u.id === e)?.price ?? 0), 0);
  const total = (svc?.priceClp ?? 0) + extra;
  const recv = Number(received.replace(/\D/g, '')) || total;
  const change = Math.max(0, recv - total);
  const done = a?.status === 'completada';

  if (!a) return (
    <PageScaffold>
      <ScreenHeader title="Detalle de cita" />
      <EmptyState title="Cita no encontrada" subtitle="Puede haber sido eliminada." />
    </PageScaffold>
  );

  const complete = () => {
    void apiUpdateAppointmentStatus(a.id, 'completada');
    setMethods({ ...methods, [a.id]: method });
    toast(`Pago registrado (${formatClp(total)}) · cita completada`);
    if (wa && cli?.phone) {
      void openWhatsApp(notifyClientMessage({
        clientName: cli.name, serviceName: svc?.name ?? 'Servicio', dateLabel: longDate(a.date), time: a.startTime,
        place: '', code: a.code, businessName: 'AgendaLibre',
      }), cli.phone);
    }
  };

  const status = a.status === 'confirmada' ? 'Cita confirmada' : a.status === 'completada' ? 'Cita completada' : a.status === 'pendiente' ? 'Pendiente de aprobación' : a.status === 'cancelada' ? 'Cita cancelada' : 'No-show';

  return (
    <PageScaffold>
      <ScreenHeader title="Detalle de cita" subtitle={`#${a.code}`} actions />
      <View style={[styles.banner, { backgroundColor: c.primaryFixed }]}>
        <Timer size={18} color={c.primaryText} />
        <Text style={[styles.bannerTxt, { color: c.primaryText }]}>{status}</Text>
      </View>

      <Pressable
        onPress={() => router.push(`/cliente/${a.clientId}`)}
        accessibilityRole="button"
        accessibilityLabel="Abrir ficha del cliente"
        style={[styles.client, { backgroundColor: c.surfaceContainerLowest, borderColor: c.surfaceContainerHigh }]}
      >
        <Avatar name={cli?.name ?? 'Cliente'} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: c.onSurface }]}>{cli?.name ?? 'Cliente'}</Text>
          <Text style={[styles.sub, { color: c.onSurfaceVariant }]}>{cli?.phone} · {cli?.completedCount ?? 0} citas</Text>
          {cli?.notes ? (
            <View style={styles.note}><Lock size={12} color={c.onSurfaceVariant} /><Text style={[styles.noteTxt, { color: c.onSurfaceVariant }]} numberOfLines={2}>{cli.notes}</Text></View>
          ) : null}
        </View>
        <Badge label="Ver ficha" tone="primary" />
      </Pressable>

      <FormSection title="Detalles del servicio" icon={<Scissors size={16} color={c.primaryText} />}>
        <Text style={[styles.svc, { color: c.onSurface }]}>{svc?.name}</Text>
        <Text style={[styles.sub, { color: c.onSurfaceVariant }]}>{svc?.durationMin} min</Text>
        <View style={styles.line}><UserRound size={16} color={c.onSurfaceVariant} /><Text style={[styles.lineTxt, { color: c.onSurface }]}>{pro?.name ?? 'Sin asignar'}</Text></View>
        {role !== 'persona_natural' ? (<View style={styles.line}><Armchair size={16} color={c.onSurfaceVariant} /><Text style={[styles.lineTxt, { color: c.onSurface }]}>{pro?.role ?? 'Sillón principal'}</Text></View>) : null}
        <View style={styles.line}><CalendarClock size={16} color={c.onSurfaceVariant} /><Text style={[styles.lineTxt, { color: c.onSurface }]}>{longDate(a.date)} · {a.startTime} – {endTime(a.startTime, svc?.durationMin ?? 60)}</Text></View>
      </FormSection>

      {a.status !== 'cancelada' ? (
        <FormSection title="Cobro y liquidación" icon={<Banknote size={16} color={c.primaryText} />}>
          <View style={styles.sumRow}><Text style={[styles.sumL, { color: c.onSurfaceVariant }]}>Servicio principal</Text><Text style={[styles.sumV, { color: c.onSurface }]}>{formatClp(svc?.priceClp ?? 0)}</Text></View>
          <Text style={[styles.sumL, { color: c.onSurfaceVariant, marginTop: 8 }]}>Upselling (opcional)</Text>
          <View style={styles.chips}>
            {UPSELL.map((u) => {
              const on = extras.includes(u.id);
              return (
                <Pressable key={u.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => setExtras(on ? extras.filter((x) => x !== u.id) : [...extras, u.id])}
                  style={[styles.chip, { backgroundColor: on ? c.primary : c.surfaceContainerLow }]}>
                  <Plus size={14} color={on ? '#fff' : c.onSurfaceVariant} />
                  <Text style={[styles.chipTxt, { color: on ? '#fff' : c.onSurfaceVariant }]}>{u.label} {formatClp(u.price)}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={[styles.sumRow, styles.total, { borderTopColor: c.surfaceContainerHigh }]}>
            <Text style={[styles.totalL, { color: c.onSurface }]}>Total a pagar</Text>
            <Text style={[styles.totalV, { color: c.primaryText }]}>{formatClp(total)}</Text>
          </View>
          <Text style={[styles.sumL, { color: c.onSurfaceVariant }]}>Método de pago</Text>
          <View style={styles.chips}>
            {([['cash', 'Efectivo', Banknote], ['transfer', 'Transferencia', Landmark], ['card', 'POS / Tarjeta', CreditCard]] as const).map(([k, l, Ic]) => (
              <Pressable key={k} accessibilityRole="radio" accessibilityState={{ selected: method === k }} onPress={() => setMethod(k)}
                style={[styles.chip, { backgroundColor: method === k ? c.primary : c.surfaceContainerLow }]}>
                <Ic size={14} color={method === k ? '#fff' : c.onSurfaceVariant} />
                <Text style={[styles.chipTxt, { color: method === k ? '#fff' : c.onSurfaceVariant }]}>{l}</Text>
              </Pressable>
            ))}
          </View>
          {method === 'cash' ? (
            <>
              <Text style={[styles.sumL, { color: c.onSurfaceVariant, marginTop: 8 }]}>Monto recibido del cliente</Text>
              <TextInput
                value={received}
                onChangeText={setReceived}
                keyboardType="number-pad"
                placeholder={String(total)}
                placeholderTextColor={c.placeholder}
                accessibilityLabel="Monto recibido"
                style={[styles.input, { color: c.onSurface, borderColor: c.outline, backgroundColor: c.surfaceContainerLowest }]}
              />
              <View style={styles.chips}>
                {[total, 20000, 30000].map((n) => (
                  <Pressable key={n} onPress={() => setReceived(String(n))} style={[styles.chip, { backgroundColor: c.surfaceContainerLow }]}>
                    <Text style={[styles.chipTxt, { color: c.onSurfaceVariant }]}>{formatClp(n)}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.sumRow}><Text style={[styles.sumL, { color: c.onSurfaceVariant }]}>Vuelto a entregar</Text><Text style={[styles.sumV, { color: c.onSurface }]}>{formatClp(change)}</Text></View>
            </>
          ) : null}
          <View style={styles.sumRow}>
            <View style={{ flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <MessageCircle size={16} color={c.onSurfaceVariant} />
              <Text style={[styles.lineTxt, { color: c.onSurface, flex: 1 }]}>Comprobante por WhatsApp</Text>
            </View>
            <Switch value={wa} onValueChange={setWa} trackColor={{ false: c.surfaceContainerHigh, true: c.accent }} thumbColor="#fff" accessibilityLabel="Enviar comprobante por WhatsApp" />
          </View>
          {method === 'transfer' ? (
            <Button title="Verificar transferencia" variant="secondary" gradient={false} onPress={() => router.push({ pathname: '/verificar-pago', params: { id: a.id } })} />
          ) : null}
        </FormSection>
      ) : null}

      {done ? <Badge label="Pago registrado" tone="success" /> : a.status !== 'cancelada' ? (
        <Button title="Registrar pago y completar cita" onPress={complete} />
      ) : null}
      <View style={{ height: spacing.sm }} />
      <Button title="Reagendar" variant="secondary" gradient={false} onPress={() => router.push({ pathname: '/nueva-cita', params: { clientId: a.clientId } })} />
      <View style={{ height: spacing.sm }} />
      <Button title="Ver ticket" variant="ghost" onPress={() => router.push(`/ticket/${a.id}`)} />
      {a.status !== 'cancelada' && !done ? (
        <DangerButton outline title="Cancelar cita" onPress={() => { void apiUpdateAppointmentStatus(a.id, 'cancelada'); toast('Cita cancelada', 'warn'); }} />
      ) : null}
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.lg },
  bannerTxt: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.sm },
  client: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', padding: spacing.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.lg },
  name: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.lg },
  sub: { fontFamily: fonts.medium, fontSize: fontSize.sm },
  note: { flexDirection: 'row', gap: 6, marginTop: 4, alignItems: 'center' },
  noteTxt: { flex: 1, fontFamily: fonts.medium, fontSize: 12 },
  svc: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.lg },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  lineTxt: { fontFamily: fonts.medium, fontSize: fontSize.sm },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  sumL: { fontFamily: fonts.medium, fontSize: fontSize.sm },
  sumV: { fontFamily: fonts.labelBold, fontSize: fontSize.md },
  total: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 8, paddingTop: 12 },
  totalL: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.md },
  totalV: { fontFamily: fonts.labelBold, fontSize: 24 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 40, borderRadius: 999 },
  chipTxt: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.sm },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, minHeight: 48, fontFamily: fonts.labelBold, fontSize: fontSize.lg, marginTop: 4 },
});
