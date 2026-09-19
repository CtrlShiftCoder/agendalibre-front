/**
 * Dual-write helpers: prefer mock API when flag on, mirror into Zustand,
 * soft-fallback to local store if API is down.
 */
import {
  appointmentsApi,
  authApi,
  businessesApi,
  cashApi,
  clientsApi,
  galleryApi,
  honorariosApi,
  notificationsApi,
  policiesApi,
  professionalsApi,
  remindersApi,
  reviewsApi,
  servicesApi,
  storefrontApi,
  teamApi,
  waitlistApi,
  ApiClientError,
  clearApiSession,
  setApiSession,
} from '@/api';
import type {
  Appointment,
  BusinessHours,
  GalleryItem,
  HonorariosQuote,
  LoginRequest,
  RegisterRequest,
  ReminderTemplate,
  Review,
  WaitlistEntry,
} from '@/contracts';
import { isApiModeEnabled } from '@/lib/apiMode';
import { useAppStore } from '@/store/useAppStore';
import { clearBusinessCollections, hydrateFromApi } from '@/store/syncFromApi';
import {
  initialDepositStatus,
  resolveSuggestedDeposit,
} from '@/lib/deposit';

function softWarn(scope: string, e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.warn(`[apiActions:${scope}] fallback`, msg);
  }
}

export async function apiLogin(body: LoginRequest) {
  if (!isApiModeEnabled()) {
    useAppStore.getState().signInMock({
      provider: 'email',
      email: body.email,
    });
    return { ok: true as const, offline: true };
  }
  try {
    const res = await authApi.login(body);
    await setApiSession(res.data.token, res.data.user);
    useAppStore.getState().signInMock({
      provider: 'email',
      email: res.data.user.email,
      name: res.data.user.name,
    });
    useAppStore.getState().updateProfile({
      role: res.data.user.role,
      businessId: res.data.user.businessId,
      activeProfessionalId: res.data.user.professionalId,
      linkedClientId: res.data.user.clientId,
      authDone: true,
      onboardingDone: true,
    });
    await hydrateFromApi({ token: res.data.token });
    return { ok: true as const, session: res.data };
  } catch (e) {
    softWarn('login', e);
    useAppStore.getState().signInMock({
      provider: 'email',
      email: body.email,
    });
    return {
      ok: true as const,
      offline: true,
      error: e instanceof ApiClientError ? e.message : 'offline',
    };
  }
}

export async function apiRegister(body: RegisterRequest) {
  if (!isApiModeEnabled()) {
    useAppStore.getState().signInMock({
      provider: 'email',
      email: body.email,
      name: body.name,
    });
    useAppStore.getState().updateProfile({ role: body.role, name: body.name });
    return { ok: true as const, offline: true };
  }
  try {
    const res = await authApi.register(body);
    await setApiSession(res.data.token, res.data.user);
    useAppStore.getState().signInMock({
      provider: 'email',
      email: res.data.user.email,
      name: res.data.user.name,
    });
    clearBusinessCollections();
    useAppStore.getState().updateProfile({
      role: res.data.user.role,
      name: res.data.user.name,
      businessId: res.data.user.businessId,
      activeProfessionalId: res.data.user.professionalId,
      linkedClientId: res.data.user.clientId,
      authDone: true,
      onboardingDone: true,
      niche: body.niche,
    });
    await hydrateFromApi({ token: res.data.token });
    return { ok: true as const, session: res.data };
  } catch (e) {
    softWarn('register', e);
    useAppStore.getState().signInMock({
      provider: 'email',
      email: body.email,
      name: body.name,
    });
    return { ok: true as const, offline: true };
  }
}

export async function apiLogout() {
  await clearApiSession();
  useAppStore.getState().signOutMock();
}

