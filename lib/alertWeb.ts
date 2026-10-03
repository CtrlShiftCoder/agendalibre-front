import { Alert, Platform, Share } from 'react-native';

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

if (Platform.OS === 'web') {
  /** react-native-web lanza "Share is not supported" si el navegador no tiene Web Share: copiamos al portapapeles. */
  const nativeShare = Share.share.bind(Share);
  Share.share = async (content, options) => {
    try {
      return await nativeShare(content, options);
    } catch {
      const text = (content as { message?: string }).message ?? '';
      try {
        await navigator.clipboard?.writeText(text);
      } catch {
        /* sin portapapeles */
      }
      toast('Copiado para compartir');
      return { action: Share.sharedAction } as never;
    }
  };
}
