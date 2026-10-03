import { router } from 'expo-router';
import { Handshake, Percent, Armchair, ShieldCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Badge, ConfirmationScreen, FormSection, InfoBanner, PageScaffold, ScreenHeader, toast } from '@/components/ui';
import { usePref } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

const LOCALES = [
  { id: 'loc1', name: 'Barbería Capital', addr: 'Av. Providencia 2145, Local 4' },
  { id: 'loc2', name: 'Atelier Central Barbería & Spa', addr: 'Av. Providencia 1240, Of. 302' },
];

/** Stitch: "Onboarding: Unirse a Negocio o Arrendar Sillón" + vinculaciones activas. */
export default function Unirse() {
  const c = useColors();
  const [mode, setMode] = usePref<'rent' | 'commission'>('join.mode', 'rent');
  const [links, setLinks] = usePref<string[]>('join.links', ['loc1']);
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);

  if (sent) return (
    <PageScaffold><ConfirmationScreen title="Solicitud enviada" message="El administrador del local revisará tu vinculación. Te avisaremos por WhatsApp." primaryLabel="Ver mis vinculaciones" onPrimary={() => setSent(false)} secondaryLabel="Volver a mi perfil" onSecondary={() => router.replace('/perfil')} /></PageScaffold>
  );

  const join = (id?: string) => {
    if (!id && code.trim().length < 4) { toast('Ingresa el código de invitación del local', 'warn'); return; }
    const target = id ?? 'loc2';
    if (!links.includes(target)) setLinks([...links, target]);
    setSent(true);
  };

  return (
    <PageScaffold>
      <ScreenHeader title="Unirme a un local" subtitle="Enrolamiento flexible" />
      <Text style={[styles.h, { color: c.onSurface }]}>¿Cómo vas a operar en AgendaLibre?</Text>
      <Text style={[styles.d, { color: c.onSurfaceVariant, marginBottom: spacing.md }]}>Elige tu modalidad para vincular tu sillón, configurar tus cobros y sincronizar tu agenda con el local.</Text>

      {([
        ['rent', 'Modelo 100% autónomo', 'Arrendar sillón / estación física', 'Cobras el 100% de tus servicios y pagas un canon mensual fijo acordado con el dueño.', ['Tus clientes y fórmulas son 100% tuyos', 'Cobro directo a tu cuenta o efectivo', 'Tú defines precios y tiempos'], <Armchair key="a" size={18} color={c.primaryText} />],
        ['commission', 'Definido por el administrador', 'Enrolarme como staff / comisión', 'El dueño fija tu esquema: ganas un porcentaje de cada servicio y producto, sin canon fijo.', ['Servicios 50% – 60%', 'Retail 15% – 20%', 'Liquidaciones automáticas'], <Percent key="p" size={18} color={c.primaryText} />],
      ] as const).map(([k, badge, t, d, bullets, ic]) => {
        const on = mode === k;
        return (
          <Pressable key={k} onPress={() => setMode(k)} accessibilityRole="radio" accessibilityState={{ selected: on }}
            style={[styles.opt, { borderColor: on ? c.primaryText : c.surfaceContainerHigh, backgroundColor: on ? c.primaryFixed : c.surfaceContainerLowest }]}>
            <View style={styles.optTop}>{ic}<Badge label={badge} tone={on ? 'primary' : 'neutral'} /></View>
            <Text style={[styles.t, { color: c.onSurface }]}>{t}</Text>
            <Text style={[styles.d, { color: c.onSurfaceVariant }]}>{d}</Text>
            {bullets.map((b) => (<Text key={b} style={[styles.d, { color: c.onSurface }]}>✓ {b}</Text>))}
          </Pressable>
        );
      })}

      <FormSection title="Vinculación con el local" icon={<Handshake size={16} color={c.primaryText} />}>
        <Text style={[styles.d, { color: c.onSurfaceVariant }]}>Código de invitación del local</Text>
        <TextInput value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="Ej. LOC-4821" placeholderTextColor={c.placeholder} accessibilityLabel="Código de invitación"
          style={[styles.input, { color: c.onSurface, borderColor: c.outline, backgroundColor: c.surfaceContainerLowest }]} />
        <Button title="Ingresar código" onPress={() => join()} />
        <View style={{ height: spacing.sm }} />
        <Button title="Escanear QR del local" variant="secondary" gradient={false} onPress={() => router.push('/qr-pase')} />
      </FormSection>

      <FormSection title="Locales disponibles">
        {LOCALES.map((l) => (
          <View key={l.id} style={[styles.loc, { borderBottomColor: c.surfaceContainerHigh }]}>
            <View style={{ flex: 1 }}><Text style={[styles.t, { color: c.onSurface }]}>{l.name}</Text><Text style={[styles.d, { color: c.onSurfaceVariant }]}>{l.addr}</Text></View>
            {links.includes(l.id) ? <Badge label="Vinculado" tone="success" /> : <Pressable onPress={() => join(l.id)} accessibilityRole="button" accessibilityLabel={`Solicitar unirme a ${l.name}`}><Text style={[styles.link, { color: c.primaryText }]}>Solicitar</Text></Pressable>}
          </View>
        ))}
      </FormSection>
      <Button title="Gestionar mis vinculaciones (desenrolar)" variant="ghost" onPress={() => router.push('/desenrolar')} />
      <InfoBanner icon={<ShieldCheck size={20} color={c.primaryText} />} text="Tu cartera de clientes siempre te pertenece: nunca se transfiere a la base del local." />
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  h: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.xl },
  d: { fontFamily: fonts.medium, fontSize: fontSize.sm, lineHeight: 19 },
  t: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.md },
  opt: { borderWidth: 1.5, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, gap: 4 },
  optTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, minHeight: 48, fontFamily: fonts.labelSemibold, fontSize: fontSize.md, marginVertical: spacing.sm },
  loc: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  link: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.sm },
});
