/** Chile wall-clock for agenda slots. HH:mm is local — no UTC conversion. */
export const CHILE_TIMEZONE = 'America/Santiago' as const;

export const WORK_HOUR_PRESETS: { label: string; start: string; end: string }[] =
  [
    { label: '09–19', start: '09:00', end: '19:00' },
    { label: '10–18', start: '10:00', end: '18:00' },
    { label: '09–13', start: '09:00', end: '13:00' },
    { label: '14–20', start: '14:00', end: '20:00' },
  ];

export const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
