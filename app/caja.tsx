import { goBack } from '@/lib/nav';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ShieldCheck, Wallet } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { FadeInView } from '@/components/motion';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import type { PaymentMethod } from '@/contracts';
import { canAccess, screenAccess, isEmpresaAdmin } from '@/lib/access';
import {
  PAYMENT_METHODS,
  computeDayCash,
  paymentMethodLabel,
} from '@/lib/cash';
import { formatClp } from '@/lib/money';
import { dayCashToCsv, exportCsv as shareOrDownloadCsv } from '@/lib/csv';
import { toast } from '@/components/ui';
import { hapticLight } from '@/lib/haptics';
import { statusTone } from '@/lib/statusColors';
import { apiCashDay } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import { useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing, type AppColors } from '@/theme/colors';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** "viernes 2 oct 2026" — formato Stitch (Caja del día). */
function formatDateLabel(isoDate: string) {
  const d = new Date(isoDate + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return isoDate;
  return d
    .toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    .replace(/\./g, '')
    .replace(/,/g, '');
}

export default function CajaScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const appointments = useAppStore((s) => s.appointments);
  const services = useAppStore((s) => s.services);
  const clients = useAppStore((s) => s.clients);

  const [date, setDate] = useState(todayStr());
  /** Local day map: appointmentId → payment method (PoC, no gateway). */
  const [methodByAppointmentId, setMethodByAppointmentId] = useState<
    Record<string, PaymentMethod>
  >({});

  const state = useMemo(
    () => ({ profile, professionals }),
    [profile, professionals]
  );
  const access = screenAccess('caja', state);
  const allowed = canAccess('caja', state);
  const ownOnly = access === 'own';
  const admin = isEmpresaAdmin(state);

  const proId = ownOnly ? profile.activeProfessionalId : null;

  const summary = useMemo(() => {
    return computeDayCash(date, appointments, services, {
      professionalId: proId,
      methodByAppointmentId,
    });
  }, [date, appointments, services, proId, methodByAppointmentId]);

  const [apiSummary, setApiSummary] = useState<typeof summary | null>(null);
  useEffect(() => {
    let cancelled = false;
    void apiCashDay(date, proId).then((data) => {
      if (!cancelled) setApiSummary(data);
    });
    return () => {
      cancelled = true;
    };
  }, [date, proId]);

  /** Prefer API counts/gross when available; always use local byMethod from tags. */
  const viewSummary = useMemo(() => {
    const base = apiSummary ?? summary;
    return { ...base, byMethod: summary.byMethod };
  }, [apiSummary, summary]);

  const pendingCount = Math.max(
    0,
    viewSummary.appointmentsCount -
      viewSummary.completedCount -
      viewSummary.cancelledCount -
      viewSummary.noShowCount
  );

  const methodRows = useMemo(() => {
    const m = viewSummary.byMethod;
    if (!m) return [] as (readonly [string, number, string])[];
    return [
      ['Efectivo', m.cash, colors.primary],
      ['Transferencia', m.transfer, colors.secondary],
      ['Tarjeta', m.card, colors.amber],
      ['Otro', m.other, colors.outline],
    ] as const;
  }, [viewSummary.byMethod, colors]);

  const completedRows = useMemo(() => {
    let list = appointments.filter(
      (a) => a.date === date && a.status === 'completada'
    );
    if (proId) {
      list = list.filter(
        (a) => a.professionalId === proId || a.professionalId === null
      );
    }
    return list
      .slice()
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map((a) => {
        const svc = services.find((s) => s.id === a.serviceId);
        const client = clients.find((c) => c.id === a.clientId);
        return {
          id: a.id,
          time: a.startTime,
          clientName: client?.name ?? 'Cliente',
          serviceName: svc?.name ?? 'Servicio',
          priceClp: svc?.priceClp ?? 0,
          method: methodByAppointmentId[a.id] as PaymentMethod | undefined,
        };
      });
  }, [
    appointments,
    date,
    proId,
    services,
    clients,
    methodByAppointmentId,
  ]);

  const setMethod = useCallback((appointmentId: string, method: PaymentMethod) => {
    void hapticLight();
    setMethodByAppointmentId((prev) => {
      if (prev[appointmentId] === method) {
        const next = { ...prev };
        delete next[appointmentId];
        return next;
      }
      return { ...prev, [appointmentId]: method };
    });
  }, []);

  const exportCsv = async () => {
    const csv = dayCashToCsv(viewSummary);
    const how = await shareOrDownloadCsv(`caja_${viewSummary.date}.csv`, csv);
    toast(how === 'downloaded' ? 'CSV descargado' : how === 'copied' ? 'CSV copiado' : 'CSV compartido');
  };

  const shiftDate = (delta: number) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().slice(0, 10));
  };

  if (!allowed) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ResponsiveShell forceMax style={{ flex: 1, padding: spacing.xl }}>
          <Text style={styles.title}>Sin acceso</Text>
          <Text style={styles.sub}>La caja del día es solo para proveedores.</Text>
          <Button title="Volver" onPress={() => goBack()} style={{ marginTop: spacing.lg }} />
        </ResponsiveShell>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ResponsiveShell forceMax style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
        >
          <FadeInView>
            <Pressable onPress={() => goBack()} style={styles.backRow}>
              <ArrowLeft size={20} color={colors.onSurface} strokeWidth={2.4} />
              <Text style={styles.backText}>Volver</Text>
            </Pressable>

            <View style={styles.headerRow}>
              <View style={[styles.headerIcon, { backgroundColor: theme.primary }]}>
                <Wallet size={20} color="#fff" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Caja del día</Text>
                <Text style={styles.sub}>
                  {ownOnly
                    ? 'Tu recaudación (trabajador)'
                    : profile.role === 'persona_natural'
                      ? 'Cierre operativo y arqueo de ingresos'
                      : admin
                        ? 'Resumen completo del día'
                        : 'Resumen del día'}
                </Text>
              </View>
            </View>

            <View style={styles.dateNav}>
              <Pressable onPress={() => shiftDate(-1)} style={styles.dateBtn}>
                <Text style={styles.dateBtnText}>←</Text>
              </Pressable>
              <Text style={styles.dateLabel}>{formatDateLabel(date)}</Text>
              <Pressable onPress={() => shiftDate(1)} style={styles.dateBtn}>
                <Text style={styles.dateBtnText}>→</Text>
              </Pressable>
              <Pressable
                onPress={() => setDate(todayStr())}
                style={[styles.todayPill, { backgroundColor: theme.surfaceTint }]}
              >
                <Text style={[styles.todayText, { color: colors.primaryText }]}>Hoy</Text>
              </Pressable>
            </View>

            <LinearGradient
              colors={theme.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.grossCard}
            >
              <Text style={styles.grossLabel}>BRUTO COMPLETADO</Text>
              <Text style={styles.grossValue}>
                {formatClp(viewSummary.grossClp)}
              </Text>
              <View style={styles.grossFooter}>
                <View style={styles.grossBadge}>
                  <Text style={styles.grossBadgeText}>
                    {viewSummary.completedCount} citas hechas
                  </Text>
                </View>
                {profile.role === 'persona_natural' ? (
                  <Text style={styles.grossHint}>
                    100% autónomo · sin comisión
                  </Text>
                ) : (
                  <Text style={styles.grossHint}>CLP</Text>
                )}
              </View>
            </LinearGradient>

            <View style={styles.metrics}>
              {(
                [
                  ['Completadas', viewSummary.completedCount, 'completada'],
                  ['Pendientes', pendingCount, 'pendiente'],
                  ['Cancel.', viewSummary.cancelledCount, 'cancelada'],
                  ['No-show', viewSummary.noShowCount, 'noshow'],
                ] as const
              ).map(([label, val, status]) => {
                const tone = statusTone(status, colors);
                return (
                  <View
                    key={label}
                    style={[styles.metric, { backgroundColor: tone.bg }]}
                  >
                    <Text style={[styles.metricVal, { color: tone.fg }]}>
                      {val}
                    </Text>
                    <Text style={[styles.metricLabel, { color: tone.fg }]}>
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Card style={styles.senaCard} elevated>
              <View style={[styles.senaIcon, { backgroundColor: theme.surfaceTint }]}>
                <ShieldCheck size={20} color={colors.primaryText} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Señas retenidas (est.)</Text>
                <Text style={styles.sectionHint}>
                  Garantía anti no-show: se descuenta del total al cobrar.
                </Text>
              </View>
              <Text style={styles.senaValue}>
                {formatClp(viewSummary.depositsHeldClp)}
              </Text>
            </Card>

            {viewSummary.byMethod ? (
              <Card style={styles.card} elevated>
                <Text style={styles.sectionTitle}>Por método</Text>
                <Text style={styles.sectionHint}>
                  Marca el medio en cada cita completada (mapa local del día).
                </Text>
                <View style={styles.methodBar}>
                  {methodRows.map(([label, val, color]) =>
                    val > 0 ? (
                      <View
                        key={label}
                        style={{ flex: val, backgroundColor: color }}
                      />
                    ) : null
                  )}
                </View>
                {methodRows.map(([label, val, color]) => (
                  <View key={label} style={styles.row}>
                    <View style={styles.methodLabelRow}>
                      <View style={[styles.methodDot, { backgroundColor: color }]} />
                      <Text style={styles.rowLabel}>{label}</Text>
                    </View>
                    <Text style={styles.rowValue}>{formatClp(val)}</Text>
                  </View>
                ))}
              </Card>
            ) : null}

            {completedRows.length > 0 ? (
              <Card style={styles.card} elevated>
                <Text style={styles.sectionTitle}>Citas completadas</Text>
                <Text style={styles.sectionHint}>
                  Chips: efectivo / transferencia / tarjeta / otro (tap otra vez quita).
                </Text>
                {completedRows.map((row) => (
                  <View key={row.id} style={styles.aptBlock}>
                    <View style={styles.aptHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.aptTitle} numberOfLines={1}>
                          {row.time} · {row.clientName}
                        </Text>
                        <Text style={styles.aptMeta} numberOfLines={1}>
                          {row.serviceName}
                        </Text>
                      </View>
                      <Text style={styles.aptPrice}>{formatClp(row.priceClp)}</Text>
                    </View>
                    <View
                      style={styles.chipRow}
                      accessibilityRole="radiogroup"
                      accessibilityLabel={`Método de pago ${row.clientName}`}
                    >
                      {PAYMENT_METHODS.map((m) => {
                        const selected = row.method === m;
                        return (
                          <Pressable
                            key={m}
                            onPress={() => setMethod(row.id, m)}
                            style={[
                              styles.chip,
                              selected && {
                                backgroundColor: colors.primary,
                                borderColor: colors.primary,
                              },
                            ]}
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                            accessibilityLabel={paymentMethodLabel(m)}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                selected && { color: '#fff' },
                              ]}
                            >
                              {paymentMethodLabel(m)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </Card>
            ) : null}

            {!ownOnly && viewSummary.byProfessionalId && Object.keys(viewSummary.byProfessionalId).length > 0 ? (
              <Card style={styles.card} elevated>
                <Text style={styles.sectionTitle}>Por profesional</Text>
                {Object.entries(viewSummary.byProfessionalId).map(([pid, val]) => {
                  const pro =
                    pid === '_unassigned'
                      ? null
                      : professionals.find((p) => p.id === pid);
                  return (
                    <View key={pid} style={styles.row}>
                      <Text style={styles.rowLabel}>
                        {pro?.name ?? 'Sin asignar'}
                      </Text>
                      <Text style={styles.rowValue}>{formatClp(val)}</Text>
                    </View>
                  );
                })}
              </Card>
            ) : null}

            <Button
              title="Exportar CSV"
              variant="secondary"
              gradient={false}
              onPress={() => void exportCsv()}
              style={{ marginTop: spacing.sm }}
            />
          </FadeInView>
        </ScrollView>
      </ResponsiveShell>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.surface },
  scroll: { padding: spacing.xl },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
    minHeight: 44,
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  headerRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: 22,
    color: c.onSurface,
  },
  sub: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.lg,
  },
  dateBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: c.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBtnText: { fontSize: 18, fontWeight: '700', color: c.onSurface },
  dateLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.md,
    color: c.onSurface,
  },
  todayPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    minHeight: 36,
    justifyContent: 'center',
  },
  todayText: { fontFamily: fonts.bold, fontWeight: '700', fontSize: fontSize.xs },
  grossCard: {
    marginBottom: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'flex-start',
  },
  grossLabel: {
    fontFamily: fonts.labelSemibold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  grossValue: {
    fontFamily: fonts.labelBold,
    fontWeight: '700',
    fontSize: 34,
    marginTop: 4,
    color: '#FFFFFF',
  },
  grossFooter: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  grossBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  grossBadgeText: {
    fontFamily: fonts.labelSemibold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  grossHint: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: '#FFFFFF',
    opacity: 0.92,
  },
  senaCard: {
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  senaIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senaValue: {
    fontFamily: fonts.labelBold,
    fontWeight: '700',
    fontSize: fontSize.lg,
    color: c.primaryText,
  },
  methodBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: c.surfaceContainer,
    marginBottom: spacing.sm,
  },
  methodLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  methodDot: { width: 10, height: 10, borderRadius: 5 },
  metrics: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.lg,
  },
  metric: {
    flex: 1,
    backgroundColor: c.white,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  metricVal: {
    fontFamily: fonts.labelBold,
    fontWeight: '700',
    fontSize: 20,
    color: c.onSurface,
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: c.onSurfaceVariant,
    marginTop: 2,
  },
  card: { marginBottom: spacing.md },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.sm,
    color: c.onSurface,
    marginBottom: spacing.sm,
  },
  sectionHint: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: c.onSurfaceVariant,
    marginBottom: spacing.sm,
    marginTop: -4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.border,
  },
  rowLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  rowValue: {
    fontFamily: fonts.labelBold,
    fontWeight: '700',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  aptBlock: {
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.border,
    marginBottom: spacing.sm,
  },
  aptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  aptTitle: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  aptMeta: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: c.onSurfaceVariant,
    marginTop: 2,
  },
  aptPrice: {
    fontFamily: fonts.labelBold,
    fontWeight: '700',
    fontSize: fontSize.sm,
    color: c.primaryText,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surfaceContainerLowest,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: c.primaryText,
  },
});
}
