import { useEffect, useMemo, useState } from 'react';

import type { Slot } from '@/data/slots';
import type { Appointment, BusinessHours } from '@/data/types';
import {
  fetchAvailabilitySlots,
  localAvailabilitySlots,
} from '@/lib/fetchAvailability';

export function useAvailabilitySlots(input: {
  date: string;
  hours: BusinessHours;
  durationMin: number;
  appointments: Appointment[];
  professionalId: string | null;
  serviceId?: string | null;
  businessId?: string | null;
  serviceDurationMin?: (serviceId: string) => number;
  /** Selected pro workStart/workEnd (HH:mm) */
  professionalHours?: { workStart?: string; workEnd?: string } | null;
  blockedDates?: string[] | null;
  /** Skip fetch when false (e.g. missing service) */
  enabled?: boolean;
}): Slot[] {
  const enabled = input.enabled !== false && !!input.date && input.durationMin > 0;

  const local = useMemo(() => {
    if (!enabled) return [];
    return localAvailabilitySlots({
      date: input.date,
      hours: input.hours,
      durationMin: input.durationMin,
      appointments: input.appointments,
      professionalId: input.professionalId,
      serviceDurationMin: input.serviceDurationMin,
      professionalHours: input.professionalHours,
      blockedDates: input.blockedDates,
    });
  }, [
    enabled,
    input.date,
    input.hours,
    input.durationMin,
    input.appointments,
    input.professionalId,
    input.serviceDurationMin,
    input.professionalHours,
    input.blockedDates,
  ]);

  const [slots, setSlots] = useState<Slot[]>(local);

  useEffect(() => {
    setSlots(local);
    if (!enabled) return;
    let cancelled = false;
    void (async () => {
      const res = await fetchAvailabilitySlots({
        date: input.date,
        hours: input.hours,
        durationMin: input.durationMin,
        appointments: input.appointments,
        professionalId: input.professionalId,
        serviceId: input.serviceId,
        businessId: input.businessId,
        serviceDurationMin: input.serviceDurationMin,
        professionalHours: input.professionalHours,
        blockedDates: input.blockedDates,
      });
      if (!cancelled) setSlots(res.slots);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    local,
    input.date,
    input.serviceId,
    input.professionalId,
    input.businessId,
    input.hours,
    input.durationMin,
    input.appointments,
    input.serviceDurationMin,
    input.professionalHours,
    input.blockedDates,
  ]);

  return slots;
}