export async function apiCreateAppointment(input: {
  serviceId: string;
  professionalId: string | null;
  clientId: string;
  date: string;
  startTime: string;
}): Promise<Appointment> {
  const local = () => useAppStore.getState().addAppointment(input);
  if (!isApiModeEnabled()) return local();
  try {
    const res = await appointmentsApi.create(input);
    const apt = res.data;
    const st = useAppStore.getState();
    const svc = st.services.find((x) => x.id === apt.serviceId);
    const suggested = resolveSuggestedDeposit(svc, st.cancellationPolicy);
    useAppStore.setState((s) => ({
      appointments: [
        ...s.appointments.filter((a) => a.id !== apt.id),
        {
          id: apt.id,
          serviceId: apt.serviceId,
          professionalId: apt.professionalId,
          clientId: apt.clientId,
          date: apt.date,
          startTime: apt.startTime,
          status: apt.status,
          code: apt.code,
          createdAt: apt.createdAt,
          notes: apt.notes,
        },
      ],
      depositStatuses: {
        ...s.depositStatuses,
        [apt.id]:
          s.depositStatuses[apt.id] ??
          initialDepositStatus(suggested.required),
      },
    }));
    return apt;
  } catch (e) {
    softWarn('createAppointment', e);
    return local();
  }
}

export async function apiUpdateAppointmentStatus(
  id: string,
  status: Appointment['status']
) {
  useAppStore.getState().updateAppointmentStatus(id, status);
  if (!isApiModeEnabled()) return;
  try {
    await appointmentsApi.update(id, { status });
  } catch (e) {
    softWarn('updateAppointmentStatus', e);
  }
}

export async function apiSavePolicy(partial: Record<string, unknown>) {
  useAppStore.getState().updateCancellationPolicy(partial as never);
  if (!isApiModeEnabled()) return;
  try {
    const res = await policiesApi.put(partial);
    useAppStore.setState({ cancellationPolicy: res.data });
  } catch (e) {
    softWarn('policy', e);
  }
}

export async function apiSaveStorefront(partial: Record<string, unknown>) {
  useAppStore.getState().updateStorefront(partial as never);
  if (!isApiModeEnabled()) return;
  try {
    const res = await storefrontApi.put(partial);
    useAppStore.setState({ storefront: res.data });
  } catch (e) {
    softWarn('storefront', e);
  }
}

export async function apiAddWaitlist(
  input: Parameters<ReturnType<typeof useAppStore.getState>['addWaitlistEntry']>[0]
): Promise<WaitlistEntry> {
  const local = () => useAppStore.getState().addWaitlistEntry(input);
  if (!isApiModeEnabled()) return local();
  try {
    const res = await waitlistApi.create({
      clientId: input.clientId,
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      serviceId: input.serviceId ?? null,
      professionalId: input.professionalId ?? null,
      preferredDate: input.preferredDate ?? null,
      preferredPeriod: input.preferredPeriod ?? 'any',
      notes: input.notes,
      status: 'waiting',
    });
    useAppStore.setState((s) => ({
      waitlist: [...s.waitlist.filter((w) => w.id !== res.data.id), res.data],
    }));
    return res.data;
  } catch (e) {
    softWarn('waitlist', e);
    return local();
  }
}

export async function apiQuoteHonorarios(brutoClp: number): Promise<HonorariosQuote> {
  if (!isApiModeEnabled()) {
    const { quoteHonorarios } = await import('@/lib/honorarios');
    return quoteHonorarios(brutoClp);
  }
  try {
    const res = await honorariosApi.quote({ brutoClp });
    return res.data;
  } catch (e) {
    softWarn('honorarios', e);
    const { quoteHonorarios } = await import('@/lib/honorarios');
    return quoteHonorarios(brutoClp);
  }
}

export async function apiCashDay(date: string, professionalId?: string | null) {
  if (!isApiModeEnabled()) return null;
  try {
    const res = await cashApi.day({
      date,
      professionalId: professionalId ?? undefined,
    });
    return res.data;
  } catch (e) {
    softWarn('cash', e);
    return null;
  }
}

export async function apiMarkNotificationRead(id: string) {
  useAppStore.getState().markNotificationRead(id);
  if (!isApiModeEnabled()) return;
  try {
    await notificationsApi.markRead(id);
  } catch (e) {
    softWarn('notifRead', e);
  }
}

export async function apiMarkAllNotificationsRead() {
  useAppStore.getState().markAllRead();
  if (!isApiModeEnabled()) return;
  try {
    await notificationsApi.markAllRead();
  } catch (e) {
    softWarn('notifReadAll', e);
  }
}

export async function apiUpdateReminderTemplate(
  id: string,
  partial: Partial<ReminderTemplate>
) {
  useAppStore.getState().updateReminderTemplate(id, partial);
  if (!isApiModeEnabled()) return;
  try {
    const res = await remindersApi.updateTemplate(id, partial);
    useAppStore.setState((s) => ({
      reminderTemplates: s.reminderTemplates.map((t) =>
        t.id === id ? res.data : t
      ),
    }));
  } catch (e) {
    softWarn('reminderTpl', e);
  }
}

