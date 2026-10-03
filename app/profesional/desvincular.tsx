import { router, useLocalSearchParams } from 'expo-router';
import { UserMinus } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ConfirmationScreen, DangerButton, FormSection, InfoBanner, PageScaffold, ProfileHeader, ScreenHeader, ToggleRow, toast } from '@/components/ui';
import { formatClp } from '@/lib/cash';
import { useAppStore } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

const REASONS = ['Fin natural de contrato de arriendo', 'Apertura de local propio / proyecto independiente', 'Mutuo acuerdo entre las partes', 'Incumplimiento de reglamento', 'Otro motivo administrativo'];

/** Stitch: "Desvincular Profesional y Liberar Espacio" — 3 pasos. */
export default function Desvincular() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pros = useAppStore((s) => s.professionals);
  const pro = pros.find((p) => p.id === id);
  const apts = useAppStore((s) => s.appointments);
  const remove = useAppStore((s) => s.removeTeamMember);
  const [mode, setMode] = useState<'reassign' | 'cancel' | 'portability'>('reassign');
  const [garantia, setGarantia] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [liberar, setLiberar] = useState(true);
  const [revocar, setRevocar] = useState(true);
  const [done, setDone] = useState(false);
  const upcoming = apts.filter((a) => a.professionalId === id && (a.status === 'confirmada' || a.status === 'pendiente')).length;
  const other = pros.find((p) => p.id !== id && p.active);

  if (!pro) return (<PageScaffold><ScreenHeader title="Desvincular" /><Text>Profesional no encontrado</Text></PageScaffold>);
  if (done) return (
    <PageScaffold>
      <ConfirmationScreen title="Desvinculación completada" message={`${pro.name} salió del equipo. Se liberó el puesto y se envió el acta de liquidación.`} primaryLabel="Volver al equipo" onPrimary={() => router.replace('/equipo')} />
    </PageScaffold>
  );

  const confirm = () => {
    if (!garantia) { toast('Confirma la revisión del puesto y la garantía (paso 2)', 'warn'); return; }
    const r = remove(pro.id);
    if (!r.ok) { toast(r.error ?? 'No se pudo desvincular', 'warn'); return; }
    setDone(true);
  };

  const modes = [
    { k: 'reassign', t: 'Reasignar citas a otro profesional', d: other ? `Se asignan a ${other.name}.` : 'No hay otro profesional activo.' },
    { k: 'cancel', t: 'Cancelar citas y devolver abonos', d: `Se avisa por WhatsApp a ${upcoming} clientes con link de reprogramación.` },
    { k: 'portability', t: 'Portabilidad (clientes propios)', d: 'Las citas de clientes directos migran a su cuenta personal.' },
  ] as const;

  return (
    <PageScaffold>
      <ScreenHeader title="Desvincular profesional" subtitle="Protocolo de desvinculación segura · 3 pasos" />
      <ProfileHeader name={pro.name} role={pro.role} status={`${upcoming} citas próximas`} color={pro.color} />
      <FormSection title="1 · Gestión de citas pendientes">
        {modes.map((m) => (
          <Pressable key={m.k} accessibilityRole="radio" accessibilityState={{ selected: mode === m.k }} onPress={() => setMode(m.k)}
            style={[styles.opt, { borderColor: mode === m.k ? c.primaryText : c.surfaceContainerHigh, backgroundColor: mode === m.k ? c.primaryFixed : c.surfaceContainerLowest }]}>
            <Text style={[styles.t, { color: c.onSurface }]}>{m.t}</Text>
            <Text style={[styles.d, { color: c.onSurfaceVariant }]}>{m.d}</Text>
          </Pressable>
        ))}
      </FormSection>
      <FormSection title="2 · Balance y liquidación de puesto">
        <View style={styles.row}><Text style={[styles.d, { color: c.onSurfaceVariant }]}>Arriendo mes en curso</Text><Text style={[styles.v, { color: c.onSurface }]}>Pagado</Text></View>
        <View style={styles.row}><Text style={[styles.d, { color: c.onSurfaceVariant }]}>Comisiones por liquidar</Text><Text style={[styles.v, { color: c.onSurface }]}>{formatClp(34500)}</Text></View>
        <View style={styles.row}><Text style={[styles.d, { color: c.onSurfaceVariant }]}>Garantía en custodia</Text><Text style={[styles.v, { color: c.onSurface }]}>{formatClp(320000)}</Text></View>
        <ToggleRow title="Revisé el puesto y acordé la garantía" description="Confirmo el retorno o descuento de la garantía con el profesional." value={garantia} onValueChange={setGarantia} />
      </FormSection>
      <FormSection title="3 · Liberación de espacio y accesos">
        <Text style={[styles.d, { color: c.onSurfaceVariant }]}>Motivo</Text>
        {REASONS.map((r) => (
          <Pressable key={r} accessibilityRole="radio" accessibilityState={{ selected: reason === r }} onPress={() => setReason(r)} style={styles.reason}>
            <View style={[styles.dot, { borderColor: c.primaryText, backgroundColor: reason === r ? c.primaryText : 'transparent' }]} />
            <Text style={[styles.d, { color: c.onSurface, flex: 1 }]}>{r}</Text>
          </Pressable>
        ))}
        <ToggleRow title="Liberar el puesto" description="Habilitar de inmediato para arriendo o lista de espera." value={liberar} onValueChange={setLiberar} />
        <ToggleRow title="Revocar accesos de sistema" description="Cierra sesión en caja y retira permisos del calendario." value={revocar} onValueChange={setRevocar} />
      </FormSection>
      <InfoBanner text="Al confirmar se enviará el acta de liquidación y traspaso por correo y WhatsApp." />
      <DangerButton title="Confirmar desvinculación y liberar puesto" icon={<UserMinus size={18} color="#fff" />} onPress={confirm} />
      <View style={{ height: spacing.sm }} />
      <Button title="Cancelar y mantener en el equipo" variant="secondary" gradient={false} onPress={() => router.back()} />
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  opt: { borderWidth: 1.5, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: 2 },
  t: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.md },
  d: { fontFamily: fonts.medium, fontSize: fontSize.sm, lineHeight: 18 },
  v: { fontFamily: fonts.labelBold, fontSize: fontSize.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  reason: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
});
