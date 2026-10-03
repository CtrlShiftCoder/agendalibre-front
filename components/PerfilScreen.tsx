import { router } from 'expo-router';
import {
  Bell,
  Calendar,
  CalendarOff,
  ChevronRight,
  Image as ImageIcon,
  ListOrdered,
  LogOut,
  MessageCircle,
  Receipt,
  RefreshCw,
  Shield,
  Star,
  Store,
  Trash2,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import React, {useState, useMemo} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Alert } from '@/lib/Alert';
import { Screen } from '@/components/Screen';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { CoverHero } from '@/components/CoverHero';
import { ShareBookingCard } from '@/components/ShareBookingCard';
import { SectionHeader } from '@/components/SectionHeader';
import { ToastBanner } from '@/components/ToastBanner';
import { formatDateLabel } from '@/data/slots';
import type { Niche, ThemeId } from '@/data/types';
import {
  isProviderRole,
  providerNoun,
  roleLabel,
  teamRoleLabel,
} from '@/data/types';
import { canAccess } from '@/lib/access';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { nicheLabel } from '@/lib/bookingLink';
import {
  POC_RUBRO_CHIPS,
  themeForNiche,
} from '@/lib/nicheVisuals';
import { parseTimeMin } from '@/lib/availability';
import { CHILE_TIMEZONE, HHMM, WORK_HOUR_PRESETS } from '@/lib/chileTime';
import { apiLogout, apiSetBlockedDates, apiUpdateBusinessHours, apiUpdateClient } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import { useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  shadow,
  spacing,
  themes,
  type AppColors,
} from '@/theme/colors';

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function isoTodayOffset(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}


function ToolRow({
  icon: Icon,
  label,
  onPress,
  tint,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  tint: string;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          minHeight: 52,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: radius.lg,
          borderWidth: 1.5,
          borderColor: danger ? colors.danger + '55' : colors.border,
          backgroundColor: colors.white,
          marginTop: spacing.sm,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: danger ? colors.danger + '14' : tint + '18',
        }}
      >
        <Icon
          size={18}
          color={danger ? colors.danger : tint}
          strokeWidth={2.3}
        />
      </View>
      <Text
        style={{
          flex: 1,
          fontFamily: fonts.semibold,
          fontWeight: '600',
          fontSize: fontSize.md,
          color: danger ? colors.danger : colors.onSurface,
        }}
      >
        {label}
      </Text>
      <ChevronRight
        size={18}
        color={colors.onSurfaceVariant}
        strokeWidth={2.2}
      />
    </Pressable>
  );
}

