import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/OfflineBanner';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { hydrateSession } from '@/api';
import { isApiModeEnabled } from '@/lib/apiMode';
import { pingApiHealth } from '@/lib/pullRefresh';
import { hydrateFromApi } from '@/store/syncFromApi';
import { useConnectivity } from '@/store/useConnectivity';
import { useAppStore } from '@/store/useAppStore';
import { useColors, useColorScheme } from '@/store/useTheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrated = useAppStore((s) => s.hydrated);
  const scheme = useColorScheme();
  const base = useColors();
  const [apiHydrating, setApiHydrating] = useState(false);
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!useAppStore.getState().hydrated) {
        useAppStore.getState().setHydrated(true);
      }
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  // After Zustand hydrate: pull mock API (soft failure → seeds) + health ping
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    (async () => {
      await hydrateSession();
      if (!isApiModeEnabled()) return;
      setApiHydrating(true);
      const res = await hydrateFromApi();
      if (!cancelled) {
        if (!res.ok) {
          useConnectivity.getState().setApiOffline(true);
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            // eslint-disable-next-line no-console
            console.warn('[boot] hydrateFromApi soft-fail → Zustand seeds', res.error);
          }
        }
        // Independent liveness check — failure marks offline; success clears only if hydrate ok
        const healthy = await pingApiHealth();
        if (!cancelled && res.ok && healthy) {
          useConnectivity.getState().setApiOffline(false);
        }
        setApiHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  if (!hydrated) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: base.surface,
          }}
        >
          <ActivityIndicator size="large" color={base.primary} />
        </View>
      </GestureHandlerRootView>
    );
  }

  void fontsLoaded;
  void apiHydrating;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Head>
        <title>AgendaLibre</title>
      </Head>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <OfflineBanner />
      <ErrorBoundary>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: base.surface },
            animation: 'fade',
          }}
        >
        <Stack.Screen name="index" />
        <Stack.Screen name="bienvenida" />
        <Stack.Screen name="login" />
        <Stack.Screen name="registro" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="nueva-cita"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'fade_from_bottom',
          }}
        />
        <Stack.Screen
          name="ticket/[id]"
          options={{ presentation: 'modal', animation: 'fade_from_bottom' }}
        />
        <Stack.Screen
          name="reservar"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="recordatorios"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="equipo"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="politica"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="lista-espera"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="vitrina"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="v/[slug]"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="caja"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="honorarios"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="cliente/[id]"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="buscar"
          options={{ presentation: 'modal', animation: 'fade_from_bottom' }}
        />
        <Stack.Screen
          name="notificaciones"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="resenas"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="resena/[appointmentId]"
          options={{ presentation: 'modal', animation: 'fade_from_bottom' }}
        />
        <Stack.Screen
          name="galeria"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        </Stack>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
