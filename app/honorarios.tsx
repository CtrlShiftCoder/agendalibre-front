import { Stack, router } from 'expo-router';
import { ArrowLeft, Calculator } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
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
import { TextField } from '@/components/TextField';
import { canAccess } from '@/lib/access';
import { formatClp } from '@/lib/cash';
import {
  HONORARIOS_BRUTO_PRESETS,
  HONORARIOS_RETENTION_2026,
  HONORARIOS_TIP_PERCENT_PRESETS,
  applyHonorariosTip,
  buildBoletaPreview,
  formatBoletaShareText,
  quoteHonorarios,
  type HonorariosTipMode,
} from '@/lib/honorarios';
import { copyOrShare } from '@/lib/whatsapp';
import { Alert } from '@/lib/Alert';
import { parseClpInput } from '@/lib/money';
import { apiQuoteHonorarios } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import { useThemeTokens, useColors } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

const TIP_MODE_OPTIONS: { mode: HonorariosTipMode; label: string }[] = [
  { mode: 'none', label: 'Sin propina' },
  { mode: 'percent', label: '% líquido' },
  { mode: 'fixed', label: 'Monto fijo' },
];

export default function HonorariosScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const [bruto, setBruto] = useState('100000');
  const [tipMode, setTipMode] = useState<HonorariosTipMode>('none');
  const [tipPercent, setTipPercent] = useState(10);
  const [tipFixed, setTipFixed] = useState('');

  const state = useMemo(
    () => ({ profile, professionals }),
    [profile, professionals]
  );
  const allowed = canAccess('honorarios', state);

  const localQuote = useMemo(() => {
    const n = parseClpInput(bruto);
    return quoteHonorarios(n);
  }, [bruto]);
  const [quote, setQuote] = useState(localQuote);
  useEffect(() => {
    setQuote(localQuote);
    const n = parseClpInput(bruto);
    let cancelled = false;
    void apiQuoteHonorarios(n).then((q) => {
      if (!cancelled) setQuote(q);
    });
    return () => {
      cancelled = true;
    };
  }, [bruto, localQuote]);

  const tipPart = useMemo(
    () =>
      applyHonorariosTip(quote.liquidoClp, {
        mode: tipMode,
        percent: tipPercent,
        fixedClp: parseClpInput(tipFixed),
      }),
    [quote.liquidoClp, tipMode, tipPercent, tipFixed]
  );

  const boleta = useMemo(
    () =>
      buildBoletaPreview({
        brutoClp: quote.brutoClp,
        rutEmisor: '12.345.678-5',
        glosa: 'Servicios profesionales (mock AgendaLibre)',
        folioSeed: quote.brutoClp,
      }),
    [quote.brutoClp]
  );

  if (!allowed) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ResponsiveShell style={{ flex: 1, padding: spacing.xl }}>
          <Text style={styles.title}>Honorarios Chile</Text>
          <Text style={styles.sub}>
            Disponible solo para Persona natural (boleta de honorarios).
          </Text>
          <Button title="Volver" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </ResponsiveShell>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ResponsiveShell style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <FadeInView>
            <Pressable onPress={() => router.back()} style={styles.backRow}>
              <ArrowLeft size={20} color={colors.onSurface} strokeWidth={2.4} />
              <Text style={styles.backText}>Volver</Text>
            </Pressable>

            <View style={styles.headerRow}>
              <View style={[styles.headerIcon, { backgroundColor: theme.primary }]}>
                <Calculator size={20} color="#fff" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Honorarios Chile</Text>
                <Text style={styles.sub}>
                  Boleta 2026 · retención{' '}
                  {(HONORARIOS_RETENTION_2026 * 100).toFixed(2).replace('.', ',')}% ·
                  propina opcional
                </Text>
              </View>
            </View>

            <TextField
              label="Bruto boleta (CLP)"
              value={bruto}
              onChangeText={setBruto}
              keyboardType="number-pad"
              placeholder="Ej. 100000"
            />

            <View
              style={styles.chipRow}
              accessibilityRole="radiogroup"
              accessibilityLabel="Presets de bruto"
            >
              {HONORARIOS_BRUTO_PRESETS.map((n) => {
                const selected = parseClpInput(bruto) === n;
                return (
                  <Pressable
                    key={n}
                    onPress={() => setBruto(String(n))}
                    style={[
                      styles.chip,
                      selected && {
                        backgroundColor: colors.primaryText,
                        borderColor: colors.primaryText,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Bruto ${formatClp(n)}`}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected && { color: '#fff' },
                      ]}
                    >
                      {formatClp(n)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>Propina (sobre el líquido)</Text>
            <View
              style={styles.chipRow}
              accessibilityRole="radiogroup"
              accessibilityLabel="Modo de propina"
            >
              {TIP_MODE_OPTIONS.map(({ mode, label }) => {
                const selected = tipMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setTipMode(mode)}
                    style={[
                      styles.chip,
                      selected && {
                        backgroundColor: colors.primaryText,
                        borderColor: colors.primaryText,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={label}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected && { color: '#fff' },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {tipMode === 'percent' ? (
              <View
                style={styles.chipRow}
                accessibilityRole="radiogroup"
                accessibilityLabel="Porcentaje de propina"
              >
                {HONORARIOS_TIP_PERCENT_PRESETS.map((p) => {
                  const selected = tipPercent === p;
                  return (
                    <Pressable
                      key={p}
                      onPress={() => setTipPercent(p)}
                      style={[
                        styles.chip,
                        selected && {
                          backgroundColor: colors.primaryText,
                          borderColor: colors.primaryText,
                        },
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`${p} por ciento`}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected && { color: '#fff' },
                        ]}
                      >
                        {p}%
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {tipMode === 'fixed' ? (
              <TextField
                label="Propina fija (CLP)"
                value={tipFixed}
                onChangeText={setTipFixed}
                keyboardType="number-pad"
                placeholder="Ej. 5000"
              />
            ) : null}

            <Card style={styles.card} elevated>
              <Text style={styles.flowHint}>
                Bruto → retención 15,25% → líquido → +propina = total cliente
              </Text>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Bruto</Text>
                <Text style={styles.rowValue}>{formatClp(quote.brutoClp)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>
                  Retención (
                  {(quote.retentionRate * 100).toFixed(2).replace('.', ',')}%)
                </Text>
                <Text style={[styles.rowValue, { color: colors.danger }]}>
                  −{formatClp(quote.retentionClp)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Líquido</Text>
                <Text style={styles.rowValue}>{formatClp(quote.liquidoClp)}</Text>
              </View>
              {tipPart.tipMode !== 'none' ? (
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>
                    + Propina
                    {tipPart.tipMode === 'percent' && tipPart.tipPercent != null
                      ? ` (${tipPart.tipPercent}%)`
                      : ''}
                  </Text>
                  <Text style={[styles.rowValue, { color: colors.primaryText }]}>
                    +{formatClp(tipPart.tipClp)}
                  </Text>
                </View>
              ) : null}
              <View style={[styles.row, styles.liquidoRow]}>
                <Text style={styles.liquidoLabel}>Total cliente</Text>
                <Text style={[styles.liquidoValue, { color: colors.primaryText }]}>
                  {formatClp(tipPart.totalClienteClp)}
                </Text>
              </View>
            </Card>

            <Card style={styles.boletaCard} elevated>
              <Text style={styles.boletaTitle}>Boleta preview (SII-ready mock)</Text>
              <Text style={styles.boletaMock}>
                Mock · sin envío al SII · sin folio real
              </Text>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>RUT emisor</Text>
                <Text style={styles.rowValue}>{boleta.rutEmisor}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Folio</Text>
                <Text style={styles.rowValue}>{boleta.folio}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Fecha</Text>
                <Text style={styles.rowValue}>{boleta.fechaEmision}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Bruto</Text>
                <Text style={styles.rowValue}>{formatClp(boleta.brutoClp)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>
                  Retención{' '}
                  {(boleta.retentionRate * 100).toFixed(2).replace('.', ',')}%
                </Text>
                <Text style={[styles.rowValue, { color: colors.danger }]}>
                  −{formatClp(boleta.retentionClp)}
                </Text>
              </View>
              <View style={[styles.row, styles.liquidoRow]}>
                <Text style={styles.liquidoLabel}>Líquido</Text>
                <Text style={[styles.liquidoValue, { color: colors.primaryText }]}>
                  {formatClp(boleta.liquidoClp)}
                </Text>
              </View>
              <Button
                title="Copiar / compartir boleta"
                variant="secondary"
                gradient={false}
                style={{ marginTop: spacing.md }}
                onPress={() => {
                  void copyOrShare(formatBoletaShareText(boleta), 'Boleta mock').then(
                    (how) => {
                      Alert.alert(
                        how === 'copied' ? 'Copiado' : 'Compartido',
                        'Texto de boleta mock listo (sin SII).'
                      );
                    }
                  );
                }}
              />
            </Card>

            <Text style={styles.disclaimer}>
              Cálculo referencial Chile 2026 (retención 15,25% boleta de honorarios).
              La propina es opcional y no afecta la retención. Verifica siempre con tu
              contador o el SII. No sustituye boleta electrónica ni declaración.
            </Text>
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
    sectionLabel: {
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.sm,
      color: c.onSurface,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
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
      fontFamily: fonts.bold,
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: c.primaryText,
    },
    card: { marginTop: spacing.md },
    flowHint: {
      fontFamily: fonts.medium,
      fontSize: fontSize.xs,
      color: c.onSurfaceVariant,
      marginBottom: spacing.sm,
      lineHeight: 18,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
    },
    rowLabel: {
      fontFamily: fonts.medium,
      fontSize: fontSize.sm,
      color: c.onSurfaceVariant,
      flexShrink: 1,
      paddingRight: spacing.sm,
    },
    rowValue: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.sm,
      color: c.onSurface,
    },
    liquidoRow: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      marginTop: 4,
      paddingTop: 14,
    },
    liquidoLabel: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.md,
      color: c.onSurface,
    },
    liquidoValue: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: 22,
    },
    disclaimer: {
      marginTop: spacing.lg,
      fontFamily: fonts.medium,
      fontSize: fontSize.xs,
      color: c.placeholder,
      lineHeight: 18,
    },
    boletaCard: { marginTop: spacing.lg },
    boletaTitle: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.md,
      color: c.onSurface,
      marginBottom: 4,
    },
    boletaMock: {
      fontFamily: fonts.medium,
      fontSize: fontSize.xs,
      color: c.onSurfaceVariant,
      marginBottom: spacing.sm,
    },
  });
}
