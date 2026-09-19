/**
 * Backend DTO bible for AgendaLibre.
 * IDs are string (UUID-ready). Dates are ISO-8601 unless noted YYYY-MM-DD.
 * Money is integer CLP (no decimals).
 *
 * Self-contained: NO imports from @/ Expo paths so the API can mirror these types.
 */

/* ─── Core unions (canonical; data/types re-exports these) ─── */

export type Niche = 'barber' | 'health' | 'beauty' | 'other';
export type ThemeId = 'barber' | 'health' | 'beauty' | 'neutral';
export type UserRole = 'cliente' | 'empresa' | 'persona_natural';
export type AppointmentStatus =
  | 'confirmada'
  | 'pendiente'
  | 'cancelada'
  | 'completada'
  | 'noshow';
export type ServiceIconKey = 'cut' | 'spa' | 'bolt' | 'all';
export type ServiceCategory = 'servicio' | 'paquete' | 'promo';
export type TeamMemberRole = 'admin' | 'trabajador';
export type AuthProvider = 'google' | 'email' | null;

export type WaitlistPeriod = 'morning' | 'afternoon' | 'any';
export type WaitlistStatus = 'waiting' | 'notified' | 'booked' | 'cancelled';
export type ClientRiskFlag = 'ok' | 'watch' | 'high';
export type ReminderKind =
  | 'confirm'
  | 'reminder_24h'
  | 'reminder_2h'
  | 'noshow_followup';
export type ReminderChannel = 'whatsapp' | 'sms' | 'email';
export type ReminderJobStatus = 'pending' | 'sent' | 'failed';
export type TeamInviteRole = 'trabajador' | 'admin';
export type TeamInviteStatus = 'pending' | 'accepted' | 'revoked';
export type DepositProvider = 'none' | 'flow' | 'mercadopago';
export type DepositStatus =
  | 'not_required'
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'forfeited';

/** Local / PoC payment method tags for day cash (no gateway). */
export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'other';

export type AppNotificationKind =
  | 'booking_confirm'
  | 'reminder_24h'
  | 'reminder_2h'
  | 'waitlist'
  | 'review_request'
  | 'team_invite'
  | 'review_received'
  | 'generic';

/* ─── HTTP envelopes ─── */

