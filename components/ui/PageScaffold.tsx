import React, { useMemo } from 'react';
import { RefreshControlProps, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResponsiveShell } from '@/components/ResponsiveShell';
import { FadeInView } from '@/components/motion';
import { useColors } from '@/store/useTheme';
import { spacing, type AppColors } from '@/theme/colors';

type Props = {
  children: React.ReactNode;
  /** Barra fija inferior (acciones). */
  footer?: React.ReactNode;
  /** Deja espacio para la barra de pestañas flotante (pantallas raíz). */
  tabbed?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
};

/** Contenedor estándar de pantallas: fondo del perfil, safe area, scroll, ancho máximo y footer fijo. */
export function PageScaffold({ children, footer, tabbed, refreshControl }: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.safe, { paddingTop: insets.top + spacing.sm }]}>
      <ResponsiveShell style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: (tabbed ? 112 : insets.bottom + 32) + (footer ? 96 : 0) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          <FadeInView>{children}</FadeInView>
        </ScrollView>
        {footer ? (
          <View style={[styles.footer, { paddingBottom: (tabbed ? 84 : insets.bottom) + spacing.md }]}>{footer}</View>
        ) : null}
      </ResponsiveShell>
    </View>
  );
}
function createStyles(c: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    scroll: { paddingHorizontal: spacing.lg },
    footer: {
      position: 'absolute', left: 0, right: 0, bottom: 0,
      paddingHorizontal: spacing.lg, paddingTop: spacing.md,
      backgroundColor: c.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.surfaceContainerHigh,
      gap: spacing.sm,
    },
  });
}
