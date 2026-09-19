/**
 * Prefer GET /availability when mock API mode is on; fall back to local generateSlots.
 * Confirm path still uses lib/availability + bookingLock.
 */
import { availabilityApi } from '@/api';
import type { AvailabilitySlot } from '@/contracts';
import {
  generateSlots,
  type Slot,
} from '@/data/slots';
import type { Appointment, BusinessHours } from '@/data/types';
import { isApiModeEnabled } from '@/lib/apiMode';
import { isDateBlocked, parseTimeMin, resolveSlotHours } from '@/lib/availability';

function periodOf(time: string): 'morning' | 'afternoon' {
  return parseTimeMin(time) < 13 * 60 ? 'morning' : 'afternoon';
}

/**
 * Collapse API rows (one per professional) into UI chips keyed by startTime.
 * When a professionalId is selected, keep only that pro (or null/"any").
 */
export function mapApiSlotsToUi(
  rows: AvailabilitySlot[],
  professionalId: string | null
): Slot[] {
  const filtered =
    professionalId == null
      ? rows
      : rows.filter(
          (r) =>
            r.professionalId == null || r.professionalId === professionalId
        );

  const byTime = new Map<string, Slot>();
  for (const r of filtered) {
    const prev = byTime.get(r.startTime);
    if (!prev) {
      byTime.set(r.startTime, {
        time: r.startTime,
        period: periodOf(r.startTime),
        available: r.available,
      });
    } else if (r.available) {
      prev.available = true;
    }
  }
  return Array.from(byTime.values()).sort((a, b) =>
    a.time.localeCompare(b.time)
  );
}

export type LoadAvailabilityInput = {
  date: string;
  hours: BusinessHours;
  durationMin: number;
  appointments: Appointment[];
  professionalId: string | null;
  serviceId?: string | null;
  businessId?: string | null;
  serviceDurationMin?: (serviceId: string) => number;
  /** Selected professional work hours (HH:mm); ignored when professionalId is null. */
  professionalHours?: { workStart?: string; workEnd?: string } | null;
  blockedDates?: string[] | null;
};

export function localAvailabilitySlots(input: LoadAvailabilityInput): Slot[] {
  return generateSlots(
    input.date,
    input.hours,
    input.durationMin,
    input.appointments,
    input.professionalId,
    input.serviceDurationMin,
    input.professionalHours,
    input.blockedDates
  );
}

/** Soft-fail fetch: API slots when USE_MOCK_API, else local. */
export async function fetchAvailabilitySlots(
  input: LoadAvailabilityInput
): Promise<{ slots: Slot[]; source: 'api' | 'local' }> {
  if (isDateBlocked(input.date, input.blockedDates)) {
    return { slots: [], source: 'local' };
  }
  const local = localAvailabilitySlots(input);
  if (!isApiModeEnabled()) {
    return { slots: local, source: 'local' };
  }
  try {
    const res = await availabilityApi.list({
      date: input.date,
      serviceId: input.serviceId ?? undefined,
      professionalId: input.professionalId ?? undefined,
      businessId: input.businessId ?? undefined,
    });
    let slots = mapApiSlotsToUi(res.data, input.professionalId);
    const effective = resolveSlotHours(
      input.hours,
      input.professionalId ? input.professionalHours : null
    );
    const open = parseTimeMin(effective.open);
    const close = parseTimeMin(effective.close);
    slots = slots.filter((s) => {
      const t = parseTimeMin(s.time);
      return t >= open && t < close;
    });
    if (!slots.length && local.length) {
      // empty day from API is valid; still prefer API
      return { slots, source: 'api' };
    }
    return { slots: slots.length ? slots : local, source: slots.length ? 'api' : 'local' };
  } catch (e) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn(
        '[availability] API fallback → local',
        e instanceof Error ? e.message : e
      );
    }
    return { slots: local, source: 'local' };
  }
}
