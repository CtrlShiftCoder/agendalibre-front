import type { BusinessType, UserRole } from '@/data/types';

/** Migra el alias histórico BusinessType → UserRole */
export function roleFromBusinessType(bt: BusinessType | undefined): UserRole {
  if (bt === 'persona') return 'persona_natural';
  if (bt === 'negocio') return 'empresa';
  return 'empresa';
}

export function businessTypeFromRole(role: UserRole): BusinessType | null {
  if (role === 'empresa') return 'negocio';
  if (role === 'persona_natural') return 'persona';
  return null;
}
