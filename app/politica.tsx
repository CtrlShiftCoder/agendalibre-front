import { Stack, router } from 'expo-router';
import { ArrowLeft, Shield } from 'lucide-react-native';
import React, {useMemo, useState} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { PolicySummaryCard } from '@/components/PolicySummaryCard';
import { FadeInView } from '@/components/motion';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { TextField } from '@/components/TextField';
import { canAccess, screenAccess } from '@/lib/access';
import { apiSavePolicy } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import {useThemeTokens, useColors} from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

export default function PoliticaScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const policy = useAppStore((s) => s.cancellationPolicy);

  const state = useMemo(
    () => ({ profile, professionals }),
    [profile, professionals]
  );
  const access = screenAccess('politica', state);
  const canEdit = access === 'edit';
  const allowed = canAccess('politica', state);

  const [hours, setHours] = useState(String(policy.cancelBeforeHours));
  const [deposit, setDeposit] = useState(
    policy.depositPercentDefault != null
      ? String(policy.depositPercentDefault)
      : ''
  );
  const [feePct, setFeePct] = useState(
    policy.noShowFeePercent != null ? String(policy.noShowFeePercent) : ''
  );
  const [feeFixed, setFeeFixed] = useState(
    policy.noShowFeeFixedClp != null ? String(policy.noShowFeeFixedClp) : ''
  );
  const [keepDeposit, setKeepDeposit] = useState(policy.keepDepositOnNoShow);
  const [text, setText] = useState(policy.policyText);

  const draftPolicy = useMemo(
    () => ({
      cancelBeforeHours: Math.max(0, parseInt(hours, 10) || 0),
      depositPercentDefault:
        deposit.trim() === ''
          ? null
          : Math.min(100, Math.max(0, parseInt(deposit, 10) || 0)),
      noShowFeePercent:
        feePct.trim() === ''
          ? null
          : Math.min(100, Math.max(0, parseInt(feePct, 10) || 0)),
      noShowFeeFixedClp:
        feeFixed.trim() === '' ? null : Math.max(0, parseInt(feeFixed, 10) || 0),
      keepDepositOnNoShow: keepDeposit,
      policyText: text.trim() || policy.policyText,
    }),
    [hours, deposit, feePct, feeFixed, keepDeposit, text, policy.policyText]
  );

  const save = () => {
    if (!canEdit) return;
    void apiSavePolicy({
      cancelBeforeHours: Math.max(0, parseInt(hours, 10) || 0),
      depositPercentDefault: deposit.trim() === '' ? null : Math.min(100, Math.max(0, parseInt(deposit, 10) || 0)),
      noShowFeePercent: feePct.trim() === '' ? null : Math.min(100, Math.max(0, parseInt(feePct, 10) || 0)),
      noShowFeeFixedClp: feeFixed.trim() === '' ? null : Math.max(0, parseInt(feeFixed, 10) || 0),
      keepDepositOnNoShow: keepDeposit,
      policyText: text.trim() || policy.policyText,
    });
    Alert.alert('Listo', 'Política de cancelación actualizada.');
  };

  if (!allowed) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ResponsiveShell style={{ flex: 1, padding: spacing.xl }}>
          <Text style={styles.title}>Sin acceso</Text>
          <Text style={styles.sub}>Esta pantalla no está disponible para tu perfil.</Text>
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
            { paddingBottom: (canEdit ? 100 : 40) + Math.max(insets.bottom, 16) },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <FadeInView>
            <Pressable onPress={() => router.back()} style={styles.backRow} accessibilityLabel="Volver">
              <ArrowLeft size={20} color={colors.onSurface} strokeWidth={2.4} />
              <Text style={styles.backText}>Volver</Text>
            </Pressable>

            <View style={styles.headerRow}>
              <View style={[styles.headerIcon, { backgroundColor: theme.primary }]}>
                <Shield size={20} color="#fff" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Política no-show / seña</Text>
                <Text style={styles.sub}>
                  {canEdit
                    ? 'Edita lo que ven tus clientes al reservar'
                    : 'Solo lectura · pide a un admin para cambiar'}
                </Text>
              </View>
            </View>

            <Text style={styles.previewLabel}>Vista cliente (en vivo)</Text>
            <PolicySummaryCard policy={draftPolicy} style={styles.card} />

            <TextField
              label="Cancelar sin cargo (horas antes)"
              value={hours}
              onChangeText={setHours}
              keyboardType="number-pad"
              editable={canEdit}
            />
            <TextField
              label="Seña por defecto (%)"
              value={deposit}
              onChangeText={setDeposit}
              keyboardType="number-pad"
              placeholder="Ej. 30 · vacío = sin seña"
              editable={canEdit}
            />
            <TextField
              label="Cargo no-show (%)"
              value={feePct}
              onChangeText={setFeePct}
              keyboardType="number-pad"
              placeholder="Ej. 50"
              editable={canEdit}
            />
            <TextField
              label="Cargo no-show fijo (CLP)"
              value={feeFixed}
              onChangeText={setFeeFixed}
              keyboardType="number-pad"
              placeholder="Opcional"
              editable={canEdit}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Retener seña en no-show</Text>
              <Switch
                value={keepDeposit}
                disabled={!canEdit}
                onValueChange={setKeepDeposit}
                trackColor={{ false: colors.outline, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>

            <TextField
              label="Texto de política"
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={4}
              editable={canEdit}
              inputStyle={{ minHeight: 100, textAlignVertical: 'top' }}
            />

          </FadeInView>
        </ScrollView>

        {canEdit ? (
          <View
            style={[
              styles.saveBar,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <Button title="Guardar política" onPress={save} />
          </View>
        ) : null}
      </ResponsiveShell>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.surface },
  scroll: { padding: spacing.xl },
  saveBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: c.outline,
    backgroundColor: c.surface,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
    minHeight: 44,
  },
  backText: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  headerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
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
    fontWeight: '500',
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  card: { marginBottom: spacing.lg },
  previewLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: c.primaryText,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    minHeight: 52,
  },
  switchLabel: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
    color: c.onSurface,
    marginRight: spacing.md,
  },
});
}

