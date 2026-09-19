import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  AppNotification,
  CancellationPolicy,
  DepositStatus,
  GalleryItem,
  PublicStorefront,
  PushPreference,
  ReminderTemplate,
  Review,
  TeamInvite,
  WaitlistEntry,
  WaitlistStatus,
} from '@/contracts';
import {
  initialDepositStatus,
  resolveSuggestedDeposit,
} from '@/lib/deposit';
import { generateCode, generateId, seedForNiche } from '@/data/seeds';
import type {
  Appointment,
  AppointmentStatus,
  AuthProvider,
  Client,
  Niche,
  Professional,
  Profile,
  Service,
  TeamMemberRole,
  ThemeId,
  UserRole,
} from '@/data/types';
import { deriveRiskFlag } from '@/data/types';
import { roleFromBusinessType } from '@/lib/roles';
import {
  getActiveProfessional,
  isEmpresaAdmin,
  migrateProfessionals,
  nextTeamColor,
} from '@/lib/team';
import {
  buildHighValueDefaults,
  defaultCancellationPolicy,
  defaultPushPreferences,
  defaultReminderTemplates,
  defaultStorefront,
  migrateClientShape,
  seedGalleryForNiche,
  seedReviewsForOnboarding,
} from '@/store/defaults';
import { findBookingConflict } from '@/lib/bookingLock';
import { scheduleLocal } from '@/lib/notifications';
import { nicheForTheme } from '@/lib/nicheVisuals';
import { resolveThemeId, type AppearanceMode } from '@/theme/colors';

const defaultProfile: Profile = {
  role: 'empresa',
  niche: 'barber',
  name: '',
  phone: '',
  theme: 'neutral',
  colorScheme: 'light',
  darkMode: false,
  address: 'Santiago, Chile',
  hours: {
    open: '09:00',
    close: '19:00',
    days: [1, 2, 3, 4, 5, 6],
  },
  blockedDates: [],
  onboardingDone: false,
  linkedClientId: null,
  activeProfessionalId: null,
  authDone: false,
  authProvider: null,
  authEmail: undefined,
  authName: undefined,
  gcalMockEnabled: false,
  gcalLastSyncAt: null,
};

export type CompleteOnboardingInput = {
  role: UserRole;
  niche?: Niche;
  name: string;
  phone?: string;
  theme?: ThemeId;
};

export type AddTeamMemberInput = {
  name: string;
  role: string;
  teamRole: TeamMemberRole;
  phone?: string;
  color?: string;
  workStart?: string;
  workEnd?: string;
};

export type AddWaitlistInput = {
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId?: string | null;
  professionalId?: string | null;
  preferredDate?: string | null;
  preferredPeriod?: WaitlistEntry['preferredPeriod'];
  notes?: string;
};

interface AppState {
  hydrated: boolean;
  appearance: AppearanceMode;
  profile: Profile;
  services: Service[];
  professionals: Professional[];
  clients: Client[];
  appointments: Appointment[];

  cancellationPolicy: CancellationPolicy;
  waitlist: WaitlistEntry[];
  storefront: PublicStorefront;
  reminderTemplates: ReminderTemplate[];
  teamInvites: TeamInvite[];

  pushPreferences: PushPreference;
  notifications: AppNotification[];
  reviews: Review[];
  gallery: GalleryItem[];
  /** Local mock seña status by appointment id — no payment API */
  depositStatuses: Record<string, DepositStatus>;

  setHydrated: (v: boolean) => void;
  setAppearance: (mode: AppearanceMode) => void;
  toggleAppearance: () => void;
  simulateCupoLiberado: (appointmentId: string) => {
    notified: number;
    topClientName?: string;
  };
  completeOnboarding: (input: CompleteOnboardingInput) => void;
  updateProfile: (partial: Partial<Profile>) => void;
  setTheme: (theme: ThemeId) => void;

  addService: (s: Omit<Service, 'id' | 'active'>) => void;
  updateService: (id: string, partial: Partial<Service>) => void;
  deleteService: (id: string) => void;

