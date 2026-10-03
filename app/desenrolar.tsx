import { router } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Badge, ConfirmationScreen, DangerButton, FormSection, InfoBanner, PageScaffold, ProfileHeader, ScreenHeader, StatCard, toast } from '@/components/ui';
import { useAppStore, usePref } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, spacing } from '@/theme/colors';

const NAMES: Record<string, string> = { loc1: 'Barbería Capital • Sillón #1', loc2: 'Atelier Central Barbería & Spa' };

/** Stitch: "Perfil y Desenrolamiento de Recinto" (acción destructiva con botón rojo). */
export default function Desenrolar() {
  const c = useColors();
  const profile = useAppStore((s) => s.profile);
  const [links, setLinks] = usePref<string[]>('join.links', ['loc1']);
  const [gone, setGone] = usePref<string | null>('join.gone', null);
  const name = profile.authName || profile.name;

  if (gone) return (
    <PageScaffold>
      <ConfirmationScreen title="Desenrolamiento completado" message={`Saliste de ${gone}. Tus clientes y fórmulas siguen contigo.`} primaryLabel="Volver a mi perfil" onPrimary={() => { setGone(null); router.replace('/perfil'); }} />
    </PageScaffold>
  );

  return (
    <PageScaffold>
      <ScreenHeader title="Mi recinto" subtitle="Vinculaciones activas" />
      <ProfileHeader name={name} role="Profesional" status={links.length ? `${links.length} local(es) vinculado(s)` : 'Independiente'} />
      <View style={styles.stats}>
        <StatCard label="Modalidad" value="Arriendo" tone="primary" />
        <StatCard label="Canon" value="$320k" />
        <StatCard label="Vence" value="05 nov" />
      </View>
      {links.length === 0 ? <InfoBanner text="No tienes locales vinculados. Puedes unirte a uno cuando quieras." /> : null}
      {links.map((id) => (
        <FormSection key={id} title={NAMES[id] ?? id} right={<Badge label="Activo" tone="success" />}>
          <Text style={[styles.d, { color: c.onSurfaceVariant }]}>Desenrolarte libera tu puesto, cierra tu acceso a la caja del local y deja de sincronizar tu agenda con el salón. No borra tu cuenta ni tus clientes.</Text>
          <View style={{ height: spacing.md }} />
          <DangerButton title="Desenrolarme de este recinto" icon={<LogOut size={18} color="#fff" />}
            onPress={() => { setLinks(links.filter((x) => x !== id)); setGone(NAMES[id] ?? id); toast('Desenrolamiento completado', 'warn'); }} />
        </FormSection>
      ))}
      <Button title="Unirme a otro local" variant="secondary" gradient={false} onPress={() => router.push('/unirse')} />
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  d: { fontFamily: fonts.medium, fontSize: fontSize.sm, lineHeight: 19 },
});
