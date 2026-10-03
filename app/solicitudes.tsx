import { router } from 'expo-router';
import { CalendarClock, Check, MessageSquareQuote, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Badge, FilterChips, InfoBanner, PageScaffold, ScreenHeader, ToggleRow, toast, Avatar } from '@/components/ui';
import { formatClp } from '@/lib/cash';
import { endTime, longDate } from '@/lib/uiFormat';
import { apiUpdateAppointmentStatus } from '@/store/apiActions';
import { useAppStore, usePref } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

/** Stitch: "Solicitudes y Aprobación de Citas" (admin) / "Aprobación de Reservas" (profesional). */
export default function SolicitudesScreen() {
  const c = useColors();
  const appointments = useAppStore((s) => s.appointments);
  const services = useAppStore((s) => s.services);
  const clients = useAppStore((s) => s.clients);
  const professionals = useAppStore((s) => s.professionals);
  const role = useAppStore((s) => s.profile.role);
  const seed = useAppStore((s) => s.seedMockRequests);
  const [approved, setApproved] = usePref<string[]>('sol.approved', []);
  const [rejected, setRejected] = usePref<string[]>('sol.rejected', []);
  const [auto, setAuto] = usePref<boolean>('sol.auto', false);
  const [tab, setTab] = useState('pend');

  useEffect(() => { seed(); }, [seed]);

  const rows = useMemo(() => {
    const byId = (id: string) => appointments.find((a) => a.id === id);
    const pend = appointments.filter((a) => a.status === 'pendiente');
    return {
      pend,
      ok: approved.map(byId).filter(Boolean) as typeof appointments,
      no: rejected.map(byId).filter(Boolean) as typeof appointments,
    };
  }, [appointments, approved, rejected]);

  const list = tab === 'pend' ? rows.pend : tab === 'ok' ? rows.ok : rows.no;

  const approve = (id: string) => {
    void apiUpdateAppointmentStatus(id, 'confirmada');
    setApproved([id, ...approved.filter((x) => x !== id)]);
    toast('Cita aprobada y cliente avisado');
  };
  const reject = (id: string) => {
    void apiUpdateAppointmentStatus(id, 'cancelada');
    setRejected([id, ...rejected.filter((x) => x !== id)]);
    toast('Solicitud rechazada', 'warn');
  };

  return (
    <PageScaffold>
      <ScreenHeader
        title="Solicitudes"
        subtitle={`${rows.pend.length} pendientes · citas web con confirmación manual`}
        actions
      />
      <FilterChips
        value={tab}
        onChange={setTab}
        chips={[
          { id: 'pend', label: 'Pendientes', count: rows.pend.length },
          { id: 'ok', label: 'Aprobadas', count: rows.ok.length },
          { id: 'no', label: 'Rechazadas', count: rows.no.length },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState title="Sin solicitudes aquí" subtitle="Cuando alguien reserve desde tu link, aparecerá en Pendientes." />
      ) : null}

      {list.map((a) => {
        const svc = services.find((x) => x.id === a.serviceId);
        const cli = clients.find((x) => x.id === a.clientId);
        const pro = professionals.find((x) => x.id === a.professionalId);
        return (
          <View key={a.id} style={[styles.card, { backgroundColor: c.surfaceContainerLowest, borderColor: c.surfaceContainerHigh }]}>
            <View style={styles.top}>
              <Avatar name={cli?.name ?? 'Cliente'} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: c.onSurface }]}>{cli?.name ?? 'Cliente'}</Text>
                <Badge label={(cli?.completedCount ?? 0) > 2 ? 'Cliente habitual' : 'Nueva clienta/e'} tone={(cli?.completedCount ?? 0) > 2 ? 'accent' : 'primary'} />
              </View>
              <Text style={[styles.price, { color: c.onSurface }]}>{formatClp(svc?.priceClp ?? 0)}</Text>
            </View>
            <Text style={[styles.svc, { color: c.onSurface }]}>{svc?.name ?? 'Servicio'}</Text>
            <Text style={[styles.meta, { color: c.onSurfaceVariant }]}>
              {svc?.durationMin ?? 0} min{pro ? ` · ${pro.name}` : ''}
            </Text>
            <View style={styles.when}>
              <CalendarClock size={16} color={c.primaryText} />
              <Text style={[styles.whenTxt, { color: c.primaryText }]}>
                {longDate(a.date)} · {a.startTime} – {endTime(a.startTime, svc?.durationMin ?? 60)}
              </Text>
            </View>
            {a.notes ? (
              <View style={[styles.quote, { backgroundColor: c.surfaceContainerLow }]}>
                <MessageSquareQuote size={16} color={c.onSurfaceVariant} />
                <Text style={[styles.quoteTxt, { color: c.onSurfaceVariant }]}>“{a.notes}”</Text>
              </View>
            ) : null}
            {tab === 'pend' ? (
              <View style={styles.actions}>
                <View style={{ flex: 1 }}>
                  <Button title="Aprobar cita" onPress={() => approve(a.id)} icon={<Check size={18} color="#fff" />} />
                </View>
              </View>
            ) : (
              <Badge label={tab === 'ok' ? 'Aprobada' : 'Rechazada'} tone={tab === 'ok' ? 'success' : 'danger'} />
            )}
            {tab === 'pend' ? (
              <View style={styles.actions}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Proponer horario"
                    variant="secondary"
                    gradient={false}
                    onPress={() => router.push({ pathname: '/nueva-cita', params: { clientId: a.clientId } })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button title="Rechazar" variant="secondary" gradient={false} onPress={() => reject(a.id)} icon={<X size={18} color={c.danger} />} />
                </View>
              </View>
            ) : null}
            <Button title="Ver cita" variant="ghost" onPress={() => router.push(`/cita/${a.id}`)} />
          </View>
        );
      })}

      <View style={[styles.autoCard, { backgroundColor: c.surfaceContainerLowest, borderColor: c.surfaceContainerHigh }]}>
        <ToggleRow
          title="Auto-aprobación inteligente"
          description="Aprobar citas automáticamente si el horario está 100% disponible"
          value={auto}
          onValueChange={(v) => { setAuto(v); toast(v ? 'Auto-aprobación activada' : 'Auto-aprobación desactivada'); }}
        />
      </View>
      <InfoBanner text={role === 'persona_natural' ? 'Tú decides qué reservas aceptar. Las rechazadas liberan el horario.' : 'Cada aprobación avisa al cliente por WhatsApp y bloquea el sillón/box.'} />
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, marginBottom: spacing.md, gap: 6 },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.md },
  price: { fontFamily: fonts.labelBold, fontSize: fontSize.lg },
  svc: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.lg, marginTop: 6 },
  meta: { fontFamily: fonts.medium, fontSize: fontSize.sm },
  when: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  whenTxt: { fontFamily: fonts.labelSemibold, fontSize: 13 },
  quote: { flexDirection: 'row', gap: 8, borderRadius: radius.md, padding: spacing.md, marginTop: 6 },
  quoteTxt: { flex: 1, fontFamily: fonts.medium, fontSize: fontSize.sm, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: 6 },
  autoCard: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
});
