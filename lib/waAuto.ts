/**
 * WhatsApp auto-suggest mock — preview Alert then openWhatsApp.
 * Never sends automatically; never hits Meta / Twilio APIs.
 */
import { Alert } from '@/lib/Alert';
import { fillReminderTemplate } from '@/lib/reminders';
import { DEFAULT_REMINDER_TEMPLATES } from '@/lib/reminders';
import { buildCupoLiberadoMessage } from '@/lib/cupoLiberado';
import { openWhatsApp } from '@/lib/whatsapp';
import type { ReminderKind } from '@/contracts';
import { useAppStore } from '@/store/useAppStore';

export type WaAutoKind = ReminderKind | 'cupo_liberado';

export type WaAutoContext = {
  clientName: string;
  clientPhone?: string;
  serviceName: string;
  dateLabel: string;
  time: string;
  place: string;
  code: string;
  businessName: string;
};

function resolveTemplateBody(kind: WaAutoKind): string {
  if (kind === 'cupo_liberado') {
    return ''; // built separately
  }
  const templates = useAppStore.getState().reminderTemplates;
  const fromStore = templates.find((t) => t.kind === kind);
  if (fromStore?.body) return fromStore.body;
  const fallback = DEFAULT_REMINDER_TEMPLATES.find((t) => t.kind === kind);
  return fallback?.body ?? '';
}

export function buildWaAutoMessage(
  kind: WaAutoKind,
  ctx: WaAutoContext
): string {
  if (kind === 'cupo_liberado') {
    return buildCupoLiberadoMessage({
      clientName: ctx.clientName,
      businessName: ctx.businessName,
      date: ctx.dateLabel,
      startTime: ctx.time,
      serviceName: ctx.serviceName,
    });
  }
  const body = resolveTemplateBody(kind);
  return fillReminderTemplate(body, {
    name: ctx.clientName,
    service: ctx.serviceName,
    date: ctx.dateLabel,
    time: ctx.time,
    place: ctx.place,
    code: ctx.code,
    business: ctx.businessName,
  });
}

const KIND_TITLE: Record<WaAutoKind, string> = {
  confirm: 'Mensaje listo (confirmación)',
  reminder_24h: 'Mensaje listo (recordatorio 24h)',
  reminder_2h: 'Mensaje listo (recordatorio 2h)',
  noshow_followup: 'Mensaje listo (no-show)',
  cupo_liberado: 'Mensaje listo (cupo liberado)',
};

/**
 * Show preview Alert → Abrir WA / Ahora no.
 * Soft-optional: never blocks the caller flow.
 */
export function offerWaAutoMessage(
  kind: WaAutoKind,
  ctx: WaAutoContext,
  opts?: { skipIfEmptyPhone?: boolean }
): void {
  if (opts?.skipIfEmptyPhone && !(ctx.clientPhone ?? '').replace(/\D/g, '')) {
    return;
  }
  const msg = buildWaAutoMessage(kind, ctx);
  if (!msg.trim()) return;

  Alert.alert(KIND_TITLE[kind], `Mock · sin envío automático\n\n${msg}`, [
    { text: 'Ahora no', style: 'cancel' },
    {
      text: 'Abrir WhatsApp',
      onPress: () => {
        void openWhatsApp(msg, ctx.clientPhone);
      },
    },
  ]);
}