export async function apiCreateService(
  input: Omit<Parameters<ReturnType<typeof useAppStore.getState>['addService']>[0], never>
) {
  useAppStore.getState().addService(input);
  if (!isApiModeEnabled()) return;
  try {
    await servicesApi.create({ ...input, active: true });
    await hydrateFromApi();
  } catch (e) {
    softWarn('service', e);
  }
}

export async function apiCreateClient(input: {
  name: string;
  phone: string;
  notes?: string;
}) {
  const local = () => {
    useAppStore.getState().addClient(input);
    const latest = useAppStore.getState().clients;
    return latest[latest.length - 1]!;
  };
  if (!isApiModeEnabled()) return local();
  try {
    const res = await clientsApi.create(input);
    useAppStore.setState((s) => ({
      clients: [
        ...s.clients.filter((c) => c.id !== res.data.id),
        {
          id: res.data.id,
          name: res.data.name,
          phone: res.data.phone,
          notes: res.data.notes,
          email: res.data.email,
          tags: res.data.tags,
          noShowCount: res.data.noShowCount ?? 0,
          completedCount: res.data.completedCount ?? 0,
          riskFlag: res.data.riskFlag,
        },
      ],
    }));
    return res.data as ReturnType<typeof local>;
  } catch (e) {
    softWarn('client', e);
    return local();
  }
}

export async function apiReplyReview(id: string, reply: string) {
  useAppStore.getState().replyToReview(id, reply);
  if (!isApiModeEnabled()) return;
  try {
    await reviewsApi.update(id, { reply });
  } catch (e) {
    softWarn('review', e);
  }
}

export async function apiToggleReviewVisible(id: string, visible: boolean) {
  useAppStore.getState().setReviewVisible(id, visible);
  if (!isApiModeEnabled()) return;
  try {
    await reviewsApi.update(id, { visible });
  } catch (e) {
    softWarn('reviewVis', e);
  }
}

export async function apiAddGalleryItem(
  input: Omit<GalleryItem, 'id' | 'createdAt'> & { createdAt?: string }
) {
  const local = useAppStore.getState().addGalleryItem(input);
  if (!isApiModeEnabled()) return local;
  try {
    const res = await galleryApi.create(input);
    useAppStore.setState((s) => ({
      gallery: [...s.gallery.filter((g) => g.id !== res.data.id), res.data],
    }));
    return res.data;
  } catch (e) {
    softWarn('gallery', e);
    return local;
  }
}

export async function apiCreateTeamInvite(input: {
  role: 'trabajador' | 'admin';
  createdByProfessionalId: string;
}) {
  const local = useAppStore.getState().createTeamInvite(input);
  if (!isApiModeEnabled()) return local;
  try {
    const res = await teamApi.createInvite({ role: input.role });
    useAppStore.setState((s) => ({
      teamInvites: [...s.teamInvites.filter((i) => i.id !== res.data.id), res.data],
    }));
    return res.data;
  } catch (e) {
    softWarn('teamInvite', e);
    return local;
  }
}

export async function apiAddTeamMember(input: {
  name: string;
  role: string;
  teamRole: 'admin' | 'trabajador';
  phone?: string;
  color?: string;
  workStart?: string;
  workEnd?: string;
}) {
  const local = useAppStore.getState().addTeamMember(input);
  if (!isApiModeEnabled()) return local;
  try {
    const res = await professionalsApi.create({
      name: input.name,
      role: input.role,
      teamRole: input.teamRole,
      phone: input.phone,
      active: true,
      color: input.color,
      workStart: input.workStart,
      workEnd: input.workEnd,
    });
    useAppStore.setState((s) => ({
      professionals: [
        ...s.professionals.filter((p) => p.id !== res.data.id),
        {
          id: res.data.id,
          name: res.data.name,
          role: res.data.role,
          teamRole: res.data.teamRole,
          phone: res.data.phone,
          active: res.data.active,
          color: res.data.color,
          workStart: res.data.workStart,
          workEnd: res.data.workEnd,
        },
      ],
    }));
    return res.data as never;
  } catch (e) {
    softWarn('teamMember', e);
    return local;
  }
}

