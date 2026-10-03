import { goBack } from '@/lib/nav';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, CircleDollarSign, Clock3, Eye, Info, Sofa, Users } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Avatar, Badge, FilterChips, FormSection, InfoBanner, PageScaffold, ScreenHeader, ToggleRow, toast } from '@/components/ui';
import { formatClp } from '@/lib/cash';
import { resolveServiceCategory } from '@/lib/serviceCategory';
import { apiCreateService, apiUpdateService } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import { useColors, usePaletteId } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

type Cat = 'servicio' | 'paquete' | 'promo';
const STEPS = ['Básicos', 'Precios', 'Tiempos', 'Boxes & Staff'];
const DURS = [15, 30, 45, 60, 90, 120];
const BUFFERS = [0, 5, 10, 15];
const DEPOSITS = [0, 30, 50, 100];
const SPACES = [
  { id: 'principal', title: 'Sillón / puesto principal', sub: 'Estación principal de atención' },
  { id: 'box', title: 'Box privado', sub: 'Cabina privada con camilla' },
  { id: 'lavado', title: 'Reserva lavado compartido (15 min)', sub: 'Bloquea uso de bachas en medio del servicio' },
];

/** Crear / configurar servicio en 4 pasos (Stitch 4a05b1e0). id="nuevo" crea. */
export default function ServicioFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const admin = usePaletteId() === 'indigo';
  const services = useAppStore((s) => s.services);
  const pros = useAppStore((s) => s.professionals);
  const setPref = useAppStore((s) => s.setPref);
  const prefs = useAppStore((s) => s.prefs);
  const existing = id && id !== 'nuevo' ? services.find((s) => s.id === id) : undefined;
  const ex = (existing ? (prefs[`svc.extra.${existing.id}`] as Record<string, unknown> | undefined) : undefined) ?? {};

  const [step, setStep] = useState(0);
  const [name, setName] = useState(existing?.name ?? '');
  const [cat, setCat] = useState<Cat>((existing ? resolveServiceCategory(existing) : 'servicio') as Cat ?? 'servicio');
  const [desc, setDesc] = useState((ex.desc as string) ?? '');
  const [pub, setPub] = useState(existing ? existing.active : true);
  const [price, setPrice] = useState(String(existing?.priceClp ?? 18000));
  const [dep, setDep] = useState<number>(existing?.depositPercent ?? 0);
  const [dur, setDur] = useState<number>(existing?.durationMin ?? 45);
  const [buf, setBuf] = useState<number>((ex.buffer as number) ?? 5);
  const [spaces, setSpaces] = useState<string[]>((ex.spaces as string[]) ?? ['principal']);
  const [staff, setStaff] = useState<string[]>((ex.staff as string[]) ?? pros.filter((p) => p.active).map((p) => p.id));

  const priceN = Number(price.replace(/\D/g, '')) || 0;
  const total = dur + buf;
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const save = (draft: boolean) => {
    if (!name.trim()) { setStep(0); Alert.alert('Falta el nombre', 'Ponle un nombre comercial al servicio.'); return; }
    if (priceN <= 0) { setStep(1); Alert.alert('Falta el precio', 'Ingresa un precio mayor a 0.'); return; }
    const extra = { desc, buffer: buf, spaces, staff };
    const body = { name: name.trim(), durationMin: dur, priceClp: priceN, depositPercent: dep > 0 ? dep : null, category: cat };
    if (existing) {
      void apiUpdateService(existing.id, { ...body, active: !draft && pub });
      setPref(`svc.extra.${existing.id}`, extra);
    } else {
      void apiCreateService({ ...body, iconKey: 'cut' } as never);
      const created = useAppStore.getState().services.find((s) => s.name === body.name);
      if (created) {
        setPref(`svc.extra.${created.id}`, extra);
        if (draft) void apiUpdateService(created.id, { active: false });
      }
    }
    toast(draft ? 'Guardado como borrador (oculto de la web)' : 'Servicio guardado y publicado');
    goBack();
  };

  const input = [styles.input, { backgroundColor: c.surfaceContainerLow, color: c.onSurface, borderColor: c.surfaceContainerHigh }];
  const label = [styles.label, { color: c.onSurfaceVariant }];

  const footer = (
    <View style={{ gap: spacing.sm }}>
      <View style={styles.rowBtns}>
        {step > 0 ? (
          <Pressable onPress={() => setStep(step - 1)} accessibilityRole="button" accessibilityLabel="Paso anterior" style={[styles.btn2, { borderColor: c.primaryText }]}>
            <Text style={[styles.btnT, { color: c.primaryText }]}>Atrás</Text>
          </Pressable>
        ) : null}
        {step < 3 ? (
          <Pressable onPress={() => setStep(step + 1)} accessibilityRole="button" accessibilityLabel="Siguiente paso" style={[styles.btn, { backgroundColor: c.primary }]}>
            <Text style={[styles.btnT, { color: '#fff' }]}>Siguiente</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => save(false)} accessibilityRole="button" accessibilityLabel="Guardar y publicar servicio" style={[styles.btn, { backgroundColor: c.primary }]}>
            <Text style={[styles.btnT, { color: '#fff' }]}>Guardar y publicar</Text>
          </Pressable>
        )}
      </View>
      <Pressable onPress={() => save(true)} accessibilityRole="button" accessibilityLabel="Guardar como borrador">
        <Text style={[styles.draft, { color: c.primaryText }]}>Guardar como borrador (oculto de la web)</Text>
      </Pressable>
    </View>
  );

  const staffList = useMemo(() => pros.filter((p) => p.active), [pros]);

  return (
    <PageScaffold footer={footer}>
      <ScreenHeader title={existing ? 'Configurar servicio' : 'Crear servicio'} subtitle={admin ? 'Configuración de catálogo' : 'Mis servicios'} right={<Badge label={pub ? 'Publicado' : 'Borrador'} tone={pub ? 'success' : 'neutral'} />} />
      <Text style={[styles.step, { color: c.primaryText }]}>Paso {step + 1} de 4</Text>
      <Text style={[styles.h1, { color: c.onSurface }]}>{existing ? 'Editar servicio' : 'Configurar nuevo servicio'}</Text>
      <Text style={[styles.sub, { color: c.onSurfaceVariant }]}>Completa los detalles para sincronizar agenda, cobro y disponibilidad.</Text>
      <FilterChips
        chips={STEPS.map((s, i) => ({ id: String(i), label: `${i + 1}. ${s}` }))}
        value={String(step)}
        onChange={(v) => setStep(Number(v))}
      />

      {step === 0 ? (
        <FormSection title="Datos básicos" icon={<Info size={16} color={c.primaryText} />}>
          <Text style={label}>Nombre comercial del servicio</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Ej: Fade Premium" placeholderTextColor={c.onSurfaceVariant} style={input} accessibilityLabel="Nombre del servicio" />
          <Text style={label}>Categoría</Text>
          <FilterChips chips={[{ id: 'servicio', label: 'Servicio' }, { id: 'paquete', label: 'Paquete' }, { id: 'promo', label: 'Promoción' }]} value={cat} onChange={(v) => setCat(v as Cat)} />
          <Text style={label}>Descripción para reserva online</Text>
          <TextInput value={desc} onChangeText={setDesc} multiline placeholder="Qué incluye el servicio…" placeholderTextColor={c.onSurfaceVariant} style={[...input, { minHeight: 90, textAlignVertical: 'top' }]} accessibilityLabel="Descripción" />
          <ToggleRow title="Público en la app" description="Los clientes lo ven al reservar" value={pub} onValueChange={setPub} />
        </FormSection>
      ) : null}

      {step === 1 ? (
        <FormSection title="Tarifa y anticipo" icon={<CircleDollarSign size={16} color={c.primaryText} />}>
          <Text style={label}>Precio oficial (CLP)</Text>
          <TextInput value={price} onChangeText={setPrice} keyboardType="number-pad" style={input} accessibilityLabel="Precio" />
          <Text style={label}>Abono previo para confirmar</Text>
          <FilterChips chips={DEPOSITS.map((d) => ({ id: String(d), label: d === 0 ? 'Sin abono' : d === 100 ? '100% total' : `${d}%` }))} value={String(dep)} onChange={(v) => setDep(Number(v))} />
          {dep > 0 ? <InfoBanner text={`Abono de ${formatClp(Math.round((priceN * dep) / 100))} vía transferencia o link seguro. Protege contra inasistencias.`} /> : null}
        </FormSection>
      ) : null}

      {step === 2 ? (
        <FormSection title="Calibración de tiempos" icon={<Clock3 size={16} color={c.primaryText} />}>
          <Text style={[styles.big, { color: c.onSurface }]}>Total: {total} min</Text>
          <Text style={[styles.sub, { color: c.onSurfaceVariant }]}>{dur} min atención + {buf} min limpieza</Text>
          <Text style={label}>Duración activa con el cliente</Text>
          <FilterChips chips={DURS.map((d) => ({ id: String(d), label: `${d}m` }))} value={String(dur)} onChange={(v) => setDur(Number(v))} />
          <Text style={label}>Tiempo de sanitización / buffer</Text>
          <FilterChips chips={BUFFERS.map((d) => ({ id: String(d), label: d === 0 ? 'Sin buffer' : `+${d} min` }))} value={String(buf)} onChange={(v) => setBuf(Number(v))} />
        </FormSection>
      ) : null}

      {step === 3 ? (
        <>
          <FormSection title="Espacio físico asignado" icon={<Sofa size={16} color={c.primaryText} />} hint="Evita colisiones asignando estaciones exclusivas por horario.">
            {SPACES.map((sp) => (
              <ToggleRow key={sp.id} title={sp.title} description={sp.sub} value={spaces.includes(sp.id)} onValueChange={() => setSpaces(toggle(spaces, sp.id))} />
            ))}
          </FormSection>
          <FormSection title="Equipo habilitado" icon={<Users size={16} color={c.primaryText} />}
            right={<Pressable onPress={() => { setStaff(staffList.map((p) => p.id)); toast('Todos habilitados'); }} accessibilityRole="button" accessibilityLabel="Habilitar todos"><Text style={{ color: c.primaryText, fontFamily: fonts.semibold, fontWeight: '600' }}>Habilitar todos</Text></Pressable>}>
            {staffList.length === 0 ? <Text style={{ color: c.onSurfaceVariant }}>Aún no hay profesionales. Invítalos desde Equipo.</Text> : null}
            {staffList.map((p) => (
              <View key={p.id} style={styles.pro}>
                <Avatar name={p.name} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.proN, { color: c.onSurface }]}>{p.name}</Text>
                  <Text style={{ color: c.onSurfaceVariant, fontSize: fontSize.sm }}>{p.role || 'Profesional'}</Text>
                </View>
                <Pressable onPress={() => setStaff(toggle(staff, p.id))} accessibilityRole="checkbox" accessibilityState={{ checked: staff.includes(p.id) }} accessibilityLabel={`Habilitar a ${p.name}`}
                  style={[styles.chk, { borderColor: c.primaryText, backgroundColor: staff.includes(p.id) ? c.primary : 'transparent' }]}>
                  {staff.includes(p.id) ? <Check size={14} color={'#fff'} /> : null}
                </Pressable>
              </View>
            ))}
          </FormSection>
          <View style={[styles.preview, { backgroundColor: c.primaryFixed }]}>
            <Eye size={16} color={c.onSurface} />
            <Text style={{ color: c.onSurface, fontFamily: fonts.semibold, fontWeight: '600', flex: 1 }}>
              Vista previa: {name || 'Servicio'} · {total} min ({formatClp(priceN)})
            </Text>
          </View>
        </>
      ) : null}
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  step: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.sm, marginTop: spacing.md },
  h1: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.xl, marginTop: 2 },
  sub: { fontFamily: fonts.medium, fontSize: fontSize.sm, marginBottom: spacing.md, marginTop: 2 },
  label: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.sm, marginTop: spacing.md, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 12, fontFamily: fonts.medium, fontSize: fontSize.md, minHeight: 48 },
  big: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.xl },
  rowBtns: { flexDirection: 'row', gap: spacing.sm },
  btn: { flex: 1, minHeight: 50, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  btn2: { minHeight: 50, paddingHorizontal: spacing.xl, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  btnT: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.md },
  draft: { textAlign: 'center', fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.sm, paddingVertical: 6 },
  pro: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 8 },
  proN: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: fontSize.md },
  chk: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  preview: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
});
