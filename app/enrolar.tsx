import { router } from 'expo-router';
import { ScanLine, ShieldCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Badge, ConfirmationScreen, FormSection, InfoBanner, PageScaffold, ProfileHeader, ScreenHeader, ToggleRow, toast } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

const SPOTS = [
  { k: 'Sillón Principal #1', d: 'Disponible de inmediato · Zona Barbería', free: true },
  { k: 'Sillón #2', d: 'Ocupado por otro profesional', free: false },
  { k: 'Box Estética #1', d: 'Equipado con lavapelo · Zona Spa', free: true },
];

/** Stitch: "Escanear QR y Enrolar Profesional" (admin). */
export default function Enrolar() {
  const c = useColors();
  const addMember = useAppStore((s) => s.addTeamMember);
  const [scanned, setScanned] = useState(false);
  const [spot, setSpot] = useState(SPOTS[0].k);
  const [deal, setDeal] = useState<'rental' | 'commission'>('rental');
  const [shared, setShared] = useState(true);
  const [walkin, setWalkin] = useState(false);
  const [done, setDone] = useState(false);

  if (done) return (
    <PageScaffold>
      <ConfirmationScreen title="¡Profesional enrolado!" message={`Ignacio Camiletti quedó vinculado a ${spot}.`} primaryLabel="Ver equipo" onPrimary={() => router.replace('/equipo')} secondaryLabel="Volver al negocio" onSecondary={() => router.replace('/perfil')} />
    </PageScaffold>
  );

  const enrol = () => {
    const p = addMember({ name: 'Ignacio Camiletti', role: 'Master Barber & Colorista', teamRole: 'trabajador' });
    if (!p) { toast('No se pudo enrolar (límite del plan)', 'warn'); return; }
    setDone(true);
  };

  return (
    <PageScaffold footer={scanned ? <Button title="Enrolar y asignar puesto" onPress={enrol} /> : undefined}>
      <ScreenHeader title="Enrolar con QR" subtitle="Escanea el código del profesional para incorporarlo" />
      <View style={[styles.viewfinder, { backgroundColor: '#0F172A' }]} accessibilityLabel="Visor de cámara (demo)">
        <ScanLine size={64} color="#fff" />
        <Text style={styles.vf}>{scanned ? 'Código detectado' : 'Visor activo'}</Text>
      </View>
      {!scanned ? (
        <Button title="Escanear código (demo)" onPress={() => { setScanned(true); toast('¡Código detectado con éxito!'); }} />
      ) : (
        <>
          <ProfileHeader name="Ignacio Camiletti" role="Master Barber · 6 años exp." status="4,9 ★ (218 reseñas)" chips={['Fade', 'Colorimetría', 'Barboterapia']} />
          <InfoBanner icon={<ShieldCheck size={20} color={c.primaryText} />} title="Portabilidad certificada." text="Identidad, cartera de clientes y certificados sanitarios validados." />
          <FormSection title="Puesto y sillón asignado">
            {SPOTS.map((s) => (
              <Pressable key={s.k} disabled={!s.free} onPress={() => setSpot(s.k)} accessibilityRole="radio" accessibilityState={{ selected: spot === s.k, disabled: !s.free }}
                style={[styles.opt, { borderColor: spot === s.k ? c.primaryText : c.surfaceContainerHigh, backgroundColor: spot === s.k ? c.primaryFixed : c.surfaceContainerLowest, opacity: s.free ? 1 : 0.55 }]}>
                <View style={{ flex: 1 }}><Text style={[styles.t, { color: c.onSurface }]}>{s.k}</Text><Text style={[styles.d, { color: c.onSurfaceVariant }]}>{s.d}</Text></View>
                <Badge label={s.free ? 'Libre' : 'En uso'} tone={s.free ? 'success' : 'warn'} />
              </Pressable>
            ))}
          </FormSection>
          <FormSection title="Modalidad de acuerdo comercial">
            {([['rental', 'Arriendo mensual de sillón', '$320.000 CLP · cobro los días 15. 100% de los ingresos para el profesional.'], ['commission', 'Porcentaje de comisión', '60% profesional / 40% local, liquidación quincenal.']] as const).map(([k, t, d]) => (
              <Pressable key={k} onPress={() => setDeal(k)} accessibilityRole="radio" accessibilityState={{ selected: deal === k }}
                style={[styles.opt, { borderColor: deal === k ? c.primaryText : c.surfaceContainerHigh, backgroundColor: deal === k ? c.primaryFixed : c.surfaceContainerLowest }]}>
                <View style={{ flex: 1 }}><Text style={[styles.t, { color: c.onSurface }]}>{t}</Text><Text style={[styles.d, { color: c.onSurfaceVariant }]}>{d}</Text></View>
              </Pressable>
            ))}
          </FormSection>
          <FormSection title="Permisos de acceso y visibilidad">
            <ToggleRow title="Permitir ver agenda compartida del salón" description="Consulta disponibilidad general para agendamientos cruzados." value={shared} onValueChange={setShared} />
            <ToggleRow title="Recepción de turnos walk-in" description="Recibe clientes de paso asignados por recepción." value={walkin} onValueChange={setWalkin} />
          </FormSection>
        </>
      )}
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  viewfinder: { height: 200, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: spacing.lg },
  vf: { color: '#fff', fontFamily: fonts.labelSemibold, fontSize: fontSize.sm },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  t: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.md },
  d: { fontFamily: fonts.medium, fontSize: fontSize.sm, marginTop: 2 },
});
