import { router } from 'expo-router';
import { Bell, ChevronRight, Clock, Copy, Image as ImageIcon, QrCode, Settings, Share2, Store, UserCog, Zap } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, FormSection, ProfileHeader, PageScaffold, ScreenHeader, StatCard, ToggleRow, toast } from '@/components/ui';
import { formatClp } from '@/lib/cash';
import { bookingShareUrl } from '@/lib/bookingLink';
import { todayIso } from '@/lib/uiFormat';
import { copyOrShare } from '@/lib/whatsapp';
import { useAppStore, usePref } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

/** Stitch: "Mi Perfil, Horarios y Link" (profesional). */
export default function MiPerfilProScreen() {
  const c = useColors();
  const profile = useAppStore((s) => s.profile);
  const storefront = useAppStore((s) => s.storefront);
  const services = useAppStore((s) => s.services);
  const apts = useAppStore((s) => s.appointments);
  const reviews = useAppStore((s) => s.reviews);
  const [express, setExpress] = usePref<boolean>('disp.express', true);
  const [mins, setMins] = usePref<Record<string, number>>('svc.mins', {});
  const [tol, setTol] = usePref<number>('rules.tolerance', 10);
  const [abono, setAbono] = usePref<boolean>('rules.abono', true);

  const name = profile.authName || profile.name;
  const url = bookingShareUrl({ slug: storefront.slug, bookingPath: storefront.bookingPath || `/v/${storefront.slug}`, name: storefront.displayName });
  const today = apts.filter((a) => a.date === todayIso() && a.status !== 'cancelada').length;
  const done = apts.filter((a) => a.status === 'completada').length;
  const total = apts.filter((a) => a.status !== 'cancelada').length;
  const rating = reviews.length ? (reviews.reduce((n, r) => n + r.rating, 0) / reviews.length).toFixed(1) : '5,0';
  const eff = total ? Math.round((done / total) * 100) : 100;

  const links = [
    { icon: <Clock size={18} color={c.primaryText} />, t: 'Horarios y disponibilidad', d: `${profile.hours.open} – ${profile.hours.close} · ${profile.hours.days.length} días`, to: '/disponibilidad' },
    { icon: <Store size={18} color={c.primaryText} />, t: 'Mi vitrina pública', d: 'Bio, portada y servicios visibles', to: '/vitrina' },
    { icon: <ImageIcon size={18} color={c.primaryText} />, t: 'Galería de trabajos', d: 'Fotos antes / después', to: '/galeria' },
    { icon: <UserCog size={18} color={c.primaryText} />, t: 'Mi recinto y vinculaciones', d: 'Unirme a un local o desenrolar', to: '/unirse' },
    { icon: <QrCode size={18} color={c.primaryText} />, t: 'Mi pase QR', d: 'Enrolamiento seguro', to: '/qr-pase' },
    { icon: <Bell size={18} color={c.primaryText} />, t: 'Configuración y notificaciones', d: 'WhatsApp, alertas y textos', to: '/ajustes-perfil' },
    { icon: <Settings size={18} color={c.primaryText} />, t: 'Cuenta y apariencia', d: 'Modo oscuro, datos básicos, cerrar sesión', to: '/ajustes' },
  ];

  return (
    <PageScaffold tabbed>
      <ScreenHeader back={false} title="Mi perfil" subtitle={storefront.displayName || profile.name} actions />
      <ProfileHeader name={name} role={profile.address || 'Profesional independiente'} status={`★ ${rating} · ${reviews.length} reseñas`} chips={['Solo Pro', '0% comisión']} />
      <View style={styles.stats}>
        <StatCard label="Turno hoy" value={`${today} citas`} />
        <StatCard label="Efectividad" value={`${eff}%`} tone="success" />
        <StatCard label="Reputación" value={reviews.length > 2 ? 'Top 1' : 'Nuevo'} tone="primary" />
      </View>

      <FormSection title="Horarios y disponibilidad" icon={<Clock size={16} color={c.primaryText} />} right={<Pressable onPress={() => router.push('/disponibilidad')} accessibilityRole="button" accessibilityLabel="Editar base de horarios"><Text style={[styles.link, { color: c.primaryText }]}>Editar base</Text></Pressable>}>
        <Text style={[styles.d, { color: c.onSurface }]}>Jornada {profile.hours.open} – {profile.hours.close} · {profile.hours.days.length} días</Text>
        <ToggleRow title="Citas express / walk-ins" description="Permite que clientes sin cita reserven tus huecos libres de hoy." value={express} onValueChange={(v) => { setExpress(v); toast(v ? 'Walk-ins activados' : 'Walk-ins desactivados'); }} />
      </FormSection>

      <FormSection title="Servicios y duración real" hint="Personalizable: ajusta cuánto te toma cada uno.">
        {services.slice(0, 4).map((s) => {
          const m = mins[s.id] ?? s.durationMin;
          return (
            <View key={s.id} style={[styles.svc, { borderBottomColor: c.surfaceContainerHigh }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.t, { color: c.onSurface }]}>{s.name}</Text>
                <Text style={[styles.d, { color: c.onSurfaceVariant }]}>{formatClp(s.priceClp)} · estándar {s.durationMin} min</Text>
              </View>
              <Pressable onPress={() => setMins({ ...mins, [s.id]: Math.max(10, m - 5) })} accessibilityRole="button" accessibilityLabel={`Menos tiempo ${s.name}`} style={[styles.step, { backgroundColor: c.surfaceContainerLow }]}><Text style={[styles.stepT, { color: c.onSurface }]}>−</Text></Pressable>
              <Text style={[styles.val, { color: c.onSurface }]}>{m} min</Text>
              <Pressable onPress={() => setMins({ ...mins, [s.id]: m + 5 })} accessibilityRole="button" accessibilityLabel={`Más tiempo ${s.name}`} style={[styles.step, { backgroundColor: c.surfaceContainerLow }]}><Text style={[styles.stepT, { color: c.onSurface }]}>+</Text></Pressable>
            </View>
          );
        })}
        <Pressable onPress={() => router.push('/servicios')} accessibilityRole="button" style={{ paddingTop: spacing.sm }}><Text style={[styles.link, { color: c.primaryText }]}>Ver catálogo completo →</Text></Pressable>
      </FormSection>

      <FormSection title="Mi link de reserva personal" icon={<Share2 size={16} color={c.primaryText} />} right={<Badge label="Exclusivo" tone="accent" />}>
        <View style={[styles.url, { backgroundColor: c.surfaceContainerLow }]}>
          <Text style={[styles.urlTxt, { color: c.onSurface }]} numberOfLines={1}>{url.replace(/^https?:\/\//, '')}</Text>
          <Pressable onPress={async () => { await copyOrShare(url, 'Link de reserva'); toast('Enlace copiado'); }} accessibilityRole="button" accessibilityLabel="Copiar link" style={styles.copy}>
            <Copy size={16} color={c.primaryText} /><Text style={[styles.link, { color: c.primaryText }]}>Copiar</Text>
          </Pressable>
        </View>
        <Text style={[styles.d, { color: c.onSurfaceVariant, marginTop: 8 }]}><Zap size={12} color={c.accent} /> Últimos 7 días: {Math.max(12, total * 3)} visitas · {total} citas reservadas</Text>
        <View style={styles.two}>
          <Pressable onPress={() => router.push('/qr-pase')} accessibilityRole="button" style={[styles.btn, { backgroundColor: c.surfaceContainerLow }]}><QrCode size={16} color={c.primaryText} /><Text style={[styles.link, { color: c.primaryText }]}>Ver QR</Text></Pressable>
          <Pressable onPress={async () => { await copyOrShare(`Reserva conmigo: ${url}`, 'Perfil'); toast('Perfil copiado para compartir'); }} accessibilityRole="button" style={[styles.btn, { backgroundColor: c.surfaceContainerLow }]}><Share2 size={16} color={c.primaryText} /><Text style={[styles.link, { color: c.primaryText }]}>Compartir perfil</Text></Pressable>
        </View>
      </FormSection>

      <FormSection title="Reglas de mi agenda">
        <View style={styles.svc}>
          <View style={{ flex: 1 }}><Text style={[styles.t, { color: c.onSurface }]}>Margen de tolerancia</Text><Text style={[styles.d, { color: c.onSurfaceVariant }]}>Máximo {tol} min de espera por turno</Text></View>
          <Pressable onPress={() => setTol(Math.max(0, tol - 5))} accessibilityRole="button" accessibilityLabel="Menos tolerancia" style={[styles.step, { backgroundColor: c.surfaceContainerLow }]}><Text style={[styles.stepT, { color: c.onSurface }]}>−</Text></Pressable>
          <Pressable onPress={() => setTol(tol + 5)} accessibilityRole="button" accessibilityLabel="Más tolerancia" style={[styles.step, { backgroundColor: c.surfaceContainerLow }]}><Text style={[styles.stepT, { color: c.onSurface }]}>+</Text></Pressable>
        </View>
        <ToggleRow title="Abono previo obligatorio" description="Seña para confirmar la cita (ver detalle en Seña y abonos)." value={abono} onValueChange={(v) => { setAbono(v); toast(v ? 'Abono obligatorio' : 'Abono opcional'); }} />
        <Pressable onPress={() => router.push('/sena')} accessibilityRole="button"><Text style={[styles.link, { color: c.primaryText }]}>Configurar seña y abonos →</Text></Pressable>
      </FormSection>

      {links.map((r) => (
        <Pressable key={r.t} onPress={() => router.push(r.to as never)} accessibilityRole="button" accessibilityLabel={r.t}
          style={[styles.rowLink, { backgroundColor: c.surfaceContainerLowest, borderColor: c.surfaceContainerHigh }]}>
          <View style={[styles.ic, { backgroundColor: c.primaryFixed }]}>{r.icon}</View>
          <View style={{ flex: 1 }}><Text style={[styles.t, { color: c.onSurface }]}>{r.t}</Text><Text style={[styles.d, { color: c.onSurfaceVariant }]}>{r.d}</Text></View>
          <ChevronRight size={18} color={c.onSurfaceVariant} />
        </Pressable>
      ))}
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  t: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.md },
  d: { fontFamily: fonts.medium, fontSize: fontSize.sm, lineHeight: 18 },
  link: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.sm },
  svc: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  step: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  stepT: { fontFamily: fonts.labelBold, fontSize: 18 },
  val: { fontFamily: fonts.labelBold, fontSize: fontSize.sm, minWidth: 52, textAlign: 'center' },
  url: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: radius.md, padding: spacing.md },
  urlTxt: { flex: 1, fontFamily: fonts.labelSemibold, fontSize: fontSize.sm },
  copy: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 36 },
  two: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  btn: { flex: 1, minHeight: 44, borderRadius: radius.md, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  rowLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.sm },
  ic: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
