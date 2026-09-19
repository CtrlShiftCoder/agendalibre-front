/**
 * Domain types for the Expo PoC.
 * Canonical unions + DTO shapes live in contracts/; re-export here for @/data/types imports.
 */

export type {
  Niche,
  ThemeId,
  UserRole,
  AppointmentStatus,
  ServiceIconKey,
  ServiceCategory,
  TeamMemberRole,
  AuthProvider,
  ClientRiskFlag,
  BusinessHours,
  Profile,
  ColorScheme,
  Service,
  Professional,
  Client,
  Appointment,
} from '@/contracts/types';

import type { ClientRiskFlag, TeamMemberRole, UserRole } from '@/contracts/types';

/**
 * @deprecated Preferir `UserRole`. Alias histórico del onboarding.
 * `negocio` → empresa · `persona` → persona_natural
 */
export type BusinessType = 'negocio' | 'persona';

export function isProviderRole(role: UserRole): boolean {
  return role === 'empresa' || role === 'persona_natural';
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case 'cliente':
      return 'Cliente';
    case 'empresa':
      return 'Empresa';
    case 'persona_natural':
      return 'Persona natural';
  }
}

export function teamRoleLabel(teamRole: TeamMemberRole): string {
  return teamRole === 'admin' ? 'Admin' : 'Trabajador';
}

/** Copy de negocio vs consulta según rol proveedor */
export function providerNoun(role: UserRole): {
  short: string;
  place: string;
  team: string;
  services: string;
} {
  if (role === 'persona_natural') {
    return {
      short: 'consulta',
      place: 'tu consulta',
      team: 'tú',
      services: 'mis servicios',
    };
  }
  return {
    short: 'negocio',
    place: 'tu negocio',
    team: 'equipo',
    services: 'servicios del negocio',
  };
}

export function deriveRiskFlag(
  noShowCount: number,
  completedCount: number
): ClientRiskFlag {
  if (noShowCount >= 3) return 'high';
  if (noShowCount >= 1 && completedCount < noShowCount * 2) return 'watch';
  if (noShowCount >= 1) return 'watch';
  return 'ok';
}