export default function PerfilScreen() {
  const theme = useThemeTokens();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const profile = useAppStore((s) => s.profile);
  const storefront = useAppStore((s) => s.storefront);
  const professionals = useAppStore((s) => s.professionals);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const setAppearance = useAppStore((s) => s.setAppearance);
  const setTheme = useAppStore((s) => s.setTheme);
  const resetAll = useAppStore((s) => s.resetAll);
  const signOutMock = useAppStore((s) => s.signOutMock);
  const provider = isProviderRole(profile.role);
  const nouns = providerNoun(profile.role);
  const activePro = professionals.find(
    (p) => p.id === profile.activeProfessionalId
  );
  const actingLabel = activePro
    ? `Actuando como: ${activePro.name} · ${teamRoleLabel(activePro.teamRole)}`
    : null;
  const teamState = { profile, professionals };
  const showPolitica = canAccess('politica', teamState);
  const showLista = canAccess('listaEspera', teamState);
  const showVitrina = canAccess('vitrinaEdit', teamState);
  const showCaja = canAccess('caja', teamState);
  const showHonorarios = canAccess('honorarios', teamState);
  const showRecordatorios = canAccess('recordatorios', teamState);
  const showResenas = canAccess('resenas', teamState) && profile.role !== 'cliente';
  const showGaleria = canAccess('galeria', teamState) && profile.role !== 'cliente';

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [address, setAddress] = useState(profile.address);
  const [openH, setOpenH] = useState(profile.hours.open);
  const [closeH, setCloseH] = useState(profile.hours.close);
  const [rubroToast, setRubroToast] = useState(false);

  const save = () => {
    if (provider) {
      if (!HHMM.test(openH) || !HHMM.test(closeH)) {
        Alert.alert('Horario inválido', 'Usa formato HH:mm (ej. 09:00).');
        return;
      }
      if (parseTimeMin(closeH) <= parseTimeMin(openH)) {
        Alert.alert(
          'Horario inválido',
          'La hora de cierre debe ser después de la apertura.'
        );
        return;
      }
    }
    const nextName = name.trim() || profile.name;
    updateProfile({
      name: nextName,
      phone: phone.trim(),
      ...(provider ? { address: address.trim() } : {}),
    });
    if (provider) {
      void apiUpdateBusinessHours({
        ...profile.hours,
        open: openH,
        close: closeH,
      });
    }
    if (!provider && profile.linkedClientId) {
      void apiUpdateClient(profile.linkedClientId, {
        name: nextName,
        phone: phone.trim() || '+56900000000',
      });
    }
    Alert.alert('Listo', 'Guardamos tus cambios.');
  };

  const toggleDay = (d: number) => {
    const days = profile.hours.days.includes(d)
      ? profile.hours.days.filter((x) => x !== d)
      : [...profile.hours.days, d].sort();
    void apiUpdateBusinessHours({ ...profile.hours, days });
  };

  const changeProfile = () => {
    Alert.confirm(
      '¿Cambiar perfil?',
      'Vas a volver al onboarding y se borrarán los datos de esta sesión PoC.',
      () => {
        resetAll();
        router.replace('/onboarding');
      },
      { confirmText: 'Cambiar perfil' }
    );
  };

  const logout = () => {
    Alert.alert(
      'Cerrar sesión',
      'Saldrás de la sesión demo. Tus datos locales se mantienen; solo se limpia el flag de auth.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            void apiLogout();
            router.replace('/login');
          },
        },
      ]
    );
  };


  const tryRubro = (niche: Extract<Niche, 'barber' | 'health' | 'beauty'>) => {
    // Prefer niche+theme only — do not reseed services/appointments (keeps citas).
    updateProfile({ niche, theme: themeForNiche(niche) });
    setRubroToast(true);
  };

  const authLabel =
    profile.authProvider === 'google'
      ? 'Google'
      : profile.authProvider === 'email'
        ? 'Correo'
        : 'Demo';

  return (
    <Screen edges={['top']} fade constrainContent>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.sub}>
          {provider
            ? profile.role === 'empresa'
              ? 'Tu negocio, horario y estilo'
              : 'Tu consulta, horario y estilo'
            : 'Tu cuenta de cliente'}
        </Text>

        <View style={[styles.roleBadge, { backgroundColor: theme.surfaceTint }]}>
          <Text style={[styles.roleBadgeText, { color: theme.primary }]}>
            {roleLabel(profile.role)}
          </Text>
        </View>

        <CoverHero
          title={
            profile.name ||
            (provider
              ? profile.role === 'empresa'
                ? 'Tu negocio'
                : 'Tu consulta'
              : 'Tu perfil')
          }
          subtitle={
            provider
              ? `${roleLabel(profile.role)} · ${nicheLabel(profile.niche)}`
              : 'Reservas y datos personales'
          }
          compact
          showAvatar
        />

        {profile.role === 'empresa' ? (
          <View style={[styles.equipoCard, shadow.sm]}>
            {actingLabel ? (
              <Text style={styles.actingText}>{actingLabel}</Text>
            ) : (
              <Text style={styles.actingText}>
                Actuando como: Admin del negocio
              </Text>
            )}
            <Pressable
              onPress={() => router.push('/equipo' as const)}
              style={[styles.equipoBtn, { backgroundColor: theme.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Ir a Equipo"
            >
              <Users size={18} color="#fff" strokeWidth={2.4} />
              <Text style={styles.equipoBtnText}>Equipo</Text>
            </Pressable>
            <Text style={styles.equipoHint}>
              Agrega trabajadores, marca Admin/Trabajador y cambia el perfil
              activo.
            </Text>
          </View>
        ) : null}

        {provider ? (
          <ShareBookingCard
            businessName={
              storefront.displayName || profile.name || nouns.place
            }
            link={{
              slug: storefront.slug,
              bookingPath: storefront.bookingPath || `/v/${storefront.slug}`,
              name: storefront.displayName || profile.name,
            }}
            subtitle={
              profile.role === 'empresa'
                ? 'Tus clientes agendan directo en tu vitrina pública'
                : 'Tus pacientes/clientes agendan en tu consulta'
            }
            previewPath={
              storefront.bookingPath || `/v/${storefront.slug}`
            }
          />
        ) : null}

        <SectionHeader title="Datos básicos" />
        <TextField
          label="Nombre"
          value={name}
          onChangeText={setName}
          placeholder={
            provider
              ? profile.role === 'empresa'
                ? 'Ej. Barbería Norte'
                : 'Ej. Dra. Camila Soto'
              : 'Ej. Ignacio'
          }
        />
        {!provider ? (
          <TextField
            label="Teléfono"
            value={phone}
            onChangeText={setPhone}
            placeholder="+569…"
            keyboardType="phone-pad"
          />
        ) : (
          <TextField
            label="Dirección / lugar"
            value={address}
            onChangeText={setAddress}
            placeholder="Ej. Av. Providencia 1234"
          />
        )}

        {provider ? (
          <>
            <SectionHeader
              title="Horario Chile"
              subtitle="Ventana del negocio — recorta todos los cupos"
            />
            <Text style={styles.tzHint}>{CHILE_TIMEZONE}</Text>
            <View style={styles.days}>
              {dayNames.map((label, i) => {
                const on = profile.hours.days.includes(i);
                return (
                  <Pressable
                    key={label}
                    onPress={() => toggleDay(i)}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    accessibilityState={{ selected: on }}
                    style={[
                      styles.day,
                      on && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        on && { color: theme.onPrimary },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.presetRow}>
              {WORK_HOUR_PRESETS.map((pr) => {
                const on = openH === pr.start && closeH === pr.end;
                return (
                  <Pressable
                    key={pr.label}
                    onPress={() => {
                      setOpenH(pr.start);
                      setCloseH(pr.end);
                      void apiUpdateBusinessHours({
                        ...profile.hours,
                        open: pr.start,
                        close: pr.end,
                      });
                    }}
                    style={[
                      styles.presetChip,
                      on && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`Horario Chile ${pr.label}`}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        on && { color: theme.onPrimary },
                      ]}
                    >
                      {pr.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Abre"
                  value={openH}
                  onChangeText={setOpenH}
                  placeholder="09:00"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Cierra"
                  value={closeH}
                  onChangeText={setCloseH}
                  placeholder="19:00"
                />
              </View>
            </View>

            <SectionHeader
              title="Días bloqueados"
              subtitle="Day-off — sin cupos esos días"
            />
            <View style={styles.blockedHelpers}>
              <Pressable
                onPress={() => {
                  const iso = isoTodayOffset(0);
                  const cur = profile.blockedDates ?? [];
                  if (!cur.includes(iso)) {
                    void apiSetBlockedDates([...cur, iso]);
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel="Bloquear hoy"
                style={[styles.helperChip, { borderColor: theme.primary }]}
              >
                <Text style={[styles.helperChipText, { color: theme.primary }]}>
                  + Hoy
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const iso = isoTodayOffset(1);
                  const cur = profile.blockedDates ?? [];
                  if (!cur.includes(iso)) {
                    void apiSetBlockedDates([...cur, iso]);
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel="Bloquear mañana"
                style={[styles.helperChip, { borderColor: theme.primary }]}
              >
                <Text style={[styles.helperChipText, { color: theme.primary }]}>
                  + Mañana
                </Text>
              </Pressable>
            </View>
            {(profile.blockedDates ?? []).length === 0 ? (
              <Text style={styles.blockedEmpty}>
                Sin días bloqueados. Agrega hoy o mañana, o quita cuando vuelvas.
              </Text>
            ) : (
              <View style={styles.blockedChips}>
                {[...(profile.blockedDates ?? [])]
                  .sort()
                  .map((iso) => (
                    <Pressable
                      key={iso}
                      onPress={() => {
                        const next = (profile.blockedDates ?? []).filter(
                          (d) => d !== iso
                        );
                        void apiSetBlockedDates(next);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Quitar día bloqueado ${formatDateLabel(iso)}`}
                      style={[
                        styles.blockedChip,
                        { backgroundColor: theme.surfaceTint },
                      ]}
                    >
                      <CalendarOff
                        size={14}
                        color={theme.primary}
                        strokeWidth={2.4}
                      />
                      <Text
                        style={[
                          styles.blockedChipText,
                          { color: theme.primary },
                        ]}
                      >
                        {formatDateLabel(iso)}
                      </Text>
                      <Text
                        style={[
                          styles.blockedChipX,
                          { color: theme.primary },
                        ]}
                      >
                        ×
                      </Text>
                    </Pressable>
                  ))}
              </View>
            )}

          </>
        ) : null}

        {provider ? (
          <>
            <SectionHeader
              title="Google Calendar (mock)"
              subtitle="Sin OAuth · solo UI local"
            />
            <View style={styles.darkRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.darkLabel}>Sincronizar agenda (mock)</Text>
                <Text style={styles.darkHint}>
                  {profile.gcalMockEnabled
                    ? profile.gcalLastSyncAt
                      ? `Última sync: ${new Date(profile.gcalLastSyncAt).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`
                      : 'Activado · sin sync aún'
                    : 'Apagado · no conecta a Google'}
                </Text>
              </View>
              <Switch
                value={!!profile.gcalMockEnabled}
                onValueChange={(on) => {
                  useAppStore.getState().updateProfile({
                    gcalMockEnabled: on,
                    gcalLastSyncAt: on
                      ? new Date().toISOString()
                      : profile.gcalLastSyncAt ?? null,
                  });
                }}
                trackColor={{ false: colors.outline, true: theme.primary }}
                thumbColor="#fff"
                accessibilityLabel="Activar Google Calendar mock"
              />
            </View>
            {profile.gcalMockEnabled ? (
              <Button
                title="Simular sync ahora"
                variant="secondary"
                gradient={false}
                style={{ marginTop: spacing.sm }}
                onPress={() => {
                  useAppStore.getState().updateProfile({
                    gcalLastSyncAt: new Date().toISOString(),
                  });
                }}
              />
            ) : null}
          </>
        ) : null}

        <SectionHeader
          title="Tema visual"
          subtitle="Cambia los acentos de la app"
        />
        {(Object.keys(themes) as ThemeId[]).map((id) => (
          <Pressable
            key={id}
            onPress={() => setTheme(id)}
            accessibilityRole="button"
            accessibilityLabel={`Tema ${themes[id].label}`}
            accessibilityState={{ selected: profile.theme === id }}
            style={[
              styles.themeRow,
              profile.theme === id && {
                borderColor: themes[id].accent,
                backgroundColor: '#fff',
              },
            ]}
          >
            <View
              style={[styles.swatch, { backgroundColor: themes[id].accent }]}
            />
            <Text style={styles.themeLabel}>{themes[id].label}</Text>
            {profile.theme === id ? (
              <Text style={{ color: themes[id].accent, fontWeight: '700' }}>
                Activo
              </Text>
            ) : null}
          </Pressable>
        ))}

        <SectionHeader
          title="Probar otro rubro"
          subtitle="Dev / PoC — nicho + tema, sin borrar citas"
        />
        <ToastBanner
          visible={rubroToast}
          message="Rubro actualizado (PoC)"
          variant="success"
          autoHideMs={2500}
          onDismiss={() => setRubroToast(false)}
        />
        <View style={styles.rubroRow}>
          {POC_RUBRO_CHIPS.map((chip) => {
            const on = profile.niche === chip.niche;
            const accent = themes[chip.niche].accent;
            return (
              <Pressable
                key={chip.niche}
                onPress={() => tryRubro(chip.niche)}
                accessibilityRole="button"
                accessibilityLabel={`Probar rubro ${chip.label}`}
                accessibilityState={{ selected: on }}
                style={[
                  styles.rubroChip,
                  on && {
                    backgroundColor: accent,
                    borderColor: accent,
                  },
                ]}
              >
                <View
                  style={[styles.rubroDot, { backgroundColor: on ? '#fff' : accent }]}
                />
                <Text
                  style={[
                    styles.rubroChipText,
                    on && { color: '#fff' },
                  ]}
                >
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isFeatureEnabled('darkModeToggle', { role: profile.role }) ? (
          <>
            <SectionHeader
              title="Apariencia"
              subtitle="Modo oscuro suave (WCAG)"
            />
            <View style={styles.darkRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.darkLabel}>Modo oscuro</Text>
                <Text style={styles.darkHint}>
                  Invierte crema/superficie con contraste AA
                </Text>
              </View>
              <Switch
                value={(profile.colorScheme ?? 'light') === 'dark'}
                onValueChange={(on) =>
                  setAppearance(on ? 'dark' : 'light')
                }
                trackColor={{ false: colors.outline, true: theme.primary }}
                thumbColor="#fff"
                accessibilityLabel="Activar modo oscuro"
              />
            </View>
          </>
        ) : null}

        <Button
          title="Guardar cambios"
          onPress={save}
          style={{ marginTop: spacing.xl }}
        />

        <SectionHeader title="Herramientas" subtitle="Accesos rápidos" />
        {provider ? (
          <>
            {profile.role === 'empresa' ? (
              <ToolRow
                icon={Users}
                label="Equipo"
                tint={theme.primary}
                onPress={() => router.push('/equipo' as const)}
              />
            ) : null}
            {showPolitica ? (
              <ToolRow
                icon={Shield}
                label="Política no-show / seña"
                tint={theme.primary}
                onPress={() => router.push('/politica' as const)}
              />
            ) : null}
            {showLista ? (
              <ToolRow
                icon={ListOrdered}
                label="Lista de espera"
                tint={theme.primary}
                onPress={() => router.push('/lista-espera' as const)}
              />
            ) : null}
            {showVitrina ? (
              <ToolRow
                icon={Store}
                label="Vitrina pública"
                tint={theme.primary}
                onPress={() => router.push('/vitrina' as const)}
              />
            ) : null}
            {showCaja ? (
              <ToolRow
                icon={Wallet}
                label="Caja del día"
                tint={theme.primary}
                onPress={() => router.push('/caja' as const)}
              />
            ) : null}
            {showRecordatorios ? (
              <ToolRow
                icon={MessageCircle}
                label="Recordatorios WhatsApp"
                tint={theme.primary}
                onPress={() => router.push('/recordatorios')}
              />
            ) : null}
            {showHonorarios ? (
              <ToolRow
                icon={Receipt}
                label="Honorarios Chile"
                tint={theme.primary}
                onPress={() => router.push('/honorarios' as const)}
              />
            ) : null}
            {showResenas ? (
              <ToolRow
                icon={Star}
                label="Reseñas"
                tint={theme.primary}
                onPress={() => router.push('/resenas' as const)}
              />
            ) : null}
            {showGaleria ? (
              <ToolRow
                icon={ImageIcon}
                label="Galería de trabajos"
                tint={theme.primary}
                onPress={() => router.push('/galeria' as const)}
              />
            ) : null}
            <ToolRow
              icon={Bell}
              label="Notificaciones"
              tint={theme.primary}
              onPress={() => router.push('/notificaciones' as const)}
            />
          </>
        ) : (
          <>
            <ToolRow
              icon={Calendar}
              label="Reservar una hora"
              tint={theme.primary}
              onPress={() => router.push('/reservar' as const)}
            />
            {showLista ? (
              <ToolRow
                icon={ListOrdered}
                label="Lista de espera"
                tint={theme.primary}
                onPress={() => router.push('/lista-espera' as const)}
              />
            ) : null}
            {profile.linkedClientId ? (
              <ToolRow
                icon={UserRound}
                label="Mi ficha"
                tint={theme.primary}
                onPress={() =>
                  router.push(`/cliente/${profile.linkedClientId}` as never)
                }
              />
            ) : null}
            <ToolRow
              icon={Bell}
              label="Notificaciones"
              tint={theme.primary}
              onPress={() => router.push('/notificaciones' as const)}
            />
          </>
        )}

        <View style={[styles.sessionCard, shadow.sm]}>
          <Text style={styles.sessionTitle}>Sesión (demo)</Text>
          <Text style={styles.sessionSub}>
            {authLabel}
            {profile.authEmail ? ` · ${profile.authEmail}` : ''}
            {profile.authName ? ` · ${profile.authName}` : ''}
          </Text>
          <Text style={styles.sessionHint}>
            Auth UI mock — backend pendiente
          </Text>
        </View>

        <View style={{ marginTop: spacing.md }} />
        <ToolRow
          icon={LogOut}
          label="Cerrar sesión"
          tint={theme.primary}
          onPress={logout}
        />
        <ToolRow
          icon={RefreshCw}
          label="Cambiar perfil"
          tint={theme.primary}
          onPress={changeProfile}
        />
        <ToolRow
          icon={Trash2}
          label="Resetear datos demo"
          tint={colors.danger}
          danger
          onPress={() =>
            Alert.confirm(
              '¿Resetear datos demo?',
              'Se borran onboarding, citas y clientes de esta demo. En el PoC no se pueden recuperar — vuelves al onboarding.',
              () => {
                resetAll();
                router.replace('/onboarding');
              },
              { confirmText: 'Resetear' }
            )
          }
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  darkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: c.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
  },
  darkLabel: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.md,
    color: c.text,
  },
  darkHint: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: c.textMuted,
  },

  safe: { flex: 1, backgroundColor: c.cream },
  scroll: { padding: spacing.xl, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '800', color: c.text },
  sub: { color: c.textMuted, marginBottom: spacing.sm, marginTop: 4 },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
  },
  roleBadgeText: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.xs,
    letterSpacing: 0.3,
  },
  blockedHelpers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  helperChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    borderRadius: radius.full,
    borderWidth: 1.5,
    backgroundColor: c.white,
  },
  helperChipText: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  blockedEmpty: {
    color: c.textMuted,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  blockedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  blockedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    borderRadius: radius.full,
  },
  blockedChipText: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.xs,
  },
  blockedChipX: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 2,
  },
  tzHint: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: fontSize.xs,
    color: c.textMuted,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 40,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.white,
  },
  presetChipText: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.xs,
    color: c.onSurface,
  },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  day: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  dayText: { fontWeight: '700', color: c.text, fontSize: 12 },
  row: { flexDirection: 'row', gap: spacing.md },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.white,
    marginBottom: spacing.sm,
    minHeight: 52,
  },
  swatch: { width: 24, height: 24, borderRadius: 12 },
  themeLabel: { flex: 1, fontWeight: '700', color: c.text },
  rubroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  rubroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.white,
  },
  rubroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rubroChipText: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  equipoCard: {
    backgroundColor: c.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  actingText: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  equipoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
  },
  equipoBtnText: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  equipoHint: {
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: fontSize.xs,
    color: c.onSurfaceVariant,
  },
  sessionCard: {
    backgroundColor: c.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: 4,
  },
  sessionTitle: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.md,
    color: c.onSurface,
  },
  sessionSub: {
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  sessionHint: {
    marginTop: 4,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: fontSize.xs,
    color: c.placeholder,
  },
});
}

