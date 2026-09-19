import React, { useMemo } from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ResponsiveShell } from '@/components/ResponsiveShell';
import { useColors } from '@/store/useTheme';
import { spacing, type AppColors } from '@/theme/colors';

export default function NotFoundScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <>
      <Stack.Screen options={{ title: 'No encontrado' }} />
      <ResponsiveShell style={styles.container} forceMax>
        <Text style={styles.title}>Esta pantalla no existe</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Volver al inicio</Text>
        </Link>
      </ResponsiveShell>
    </>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: c.cream,
  },
  title: { fontSize: 18, fontWeight: '700', color: c.text },
  link: { marginTop: spacing.lg },
  linkText: { fontSize: 16, color: c.primary, fontWeight: '600' },
});
}

