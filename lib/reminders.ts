import type { ReminderTemplate } from '@/contracts';

/** Fill {{name}} {{time}} {{service}} {{date}} {{place}} {{code}} {{business}} */
export function fillReminderTemplate(
  body: string,
  vars: Record<string, string>
): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '');
}

export const DEFAULT_REMINDER_TEMPLATES: ReminderTemplate[] = [
  {
    id: 'tpl_confirm',
    kind: 'confirm',
    channel: 'whatsapp',
    body:
      'Hola {{name}}! Tu cita en {{business}} está confirmada.\n' +
      '{{service}} · {{date}} a las {{time}}\n' +
      'Código: {{code}}\nLugar: {{place}}\n¡Te esperamos!',
  },
  {
    id: 'tpl_24h',
    kind: 'reminder_24h',
    channel: 'whatsapp',
    body:
      'Hola {{name}}! Te recordamos tu cita mañana en {{business}}:\n' +
      '{{service}} · {{date}} a las {{time}}\n' +
      'Lugar: {{place}}\n¿Confirmas? Responde SÍ o REAGENDAR.',
  },
  {
    id: 'tpl_2h',
    kind: 'reminder_2h',
    channel: 'whatsapp',
    body:
      'Hola {{name}}! Tu cita es hoy a las {{time}} ({{service}}) en {{place}}. ' +
      'Cancela o reagenda si no puedes ir.',
  },
  {
    id: 'tpl_noshow',
    kind: 'noshow_followup',
    channel: 'whatsapp',
    body:
      'Hola {{name}}, notamos que no llegaste a tu cita de {{service}} ({{date}} {{time}}). ' +
      '¿Quieres reagendar? Escríbenos.',
  },
];
