/**
 * Mock auth session — token persisted for Bearer headers.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'agenda_libre_api_token';
const USER_KEY = 'agenda_libre_api_user';

let memoryToken: string | null = null;
let memoryUserJson: string | null = null;
let hydrated = false;

export async function hydrateSession(): Promise<void> {
  if (hydrated) return;
  try {
    const [t, u] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]);
    memoryToken = t;
    memoryUserJson = u;
  } catch {
    // ignore
  }
  hydrated = true;
}

export function getApiToken(): string | null {
  return memoryToken;
}

export async function setApiSession(
  token: string | null,
  user?: unknown
): Promise<void> {
  memoryToken = token;
  memoryUserJson = user != null ? JSON.stringify(user) : null;
  try {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    else await AsyncStorage.removeItem(TOKEN_KEY);
    if (memoryUserJson) await AsyncStorage.setItem(USER_KEY, memoryUserJson);
    else await AsyncStorage.removeItem(USER_KEY);
  } catch {
    // ignore persist errors
  }
}

export async function clearApiSession(): Promise<void> {
  await setApiSession(null);
}

export function getStoredAuthUser<T = unknown>(): T | null {
  if (!memoryUserJson) return null;
  try {
    return JSON.parse(memoryUserJson) as T;
  } catch {
    return null;
  }
}

/** Default PoC empresa token when none stored */
export const DEFAULT_MOCK_TOKEN = 'mock:empresa:usr_empresa_1';
