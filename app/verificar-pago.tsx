import { router, useLocalSearchParams } from 'expo-router';
import { Copy, Landmark, MessageCircle, ReceiptText, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Badge, DangerButton, FormSection, HeroSummaryCard, InfoBanner, PageScaffold, ScreenHeader, toast } from '@/components/ui';
import { formatClp } from '@/lib/cash';
import { DEFAULT_BANK } from '@/lib/bizMock';
import { todayIso } from '@/lib/uiFormat';
import { copyOrShare, openWhatsApp } from '@/lib/whatsapp';
import { apiUpdateAppointmentStatus } from '@/store/apiActions';
import { useAppStore, usePref } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing } from '@/theme/colors';

/** Stitch: "Verificar Pago por Transferencia". */
export default function VerificarPago() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const apts = useAppStore((s) => s.appointments);
  const services = useAppStore((s) => s.services);
  const clients = useAppStore((s) => s.clients);
  const a = apts.find((x) => x.id === id) ?? apts.find((x) => x.status === 'confirmada') ?? apts[0];
  const svc = services.find((x) => x.id === a?.serviceId);
  const cli = clients.find((x) => x.id === a?.clientId);
  const [bank] = usePref('biz.bank', DEFAULT_BANK);
  const [verified, setVerified] = usePref<string[]>('pay.verified', []);
  const [ref, setRef] = useState('TX-94821039');
  const [ok, setOk] = useState(false);

  const today = todayIso();
  const doneToday = apts.filter((x) => x.status === 'completada' && x.date === today);
  const recaudado = doneToday.reduce((n, x) => n + (services.find((s) => s.id === x.serviceId)?.priceClp ?? 0), 0) + verified.length * 0;
  const monto = svc?.priceClp ?? 0;
  const done = !!a && verified.includes(a.id);

  const copy = async (label: string, v: string) => { await copyOrShare(v, label); toast(`${label} copiado`); };

  const confirm = () => {
    if (!a) return;
    if (!ok) { toast('Marca la casilla de confirmación primero', 'warn'); return; }
    setVerified([...verified, a.id]);
    void apiUpdateAppointmentStatus(a.id, 'completada');
    toast(`Pago de ${formatClp(monto)} confirmado y sumado a la caja`);
  };

  return (
    <PageScaffold>
      <ScreenHeader title="Verificar pagos" subtitle="Transferencias del día" actions />
      <HeroSummaryCard
        label="Recaudado hoy (verificado)"
        value={formatClp(recaudado)}
        chips={[`${doneToday.length} pagos confirmados`, `Al verificar: +${formatClp(monto)}`]}
      />

      <View style={[styles.client, { backgroundColor: c.surfaceContainerLowest, borderColor: c.surfaceContainerHigh }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: c.onSurface }]}>{cli?.name ?? 'Cliente'}</Text>
          <Text style={[styles.sub, { color: c.onSurfaceVariant }]}>{svc?.name} · {a?.startTime}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Badge label={done ? 'Verificado' : 'A verificar'} tone={done ? 'success' : 'warn'} />
          <Text style={[styles.amount, { color: c.onSurface }]}>{formatClp(monto)}</Text>
        </View>
      </View>

      <FormSection title="Cuenta para recepción de pagos" icon={<Landmark size={16} color={c.primaryText} />} right={<Badge label="Oficial" tone="primary" />}>
        {([['Banco y tipo', bank.banco], ['Número de cuenta', bank.cuenta], ['RUT titular', bank.rut], ['Nombre titular', bank.titular], ['Email comprobantes', bank.email]] as const).map(([l, v]) => (
          <View key={l} style={styles.bankRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sub, { color: c.onSurfaceVariant }]}>{l}</Text>
              <Text style={[styles.val, { color: c.onSurface }]}>{v}</Text>
            </View>
            <Pressable onPress={() => void copy(l, v)} accessibilityRole="button" accessibilityLabel={`Copiar ${l}`} hitSlop={8}>
              <Copy size={18} color={c.primaryText} />
            </Pressable>
          </View>
        ))}
        <View style={styles.two}>
          <View style={{ flex: 1 }}><Button title="Copiar todos los datos" variant="secondary" gradient={false} onPress={() => void copy('Datos bancarios', Object.values(bank).join('\n'))} /></View>
          <View style={{ flex: 1 }}><Button title="WhatsApp" variant="secondary" gradient={false} onPress={() => void openWhatsApp(Object.values(bank).join('\n'), cli?.phone)} /></View>
        </View>
      </FormSection>

      <FormSection title="Comprobante del cliente" icon={<ReceiptText size={16} color={c.primaryText} />} right={<Badge label={done ? 'Revisado' : 'Pendiente de revisión'} tone={done ? 'success' : 'warn'} />}>
        <Text style={[styles.val, { color: c.onSurface }]}>Transferencia Banco Santander</Text>
        <Text style={[styles.sub, { color: c.onSurfaceVariant }]}>{a?.date} · comprobante_{(cli?.name ?? 'cliente').split(' ')[0].toLowerCase()}.pdf</Text>
        <Text style={[styles.sub, { color: c.onSurfaceVariant, marginTop: 10 }]}>Código de operación / ref. bancaria</Text>
        <TextInput value={ref} onChangeText={setRef} accessibilityLabel="Código de operación" style={[styles.input, { color: c.onSurface, borderColor: c.outline, backgroundColor: c.surfaceContainerLowest }]} />
        <View style={styles.sw}>
          <Switch value={ok} onValueChange={setOk} trackColor={{ false: c.surfaceContainerHigh, true: c.accent }} thumbColor="#fff" accessibilityLabel="Confirmo que el abono está acreditado" />
          <Text style={[styles.sub, { color: c.onSurface, flex: 1 }]}>He revisado la cuenta bancaria y el abono de {formatClp(monto)} está efectivamente acreditado.</Text>
        </View>
      </FormSection>

      {done ? <Badge label="Pago confirmado" tone="success" /> : <Button title="Dar check y sumar a recaudación diaria" onPress={confirm} />}
      <View style={{ height: spacing.sm }} />
      <Button title="Solicitar nuevo comprobante por WhatsApp" variant="secondary" gradient={false} icon={<MessageCircle size={18} color={c.primaryText} />}
        onPress={() => { void openWhatsApp('Hola, ¿puedes reenviar el comprobante de tu transferencia?', cli?.phone); toast('Solicitud enviada por WhatsApp'); }} />
      <View style={{ height: spacing.sm }} />
      <DangerButton outline title="Rechazar transferencia / marcar pendiente" icon={<X size={18} color={c.danger} />} onPress={() => { toast('Transferencia marcada como pendiente', 'warn'); router.back(); }} />
      <View style={{ height: spacing.lg }} />
      <InfoBanner text="Al confirmar, la cita se marcará como PAGADA y se sumará a las finanzas del día en caja y reportería." />
    </PageScaffold>
  );
}
const styles = StyleSheet.create({
  client: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.lg },
  name: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.lg },
  sub: { fontFamily: fonts.medium, fontSize: fontSize.sm },
  amount: { fontFamily: fonts.labelBold, fontSize: fontSize.xl },
  bankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  val: { fontFamily: fonts.labelSemibold, fontSize: fontSize.md },
  two: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, minHeight: 48, fontFamily: fonts.labelSemibold, fontSize: fontSize.md, marginTop: 4 },
  sw: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
});