export async function apiUpdateTeamMember(
  id: string,
  partial: Partial<{
    name: string;
    role: string;
    teamRole: 'admin' | 'trabajador';
    phone: string | undefined;
    active: boolean;
    color: string;
    workStart: string;
    workEnd: string;
  }>
) {
  useAppStore.getState().updateTeamMember(id, partial);
  if (!isApiModeEnabled()) return;
  try {
    const res = await professionalsApi.update(id, partial);
    useAppStore.setState((s) => ({
      professionals: s.professionals.map((p) =>
        p.id === id
          ? {
              ...p,
              name: res.data.name,
              role: res.data.role,
              teamRole: res.data.teamRole,
              phone: res.data.phone,
              active: res.data.active,
              color: res.data.color,
              workStart: res.data.workStart,
              workEnd: res.data.workEnd,
            }
          : p
      ),
    }));
  } catch (e) {
    softWarn('updateTeamMember', e);
  }
}


/** Persist blocked day-offs on profile + optional PATCH /businesses/:id */
export async function apiSetBlockedDates(blockedDates: string[]) {
  const uniq = Array.from(new Set(blockedDates)).sort();
  useAppStore.getState().updateProfile({ blockedDates: uniq });
  if (!isApiModeEnabled()) return;
  const bizId = useAppStore.getState().profile.businessId;
  if (!bizId) return;
  try {
    const res = await businessesApi.update(bizId, { blockedDates: uniq });
    if (Array.isArray(res.data.blockedDates)) {
      useAppStore.getState().updateProfile({
        blockedDates: res.data.blockedDates,
      });
    }
  } catch (e) {
    softWarn('setBlockedDates', e);
  }
}

/** Persist Horario Chile (business window) + optional PATCH /businesses/:id */
export async function apiUpdateBusinessHours(hours: BusinessHours) {
  useAppStore.getState().updateProfile({ hours });
  if (!isApiModeEnabled()) return;
  const bizId = useAppStore.getState().profile.businessId;
  if (!bizId) return;
  try {
    const res = await businessesApi.update(bizId, { hours });
    if (res.data.hours) {
      useAppStore.getState().updateProfile({ hours: res.data.hours });
    }
  } catch (e) {
    softWarn('updateBusinessHours', e);
  }
}

/* ─── Extra dual-writes (audit leftovers) ─── */

export async function apiUpdateService(
  id: string,
  partial: Partial<{
    name: string;
    durationMin: number;
    priceClp: number;
    active: boolean;
    depositPercent: number | null;
    popular: boolean;
    category: string;
  }>
) {
  useAppStore.getState().updateService(id, partial as never);
  if (!isApiModeEnabled()) return;
  try {
    const res = await servicesApi.update(id, partial as never);
    useAppStore.setState((s) => ({
      services: s.services.map((x) =>
        x.id === id
          ? {
              ...x,
              name: res.data.name,
              durationMin: res.data.durationMin,
              priceClp: res.data.priceClp,
              active: res.data.active,
              depositPercent: res.data.depositPercent,
              popular: res.data.popular,
              category: res.data.category,
            }
          : x
      ),
    }));
  } catch (e) {
    softWarn('updateService', e);
  }
}

export async function apiUpdateClient(
  id: string,
  partial: Partial<{
    name: string;
    phone: string;
    notes: string;
    email: string;
    tags: string[];
    noShowCount: number;
    completedCount: number;
    riskFlag: import('@/contracts').ClientRiskFlag;
  }>
) {
  useAppStore.getState().updateClient(id, partial as never);
  if (!isApiModeEnabled()) return;
  try {
    const res = await clientsApi.update(id, partial);
    useAppStore.setState((s) => ({
      clients: s.clients.map((c) =>
        c.id === id
          ? {
              ...c,
              name: res.data.name,
              phone: res.data.phone,
              notes: res.data.notes,
              email: res.data.email ?? c.email,
              tags: res.data.tags ?? c.tags,
              noShowCount: res.data.noShowCount ?? c.noShowCount,
              completedCount: res.data.completedCount ?? c.completedCount,
              riskFlag: res.data.riskFlag ?? c.riskFlag,
            }
          : c
      ),
    }));
  } catch (e) {
    softWarn('updateClient', e);
  }
}

