import { goBack } from '@/lib/nav';
import { router } from 'expo-router';
import { ArrowLeft, Bell } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { formatUnreadBadge, unreadInboxCount } from '@/lib/reviews';
import { useAppStore } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import { fonts, fontSize, spacing, type AppColors } from '@/theme/colors';

type Props = {
  title: string;
  subtitle?: string;
  /** Muestra flecha atrás (default true). false en pestañas raíz. */
  back?: boolean;
  /** Muestra campana + avatar (estilo Stitch) */
  actions?: boolean;
  right?: React.ReactNode;
  onBack?: () => void;
};

/** Cabecera Stitch: [←] título/subtítulo ........ [🔔] [avatar]. */
export function ScreenHeader({ title, subtitle, back = true, actions = false, right, onBack }: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const notifications = useAppStore((s) => s.notifications);
  const badge = formatUnreadBadge(unreadInboxCount(notifications, { profile, professionals }));
  const name = profile.authName || profile.name || 'Yo';
  return (
    <View style={styles.row}>
      {back ? (
        <Pressable
          onPress={() => (onBack ? onBack() : router.canGoBack() ? goBack() : router.replace('/'))}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={8}
        >
          <ArrowLeft size={22} color={colors.onSurface} strokeWidth={2.4} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1} accessibilityRole="header">{title}</Text>
        {subtitle ? <Text style={styles.sub} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {right}
      {actions ? (
        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push('/notificaciones')}
            style={styles.bell}
            accessibilityRole="button"
            accessibilityLabel="Notificaciones"
          >
            <Bell size={20} color={colors.onSurface} strokeWidth={2.2} />
            {badge ? <View style={styles.dot} /> : null}
          </Pressable>
          <Pressable onPress={() => router.push('/perfil')} accessibilityRole="button" accessibilityLabel="Mi perfil">
            <Avatar name={name} size={36} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingBottom: spacing.lg, minHeight: 56 },
    back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceContainerLow },
    title: { fontFamily: fonts.bold, fontWeight: '700', fontSize: 22, color: c.onSurface, letterSpacing: -0.3 },
    sub: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: c.onSurfaceVariant, marginTop: 2 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    bell: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceContainerLow },
    dot: { position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: c.danger },
  });
}