export interface ApiSuccessMeta {
  requestId?: string;
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface ApiSuccess<T> {
  data: T;
  meta?: ApiSuccessMeta;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiError {
  error: ApiErrorBody;
}

/* ─── Auth ─── */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessId: string | null;
  professionalId: string | null;
  clientId: string | null;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  /** Optional: force mock role when email matches seed */
  roleHint?: UserRole;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  niche?: Niche;
  phone?: string;
}

/* ─── Business / Profile ─── */

/** open/close are HH:mm in America/Santiago (Horario Chile). */
export interface BusinessHours {
  open: string;
  close: string;
  days: number[];
}

export interface Business {
  id: string;
  slug: string;
  name: string;
  niche: Niche;
  /** Alias of niche for vertical-agnostic APIs */
  vertical: string;
  roleKind: 'empresa' | 'persona_natural';
  address: string;
  phone?: string;
  hours: BusinessHours;
  /** YYYY-MM-DD day-offs — no slots generated */
  blockedDates?: string[];
  theme: ThemeId;
  createdAt: string;
  updatedAt: string;
}

/** App profile shape used by Expo PoC (may map 1:1 to Business + AuthUser) */
export type ColorScheme = 'light' | 'dark';

export interface Profile {
  role: UserRole;
  niche: Niche;
  name: string;
  phone?: string;
  theme: ThemeId;
  /** Soft dark mode flag (WCAG-tuned cream/surface inversions) */
  colorScheme?: ColorScheme;
  /** @deprecated alias — prefer colorScheme === 'dark' */
  darkMode?: boolean;
  address: string;
  hours: BusinessHours;
  /** YYYY-MM-DD day-offs / blocked dates (business-level mock) */
  blockedDates?: string[];
  onboardingDone: boolean;
  linkedClientId?: string | null;
  activeProfessionalId: string | null;
  authDone: boolean;
  authProvider: AuthProvider;
  authEmail?: string;
  authName?: string;
  businessId?: string | null;
  /** Google Calendar mock toggle — no OAuth */
  gcalMockEnabled?: boolean;
  /** ISO timestamp of last fake GCal sync */
  gcalLastSyncAt?: string | null;
}

/* ─── Catalog domain ─── */

export interface Service {
  id: string;
  businessId?: string;
  name: string;
  durationMin: number;
  priceClp: number;
  active: boolean;
  depositPercent?: number | null;
  popular?: boolean;
  category?: ServiceCategory;
  iconKey?: ServiceIconKey;
}

export interface Professional {
  id: string;
  businessId?: string;
  name: string;
  role: string;
  teamRole: TeamMemberRole;
  phone?: string;
  active: boolean;
  color?: string;
  /** Optional personal working hours (HH:mm). Falls back to business hours. */
  workStart?: string;
  workEnd?: string;
}

export interface Client {
  id: string;
  businessId?: string;
  name: string;
  phone: string;
  notes?: string;
  email?: string;
  tags?: string[];
  noShowCount: number;
  completedCount: number;
  lastVisitAt?: string;
  riskFlag?: ClientRiskFlag;
}

export interface Appointment {
  id: string;
  businessId?: string;
  serviceId: string;
  professionalId: string | null;
  clientId: string;
  date: string;
  startTime: string;
  status: AppointmentStatus;
  code: string;
  createdAt: string;
  notes?: string;
  /** Mock seña status — never hits a real gateway */
  depositStatus?: DepositStatus;
  /** Mock provider tag (flow / mercadopago / none) */
  depositProvider?: DepositProvider;
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  professionalId: string | null;
  available: boolean;
}

export interface AvailabilityQuery {
  date: string;
  serviceId?: string;
  professionalId?: string;
  businessId?: string;
}

export interface ListQuery {
  businessId?: string;
  page?: number;
  pageSize?: number;
  q?: string;
  active?: boolean;
}

/* ─── High-value DTOs ─── */

export interface CancellationPolicy {
  id: string;
  businessId?: string;
  cancelBeforeHours: number;
  depositPercentDefault: number | null;
  noShowFeePercent: number | null;
  noShowFeeFixedClp: number | null;
  keepDepositOnNoShow: boolean;
  policyText: string;
  updatedAt: string;
}

export interface WaitlistEntry {
  id: string;
  businessId?: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string | null;
  professionalId: string | null;
  preferredDate: string | null;
  preferredPeriod: WaitlistPeriod;
  notes?: string;
  status: WaitlistStatus;
  createdAt: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  notes?: string;
  email?: string;
  tags?: string[];
  noShowCount: number;
  completedCount: number;
  lastVisitAt?: string;
  riskFlag?: ClientRiskFlag;
}

export interface PublicStorefront {
  slug: string;
  businessId?: string;
  displayName: string;
  bio: string;
  niche: Niche;
  address: string;
  coverEmoji?: string;
  coverColor?: string;
  showPrices: boolean;
  showTeam: boolean;
  bookingPath: string;
}

/** Public vitrina payload (enriched) */
export interface PublicStorefrontView {
  storefront: PublicStorefront;
  services: Service[];
  professionals: Professional[];
  reviews: Review[];
  gallery: GalleryItem[];
  policySummary: Pick<
    CancellationPolicy,
    'cancelBeforeHours' | 'depositPercentDefault' | 'policyText'
  > | null;
}

export interface DayCashSummary {
  date: string;
  currency: 'CLP';
  appointmentsCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  grossClp: number;
  depositsHeldClp: number;
  byMethod?: {
    cash: number;
    transfer: number;
    card: number;
    other: number;
  };
  byProfessionalId?: Record<string, number>;
}

export interface ReminderTemplate {
  id: string;
  businessId?: string;
  kind: ReminderKind;
  channel: ReminderChannel;
  body: string;
}

export interface ReminderJob {
  id: string;
  businessId?: string;
  appointmentId: string;
  templateId: string;
  channel: ReminderChannel;
  status: ReminderJobStatus;
  scheduledFor: string;
  sentAt?: string;
}

export interface HonorariosQuote {
  brutoClp: number;
  retentionRate: number;
  retentionClp: number;
  liquidoClp: number;
  year: 2026;
}

export interface HonorariosQuoteRequest {
  brutoClp: number;
  year?: number;
}

export interface TeamInvite {
  id: string;
  businessId?: string;
  code: string;
  businessName: string;
  createdByProfessionalId: string;
  role: TeamInviteRole;
  status: TeamInviteStatus;
  expiresAt: string;
  createdAt: string;
}

export interface DepositRequirement {
  serviceId: string;
  percent: number | null;
  fixedClp: number | null;
  provider: DepositProvider;
  status: DepositStatus;
}

export interface PushPreference {
  bookingConfirm: boolean;
  reminder24h: boolean;
  reminder2h: boolean;
  waitlistOpen: boolean;
  reviewRequest: boolean;
  teamInvite: boolean;
  marketing: boolean;
}

export interface AppNotification {
  id: string;
  businessId?: string;
  userId?: string;
  userRoleTarget?: UserRole | 'all';
  title: string;
  body: string;
  kind: AppNotificationKind;
  relatedAppointmentId?: string;
  relatedReviewId?: string;
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  businessId?: string;
  appointmentId: string;
  clientId: string;
  clientName: string;
  professionalId: string | null;
  serviceId: string | null;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
  reply?: string | null;
  replyAt?: string | null;
  visible: boolean;
}

export interface GalleryItem {
  id: string;
  businessId?: string;
  professionalId: string | null;
  title: string;
  caption?: string;
  imageUri?: string | null;
  placeholderColor: string;
  emoji: string;
  serviceId?: string | null;
  createdAt: string;
  visible: boolean;
}
