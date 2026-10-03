import { router } from 'expo-router';
import { Download, RefreshCw, ShieldCheck, Store } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Badge, FormSection, PageScaffold, ProfileHeader, QRCard, ScreenHeader, toast } from '@/components/ui';
import { copyOrShare, openWhatsApp } from '@/lib/whatsapp';
import { useAppStore } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, spacing } from '@/theme/colors';

const RIGHTS = [
  ['Cartera 100% protegida', 'Tus clientes privados y agenda personal nunca se transferirán a la base del local.'],
  ['Servicios y tiempos respetados', 'Tus tiempos de atención se respetan automáticamente para evitar sobreturnos.'],
  ['Transparencia de acuerdos', 'El salón define arriendo mensual o comisión, y tú lo aceptas antes de activar el puesto.'],
];

function fmt(sec: number) { return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; }
function newCode() { return `AGL-${Math.floor(1000 + Math.random() * 9000)}`; }

/** Stitch: "Mi Pase QR de Enrolamiento" / "Generar Pase QR" / "Mi QR de Enrolamiento y Ficha Profesional". */
export default function QrPase() {
  const c = useColors();
  const profile = useAppStore((s) => s.profile);
  const pro = useAppStore((s) => s.professionals.find((p) => p.id === s.profile.activeProfessionalId));
  const name = pro?.name ?? profile.authName ?? profile.name;
  const [code, setCode] = useState('AGL-9241');
  const [left, setLeft] = useState(285);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const regen = () => { setCode(newCode()); setLeft(300); toast('Código regenerado'); };

  return (
    <PageScaffold>
      <ScreenHeader title="Mi pase QR" subtitle="Enrolamiento seguro · AgendaLibre" />
      <ProfileHeader name={name} role={pro?.role ?? 'Profesional'} status="Disponible para vinculación" chips={['Sillón preferido: Puesto 03 / Senior']} color={pro?.color} />
      <QRCard value={`${name}|${code}`} caption="Muestra este código al dueño del salón" expires={left > 0 ? `Código dinámico activo · expira en ${fmt(left)} min` : 'Código vencido — regenéralo'} code={code} />
      <View style={styles.row}>
        <View style={{ flex: 1 }}><Button title="Copiar" variant="secondary" gradient={false} onPress={async () => { await copyOrShare(code, 'Código'); toast('Código copiado'); }} /></View>
        <View style={{ flex: 1 }}><Button title="WhatsApp" variant="secondary" gradient={false} onPress={() => { void openWhatsApp(`Mi código de enrolamiento AgendaLibre: ${code}`); toast('Abriendo WhatsApp'); }} /></View>
      </View>
      <View style={{ height: spacing.sm }} />
      <Button title="Guardar imagen / PDF" variant="secondary" gradient={false} icon={<Download size={18} color={c.primaryText} />} onPress={() => toast('Imagen del pase guardada (demo)')} />
      <View style={{ height: spacing.sm }} />
      <Button title="Regenerar código QR seguro" onPress={regen} icon={<RefreshCw size={18} color="#fff" />} />
      <View style={{ height: spacing.lg }} />
      <FormSection title="Portabilidad y autonomía" icon={<ShieldCheck size={16} color={c.primaryText} />} right={<Badge label="Tus derechos" tone="accent" />}>
        {RIGHTS.map(([t, d]) => (
          <View key={t} style={{ marginBottom: spacing.md }}>
            <Text style={[styles.t, { color: c.onSurface }]}>{t}</Text>
            <Text style={[styles.d, { color: c.onSurfaceVariant }]}>{d}</Text>
          </View>
        ))}
      </FormSection>
      <Button title="Ver mis vinculaciones y locales activos (2)" variant="ghost" icon={<Store size={18} color={c.primaryText} />} onPress={() => router.push('/unirse')} />
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  t: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.md },
  d: { fontFamily: fonts.medium, fontSize: fontSize.sm, lineHeight: 19, marginTop: 2 },
});
