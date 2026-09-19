import type { Profile, Professional, UserRole } from '@/data/types';
import { isEmpresaAdmin, getActiveProfessional } from '@/lib/team';

export type ScreenKey =
  | 'politica'
  | 'listaEspera'
  | 'fichaCliente'
  | 'vitrinaEdit'
  | 'vitrinaVisit'
  | 'caja'
  | 'recordatorios'
  | 'honorarios'
  | 'invitarTrabajador'
  | 'notificaciones'
  | 'resenas'
  | 'dejarResena'
  | 'galeria';

export type AccessLevel =
  | 'none'
  | 'view'
  | 'edit'
  | 'manage'
  | 'join'
  | 'claim'
  | 'own'
  | 'full'
  | 'send';

type TeamState = { profile: Profile; professionals: Professional[] };

function isTrabajador(state: TeamState): boolean {
  if (state.profile.role !== 'empresa') return false;
  return !isEmpresaAdmin(state);
}

/**
 * Role-gated access for high-value screens.
 * @see contracts/ROLE_SCREENS.md
 */
export function screenAccess(
  key: ScreenKey,
  state: TeamState
): AccessLevel {
  const role: UserRole = state.profile.role;

  switch (key) {
    case 'politica':
      if (role === 'cliente') return 'view';
      if (role === 'persona_natural') return 'edit';
      if (role === 'empresa') return isEmpresaAdmin(state) ? 'edit' : 'view';
      return 'none';

    case 'listaEspera':
      if (role === 'cliente') return 'join';
      if (role === 'persona_natural') return 'manage';
      if (role === 'empresa') return isEmpresaAdmin(state) ? 'manage' : 'claim';
      return 'none';

    case 'fichaCliente':
      if (role === 'cliente') return 'own';
      if (role === 'persona_natural') return 'full';
      if (role === 'empresa') return isEmpresaAdmin(state) ? 'full' : 'own';
      return 'none';

    case 'vitrinaEdit':
      if (role === 'persona_natural') return 'edit';
      if (role === 'empresa' && isEmpresaAdmin(state)) return 'edit';
      return 'none';

    case 'vitrinaVisit':
      return 'view';

    case 'caja':
      if (role === 'cliente') return 'none';
      if (role === 'persona_natural') return 'full';
      if (role === 'empresa') return isEmpresaAdmin(state) ? 'full' : 'own';
      return 'none';

    case 'recordatorios':
      if (role === 'cliente') return 'none';
      if (role === 'persona_natural') return 'send';
      if (role === 'empresa') return 'send';
      return 'none';

    case 'honorarios':
      return role === 'persona_natural' ? 'full' : 'none';

    case 'invitarTrabajador':
      return role === 'empresa' && isEmpresaAdmin(state) ? 'full' : 'none';

    case 'notificaciones':
      return 'own';

    case 'resenas':
      if (role === 'cliente') return 'view';
      if (role === 'persona_natural') return 'manage';
      if (role === 'empresa') return isEmpresaAdmin(state) ? 'manage' : 'view';
      return 'none';

    case 'dejarResena':
      return role === 'cliente' ? 'edit' : 'none';

    case 'galeria':
      if (role === 'cliente') return 'view';
      if (role === 'persona_natural') return 'edit';
      if (role === 'empresa') return isEmpresaAdmin(state) ? 'edit' : 'own';
      return 'none';

    default:
      return 'none';
  }
}

export function canAccess(key: ScreenKey, state: TeamState): boolean {
  return screenAccess(key, state) !== 'none';
}

export { isEmpresaAdmin, getActiveProfessional, isTrabajador };
