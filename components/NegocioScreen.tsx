import { router } from 'expo-router';
import { BadgeCheck, BarChart3, ChevronRight, ClipboardList, Clock, Image as ImageIcon, MapPin, MessageCircle, QrCode, ScanLine, Settings, ShieldCheck, Star, Store, Users, Wallet } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Avatar, Badge, FormSection, PageScaffold, ScreenHeader, ToggleRow, toast } from '@/components/ui';
import { useAppStore, usePref } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

const MODELS = [
  { k: 'fixed', t: 'Equipo fijo', b: 'Turnos estándar', d: 'Los profesionales asisten en turnos predeterminados de lunes a sábado.' },
  { k: 'flexible', t: 'Horarios flexibles', b: 'Autogestión total', d: 'Cada profesional abre sus propios días y bloques horarios.' },
  { k: 'mixed', t: 'Modelo mixto', b: 'Recomendado', d: 'Algunos con horario fijo y otros por días específicos o arriendo por horas.' },
] as const;

/** Stitch: "Configuración del Negocio" (admin) — pestaña "Negocio". */
export default function NegocioScreen() {
  const c = useColors();
  const profile = useAppStore((s) => s.profile);
  const update = useAppStore((s) => s.updateProfile);
  const pros = useAppStore((s) => s.professionals);
  const services = useAppStore((s) => s.services);
  const storefront = useAppStore((s) => s.storefront);
  const [model, setModel] = usePref<string>('biz.model', 'mixed');
  const [wa, setWa] = usePref<boolean>('biz.wa24', true);
  const [lead, setLead] = usePref<number>('biz.lead', 2);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [address, setAddress] = useState(profile.address);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const nowReq = useAppStore((s) => s.appointments.filter((a) => a.status === 'pendiente').length);

  const save = () => {
    update({ name, address, phone });
    setEditing(false);
    toast('¡Configuración actualizada con éxito!');
  };

  const rows: { icon: React.ReactNode; t: string; d: string; to: string; badge?: string }[] = [
    { icon: <Users size={18} color={c.primaryText} />, t: 'Equipo / profesionales', d: `${pros.filter((p) => p.active).length} activos · comisiones y accesos`, to: '/equipo' },
    { icon: <ClipboardList size={18} color={c.primaryText} />, t: 'Solicitudes de reserva', d: 'Aprobar, proponer horario o rechazar', to: '/solicitudes', badge: nowReq ? String(nowReq) : undefined },
    { icon: <Wallet size={18} color={c.primaryText} />, t: 'Caja del día', d: 'Cierre, arqueo y exportación CSV', to: '/caja' },
    { icon: <ShieldCheck size={18} color={c.primaryText} />, t: 'Verificar transferencias', d: 'Revisa comprobantes y suma a la caja', to: '/verificar-pago' },
    { icon: <ScanLine size={18} color={c.primaryText} />, t: 'Enrolar profesional con QR', d: 'Escanea el pase del profesional', to: '/enrolar' },
    { icon: <Store size={18} color={c.primaryText} />, t: 'Vitrina pública', d: `agendalibre.cl/${storefront.slug}`, to: '/vitrina' },
    { icon: <ImageIcon size={18} color={c.primaryText} />, t: 'Galería', d: 'Fotos del negocio y trabajos', to: '/galeria' },
    { icon: <Star size={18} color={c.primaryText} />, t: 'Reseñas', d: 'Responde y destaca opiniones', to: '/resenas' },
    { icon: <MessageCircle size={18} color={c.primaryText} />, t: 'Recordatorios WhatsApp', d: 'Plantillas y envíos', to: '/recordatorios' },
    { icon: <Clock size={18} color={c.primaryText} />, t: 'Lista de espera y política', d: 'Cupos liberados y cancelaciones', to: '/lista-espera' },
    { icon: <BarChart3 size={18} color={c.primaryText} />, t: 'Mi disponibilidad', d: 'Días, slots y bloqueos', to: '/disponibilidad' },
    { icon: <QrCode size={18} color={c.primaryText} />, t: 'Mi pase QR', d: 'Código de enrolamiento', to: '/qr-pase' },
    { icon: <Settings size={18} color={c.primaryText} />, t: 'Cuenta, apariencia y datos', d: 'Modo oscuro, tema, cerrar sesión', to: '/ajustes' },
  ];

  return (
    <PageScaffold tabbed>
      <ScreenHeader back={false} title="Negocio" subtitle="Gestión del espacio" actions />
      <View style={[styles.card, { backgroundColor: c.surfaceContainerLowest, borderColor: c.surfaceContainerHigh }]}>
        <View style={styles.top}>
          <Avatar name={profile.name || 'Negocio'} size={56} />
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: c.onSurface }]} numberOfLines={2}>{profile.name}</Text>
              <BadgeCheck size={18} color={c.accent} />
            </View>
            <Badge label="Activo · multi-profesional" tone="success" />
          </View>
          <Pressable onPress={() => setEditing((v) => !v)} accessibilityRole="button" accessibilityLabel="Editar datos del negocio"><Text style={[styles.edit, { color: c.primaryText }]}>{editing ? 'Cerrar' : 'Editar'}</Text></Pressable>
        </View>
        {editing ? (
          <View style={{ marginTop: spacing.md }}>
            <TextField label="Nombre del negocio" value={name} onChangeText={setName} />
            <TextField label="Dirección" value={address} onChangeText={setAddress} />
            <TextField label="WhatsApp / fono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
        ) : (
          <View style={{ marginTop: spacing.md, gap: 6 }}>
            <View style={styles.line}><MapPin size={16} color={c.onSurfaceVariant} /><Text style={[styles.txt, { color: c.onSurface }]}>{profile.address || 'Sin dirección'}</Text></View>
            <View style={styles.line}><MessageCircle size={16} color={c.onSurfaceVariant} /><Text style={[styles.txt, { color: c.onSurface }]}>{profile.phone || '+56 9 8412 3904'}</Text></View>
            <View style={styles.line}><Clock size={16} color={c.onSurfaceVariant} /><Text style={[styles.txt, { color: c.onSurface }]}>{profile.hours.open} - {profile.hours.close} · {profile.hours.days.length} días</Text></View>
          </View>
        )}
      </View>

      <FormSection title="¿Cómo trabaja tu equipo?" hint="Modelo operativo: reglas de ocupación de sillones y disponibilidad de agendas.">
        {MODELS.map((m) => {
          const on = model === m.k;
          return (
            <Pressable key={m.k} onPress={() => setModel(m.k)} accessibilityRole="radio" accessibilityState={{ selected: on }}
              style={[styles.opt, { borderColor: on ? c.primaryText : c.surfaceContainerHigh, backgroundColor: on ? c.primaryFixed : c.surfaceContainerLowest }]}>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}><Text style={[styles.t, { color: c.onSurface }]}>{m.t}</Text><Badge label={m.b} tone={m.k === 'mixed' ? 'accent' : 'neutral'} /></View>
                <Text style={[styles.d, { color: c.onSurfaceVariant }]}>{m.d}</Text>
              </View>
            </Pressable>
          );
        })}
      </FormSection>

      <FormSection title="Políticas de reserva inmediata">
        <View style={styles.stepRow}>
          <View style={{ flex: 1 }}><Text style={[styles.t, { color: c.onSurface }]}>Anticipación mínima</Text><Text style={[styles.d, { color: c.onSurfaceVariant }]}>Los clientes agendan con al menos {lead} h de holgura.</Text></View>
          <Pressable onPress={() => setLead(Math.max(0, lead - 1))} accessibilityRole="button" accessibilityLabel="Menos anticipación" style={[styles.step, { backgroundColor: c.surfaceContainerLow }]}><Text style={[styles.stepT, { color: c.onSurface }]}>−</Text></Pressable>
          <Text style={[styles.val, { color: c.onSurface }]}>{lead} h</Text>
          <Pressable onPress={() => setLead(Math.min(24, lead + 1))} accessibilityRole="button" accessibilityLabel="Más anticipación" style={[styles.step, { backgroundColor: c.surfaceContainerLow }]}><Text style={[styles.stepT, { color: c.onSurface }]}>+</Text></Pressable>
        </View>
        <ToggleRow title="Confirmación por WhatsApp" description="Envío automático de recordatorio 24 h antes." value={wa} onValueChange={(v) => { setWa(v); toast(v ? 'Recordatorios activados' : 'Recordatorios desactivados'); }} />
      </FormSection>

      <Text style={[styles.sec, { color: c.onSurface }]}>Capacidad y operación</Text>
      <Text style={[styles.d, { color: c.onSurfaceVariant, marginBottom: spacing.sm }]}>{services.length} servicios · {pros.length} profesionales</Text>
      {rows.map((r) => (
        <Pressable key={r.t} onPress={() => router.push(r.to as never)} accessibilityRole="button" accessibilityLabel={r.t}
          style={[styles.rowLink, { backgroundColor: c.surfaceContainerLowest, borderColor: c.surfaceContainerHigh }]}>
          <View style={[styles.ic, { backgroundColor: c.primaryFixed }]}>{r.icon}</View>
          <View style={{ flex: 1 }}><Text style={[styles.t, { color: c.onSurface }]}>{r.t}</Text><Text style={[styles.d, { color: c.onSurfaceVariant }]}>{r.d}</Text></View>
          {r.badge ? <Badge label={r.badge} tone="danger" /> : null}
          <ChevronRight size={18} color={c.onSurfaceVariant} />
        </Pressable>
      ))}
      <View style={{ height: spacing.md }} />
      <Button title="Guardar cambios" onPress={save} />
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, marginBottom: spacing.lg },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.xl, flexShrink: 1 },
  edit: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.sm },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  txt: { fontFamily: fonts.medium, fontSize: fontSize.sm, flex: 1 },
  opt: { flexDirection: 'row', borderWidth: 1.5, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  t: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.md },
  d: { fontFamily: fonts.medium, fontSize: fontSize.sm, lineHeight: 18, marginTop: 2 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: spacing.md },
  step: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  stepT: { fontFamily: fonts.labelBold, fontSize: 20 },
  val: { fontFamily: fonts.labelBold, fontSize: fontSize.md, minWidth: 36, textAlign: 'center' },
  sec: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.lg },
  rowLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.sm },
  ic: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
