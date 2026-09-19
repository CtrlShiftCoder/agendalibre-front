import { Platform } from 'react-native';

/**
 * Local notifications abstraction (no FCM / push backend).
 * Web: no-op with console fallback. Native: expo-notifications when available.
 */

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    console.info('[notifications] web: permissions no-op');
    return false;
  }
  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    console.warn('[notifications] requestPermissions failed', e);
    return false;
  }
}

export async function scheduleLocal(input: {
  title: string;
  body: string;
  seconds?: number;
}): Promise<string | null> {
  const seconds = Math.max(1, input.seconds ?? 2);
  if (Platform.OS === 'web') {
    console.info(
      `[notifications] web fallback: ${input.title} — ${input.body}`
    );
    return null;
  }
  try {
    const ok = await requestPermissions();
    if (!ok) {
      console.info('[notifications] permission denied; store inbox only');
      return null;
    }
    const Notifications = await import('expo-notifications');
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: input.title,
        body: input.body,
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
      },
    });
    return id;
  } catch (e) {
    console.warn('[notifications] scheduleLocal failed', e);
    return null;
  }
}
