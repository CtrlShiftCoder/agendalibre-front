import { Alert, Platform } from 'react-native';

import { toast } from '@/components/ui/Toast';

/**
 * react-native-web no implementa Alert.alert (queda como botón muerto).
 * En web: info (0-1 botones) → toast; confirmaciones (2+ botones) → window.confirm.
 */
if (Platform.OS === 'web') {
  Alert.alert = (title, message, buttons) => {
    const text = [title, message].filter(Boolean).join(': ');
    const list = buttons ?? [];
    if (list.length < 2) {
      toast(text);
      list[0]?.onPress?.();
      return;
    }
    const cancel = list.find((b) => b.style === 'cancel');
    const action = list.find((b) => b !== cancel) ?? list[0];
    const ok = typeof window !== 'undefined' && typeof window.confirm === 'function' ? window.confirm(text) : false;
    if (ok) action?.onPress?.();
    else cancel?.onPress?.();
  };
}
