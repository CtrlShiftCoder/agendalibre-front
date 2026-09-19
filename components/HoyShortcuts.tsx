import { router } from 'expo-router';
import {
  Bell,
  CalendarPlus,
  Clock3,
  type LucideIcon,
  Wallet,
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { isProviderRole } from '@/data/types';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { formatUnreadBadge } from '@/lib/reviews';
import { isEmpresaAdmin } from '@/lib/team';
import { useAppStore } from '@/store/useAppStore';
import { useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  spacing,
  type AppColors,
} from '@/theme/colors';

type Shortcut = {
  key: string;
  label: string;
  Icon: LucideIcon;
  href: '/nueva-cita' | '/lista-espera' | '/caja' | '/notificaciones' | '/reservar';
};

/**
 * Role-aware quick-action chips for Hoy / ClienteHome.
 * empresa/PN: Nueva cita, Lista espera, Caja, Notificaciones
 * cliente: Reservar, Notificaciones
 */
export function HoyShortcuts() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const waitlist = useAppStore((s) => s.waitlist);
  const waitingCount = useMemo(
    () => waitlist.filter((w) => w.status === 'waiting').length,
    [waitlist]
  );
  const waitingBadge = formatUnreadBadge(waitingCount);

  const ctx = useMemo(
    () => ({
      role: profile.role,
      niche: profile.niche,
      isAdmin: isEmpresaAdmin({ profile, professionals }),
    }),
    [profile, professionals]
  );

  const items = useMemo((): Shortcut[] => {
    if (!isProviderRole(profile.role)) {
      return [
        { key: 'reservar', label: 'Reservar', Icon: CalendarPlus, href: '/reservar' },
        {
          key: 'notificaciones',
          label: 'Notificaciones',
          Icon: Bell,
          href: '/notificaciones',
        },
      ];
    }

    const out: Shortcut[] = [
      {
        key: 'nueva-cita',
        label: 'Nueva cita',
        Icon: CalendarPlus,
        href: '/nueva-cita',
      },
    ];
    if (isFeatureEnabled('listaEspera', ctx)) {
      out.push({
        key: 'lista-espera',
        label: 'Lista espera',
        Icon: Clock3,
        href: '/lista-espera',
      });
    }
    if (isFeatureEnabled('caja', ctx)) {
      out.push({
        key: 'caja',
        label: 'Caja',
        Icon: Wallet,
        href: '/caja',
      });
    }
    out.push({
      key: 'notificaciones',
      label: 'Notificaciones',
      Icon: Bell,
      href: '/notificaciones',
    });
    return out;
  }, [profile.role, ctx]);

  if (items.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {items.map(({ key, label, Icon, href }) => {
        const showWaitingBadge = key === 'lista-espera' && waitingBadge;
        return (
          <Pressable
            key={key}
            onPress={() => router.push(href)}
            style={[styles.chip, { backgroundColor: theme.surfaceTint }]}
            accessibilityRole="button"
            accessibilityLabel={
              showWaitingBadge
                ? `${label}, ${waitingCount} en espera`
                : label
            }
          >
            <Icon size={16} color={theme.primary} strokeWidth={2.4} />
            <Text style={[styles.text, { color: theme.primary }]}>{label}</Text>
            {showWaitingBadge ? (
              <View
                style={[styles.badge, { backgroundColor: theme.primary }]}
                accessibilityElementsHidden
                importantForAccessibility="no"
              >
                <Text style={styles.badgeText}>{waitingBadge}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    scroll: {
      marginTop: 4,
      marginBottom: spacing.md,
      flexGrow: 0,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingRight: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      minHeight: 40,
      justifyContent: 'center',
    },
    text: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.xs,
      letterSpacing: 0.1,
    },
    badge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 2,
    },
    badgeText: {
      color: '#fff',
      fontSize: 10,
      fontFamily: fonts.bold,
      fontWeight: '700',
      lineHeight: 12,
    },
  });
}
