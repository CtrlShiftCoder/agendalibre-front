import type { Niche, UserRole } from '@/contracts';

/**
 * Niche / role feature flags for AgendaLibre PoC.
 * Prefer this module over scattering role checks in UI.
 */

export type FeatureFlag =
  | 'honorarios'
  | 'equipo'
  | 'invitarTrabajador'
  | 'caja'
  | 'listaEspera'
  | 'vitrinaEdit'
  | 'galeria'
  | 'depositos'
  | 'recordatorios'
  | 'politicaCancelacion'
  | 'resenasManage'
  | 'darkModeToggle';

export type FeatureContext = {
  role: UserRole;
  niche?: Niche | null;
  /** empresa admin vs trabajador */
  isAdmin?: boolean;
};

/**
 * Returns whether a feature is enabled for the given role/niche context.
 * - honorarios: only persona_natural
 * - equipo / invitarTrabajador: only empresa (+ admin for invites)
 * - caja: providers only
 */
export function isFeatureEnabled(
  flag: FeatureFlag,
  ctx: FeatureContext
): boolean {
  const { role, isAdmin = true } = ctx;

  switch (flag) {
    case 'honorarios':
      return role === 'persona_natural';

    case 'equipo':
      return role === 'empresa';

    case 'invitarTrabajador':
      return role === 'empresa' && isAdmin;

    case 'caja':
      return role === 'empresa' || role === 'persona_natural';

    case 'vitrinaEdit':
      return role === 'persona_natural' || (role === 'empresa' && isAdmin);

    case 'galeria':
      return role !== 'cliente';

    case 'depositos':
      if (role === 'cliente') return false;
      return ctx.niche !== 'health';

    case 'resenasManage':
      if (role === 'cliente') return false;
      if (role === 'persona_natural') return true;
      return role === 'empresa' && isAdmin;

    case 'listaEspera':
      return true;

    case 'recordatorios':
      return role !== 'cliente';

    case 'politicaCancelacion':
      return true;

    case 'darkModeToggle':
      return true;

    default:
      return false;
  }
}

export function enabledFeatures(ctx: FeatureContext): FeatureFlag[] {
  const all: FeatureFlag[] = [
    'honorarios',
    'equipo',
    'invitarTrabajador',
    'caja',
    'listaEspera',
    'vitrinaEdit',
    'galeria',
    'depositos',
    'recordatorios',
    'politicaCancelacion',
    'resenasManage',
    'darkModeToggle',
  ];
  return all.filter((f) => isFeatureEnabled(f, ctx));
}