  addClient: (
    c: Omit<Client, 'id' | 'noShowCount' | 'completedCount'> & {
      noShowCount?: number;
      completedCount?: number;
    }
  ) => void;
  updateClient: (id: string, partial: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addAppointment: (input: {
    serviceId: string;
    professionalId: string | null;
    clientId: string;
    date: string;
    startTime: string;
  }) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  setDepositStatus: (appointmentId: string, status: DepositStatus) => void;

  addTeamMember: (input: AddTeamMemberInput) => Professional | null;
  updateTeamMember: (id: string, partial: Partial<Professional>) => void;
  removeTeamMember: (id: string) => { ok: boolean; error?: string };
  setActiveProfessional: (id: string | null) => void;

  updateCancellationPolicy: (partial: Partial<CancellationPolicy>) => void;
  addWaitlistEntry: (input: AddWaitlistInput) => WaitlistEntry;
  updateWaitlistEntry: (id: string, partial: Partial<WaitlistEntry>) => void;
  setWaitlistStatus: (id: string, status: WaitlistStatus) => void;
  updateStorefront: (partial: Partial<PublicStorefront>) => void;
  updateReminderTemplate: (
    id: string,
    partial: Partial<ReminderTemplate>
  ) => void;
  createTeamInvite: (input: {
    role: TeamInvite['role'];
    createdByProfessionalId: string;
  }) => TeamInvite | null;
  revokeTeamInvite: (id: string) => void;

  updatePushPreferences: (partial: Partial<PushPreference>) => void;
  addNotification: (
    n: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & {
      id?: string;
      createdAt?: string;
      read?: boolean;
    }
  ) => AppNotification;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;

  addReview: (input: {
    appointmentId: string;
    rating: Review['rating'];
    comment: string;
  }) => Review | null;
  replyToReview: (id: string, reply: string) => void;
  setReviewVisible: (id: string, visible: boolean) => void;

  addGalleryItem: (
    input: Omit<GalleryItem, 'id' | 'createdAt'> & { createdAt?: string }
  ) => GalleryItem;
  updateGalleryItem: (id: string, partial: Partial<GalleryItem>) => void;
  removeGalleryItem: (id: string) => void;

  signInMock: (input: {
    provider: Exclude<AuthProvider, null>;
    email?: string;
    name?: string;
  }) => void;
  signOutMock: () => void;

  resetAll: () => void;
}

function migrateProfile(raw: Partial<Profile> & { businessType?: string }): Profile {
  const role =
    raw.role ??
    roleFromBusinessType(
      raw.businessType as 'negocio' | 'persona' | undefined
    );
  const colorScheme =
    raw.colorScheme === 'dark' || raw.colorScheme === 'light'
      ? raw.colorScheme
      : raw.darkMode
        ? 'dark'
        : 'light';
  return {
    ...defaultProfile,
    ...raw,
    role,
    theme: resolveThemeId(raw.theme),
    colorScheme,
    darkMode: colorScheme === 'dark',
    phone: raw.phone ?? '',
    blockedDates: Array.isArray(raw.blockedDates) ? raw.blockedDates : [],
    linkedClientId: raw.linkedClientId ?? null,
    activeProfessionalId:
      raw.activeProfessionalId !== undefined
        ? raw.activeProfessionalId
        : null,
    authDone: raw.authDone ?? false,
    authProvider: raw.authProvider ?? null,
    authEmail: raw.authEmail,
    authName: raw.authName,
    gcalMockEnabled: raw.gcalMockEnabled ?? false,
    gcalLastSyncAt: raw.gcalLastSyncAt ?? null,
  };
}

function authFrom(profile: Profile): Pick<
  Profile,
  'authDone' | 'authProvider' | 'authEmail' | 'authName'
> {
  return {
    authDone: profile.authDone,
    authProvider: profile.authProvider,
    authEmail: profile.authEmail,
    authName: profile.authName,
  };
}

function buildEmpresaTeam(
  ownerName: string,
  seedPros: Professional[],
  ownerPhone?: string
): { professionals: Professional[]; activeProfessionalId: string } {
  const adminId = generateId('pro');
  const admin: Professional = {
    id: adminId,
    name: ownerName.trim() || 'Admin',
    role: 'Dueño/a',
    teamRole: 'admin',
    phone: ownerPhone?.trim() || undefined,
    active: true,
    color: nextTeamColor(0),
  };
  const workers: Professional[] = seedPros.map((p, i) => ({
    ...p,
    teamRole: 'trabajador' as const,
    active: p.active ?? true,
    color: p.color ?? nextTeamColor(i + 1),
  }));
  return {
    professionals: [admin, ...workers],
    activeProfessionalId: adminId,
  };
}

function buildSoloPro(
  name: string,
  seedPros: Professional[],
  phone?: string
): { professionals: Professional[]; activeProfessionalId: string } {
  if (seedPros.length > 0) {
    const solo: Professional = {
      ...seedPros[0],
      name: name.trim() || seedPros[0].name,
      role: seedPros[0].role || 'Profesional',
      teamRole: 'admin',
      phone: phone?.trim() || seedPros[0].phone,
      active: true,
      color: seedPros[0].color ?? nextTeamColor(0),
    };
    const rest = seedPros.slice(1).map((p, i) => ({
      ...p,
      teamRole: 'trabajador' as const,
      active: false,
      color: p.color ?? nextTeamColor(i + 1),
    }));
    return {
      professionals: [solo, ...rest],
      activeProfessionalId: solo.id,
    };
  }
  const id = generateId('pro');
  const solo: Professional = {
    id,
    name: name.trim() || 'Tú',
    role: 'Profesional',
    teamRole: 'admin',
    phone: phone?.trim() || undefined,
    active: true,
    color: nextTeamColor(0),
  };
  return { professionals: [solo], activeProfessionalId: id };
}

const hv0 = buildHighValueDefaults(defaultProfile);

function applyClientCounters(
  clients: Client[],
  clientId: string,
  prev: AppointmentStatus,
  next: AppointmentStatus
): Client[] {
  if (prev === next) return clients;
  return clients.map((c) => {
    if (c.id !== clientId) return c;
    let noShowCount = c.noShowCount;
    let completedCount = c.completedCount;
    let lastVisitAt = c.lastVisitAt;

    if (prev === 'completada') completedCount = Math.max(0, completedCount - 1);
    if (prev === 'noshow') noShowCount = Math.max(0, noShowCount - 1);

    if (next === 'completada') {
      completedCount += 1;
      lastVisitAt = new Date().toISOString();
    }
    if (next === 'noshow') noShowCount += 1;

    return {
      ...c,
      noShowCount,
      completedCount,
      lastVisitAt,
      riskFlag: deriveRiskFlag(noShowCount, completedCount),
    };
  });
}

function inviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'INV-';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      appearance: 'light',
      profile: defaultProfile,
      services: [],
      professionals: [],
      clients: [],
      appointments: [],
      cancellationPolicy: hv0.cancellationPolicy,
      waitlist: [],
      storefront: hv0.storefront,
      reminderTemplates: hv0.reminderTemplates,
      teamInvites: [],
      pushPreferences: hv0.pushPreferences,
      notifications: [],
      reviews: [],
      gallery: [],
      depositStatuses: {},

