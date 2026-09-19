import type {
  Appointment,
  Professional,
  Profile,
  TeamMemberRole,
} from '@/data/types';

const TEAM_COLORS = [
  '#06C167',
  '#059669',
  '#047857',
  '#0D9488',
  '#65A30D',
  '#CA8A04',
  '#EA580C',
  '#DB2777',
];

export function nextTeamColor(index: number): string {
  return TEAM_COLORS[index % TEAM_COLORS.length];
}

/** Normaliza profesionales antiguos sin teamRole / active */
export function migrateProfessionals(
  list: Array<Partial<Professional> & { id: string; name: string; role: string }>
): Professional[] {
  const migrated: Professional[] = list.map((p, i) => ({
    id: p.id,
    name: p.name,
    role: p.role,
    teamRole: (p.teamRole as TeamMemberRole | undefined) ?? 'trabajador',
    phone: p.phone,
    active: p.active ?? true,
    color: p.color ?? nextTeamColor(i),
    workStart: p.workStart,
    workEnd: p.workEnd,
  }));

  if (migrated.length > 0 && !migrated.some((p) => p.teamRole === 'admin')) {
    migrated[0] = { ...migrated[0], teamRole: 'admin' };
  }
  return migrated;
}

export type TeamAwareState = {
  profile: Profile;
  professionals: Professional[];
};

/** ¿El contexto activo es admin de empresa? */
export function isEmpresaAdmin(state: TeamAwareState): boolean {
  if (state.profile.role !== 'empresa') return false;
  const activeId = state.profile.activeProfessionalId;
  if (!activeId) {
    // Sin sub-perfil: dueño/admin por defecto
    return true;
  }
  const pro = state.professionals.find((p) => p.id === activeId);
  return pro?.teamRole === 'admin';
}

/** Miembro activo actual (o null) */
export function getActiveProfessional(
  state: TeamAwareState
): Professional | null {
  const id = state.profile.activeProfessionalId;
  if (!id) return null;
  return state.professionals.find((p) => p.id === id) ?? null;
}

/**
 * Filtra citas según el sub-perfil activo.
 * - Trabajador: solo sus citas (professionalId === activeId)
 * - Admin / sin filtro: todas
 * - persona_natural / cliente: sin filtro extra
 */
export function filterAppointmentsForActivePro(
  state: TeamAwareState,
  appointments: Appointment[],
  opts?: { adminFilterId?: string | null }
): Appointment[] {
  if (state.profile.role !== 'empresa') return appointments;

  const adminFilter = opts?.adminFilterId;
  if (adminFilter) {
    return appointments.filter(
      (a) => a.professionalId === adminFilter || a.professionalId === null
    );
  }

  const active = getActiveProfessional(state);
  if (!active) return appointments;
  if (active.teamRole === 'admin') return appointments;

  return appointments.filter((a) => a.professionalId === active.id);
}
