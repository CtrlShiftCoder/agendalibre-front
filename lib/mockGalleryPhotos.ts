/**
 * Mock HTTPS placeholders for gallery PoC — picsum seeds only.
 * No cloud upload SDK / image picker.
 */

export type MockPhotoPreset = {
  id: string;
  label: string;
  /** Stable picsum URL (400×400). */
  uri: string;
};

export const MOCK_PHOTO_PRESETS: MockPhotoPreset[] = [
  {
    id: 'fade',
    label: 'Corte',
    uri: 'https://picsum.photos/seed/agendalibre-fade/400/400',
  },
  {
    id: 'barba',
    label: 'Barba',
    uri: 'https://picsum.photos/seed/agendalibre-barba/400/400',
  },
  {
    id: 'salon',
    label: 'Salón',
    uri: 'https://picsum.photos/seed/agendalibre-salon/400/400',
  },
  {
    id: 'manos',
    label: 'Manos',
    uri: 'https://picsum.photos/seed/agendalibre-manos/400/400',
  },
  {
    id: 'consulta',
    label: 'Consulta',
    uri: 'https://picsum.photos/seed/agendalibre-consulta/400/400',
  },
  {
    id: 'glow',
    label: 'Glow',
    uri: 'https://picsum.photos/seed/agendalibre-glow/400/400',
  },
];

/** Seed helper: niche → first N preset URIs (or null to keep emoji fallback). */
export function mockPhotoUriForNiche(
  niche: string,
  index: number
): string | null {
  const byNiche: Record<string, string[]> = {
    barber: [
      MOCK_PHOTO_PRESETS[0]!.uri,
      MOCK_PHOTO_PRESETS[1]!.uri,
    ],
    health: [
      MOCK_PHOTO_PRESETS[4]!.uri,
      MOCK_PHOTO_PRESETS[2]!.uri,
    ],
    beauty: [
      MOCK_PHOTO_PRESETS[5]!.uri,
      MOCK_PHOTO_PRESETS[3]!.uri,
    ],
    other: [
      MOCK_PHOTO_PRESETS[2]!.uri,
      MOCK_PHOTO_PRESETS[0]!.uri,
    ],
  };
  const list = byNiche[niche] ?? byNiche.other!;
  return list[index] ?? list[0] ?? null;
}
