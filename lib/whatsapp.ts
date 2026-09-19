import { Linking, Platform, Share } from 'react-native';

/** Build a WhatsApp deep link with prefilled text (Chile / LATAM). */
export function buildWhatsAppUrl(text: string, phone?: string): string {
  const encoded = encodeURIComponent(text);
  const digits = (phone ?? '').replace(/\D/g, '');
  if (digits.length >= 8) {
    return `https://wa.me/${digits}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

export async function openWhatsApp(text: string, phone?: string): Promise<void> {
  const url = buildWhatsAppUrl(text, phone);
  const can = await Linking.canOpenURL(url);
  if (can) {
    await Linking.openURL(url);
    return;
  }
  // Fallback: share sheet (esp. web / desktop)
  await Share.share({ message: text });
}

export function reminderMessage(opts: {
  clientName: string;
  serviceName: string;
  dateLabel: string;
  time: string;
  place: string;
  businessName: string;
}): string {
  return (
    `Hola ${opts.clientName}! Te recordamos tu cita en ${opts.businessName}:\n` +
    `${opts.serviceName} · ${opts.dateLabel} a las ${opts.time}\n` +
    `Lugar: ${opts.place}\n` +
    `¿Confirmas? Responde SÍ o REAGENDAR.`
  );
}

export function notifyClientMessage(opts: {
  clientName: string;
  serviceName: string;
  dateLabel: string;
  time: string;
  place: string;
  code: string;
  businessName: string;
}): string {
  return (
    `Hola ${opts.clientName}! Tu cita en ${opts.businessName} está confirmada.\n` +
    `${opts.serviceName} · ${opts.dateLabel} a las ${opts.time}\n` +
    `Código: ${opts.code}\n` +
    `Lugar: ${opts.place}\n` +
    `¡Te esperamos!`
  );
}

/** Copy text to clipboard on web; Share elsewhere. */
export async function copyOrShare(text: string, title = 'AgendaLibre'): Promise<'copied' | 'shared'> {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return 'copied';
  }
  await Share.share({ message: text, title });
  return 'shared';
}
