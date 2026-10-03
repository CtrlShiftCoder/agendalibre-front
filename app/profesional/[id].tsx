import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Check, Mail, Phone, Scissors } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { DangerButton, FormSection, PageScaffold, ProfileHeader, ScreenHeader, toast } from '@/components/ui';
import { formatClp } from '@/lib/cash';
import { useProExtra } from '@/lib/bizMock';
import { useAppStore } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

const SHIFTS = [
  { k: 'fixed', t: 'Horario fijo', d: 'Lunes a viernes, 09:00 - 18:00' },
  { k: 'specific', t: 'Días específicos', d: 'Ej. Mar y Jue; o solo sábados' },
  { k: 'flexible', t: 'Horario flexible', d: 'Carga semanal según rotación acordada' },
] as const;

/** Stitch: "Perfil Profesional" (staff) con Forma de Trabajo + Servicios + Guardar. */
export default function ProfesionalPerfil() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pro = useAppStore((s) => s.professionals.find((p) => p.id === id));
  const services = useAppStore((s) => s.services);
  const update = useAppStore((s) => s.updateTeamMember);
  const [ex, setEx] = useProExtra(id);
  const [phone, setPhone] = useState(pro?.phone ?? '+56 9 7821 4433');

  if (!pro) return (<PageScaffold><ScreenHeader title="Perfil profesional" /><EmptyState title="Profesional no encontrado" subtitle="Vuelve al equipo e inténtalo de nuevo." /></PageScaffold>);

  const save = () => { update(pro.id, { phone }); toast('Perfil guardado'); };
  const enabled = (sid: string) => ex.services[sid] ?? true;

  return (
    <PageScaffold
      footer={<Button title="Guardar perfil" onPress={save} icon={<Check size={18} color="#fff" />} />}
    >
      <ScreenHeader title="Perfil profesional" subtitle="Configuración de staff" />
      <ProfileHeader name={pro.name} role={pro.role} status={pro.active ? 'Activo' : 'Inactivo'} chips={[ex.space, ex.agreement]} color={pro.color} />
      <FormSection title="Contacto">
        <View style={styles.line}><Phone size={16} color={c.onSurfaceVariant} /><Text style={[styles.txt, { color: c.onSurface }]}>{phone}</Text></View>
        <View style={styles.line}><Mail size={16} color={c.onSurfaceVariant} /><Text style={[styles.txt, { color: c.onSurface }]}>{(ex.email || `${pro.name.split(' ')[0].toLowerCase()}@atelier.cl`)}</Text></View>
      </FormSection>

      <FormSection title="Forma de trabajo" hint="Tus clientes podrán agendar según la regla y los bloques que configures aquí.">
        {SHIFTS.map((s) => {
          const on = ex.shift === s.k;
          return (
            <Pressable key={s.k} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setEx({ shift: s.k })}
              style={[styles.opt, { borderColor: on ? c.primaryText : c.surfaceContainerHigh, backgroundColor: on ? c.primaryFixed : c.surfaceContainerLowest }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optT, { color: c.onSurface }]}>{s.t}</Text>
                <Text style={[styles.optD, { color: c.onSurfaceVariant }]}>{s.d}</Text>
              </View>
              {on ? <Check size={20} color={c.primaryText} /> : null}
            </Pressable>
          );
        })}
      </FormSection>

      <FormSection title="Servicios que realiza" icon={<Scissors size={16} color={c.primaryText} />} hint={`${services.filter((s) => enabled(s.id)).length} activos`}>
        {services.map((s) => (
          <View key={s.id} style={[styles.svc, { borderBottomColor: c.surfaceContainerHigh }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optT, { color: c.onSurface }]}>{s.name}</Text>
              <Text style={[styles.optD, { color: c.onSurfaceVariant }]}>{s.durationMin} min · {formatClp(s.priceClp)}</Text>
            </View>
            <Switch value={enabled(s.id)} onValueChange={(v) => setEx({ services: { ...ex.services, [s.id]: v } })} trackColor={{ false: c.surfaceContainerHigh, true: c.accent }} thumbColor="#fff" accessibilityLabel={`${s.name} habilitado`} />
          </View>
        ))}
      </FormSection>

      <Pressable onPress={() => router.push('/disponibilidad')} accessibilityRole="button" style={[styles.link, { backgroundColor: c.primaryFixed }]}>
        <Text style={[styles.optT, { color: c.primaryText, flex: 1 }]}>Gestionar mi disponibilidad y slots</Text>
        <ArrowRight size={18} color={c.primaryText} />
      </Pressable>
      <View style={{ height: spacing.sm }} />
      <Button title="Permisos y notificaciones" variant="secondary" gradient={false} onPress={() => router.push({ pathname: '/profesional/permisos', params: { id: pro.id } })} />
      <View style={{ height: spacing.sm }} />
      <DangerButton outline title="Desvincular profesional" onPress={() => router.push({ pathname: '/profesional/desvincular', params: { id: pro.id } })} />
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  txt: { fontFamily: fonts.medium, fontSize: fontSize.md },
  opt: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  optT: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.md },
  optD: { fontFamily: fonts.medium, fontSize: fontSize.sm, marginTop: 2 },
  svc: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  link: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: radius.md },
});