      setHydrated: (v) => set({ hydrated: v }),

      setAppearance: (mode) =>
        set((s) => ({
          appearance: mode,
          profile: {
            ...s.profile,
            colorScheme: mode,
            darkMode: mode === 'dark',
          },
        })),
      toggleAppearance: () =>
        set((s) => {
          const mode = s.appearance === 'dark' ? 'light' : 'dark';
          return {
            appearance: mode,
            profile: {
              ...s.profile,
              colorScheme: mode,
              darkMode: mode === 'dark',
            },
          };
        }),


      completeOnboarding: ({ role, niche, name, phone, theme }) => {
        const resolvedNiche: Niche = niche ?? 'barber';
        const resolvedTheme: ThemeId =
          theme ??
          (role === 'cliente'
            ? 'neutral'
            : resolvedNiche === 'other'
              ? 'neutral'
              : resolvedNiche);

        const seed = seedForNiche(resolvedNiche);

        if (role === 'cliente') {
          const clientId = generateId('cli');
          const me: Client = {
            id: clientId,
            name: name.trim() || 'Cliente',
            phone: (phone ?? '').trim() || '+56900000000',
            noShowCount: 0,
            completedCount: 0,
            riskFlag: 'ok',
          };
          const appointments = seed.appointments.map((a, i) =>
            i === seed.appointments.length - 1 ||
            i === seed.appointments.length - 2
              ? { ...a, clientId }
              : a
          );
          const profile: Profile = {
            ...defaultProfile,
            ...authFrom(get().profile),
            role: 'cliente',
            niche: resolvedNiche,
            name: me.name,
            phone: me.phone,
            theme: resolvedTheme,
            onboardingDone: true,
            linkedClientId: clientId,
            activeProfessionalId: null,
            address: seed.appointments.length
              ? resolvedNiche === 'barber'
                ? 'Av. Providencia 1234, Santiago'
                : resolvedNiche === 'health'
                  ? 'Consultorio Centro, Santiago'
                  : 'Santiago, Chile'
              : defaultProfile.address,
          };
          const hv = buildHighValueDefaults(profile);
          const reviews = seedReviewsForOnboarding({
            niche: resolvedNiche,
            clients: [...seed.clients, me],
            appointments,
          });
          set({
            profile,
            services: seed.services,
            professionals: migrateProfessionals(seed.professionals),
            clients: [...seed.clients, me],
            appointments,
            ...hv,
            reviews,
            gallery: seedGalleryForNiche(resolvedNiche, null),
          });
          return;
        }

        const defaultName =
          name.trim() ||
          (role === 'empresa' ? 'Mi negocio' : 'Mi consulta');

        const address =
          resolvedNiche === 'barber'
            ? 'Av. Providencia 1234, Santiago'
            : resolvedNiche === 'health'
              ? 'Consultorio Centro, Santiago'
              : 'Santiago, Chile';

        if (role === 'empresa') {
          const team = buildEmpresaTeam(
            defaultName,
            seed.professionals,
            phone
          );
          const profile: Profile = {
            ...defaultProfile,
            ...authFrom(get().profile),
            role: 'empresa',
            niche: resolvedNiche,
            name: defaultName,
            phone: (phone ?? '').trim(),
            theme: resolvedTheme,
            onboardingDone: true,
            linkedClientId: null,
            activeProfessionalId: team.activeProfessionalId,
            address,
          };
          const hv = buildHighValueDefaults(profile);
          const reviews = seedReviewsForOnboarding({
            niche: resolvedNiche,
            clients: seed.clients,
            appointments: seed.appointments,
          });
          set({
            profile,
            services: seed.services,
            professionals: team.professionals,
            clients: seed.clients,
            appointments: seed.appointments,
            ...hv,
            reviews,
            gallery: seedGalleryForNiche(
              resolvedNiche,
              team.activeProfessionalId
            ),
          });
          return;
        }

        const solo = buildSoloPro(defaultName, seed.professionals, phone);
        const remappedApts = seed.appointments.map((a) => ({
          ...a,
          professionalId: a.professionalId
            ? solo.activeProfessionalId
            : null,
        }));
        const profile: Profile = {
          ...defaultProfile,
          ...authFrom(get().profile),
          role: 'persona_natural',
          niche: resolvedNiche,
          name: defaultName,
          phone: (phone ?? '').trim(),
          theme: resolvedTheme,
          onboardingDone: true,
          linkedClientId: null,
          activeProfessionalId: solo.activeProfessionalId,
          address,
        };
        const hv = buildHighValueDefaults(profile);
        const reviews = seedReviewsForOnboarding({
          niche: resolvedNiche,
          clients: seed.clients,
          appointments: remappedApts,
        });
        set({
          profile,
          services: seed.services,
          professionals: solo.professionals,
          clients: seed.clients,
          appointments: remappedApts,
          ...hv,
          reviews,
          gallery: seedGalleryForNiche(
            resolvedNiche,
            solo.activeProfessionalId
          ),
        });
      },

