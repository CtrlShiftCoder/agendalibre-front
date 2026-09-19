import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import {
  CalendarDays,
  CalendarPlus,
  Home,
  Scissors,
  Sun,
  UserRound,
  Users,
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { isProviderRole } from '@/data/types';
import { formatUnreadBadge, unreadInboxCount } from '@/lib/reviews';
import { useAppStore } from '@/store/useAppStore';
import { useColorScheme, useColors, useThemeTokens } from '@/store/useTheme';
import { fonts, flujo, type AppColors } from '@/theme/colors';

function TabBarBackground() {
  const colors = useColors();
  const scheme = useColorScheme();
  const styles = useMemo(() => createStyles(colors, scheme), [colors, scheme]);

  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.webBar,
          {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          } as object,
        ]}
      />
    );
  }

  return (
    <BlurView
      intensity={80}
      tint={scheme === 'dark' ? 'dark' : 'light'}
      style={[StyleSheet.absoluteFill, styles.blurBar]}
    />
  );
}

export default function TabLayout() {
  const theme = useThemeTokens();
  const colors = useColors();
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const notifications = useAppStore((s) => s.notifications);
  const role = profile.role;
  const provider = isProviderRole(role);
  const active = theme.tabActive || flujo.primary;
  const hoyBadge = useMemo(
    () =>
      formatUnreadBadge(
        unreadInboxCount(notifications, { profile, professionals })
      ),
    [notifications, profile, professionals]
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: colors.secondary,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: 'hidden',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          fontFamily: fonts.semibold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: provider ? 'Hoy' : 'Inicio',
          tabBarAccessibilityLabel: provider ? 'Hoy' : 'Inicio',
          tabBarBadge: hoyBadge,
          tabBarBadgeStyle: {
            backgroundColor: active,
            color: '#fff',
            fontSize: 10,
            fontWeight: '700',
            minWidth: 16,
            height: 16,
            lineHeight: 14,
            borderRadius: 8,
          },
          tabBarIcon: ({ color, size }) =>
            provider ? (
              <Sun size={size ?? 22} color={color} strokeWidth={2.2} />
            ) : (
              <Home size={size ?? 22} color={color} strokeWidth={2.2} />
            ),
        }}
      />
      <Tabs.Screen
        name="reservar-tab"
        options={{
          title: 'Reservar',
          tabBarAccessibilityLabel: 'Reservar',
          href: provider ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <CalendarPlus size={size ?? 22} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarAccessibilityLabel: 'Agenda',
          href: provider ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <CalendarDays size={size ?? 22} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="servicios"
        options={{
          title: 'Servicios',
          tabBarAccessibilityLabel: 'Servicios',
          href: provider ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Scissors size={size ?? 22} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          title: 'Clientes',
          tabBarAccessibilityLabel: 'Clientes',
          href: provider ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Users size={size ?? 22} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarAccessibilityLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <UserRound size={size ?? 22} color={color} strokeWidth={2.2} />
          ),
        }}
      />
    </Tabs>
  );
}

function createStyles(c: AppColors, scheme: 'light' | 'dark') {
  const barBg =
    scheme === 'dark'
      ? 'rgba(18, 24, 20, 0.92)'
      : 'rgba(247, 250, 248, 0.94)';
  const blurBg =
    scheme === 'dark'
      ? 'rgba(18, 24, 20, 0.72)'
      : 'rgba(247, 250, 248, 0.72)';
  return StyleSheet.create({
    webBar: {
      backgroundColor: barBg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.surfaceContainerHigh,
    },
    blurBar: {
      backgroundColor: blurBg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.surfaceContainerHigh,
      overflow: 'hidden',
    },
  });
}