export async function apiSetWaitlistStatus(
  id: string,
  status: WaitlistEntry['status']
) {
  useAppStore.getState().setWaitlistStatus(id, status);
  if (!isApiModeEnabled()) return;
  try {
    const res = await waitlistApi.update(id, { status });
    useAppStore.setState((s) => ({
      waitlist: s.waitlist.map((w) => (w.id === id ? { ...w, ...res.data } : w)),
    }));
  } catch (e) {
    softWarn('waitlistStatus', e);
  }
}

export async function apiUpdateWaitlistEntry(
  id: string,
  partial: Partial<WaitlistEntry>
) {
  useAppStore.getState().updateWaitlistEntry(id, partial);
  if (!isApiModeEnabled()) return;
  try {
    const res = await waitlistApi.update(id, partial);
    useAppStore.setState((s) => ({
      waitlist: s.waitlist.map((w) => (w.id === id ? res.data : w)),
    }));
  } catch (e) {
    softWarn('waitlistUpdate', e);
  }
}

export async function apiRemoveGalleryItem(id: string) {
  useAppStore.getState().removeGalleryItem(id);
  if (!isApiModeEnabled()) return;
  try {
    await galleryApi.remove(id);
  } catch (e) {
    softWarn('galleryRemove', e);
  }
}

export async function apiUpdateGalleryItem(
  id: string,
  partial: Partial<GalleryItem>
) {
  useAppStore.getState().updateGalleryItem(id, partial);
  if (!isApiModeEnabled()) return;
  try {
    const res = await galleryApi.update(id, partial);
    useAppStore.setState((s) => ({
      gallery: s.gallery.map((g) => (g.id === id ? res.data : g)),
    }));
  } catch (e) {
    softWarn('galleryUpdate', e);
  }
}

/* ─── Batch C leftovers: deposit, push prefs, reviews create ─── */

export async function apiSetDepositStatus(
  appointmentId: string,
  status: import('@/contracts').DepositStatus,
  provider?: import('@/contracts').DepositProvider
) {
  useAppStore.getState().setDepositStatus(appointmentId, status);
  if (provider) {
    useAppStore.setState((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === appointmentId
          ? { ...a, depositStatus: status, depositProvider: provider }
          : a
      ),
    }));
  } else {
    useAppStore.setState((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === appointmentId ? { ...a, depositStatus: status } : a
      ),
    }));
  }
  if (!isApiModeEnabled()) return;
  try {
    const body: Record<string, unknown> = { depositStatus: status };
    if (provider) body.depositProvider = provider;
    const res = await appointmentsApi.update(appointmentId, body);
    useAppStore.setState((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              depositStatus: res.data.depositStatus ?? status,
              depositProvider: res.data.depositProvider ?? provider ?? a.depositProvider,
            }
          : a
      ),
      depositStatuses: {
        ...s.depositStatuses,
        [appointmentId]: res.data.depositStatus ?? status,
      },
    }));
  } catch (e) {
    softWarn('setDepositStatus', e);
  }
}

export async function apiUpdatePushPreferences(
  partial: Partial<import('@/contracts').PushPreference>
) {
  useAppStore.getState().updatePushPreferences(partial);
  if (!isApiModeEnabled()) return;
  try {
    const res = await notificationsApi.putPreferences(partial);
    useAppStore.setState({ pushPreferences: res.data });
  } catch (e) {
    softWarn('pushPrefs', e);
  }
}

export async function apiCreateReview(input: {
  appointmentId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
}) {
  const local = () =>
    useAppStore.getState().addReview({
      appointmentId: input.appointmentId,
      rating: input.rating,
      comment: input.comment,
    });
  const created = local();
  if (!created) return null;
  if (!isApiModeEnabled()) return created;
  try {
    const apt = useAppStore
      .getState()
      .appointments.find((a) => a.id === input.appointmentId);
    const profile = useAppStore.getState().profile;
    const res = await reviewsApi.create({
      appointmentId: input.appointmentId,
      rating: input.rating,
      comment: input.comment,
      clientId: apt?.clientId ?? profile.linkedClientId ?? '',
      clientName: profile.name || 'Cliente',
      professionalId: apt?.professionalId ?? null,
      serviceId: apt?.serviceId ?? null,
      visible: true,
    });
    useAppStore.setState((s) => ({
      reviews: [...s.reviews.filter((r) => r.id !== res.data.id), res.data],
    }));
    return res.data;
  } catch (e) {
    softWarn('createReview', e);
    return created;
  }
}