      updateProfile: (partial) =>
        set((s) => {
          const profile = {
            ...s.profile,
            ...partial,
            ...(partial.theme !== undefined
              ? { theme: resolveThemeId(partial.theme) }
              : null),
          };
          let storefront = s.storefront;
          if (partial.name !== undefined || partial.address !== undefined) {
            const slugBase = defaultStorefront(profile);
            storefront = {
              ...s.storefront,
              ...(partial.name !== undefined
                ? {
                    displayName: partial.name,
                    slug: slugBase.slug,
                    bookingPath: `/v/${slugBase.slug}`,
                  }
                : null),
              ...(partial.address !== undefined
                ? { address: partial.address }
                : null),
            };
          }
          const appearance =
            partial.colorScheme === 'dark' || partial.colorScheme === 'light'
              ? partial.colorScheme
              : s.appearance;
          return { profile, storefront, appearance };
        }),

      setTheme: (theme) =>
        set((s) => {
          const resolved = resolveThemeId(theme);
          const niche = nicheForTheme(resolved);
          return {
            profile: {
              ...s.profile,
              theme: resolved,
              ...(niche ? { niche } : null),
            },
          };
        }),

      addService: (svc) =>
        set((s) => ({
          services: [
            ...s.services,
            { ...svc, id: generateId('svc'), active: true },
          ],
        })),

      updateService: (id, partial) =>
        set((s) => ({
          services: s.services.map((x) =>
            x.id === id ? { ...x, ...partial } : x
          ),
        })),

      deleteService: (id) =>
        set((s) => ({
          services: s.services.map((x) =>
            x.id === id ? { ...x, active: false } : x
          ),
        })),

      addClient: (c) =>
        set((s) => ({
          clients: [
            ...s.clients,
            {
              ...c,
              id: generateId('cli'),
              noShowCount: c.noShowCount ?? 0,
              completedCount: c.completedCount ?? 0,
              riskFlag:
                c.riskFlag ??
                deriveRiskFlag(c.noShowCount ?? 0, c.completedCount ?? 0),
            },
          ],
        })),

      updateClient: (id, partial) =>
        set((s) => ({
          clients: s.clients.map((x) =>
            x.id === id ? { ...x, ...partial } : x
          ),
        })),

      deleteClient: (id) =>
        set((s) => ({ clients: s.clients.filter((x) => x.id !== id) })),

      addAppointment: (input) => {
        const conflict = findBookingConflict({
          appointments: get().appointments,
          date: input.date,
          startTime: input.startTime,
          professionalId: input.professionalId,
        });
        if (conflict) {
          throw new Error(
            `Cupo ocupado (${conflict.startTime}) · cita ${conflict.code}. Elige otro horario.`
          );
        }
        const apt: Appointment = {
          id: generateId('apt'),
          ...input,
          status: 'confirmada',
          code: generateCode(),
          createdAt: new Date().toISOString(),
        };
        const prefs = get().pushPreferences;
        const notifs: AppNotification[] = [];
        if (prefs.bookingConfirm) {
          const n: AppNotification = {
            id: generateId('ntf'),
            userRoleTarget: 'cliente',
            title: 'Cita confirmada',
            body: `Tu reserva ${apt.code} quedó agendada para el ${apt.date} a las ${apt.startTime}.`,
            kind: 'booking_confirm',
            relatedAppointmentId: apt.id,
            read: false,
            createdAt: new Date().toISOString(),
          };
          notifs.push(n);
          void scheduleLocal({
            title: n.title,
            body: n.body,
            seconds: 2,
          });
        }
        const svc = get().services.find((x) => x.id === apt.serviceId);
        const suggested = resolveSuggestedDeposit(
          svc,
          get().cancellationPolicy
        );
        const depositStatuses = {
          ...get().depositStatuses,
          [apt.id]: initialDepositStatus(suggested.required),
        };
        set((s) => ({
          appointments: [...s.appointments, apt],
          notifications: [...notifs, ...s.notifications],
          depositStatuses,
        }));
        return apt;
      },

