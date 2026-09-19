/**
 * Mock Flow / Mercado Pago seña buttons — flip depositStatus only.
 * NEVER calls real payment gateways.
 */
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { hapticSuccess } from '@/lib/haptics';
import { apiSetDepositStatus } from '@/store/apiActions';
import { useColors } from '@/store/useTheme';
import { fontSize, radius, spacing, type AppColors } from '@/theme/colors';

type Props = {
  appointmentId: string;
  visible?: boolean;
};

export function DepositFlowMpMock({ appointmentId, visible = true }: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  if (!visible) return null;

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <Text style={styles.title}>Simular pago (mock — sin cobro)</Text>
      <Text style={styles.sub}>
        Solo cambia el estado local/API mock. Nunca llama Flow ni Mercado Pago.
      </Text>
      <View style={styles.row}>
        <Button
          title="Simular pago Flow"
          variant="secondary"
          gradient={false}
          style={{ flex: 1 }}
          onPress={() => {
            void apiSetDepositStatus(appointmentId, 'paid', 'flow');
            void hapticSuccess();
          }}
        />
        <Button
          title="Simular pago MP"
          variant="secondary"
          gradient={false}
          style={{ flex: 1 }}
          onPress={() => {
            void apiSetDepositStatus(appointmentId, 'paid', 'mercadopago');
            void hapticSuccess();
          }}
        />
      </View>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    wrap: {
      marginTop: spacing.md,
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceContainerLow,
    },
    title: {
      fontSize: fontSize.sm + 1,
      fontWeight: '700',
      color: c.text,
    },
    sub: {
      fontSize: fontSize.xs,
      fontWeight: '500',
      color: c.textMuted,
      lineHeight: 17,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
  });
}
