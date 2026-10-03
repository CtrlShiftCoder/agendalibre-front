import { router } from 'expo-router';
import { Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Badge, ConfirmationScreen, DangerButton, FormSection, InfoBanner, PageScaffold, ScreenHeader, ToggleRow, toast } from '@/components/ui';
import { usePref } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

const WEEK = [
  ['Lunes a Jueves', '10:00 - 19:30', '10:00 - 19:30'],
  ['Viernes', '10:00 - 19:00', '09:30 - 20:30'],
  ['Sábado', '09:30 - 18:00', '09:30 - 18:00'],
  ['Domingo', 'Libre', 'Libre'],
];

type Prop = { status: 'none' | 'sent' | 'approved' | 'rejected'; note: string };

/** Stitch: "Enviar Propuesta de Horarios al Salón" (profesional) + "Revisar y Aprobar Propuesta" (admin). Una sola pantalla con ambos lados. */
export default function PropuestaHorarios() {
  const c = useColors();
  const [p, setP] = usePref<Prop>('prop.state', { status: 'none', note: 'Ampliación de turno viernes tarde para cubrir alta demanda de degradados y barboterapia.' });
  const [view, setView] = useState<'prof' | 'admin'>('prof');
  const [notify, setNotify] = useState(true);

  if (p.status === 'approved' && view === 'admin') return (
    <PageScaffold><ConfirmationScreen title="¡Horario aprobado!" message="Los cupos quedaron activos en la agenda del salón y en el link del profesional." primaryLabel="Volver" onPrimary={() => router.back()} secondaryLabel="Reiniciar demo" onSecondary={() => setP({ ...p, status: 'none' })} /></PageScaffold>
  );

  return (
    <PageScaffold>
      <ScreenHeader title="Propuesta de horario" subtitle={view === 'prof' ? 'Se enviará al administrador del salón' : 'Detalle de propuesta · pendiente de aprobación'} />
      <View style={[styles.seg, { backgroundColor: c.surfaceContainerLow }]}>
        {([['prof', 'Soy profesional'], ['admin', 'Soy administrador']] as const).map(([k, l]) => (
          <Text key={k} onPress={() => setView(k)} accessibilityRole="button" style={[styles.segBtn, { color: view === k ? '#fff' : c.onSurfaceVariant, backgroundColor: view === k ? c.primary : 'transparent' }]}>{l}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
        <Badge label={p.status === 'none' ? 'Borrador' : p.status === 'sent' ? 'Pendiente de aprobación' : p.status === 'approved' ? 'Aprobada' : 'Rechazada'} tone={p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'danger' : 'warn'} />
      </View>

      <FormSection title="Jornadas propuestas" hint="Detalle semanal de disponibilidad en sillón · 44 h semanales">
        {WEEK.map(([d, before, after]) => {
          const changed = before !== after;
          return (
            <View key={d} style={[styles.week, { borderBottomColor: c.surfaceContainerHigh }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.t, { color: c.onSurface }]}>{d}</Text>
                {changed ? <Text style={[styles.d, { color: c.onSurfaceVariant }]}>Anterior: {before}</Text> : null}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.v, { color: changed ? c.primaryText : c.onSurface }]}>{after}</Text>
                {changed ? <Badge label="Modificado +1,5 h" tone="primary" /> : null}
              </View>
            </View>
          );
        })}
      </FormSection>

      <FormSection title={view === 'prof' ? 'Nota para el administrador' : 'Mensaje del profesional'}>
        {view === 'prof' ? (
          <TextInput value={p.note} onChangeText={(t) => setP({ ...p, note: t })} multiline accessibilityLabel="Nota para el administrador"
            style={[styles.input, { color: c.onSurface, borderColor: c.outline, backgroundColor: c.surfaceContainerLowest }]} />
        ) : (
          <Text style={[styles.d, { color: c.onSurface, fontStyle: 'italic' }]}>“{p.note}”</Text>
        )}
      </FormSection>

      {view === 'admin' ? (
        <>
          <FormSection title="Impacto operacional estimado">
            <Text style={[styles.v, { color: c.primaryText }]}>+16,6% · +1,5 h disponibles los viernes · +3 cupos semanales</Text>
            <Text style={[styles.d, { color: c.onSurfaceVariant }]}>0 conflictos de infraestructura: Sillón #1 disponible sin cruces.</Text>
          </FormSection>
          <ToggleRow title="Notificaciones automáticas" description="WhatsApp al profesional y sincronización en AgendaLibre" value={notify} onValueChange={setNotify} />
          <View style={{ height: spacing.md }} />
          <Button title="Aprobar y actualizar agenda" disabled={p.status !== 'sent'} onPress={() => { setP({ ...p, status: 'approved' }); toast('Horario aprobado'); }} />
          <View style={{ height: spacing.sm }} />
          <Button title="Sugerir ajuste de horario" variant="secondary" gradient={false} disabled={p.status !== 'sent'} onPress={() => { toast('Sugerencia enviada al profesional'); }} />
          <View style={{ height: spacing.sm }} />
          <DangerButton outline title="Rechazar propuesta" onPress={() => { if (p.status === 'sent') { setP({ ...p, status: 'rejected' }); toast('Propuesta rechazada', 'warn'); } else toast('No hay propuesta pendiente', 'warn'); }} />
          {p.status !== 'sent' ? <InfoBanner text="Aún no hay una propuesta enviada. Cambia a “Soy profesional” y envíala." /> : null}
        </>
      ) : (
        <>
          <Button title="Enviar propuesta al administrador" icon={<Send size={18} color="#fff" />} onPress={() => { setP({ ...p, status: 'sent' }); toast('Propuesta enviada al administrador'); }} />
          <View style={{ height: spacing.sm }} />
          <Button title="Guardar borrador" variant="secondary" gradient={false} onPress={() => { setP({ ...p, status: 'none' }); toast('Borrador guardado'); }} />
        </>
      )}
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  seg: { flexDirection: 'row', borderRadius: radius.md, padding: 4, marginBottom: spacing.md },
  segBtn: { flex: 1, textAlign: 'center', paddingVertical: 10, borderRadius: radius.sm, overflow: 'hidden', fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.sm },
  week: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
  t: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.md },
  d: { fontFamily: fonts.medium, fontSize: fontSize.sm, lineHeight: 19 },
  v: { fontFamily: fonts.labelBold, fontSize: fontSize.md },
  input: { borderWidth: 1, borderRadius: radius.md, padding: 12, minHeight: 90, fontFamily: fonts.medium, fontSize: fontSize.md, textAlignVertical: 'top' },
});