            setDepositStatus: (appointmentId, status) =>
        set((s) => ({
          depositStatuses: {
            ...s.depositStatuses,
            [appointmentId]: status,
          },
          appointments: s.appointments.map((a) =>
            a.id === appointmentId ? { ...a, depositStatus: status } : a
          ),
        })),

      updateAppointmentStatus: (id, status) => {
        const s = get();
        const prev = s.appointments.find((a) => a.id === id);
        if (!prev) return;
        const extraNotifs: AppNotification[] = [];
        if (status === 'completada' && prev.status !== 'completada') {
          if (s.pushPreferences.reviewRequest) {
            const already = s.reviews.some((r) => r.appointmentId === id);
            if (!already) {
              const n: AppNotification = {
                id: generateId('ntf'),
                userRoleTarget: 'cliente',
                title: '¿Cómo estuvo tu cita?',
                body: 'Cuéntanos tu experiencia — toma menos de un minuto.',
                kind: 'review_request',
                relatedAppointmentId: id,
                read: false,
                createdAt: new Date().toISOString(),
              };
              extraNotifs.push(n);
              void scheduleLocal({
                title: n.title,
                body: n.body,
                seconds: 3,
              });
            }
          }
        }
        set({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, status } : a
          ),
          clients: applyClientCounters(
            s.clients,
            prev.clientId,
            prev.status,
            status
          ),
          notifications:
            extraNotifs.length > 0
              ? [...extraNotifs, ...s.notifications]
              : s.notifications,
        });
        if (
          (status === 'noshow' || status === 'cancelada') &&
          prev.status !== 'noshow' &&
          prev.status !== 'cancelada'
        ) {
          get().simulateCupoLiberado(id);
        }
      },

      addTeamMember: (input) => {
        const state = get();
        if (state.profile.role !== 'empresa') return null;
        if (!isEmpresaAdmin(state)) return null;

        const member: Professional = {
          id: generateId('pro'),
          name: input.name.trim() || 'Trabajador',
          role: input.role.trim() || 'Profesional',
          teamRole: input.teamRole,
          phone: input.phone?.trim() || undefined,
          active: true,
          color: input.color ?? nextTeamColor(state.professionals.length),
          workStart: input.workStart,
          workEnd: input.workEnd,
        };
        set((s) => ({
          professionals: [...s.professionals, member],
        }));
        return member;
      },

      updateTeamMember: (id, partial) => {
        const state = get();
        if (state.profile.role !== 'empresa') return;

        if (
          partial.teamRole === 'trabajador' ||
          partial.active === false
        ) {
          const target = state.professionals.find((p) => p.id === id);
          if (target?.teamRole === 'admin') {
            const otherAdmins = state.professionals.filter(
              (p) =>
                p.id !== id && p.teamRole === 'admin' && p.active !== false
            );
            if (otherAdmins.length === 0) {
              const { teamRole: _tr, active: _a, ...safe } = partial;
              void _tr;
              void _a;
              set((s) => ({
                professionals: s.professionals.map((x) =>
                  x.id === id ? { ...x, ...safe } : x
                ),
              }));
              return;
            }
          }
        }

        set((s) => ({
          professionals: s.professionals.map((x) =>
            x.id === id ? { ...x, ...partial } : x
          ),
        }));
      },

      removeTeamMember: (id) => {
        const state = get();
        if (state.profile.role !== 'empresa') {
          return { ok: false, error: 'Solo empresa puede gestionar el equipo.' };
        }
        const target = state.professionals.find((p) => p.id === id);
        if (!target) return { ok: false, error: 'Miembro no encontrado.' };

        if (target.teamRole === 'admin') {
          const otherAdmins = state.professionals.filter(
            (p) => p.id !== id && p.teamRole === 'admin'
          );
          if (otherAdmins.length === 0) {
            return {
              ok: false,
              error: 'No puedes eliminar al último admin.',
            };
          }
        }

        set((s) => ({
          professionals: s.professionals.filter((x) => x.id !== id),
          profile:
            s.profile.activeProfessionalId === id
              ? {
                  ...s.profile,
                  activeProfessionalId:
                    s.professionals.find(
                      (p) => p.id !== id && p.teamRole === 'admin'
                    )?.id ??
                    s.professionals.find((p) => p.id !== id)?.id ??
                    null,
                }
              : s.profile,
        }));
        return { ok: true };
      },

      setActiveProfessional: (id) =>
        set((s) => ({
          profile: { ...s.profile, activeProfessionalId: id },
        })),

      updateCancellationPolicy: (partial) =>
        set((s) => ({
          cancellationPolicy: {
            ...s.cancellationPolicy,
            ...partial,
            updatedAt: new Date().toISOString(),
          },
        })),

      addWaitlistEntry: (input) => {
        const entry: WaitlistEntry = {
          id: generateId('wl'),
          clientId: input.clientId,
          clientName: input.clientName,
          clientPhone: input.clientPhone,
          serviceId: input.serviceId ?? null,
          professionalId: input.professionalId ?? null,
          preferredDate: input.preferredDate ?? null,
          preferredPeriod: input.preferredPeriod ?? 'any',
          notes: input.notes,
          status: 'waiting',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ waitlist: [...s.waitlist, entry] }));
        return entry;
      },

      updateWaitlistEntry: (id, partial) =>
        set((s) => ({
          waitlist: s.waitlist.map((w) =>
            w.id === id ? { ...w, ...partial } : w
          ),
        })),

      setWaitlistStatus: (id, status) => {
        const s = get();
        const entry = s.waitlist.find((w) => w.id === id);
        const extra: AppNotification[] = [];
        if (
          entry &&
          status === 'notified' &&
          s.pushPreferences.waitlistOpen
        ) {
          const n: AppNotification = {
            id: generateId('ntf'),
            userRoleTarget: 'cliente',
            title: '¡Se abrió un cupo!',
            body: `Hola ${entry.clientName}, hay disponibilidad. Reserva pronto.`,
            kind: 'waitlist',
            read: false,
            createdAt: new Date().toISOString(),
          };
          extra.push(n);
          void scheduleLocal({ title: n.title, body: n.body, seconds: 2 });
        }
        set({
          waitlist: s.waitlist.map((w) =>
            w.id === id ? { ...w, status } : w
          ),
          notifications:
            extra.length > 0 ? [...extra, ...s.notifications] : s.notifications,
        });
      },


      simulateCupoLiberado: (appointmentId) => {
        const s = get();
        const apt = s.appointments.find((a) => a.id === appointmentId);
        if (!apt) return { notified: 0 };
        const waiting = s.waitlist.filter((w) => w.status === 'waiting');
        const scored = waiting
          .map((entry) => {
            let score = 10;
            if (entry.serviceId && entry.serviceId === apt.serviceId) score += 40;
            if (
              entry.professionalId &&
              apt.professionalId &&
              entry.professionalId === apt.professionalId
            ) {
              score += 30;
            }
            if (entry.preferredDate === apt.date) score += 25;
            return { entry, score };
          })
          .sort((a, b) => b.score - a.score);
        const top = scored.slice(0, 3);
        if (top.length === 0) return { notified: 0 };
        const extra: AppNotification[] = top.map(({ entry }) => ({
          id: generateId('ntf'),
          userRoleTarget: 'cliente' as const,
          title: '¡Se abrió un cupo!',
          body: `Hola ${entry.clientName}, hay un cupo el ${apt.date} a las ${apt.startTime}. Reserva pronto.`,
          kind: 'waitlist' as const,
          relatedAppointmentId: apt.id,
          read: false,
          createdAt: new Date().toISOString(),
        }));
        const notifiedIds = new Set(top.map((t) => t.entry.id));
        set({
          waitlist: s.waitlist.map((w) =>
            notifiedIds.has(w.id) ? { ...w, status: 'notified' as const } : w
          ),
          notifications: [...extra, ...s.notifications],
        });
        for (const n of extra) {
          void scheduleLocal({ title: n.title, body: n.body, seconds: 2 });
        }
        return {
          notified: top.length,
          topClientName: top[0]?.entry.clientName,
        };
      },

      updateStorefront: (partial) =>
        set((s) => {
          const next = { ...s.storefront, ...partial };
          if (partial.slug) {
            next.bookingPath = `/v/${partial.slug}`;
          }
          return { storefront: next };
        }),

      updateReminderTemplate: (id, partial) =>
        set((s) => ({
          reminderTemplates: s.reminderTemplates.map((t) =>
            t.id === id ? { ...t, ...partial } : t
          ),
        })),

      createTeamInvite: ({ role, createdByProfessionalId }) => {
        const state = get();
        if (state.profile.role !== 'empresa') return null;
        if (!isEmpresaAdmin(state)) return null;
        const now = new Date();
        const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const invite: TeamInvite = {
          id: generateId('inv'),
          code: inviteCode(),
          businessName: state.profile.name || 'Mi negocio',
          createdByProfessionalId,
          role,
          status: 'pending',
          expiresAt: expires.toISOString(),
          createdAt: now.toISOString(),
        };
        set((s) => {
          const extras: AppNotification[] = [];
          if (s.pushPreferences.teamInvite) {
            extras.push({
              id: generateId('ntf'),
              userRoleTarget: 'empresa',
              title: 'Invitación de equipo',
              body: `Código ${invite.code} · rol ${invite.role}. Válido 7 días.`,
              kind: 'team_invite',
              read: false,
              createdAt: new Date().toISOString(),
            });
          }
          return {
            teamInvites: [invite, ...s.teamInvites],
            notifications: [...extras, ...s.notifications],
          };
        });
        return invite;
      },

      revokeTeamInvite: (id) =>
        set((s) => ({
          teamInvites: s.teamInvites.map((i) =>
            i.id === id ? { ...i, status: 'revoked' as const } : i
          ),
        })),

      updatePushPreferences: (partial) =>
        set((s) => ({
          pushPreferences: { ...s.pushPreferences, ...partial },
        })),

      addNotification: (n) => {
        const item: AppNotification = {
          id: n.id ?? generateId('ntf'),
          userRoleTarget: n.userRoleTarget,
          title: n.title,
          body: n.body,
          kind: n.kind,
          relatedAppointmentId: n.relatedAppointmentId,
          relatedReviewId: n.relatedReviewId,
          read: n.read ?? false,
          createdAt: n.createdAt ?? new Date().toISOString(),
        };
        set((s) => ({ notifications: [item, ...s.notifications] }));
        return item;
      },

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      addReview: ({ appointmentId, rating, comment }) => {
        const s = get();
        const apt = s.appointments.find((a) => a.id === appointmentId);
        if (!apt || apt.status !== 'completada') return null;
        if (s.reviews.some((r) => r.appointmentId === appointmentId)) {
          return null;
        }
        const client = s.clients.find((c) => c.id === apt.clientId);
        const review: Review = {
          id: generateId('rev'),
          appointmentId,
          clientId: apt.clientId,
          clientName: client?.name ?? 'Cliente',
          professionalId: apt.professionalId,
          serviceId: apt.serviceId,
          rating,
          comment: comment.trim(),
          createdAt: new Date().toISOString(),
          reply: null,
          replyAt: null,
          visible: true,
        };
        const providerNotif: AppNotification = {
          id: generateId('ntf'),
          userRoleTarget:
            s.profile.role === 'persona_natural'
              ? 'persona_natural'
              : 'empresa',
          title: 'Nueva reseña',
          body: `${review.clientName} dejó ${rating}★: ${comment.trim().slice(0, 80) || 'Sin comentario'}`,
          kind: 'review_received',
          relatedAppointmentId: appointmentId,
          relatedReviewId: review.id,
          read: false,
          createdAt: new Date().toISOString(),
        };
        set({
          reviews: [review, ...s.reviews],
          notifications: [providerNotif, ...s.notifications],
        });
        return review;
      },

      replyToReview: (id, reply) =>
        set((s) => ({
          reviews: s.reviews.map((r) =>
            r.id === id
              ? {
                  ...r,
                  reply: reply.trim(),
                  replyAt: new Date().toISOString(),
                }
              : r
          ),
        })),

      setReviewVisible: (id, visible) =>
        set((s) => ({
          reviews: s.reviews.map((r) =>
            r.id === id ? { ...r, visible } : r
          ),
        })),

      addGalleryItem: (input) => {
        const item: GalleryItem = {
          ...input,
          id: generateId('gal'),
          createdAt: input.createdAt ?? new Date().toISOString(),
        };
        set((s) => ({ gallery: [item, ...s.gallery] }));
        return item;
      },

      updateGalleryItem: (id, partial) =>
        set((s) => ({
          gallery: s.gallery.map((g) =>
            g.id === id ? { ...g, ...partial } : g
          ),
        })),

      removeGalleryItem: (id) =>
        set((s) => ({ gallery: s.gallery.filter((g) => g.id !== id) })),

      signInMock: ({ provider, email, name }) =>
        set((s) => ({
          profile: {
            ...s.profile,
            authDone: true,
            authProvider: provider,
            authEmail: email ?? s.profile.authEmail,
            authName: name ?? s.profile.authName,
          },
        })),

      signOutMock: () =>
        set((s) => ({
          profile: {
            ...s.profile,
            authDone: false,
            authProvider: null,
            authEmail: undefined,
            authName: undefined,
          },
        })),

      resetAll: () =>
        set((s) => {
          const profile = {
            ...defaultProfile,
            ...authFrom(s.profile),
          };
          const hv = buildHighValueDefaults(profile);
          return {
            profile,
            services: [],
            professionals: [],
            clients: [],
            appointments: [],
            ...hv,
          };
        }),
    }),
    {
      name: 'agenda-libre-storage',
      version: 6,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted: unknown) => {
        const p = persisted as {
          profile?: Partial<Profile> & { businessType?: string };
          services?: Service[];
          professionals?: Array<
            Partial<Professional> & { id: string; name: string; role: string }
          >;
          clients?: Array<
            Partial<Client> & { id: string; name: string; phone: string }
          >;
          appointments?: Appointment[];
          cancellationPolicy?: CancellationPolicy;
          waitlist?: WaitlistEntry[];
          storefront?: PublicStorefront;
          reminderTemplates?: ReminderTemplate[];
          teamInvites?: TeamInvite[];
          pushPreferences?: PushPreference;
          notifications?: AppNotification[];
          reviews?: Review[];
          gallery?: GalleryItem[];
        } | null;
        if (!p) return persisted as never;
        if (p.profile) {
          p.profile = migrateProfile(p.profile);
        }
        if (p.professionals) {
          p.professionals = migrateProfessionals(p.professionals);
          if (
            p.profile &&
            p.profile.role === 'empresa' &&
            !p.profile.activeProfessionalId
          ) {
            const admin = p.professionals.find((x) => x.teamRole === 'admin');
            p.profile.activeProfessionalId =
              admin?.id ?? p.professionals[0]?.id ?? null;
          }
        }
        if (p.clients) {
          p.clients = p.clients.map(migrateClientShape);
        }
        const profileForDefaults = p.profile
          ? migrateProfile(p.profile)
          : defaultProfile;
        if (!p.cancellationPolicy) {
          p.cancellationPolicy = defaultCancellationPolicy();
        }
        if (!p.waitlist) p.waitlist = [];
        if (!p.storefront) {
          p.storefront = defaultStorefront(profileForDefaults);
        }
        if (!p.reminderTemplates?.length) {
          p.reminderTemplates = defaultReminderTemplates();
        }
        if (!p.teamInvites) p.teamInvites = [];
        if (!p.pushPreferences) {
          p.pushPreferences = defaultPushPreferences();
        } else {
          p.pushPreferences = {
            ...defaultPushPreferences(),
            ...p.pushPreferences,
          };
        }
        if (!p.notifications) p.notifications = [];
        if (!p.reviews) p.reviews = [];
        if (!p.gallery) p.gallery = [];
        return p as never;
      },
      onRehydrateStorage: () => (state) => {
        if (state?.profile) {
          state.profile = migrateProfile(
            state.profile as Partial<Profile> & { businessType?: string }
          );
        }
        if (state?.professionals) {
          state.professionals = migrateProfessionals(state.professionals);
        }
        if (state?.clients) {
          state.clients = state.clients.map(migrateClientShape);
        }
        if (state && !state.cancellationPolicy) {
          state.cancellationPolicy = defaultCancellationPolicy();
        }
        if (state && !state.reminderTemplates?.length) {
          state.reminderTemplates = defaultReminderTemplates();
        }
        if (state && !state.storefront) {
          state.storefront = defaultStorefront(
            state.profile ?? defaultProfile
          );
        }
        if (state && !state.waitlist) state.waitlist = [];
        if (state) {
          const st = state as {
            appearance?: AppearanceMode;
            profile?: { colorScheme?: AppearanceMode };
          };
          if (!st.appearance) {
            st.appearance =
              st.profile?.colorScheme === 'dark' ||
              st.profile?.colorScheme === 'light'
                ? st.profile.colorScheme
                : 'light';
          } else if (
            st.profile &&
            (st.appearance === 'dark' || st.appearance === 'light')
          ) {
            // keep profile.colorScheme aligned with appearance
            st.profile = {
              ...st.profile,
              colorScheme: st.appearance,
              darkMode: st.appearance === 'dark',
            } as typeof st.profile;
          }
        }
        if (state && !state.teamInvites) state.teamInvites = [];
        if (state && !state.pushPreferences) {
          state.pushPreferences = defaultPushPreferences();
        }
        if (state && !state.notifications) state.notifications = [];
        if (state && !state.reviews) state.reviews = [];
        if (state && !state.gallery) state.gallery = [];
        if (state && !state.depositStatuses) state.depositStatuses = {};
        state?.setHydrated(true);
      },
      partialize: (s) => ({
        profile: s.profile,
        services: s.services,
        professionals: s.professionals,
        clients: s.clients,
        appointments: s.appointments,
        cancellationPolicy: s.cancellationPolicy,
        waitlist: s.waitlist,
        storefront: s.storefront,
        reminderTemplates: s.reminderTemplates,
        teamInvites: s.teamInvites,
        pushPreferences: s.pushPreferences,
        notifications: s.notifications,
        reviews: s.reviews,
        gallery: s.gallery,
        depositStatuses: s.depositStatuses,
      }),
    }
  )
);

export { getActiveProfessional, isEmpresaAdmin };
