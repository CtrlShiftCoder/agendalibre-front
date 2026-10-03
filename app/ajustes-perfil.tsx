import { router } from 'expo-router';
import { Copy, Moon } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Badge, FormSection, PageScaffold, ProfileHeader, ScreenHeader, ToggleRow, toast } from '@/components/ui';
import { bookingShareUrl } from '@/lib/bookingLink';
import { copyOrShare } from '@/lib/whatsapp';
import { useAppStore, usePref } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

const KEYS: { section: string; items: { k: string; t: string; d: string; def: boolean; tag?: string }[] }[] = [
  { section: 'Alertas de agenda y negocio', items: [
    { k: 'n.reservas', t: 'Nuevas reservas y walk-ins', d: 'Alerta inmediata cuando ingresa un turno propio o asignado.', def: true, tag: 'Push + WA' },
    { k: 'n.cancel', t: 'Cancelaciones y reagendamientos', d: 'Aviso sonoro para liberar el turno y ofrecer el hueco.', def: true, tag: 'Inmediato' },
    { k: 'n.pagos', t: 'Comprobantes de pago y señas', d: 'Notificación al validar el abono por transferencia.', def: true, tag: 'Finanzas' },
    { k: 'n.resumen', t: 'Resumen matutino (08:30)', d: 'Plan del día: clientes agendados, recaudación estimada y huecos.', def: true },
  ] },
  { section: 'Bot de WhatsApp para clientes', items: [
    { k: 'w.24h', t: 'Recordatorio preventivo (24 h antes)', d: 'Pide confirmación en un toque: “Confirmar” o “Reagendar”.', def: true, tag: 'Baja inasistencias' },
    { k: 'w.2h', t: 'Aviso de salida y acceso (2 h antes)', d: 'Envía link de mapa con la dirección.', def: false },
    { k: 'w.resena', t: 'Reseña y propina post-atención', d: 'Se envía 30 min después de marcar “Completado”.', def: true },
  ] },
  { section: 'Políticas del puesto', items: [
    { k: 'p.silencio', t: 'Modo silencio fuera de turno', d: 'Bloquea alertas y llamadas directas fuera de tu horario.', def: false },
  ] },
];

/** Stitch: "Configuración de Perfil y Notificaciones" (profesional). Toggles persistentes. */
export default function AjustesPerfil() {
  const c = useColors();
  const profile = useAppStore((s) => s.profile);
  const storefront = useAppStore((s) => s.storefront);
  const dark = useAppStore((s) => s.appearance === 'dark');
  const toggleAppearance = useAppStore((s) => s.toggleAppearance);
  const [vals, setVals] = usePref<Record<string, boolean>>('settings.toggles', {});
  const url = bookingShareUrl({ slug: storefront.slug, bookingPath: storefront.bookingPath || `/v/${storefront.slug}`, name: storefront.displayName });
  const get = (k: string, d: boolean) => vals[k] ?? d;

  return (
    <PageScaffold footer={<Button title="Guardar configuración" onPress={() => toast('Configuración guardada')} />}>
      <ScreenHeader title="Configuración" subtitle="Perfil y notificaciones" />
      <ProfileHeader name={profile.authName || profile.name} role={storefront.bio || 'Profesional independiente'} status="Verificado" />
      <View style={[styles.url, { backgroundColor: c.surfaceContainerLow }]}>
        <Text style={[styles.urlT, { color: c.onSurface }]} numberOfLines={1}>{url.replace(/^https?:\/\//, '')}</Text>
        <Badge label="En vivo" tone="success" />
        <Pressable onPress={async () => { await copyOrShare(url, 'Link'); toast('Enlace copiado'); }} accessibilityRole="button" accessibilityLabel="Copiar enlace" style={styles.copy}>
          <Copy size={16} color={c.primaryText} /><Text style={[styles.cp, { color: c.primaryText }]}>Copiar</Text>
        </Pressable>
      </View>

      {KEYS.map((g) => (
        <FormSection key={g.section} title={g.section}>
          {g.items.map((it) => (
            <ToggleRow key={it.k} title={it.t} description={it.d} value={get(it.k, it.def)} badge={it.tag ? <Badge label={it.tag} tone="accent" /> : undefined}
              onValueChange={(v) => { setVals({ ...vals, [it.k]: v }); toast(`${it.t}: ${v ? 'activado' : 'desactivado'}`); }} />
          ))}
        </FormSection>
      ))}

      <FormSection title="Apariencia" icon={<Moon size={16} color={c.primaryText} />}>
        <ToggleRow title="Modo oscuro" description="Colores suaves con contraste AA." value={dark} onValueChange={() => toggleAppearance()} />
      </FormSection>
      <Button title="Personalizar textos de mensajes WhatsApp" variant="secondary" gradient={false} onPress={() => router.push('/recordatorios')} />
      <View style={{ height: spacing.sm }} />
      <Button title="Cuenta, datos básicos y cerrar sesión" variant="ghost" onPress={() => router.push('/ajustes')} />
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  url: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  urlT: { flex: 1, fontFamily: fonts.labelSemibold, fontSize: fontSize.sm },
  copy: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 36 },
  cp: { fontFamily: fonts.semibold, fontSize: fontSize.sm },
});
