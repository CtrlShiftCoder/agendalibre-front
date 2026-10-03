import { router } from 'expo-router';
import { Copy, Lock, Plus, RefreshCw, Utensils } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Badge, FormSection, InfoBanner, PageScaffold, ScreenHeader, ToggleRow, toast } from '@/components/ui';
import { addDaysIso, endTime, longDate, todayIso } from '@/lib/uiFormat';
import { useAppStore, usePref } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const BUFFERS = [0, 5, 10, 15];

function slotsFor(open: string, close: string): string[] {
  const [oh] = open.split(':').map(Number); const [ch] = close.split(':').map(Number);
  const out: string[] = [];
  for (let h = oh; h < ch; h++) out.push(`${String(h).padStart(2, '0')}:00`);
  return out;
}

/** Stitch: "Mi Disponibilidad y Slots" (staff) + "Horarios y Disponibilidad" (independiente). */
export default function Disponibilidad() {
  const c = useColors();
  const profile = useAppStore((s) => s.profile);
  const update = useAppStore((s) => s.updateProfile);
  const appointments = useAppStore((s) => s.appointments);
  const clients = useAppStore((s) => s.clients);
  const services = useAppStore((s) => s.services);
  const [mode, setMode] = usePref<'indep' | 'salon'>('disp.mode', 'indep');
  const [blocks, setBlocks] = usePref<string[]>('disp.blocks', []);
  const [buffer, setBuffer] = usePref<number>('disp.buffer', 5);
  const [express, setExpress] = usePref<boolean>('disp.express', true);
  const [repeat, setRepeat] = usePref<boolean>('disp.repeat', true);
  const [sel, setSel] = useState(todayIso());
  const [copyTo, setCopyTo] = useState<string[]>([]);
  const [showCopy, setShowCopy] = useState(false);

  const week = useMemo(() => Array.from({ length: 6 }, (_, i) => addDaysIso(todayIso(), i)), []);
  const hours = profile.hours;
  const dow = (iso: string) => new Date(iso + 'T12:00:00').getDay();
  const dayActive = (iso: string) => hours.days.includes(dow(iso));
  const slots = slotsFor(hours.open, hours.close);

  const toggleWeekday = (d: number) => {
    const days = hours.days.includes(d) ? hours.days.filter((x) => x !== d) : [...hours.days, d].sort();
    update({ hours: { ...hours, days } });
  };
  const toggleBlock = (key: string) => {
    setBlocks(blocks.includes(key) ? blocks.filter((b) => b !== key) : [...blocks, key]);
  };
  const applyCopy = () => {
    const src = blocks.filter((b) => b.startsWith(sel)).map((b) => b.split('|')[1]);
    const next = blocks.filter((b) => !copyTo.some((d) => b.startsWith(d)));
    copyTo.forEach((d) => src.forEach((t) => next.push(`${d}|${t}`)));
    setBlocks(next);
    setShowCopy(false);
    toast(`Pauta aplicada a ${copyTo.length} días`);
    setCopyTo([]);
  };

  return (
    <PageScaffold footer={<Button title="Guardar disponibilidad" onPress={() => toast('Disponibilidad guardada y publicada en tu link')} />}>
      <ScreenHeader title="Mi disponibilidad" subtitle="Gestión de agenda y slots" actions />

      <View style={[styles.seg, { backgroundColor: c.surfaceContainerLow }]}>
        {([['indep', 'Independiente'], ['salon', 'En salón / asociado']] as const).map(([k, l]) => (
          <Pressable key={k} onPress={() => setMode(k)} accessibilityRole="radio" accessibilityState={{ selected: mode === k }}
            style={[styles.segBtn, mode === k && { backgroundColor: c.primary }]}>
            <Text style={[styles.segTxt, { color: mode === k ? '#fff' : c.onSurfaceVariant }]}>{l}</Text>
          </Pressable>
        ))}
      </View>
      {mode === 'salon' ? (
        <InfoBanner title="Validación de turnos físicos." text="Tus horas ocupan un puesto del local; los cambios se envían como propuesta al administrador." />
      ) : (
        <InfoBanner title="Autonomía total." text="Los cambios se reflejan en tiempo real en tu link público." />
      )}
      {mode === 'salon' ? <Button title="Enviar propuesta de horarios al administrador" variant="secondary" gradient={false} onPress={() => router.push('/propuesta-horarios')} /> : null}
      {mode === 'salon' ? <View style={{ height: spacing.lg }} /> : null}

      <FormSection title="Días laborales" hint="Toca para activar o desactivar días" right={<Badge label={`${hours.days.length} activos`} tone="primary" />}>
        <View style={styles.dayRow}>
          {[1, 2, 3, 4, 5, 6, 0].map((d) => {
            const on = hours.days.includes(d);
            return (
              <Pressable key={d} onPress={() => toggleWeekday(d)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={DAYS[d]}
                style={[styles.dayPill, { backgroundColor: on ? c.primary : c.surfaceContainerLow }]}>
                <Text style={[styles.dayTxt, { color: on ? '#fff' : c.onSurfaceVariant }]}>{DAYS[d]}</Text>
              </Pressable>
            );
          })}
        </View>
      </FormSection>

      <FormSection title="Margen y citas express">
        <ToggleRow title="Citas express / walk-ins" description="Acepta clientes de paso entre citas" value={express} onValueChange={(v) => { setExpress(v); toast(v ? 'Citas express activadas' : 'Citas express desactivadas'); }} />
        <Text style={[styles.sub, { color: c.onSurfaceVariant, marginTop: spacing.md }]}>Margen entre citas (limpieza y cobro)</Text>
        <View style={styles.dayRow}>
          {BUFFERS.map((b) => (
            <Pressable key={b} onPress={() => setBuffer(b)} accessibilityRole="radio" accessibilityState={{ selected: buffer === b }}
              style={[styles.dayPill, { backgroundColor: buffer === b ? c.primary : c.surfaceContainerLow }]}>
              <Text style={[styles.dayTxt, { color: buffer === b ? '#fff' : c.onSurfaceVariant }]}>{b} min</Text>
            </Pressable>
          ))}
        </View>
      </FormSection>

      <View style={styles.strip}>
        {week.map((d) => {
          const on = d === sel;
          return (
            <Pressable key={d} onPress={() => setSel(d)} accessibilityRole="button" accessibilityLabel={longDate(d)}
              style={[styles.stripDay, { backgroundColor: on ? c.primary : c.surfaceContainerLowest, borderColor: c.surfaceContainerHigh, opacity: dayActive(d) ? 1 : 0.5 }]}>
              <Text style={[styles.stripD, { color: on ? '#fff' : c.onSurfaceVariant }]}>{DAYS[dow(d)]}</Text>
              <Text style={[styles.stripN, { color: on ? '#fff' : c.onSurface }]}>{Number(d.slice(8))}</Text>
            </Pressable>
          );
        })}
      </View>

      <FormSection title={longDate(sel)} hint={dayActive(sel) ? `Turno activo (${slots.length} slots programados)` : 'Día sin atención'} right={
        <Pressable onPress={() => setShowCopy((v) => !v)} accessibilityRole="button" accessibilityLabel="Copiar pauta a otros días" style={styles.copyBtn}>
          <Copy size={16} color={c.primaryText} /><Text style={[styles.copyTxt, { color: c.primaryText }]}>Copiar</Text>
        </Pressable>
      }>
        {dayActive(sel) ? slots.map((t) => {
          const key = `${sel}|${t}`;
          const apt = appointments.find((a) => a.date === sel && a.startTime === t && a.status !== 'cancelada');
          const blocked = blocks.includes(key);
          const svc = services.find((s) => s.id === apt?.serviceId);
          const cli = clients.find((x) => x.id === apt?.clientId);
          return (
            <View key={t} style={[styles.slot, { borderColor: c.surfaceContainerHigh, backgroundColor: apt ? c.primaryFixed : blocked ? c.surfaceContainer : c.surfaceContainerLowest }]}>
              <Text style={[styles.slotT, { color: c.onSurface }]}>{t} – {endTime(t, 60)}</Text>
              <View style={{ flex: 1 }}>
                {apt ? (<><Text style={[styles.slotN, { color: c.primaryText }]}>{cli?.name}</Text><Text style={[styles.sub, { color: c.onSurfaceVariant }]}>{svc?.name}</Text></>)
                  : blocked ? <View style={styles.row}><Lock size={14} color={c.onSurfaceVariant} /><Text style={[styles.sub, { color: c.onSurfaceVariant }]}>Bloqueado</Text></View>
                    : <Text style={[styles.sub, { color: c.onSurfaceVariant }]}>Libre para reserva online</Text>}
              </View>
              {!apt ? (
                <Pressable onPress={() => toggleBlock(key)} accessibilityRole="button" accessibilityLabel={blocked ? `Liberar ${t}` : `Bloquear ${t}`}>
                  <Text style={[styles.action, { color: c.primaryText }]}>{blocked ? 'Liberar' : 'Bloquear'}</Text>
                </Pressable>
              ) : <Utensils size={0} color="transparent" />}
            </View>
          );
        }) : null}
        <Pressable onPress={() => toggleWeekday(dow(sel))} style={styles.add} accessibilityRole="button">
          <Plus size={16} color={c.primaryText} /><Text style={[styles.action, { color: c.primaryText }]}>{dayActive(sel) ? 'Desactivar este día de la semana' : 'Activar este día de la semana'}</Text>
        </Pressable>
      </FormSection>

      {showCopy ? (
        <FormSection title="Copiar disponibilidad" hint={`Aplica la pauta de ${longDate(sel)} a los días seleccionados`}>
          {week.filter((d) => d !== sel).map((d) => (
            <ToggleRow key={d} title={longDate(d)} value={copyTo.includes(d)} onValueChange={(v) => setCopyTo(v ? [...copyTo, d] : copyTo.filter((x) => x !== d))} />
          ))}
          <View style={{ height: spacing.sm }} />
          <Button title={`Aplicar a ${copyTo.length} días`} onPress={applyCopy} disabled={copyTo.length === 0} />
        </FormSection>
      ) : null}

      <FormSection title="Repetir automáticamente" icon={<RefreshCw size={16} color={c.primaryText} />}>
        <ToggleRow title="Replicar esquema todas las semanas" value={repeat} onValueChange={(v) => { setRepeat(v); toast(v ? 'Se repetirá cada semana' : 'No se repetirá'); }} />
      </FormSection>
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  seg: { flexDirection: 'row', borderRadius: radius.md, padding: 4, marginBottom: spacing.md },
  segBtn: { flex: 1, minHeight: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  segTxt: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.sm },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  dayPill: { paddingHorizontal: 14, minHeight: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  dayTxt: { fontFamily: fonts.labelSemibold, fontSize: 13 },
  sub: { fontFamily: fonts.medium, fontSize: fontSize.sm },
  strip: { flexDirection: 'row', gap: 6, marginBottom: spacing.md },
  stripDay: { flex: 1, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', paddingVertical: 10 },
  stripD: { fontFamily: fonts.labelSemibold, fontSize: 11 },
  stripN: { fontFamily: fonts.labelBold, fontSize: 18 },
  slot: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, padding: spacing.md, marginBottom: 8, minHeight: 56 },
  slotT: { fontFamily: fonts.labelBold, fontSize: fontSize.sm, width: 98 },
  slotN: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  action: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.sm },
  add: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 36 },
  copyTxt: { fontFamily: fonts.semibold, fontSize: fontSize.sm },
});
