import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Copy,
  Pencil,
  Phone,
  Share2,
  Trash2,
  UserCircle2,
  UserPlus,
  Users,
} from 'lucide-react-native';
import React, {useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { TextField } from '@/components/TextField';
import { ToastBanner } from '@/components/ToastBanner';
import type { Professional, TeamMemberRole } from '@/data/types';
import { teamRoleLabel } from '@/data/types';
import { Alert } from '@/lib/Alert';
import { canAccess } from '@/lib/access';
import { HHMM, WORK_HOUR_PRESETS } from '@/lib/chileTime';
import { isEmpresaAdmin } from '@/lib/team';
import { copyOrShare, openWhatsApp } from '@/lib/whatsapp';
import {
  apiAddTeamMember,
  apiCreateTeamInvite,
  apiUpdateTeamMember,
} from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import {useThemeTokens, useColors} from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  shadow,
  spacing,
  type AppColors,
} from '@/theme/colors';

export default function EquipoScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const removeTeamMember = useAppStore((s) => s.removeTeamMember);
  const setActiveProfessional = useAppStore((s) => s.setActiveProfessional);
  const teamInvites = useAppStore((s) => s.teamInvites);
  const revokeTeamInvite = useAppStore((s) => s.revokeTeamInvite);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [cargo, setCargo] = useState('');
  const [phone, setPhone] = useState('');
  const [teamRole, setTeamRole] = useState<TeamMemberRole>('trabajador');
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('19:00');
  const [copiedToast, setCopiedToast] = useState(false);

  const isEmpresa = profile.role === 'empresa';
  const activeId = profile.activeProfessionalId;

  const members = useMemo(
    () =>
      [...professionals].sort((a, b) => {
        if (a.teamRole === b.teamRole) return a.name.localeCompare(b.name);
        return a.teamRole === 'admin' ? -1 : 1;
      }),
    [professionals]
  );

  const canManage = isEmpresaAdmin({ profile, professionals });
  const canInvite = canAccess('invitarTrabajador', { profile, professionals });
  const pendingInvites = useMemo(
    () => teamInvites.filter((i) => i.status === 'pending'),
    [teamInvites]
  );

  const copyInviteCode = async (code: string) => {
    await copyOrShare(code, 'Código de invitación');
    setCopiedToast(true);
  };

  const generateInvite = async () => {
    const createdBy =
      profile.activeProfessionalId ??
      professionals.find((p) => p.teamRole === 'admin')?.id ??
      '';
    const invite = await apiCreateTeamInvite({
      role: 'trabajador',
      createdByProfessionalId: createdBy,
    });
    if (!invite) {
      Alert.alert('No se pudo crear', 'Solo un admin puede invitar.');
      return;
    }
    Alert.alert(
      'Invitación creada',
      `Código: ${invite.code}\nVálido 7 días. Comparte por WhatsApp o copia el código.`,
      [
        { text: 'OK' },
        {
          text: 'WhatsApp',
          onPress: () => {
            void openWhatsApp(
              `Te invito al equipo de ${invite.businessName} en AgendaLibre.\nCódigo: ${invite.code}\n(PoC local — sin backend aún)`
            );
          },
        },
        {
          text: 'Copiar',
          onPress: () => {
            void copyInviteCode(invite.code);
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCargo('');
    setPhone('');
    setTeamRole('trabajador');
    setWorkStart('09:00');
    setWorkEnd('19:00');
  };

  const openAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (m: Professional) => {
    setEditingId(m.id);
    setName(m.name);
    setCargo(m.role);
    setPhone(m.phone ?? '');
    setTeamRole(m.teamRole);
    setWorkStart(m.workStart ?? profile.hours.open ?? '09:00');
    setWorkEnd(m.workEnd ?? profile.hours.close ?? '19:00');
    setModalOpen(true);
  };

  const submitMember = async () => {
    if (!name.trim()) {
      Alert.alert('Falta el nombre', 'Escribe el nombre del trabajador.');
      return;
    }
    if (!HHMM.test(workStart) || !HHMM.test(workEnd)) {
      Alert.alert('Horario inválido', 'Usa formato HH:mm (ej. 09:00).');
      return;
    }
    if (editingId) {
      await apiUpdateTeamMember(editingId, {
        name: name.trim(),
        role: cargo.trim() || 'Profesional',
        teamRole,
        phone: phone.trim() || undefined,
        workStart,
        workEnd,
      });
      setModalOpen(false);
      resetForm();
      return;
    }
    const created = await apiAddTeamMember({
      name: name.trim(),
      role: cargo.trim() || 'Profesional',
      teamRole,
      phone: phone.trim() || undefined,
      workStart,
      workEnd,
    });
    if (!created) {
      Alert.alert(
        'No se pudo agregar',
        'Solo un admin de empresa puede agregar trabajadores.'
      );
      return;
    }
    setModalOpen(false);
    resetForm();
  };

  const confirmRemove = (id: string, memberName: string) => {
    Alert.confirm(
      '¿Quitar del equipo?',
      `${memberName} dejará de ver la agenda y los cupos del negocio.`,
      () => {
        const result = removeTeamMember(id);
        if (!result.ok) {
          Alert.alert(
            'No se puede quitar',
            result.error ?? 'No puedes eliminar al último admin.'
          );
        }
      },
      { confirmText: 'Quitar del equipo' }
    );
  };

  if (!isEmpresa) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ResponsiveShell style={styles.shell}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backRow}
            accessibilityLabel="Volver"
          >
            <ArrowLeft size={20} color={colors.onSurface} strokeWidth={2.4} />
            <Text style={styles.backText}>Volver</Text>
          </Pressable>
          <Text style={styles.title}>Equipo</Text>
          <Text style={styles.sub}>
            El equipo solo está disponible para perfiles Empresa. Persona natural
            trabaja sola, sin sub-perfiles.
          </Text>
        </ResponsiveShell>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ResponsiveShell style={styles.shell}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            onPress={() => router.back()}
            style={styles.backRow}
            accessibilityLabel="Volver"
          >
            <ArrowLeft size={20} color={colors.onSurface} strokeWidth={2.4} />
            <Text style={styles.backText}>Volver</Text>
          </Pressable>

          <ToastBanner
            visible={copiedToast}
            message="Copiado"
            variant="success"
            autoHideMs={2500}
            onDismiss={() => setCopiedToast(false)}
          />

          <View style={styles.headerRow}>
            <View
              style={[styles.headerIcon, { backgroundColor: theme.primary }]}
            >
              <Users size={20} color="#fff" strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                Equipo de {profile.name || 'tu negocio'}
              </Text>
              <Text style={styles.sub}>
                Admin y trabajadores · cambia el perfil activo
              </Text>
            </View>
          </View>

          {members.map((m) => {
            const isActive = activeId === m.id;
            const chipBg = m.color ?? theme.primary;
            return (
              <Card key={m.id} style={styles.memberCard} elevated>
                <View style={styles.memberTop}>
                  <View
                    style={[styles.avatar, { backgroundColor: chipBg }]}
                  >
                    <Text style={styles.avatarText}>
                      {(m.name.trim()[0] ?? '?').toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{m.name}</Text>
                    <Text style={styles.memberRole}>{m.role}</Text>
                    {m.phone ? (
                      <View style={styles.phoneRow}>
                        <Phone
                          size={12}
                          color={colors.onSurfaceVariant}
                          strokeWidth={2.2}
                        />
                        <Text style={styles.phoneText}>{m.phone}</Text>
                      </View>
                    ) : null}
                    <Text style={styles.hoursText}>
                      Horario{' '}
                      {m.workStart && m.workEnd
                        ? `${m.workStart}–${m.workEnd}`
                        : `${profile.hours.open}–${profile.hours.close} (negocio)`}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          m.teamRole === 'admin'
                            ? theme.surfaceTint
                            : colors.surfaceContainer,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color:
                            m.teamRole === 'admin'
                              ? colors.primaryText
                              : colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {teamRoleLabel(m.teamRole)}
                    </Text>
                  </View>
                </View>

                <View style={styles.memberActions}>
                  <View style={styles.activeToggle}>
                    <Text style={styles.toggleLabel}>Activo</Text>
                    <Switch
                      value={m.active}
                      disabled={!canManage}
                      onValueChange={(v) => {
                        void apiUpdateTeamMember(m.id, { active: v });
                      }}
                      trackColor={{
                        false: colors.outline,
                        true: theme.primary,
                      }}
                      thumbColor="#fff"
                      accessibilityLabel={`Activo ${m.name}`}
                    />
                  </View>

                  <Pressable
                    onPress={() => setActiveProfessional(m.id)}
                    style={[
                      styles.useBtn,
                      isActive && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                    accessibilityLabel={
                      isActive
                        ? `Perfil activo: ${m.name}`
                        : `Usar este perfil: ${m.name}`
                    }
                  >
                    {isActive ? (
                      <Check size={14} color="#fff" strokeWidth={2.6} />
                    ) : (
                      <UserCircle2
                        size={14}
                        color={colors.primaryText}
                        strokeWidth={2.4}
                      />
                    )}
                    <Text
                      style={[
                        styles.useBtnText,
                        isActive && { color: '#fff' },
                      ]}
                    >
                      {isActive ? 'Perfil activo' : 'Usar este perfil'}
                    </Text>
                  </Pressable>

                  {canManage ? (
                    <Pressable
                      onPress={() => openEdit(m)}
                      style={styles.editBtn}
                      accessibilityLabel={`Editar a ${m.name}`}
                    >
                      <Pencil
                        size={16}
                        color={colors.primaryText}
                        strokeWidth={2.2}
                      />
                    </Pressable>
                  ) : null}

                  {canManage ? (
                    <Pressable
                      onPress={() => confirmRemove(m.id, m.name)}
                      style={styles.removeBtn}
                      accessibilityLabel={`Quitar del equipo a ${m.name}`}
                    >
                      <Trash2
                        size={16}
                        color={colors.danger}
                        strokeWidth={2.2}
                      />
                    </Pressable>
                  ) : null}
                </View>
              </Card>
            );
          })}

          {canManage ? (
            <Button
              title="Agregar trabajador"
              onPress={openAdd}
              style={{ marginTop: spacing.md }}
            />
          ) : (
            <Text style={[styles.sub, { marginTop: spacing.md }]}>
              Solo un Admin puede agregar o quitar trabajadores.
            </Text>
          )}

          {canInvite ? (
            <Card style={{ marginTop: spacing.xl }} elevated>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <UserPlus size={18} color={theme.primary} strokeWidth={2.4} />
                <Text style={[styles.title, { fontSize: 18 }]}>Invitar trabajador</Text>
              </View>
              <Text style={styles.sub}>
                Genera un código INV-XXXXXX (PoC) y compártelo por WhatsApp.
              </Text>
              <Button
                title="Generar invitación"
                onPress={generateInvite}
                style={{ marginTop: spacing.md }}
              />
              {pendingInvites.map((inv) => (
                <View
                  key={inv.id}
                  style={{
                    marginTop: spacing.md,
                    padding: spacing.md,
                    backgroundColor: colors.surfaceContainerLow,
                    borderRadius: radius.md,
                    gap: 6,
                  }}
                >
                  <Text style={{ fontFamily: fonts.bold, fontWeight: '700', color: colors.onSurface }}>
                    {inv.code} · {inv.role}
                  </Text>
                  <Text style={{ fontSize: fontSize.xs, color: colors.onSurfaceVariant }}>
                    Expira {inv.expiresAt.slice(0, 10)}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <Pressable
                      onPress={() => {
                        void copyInviteCode(inv.code);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        minHeight: 44,
                        paddingRight: 8,
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Copiar código de invitación"
                    >
                      <Copy size={14} color={colors.primaryText} strokeWidth={2.4} />
                      <Text style={{ color: colors.primaryText, fontWeight: '600' }}>
                        Copiar
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        void openWhatsApp(
                          `Código equipo ${inv.businessName}: ${inv.code}`
                        )
                      }
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        minHeight: 44,
                      }}
                    >
                      <Share2 size={14} color={colors.primaryText} strokeWidth={2.4} />
                      <Text style={{ color: colors.primaryText, fontWeight: '600' }}>
                        Compartir
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        Alert.confirm(
                          '¿Revocar invitación?',
                          `El código ${inv.code} dejará de servir. Quien no lo usó no podrá unirse.`,
                          () => revokeTeamInvite(inv.id),
                          { confirmText: 'Revocar' }
                        )
                      }
                      style={{ minHeight: 44, justifyContent: 'center' }}
                    >
                      <Text style={{ color: colors.danger, fontWeight: '600' }}>
                        Revocar
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </Card>
          ) : null}
        </ScrollView>
      </ResponsiveShell>

      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.select({ ios: 'padding', android: 'height' })}
        >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={{
                paddingBottom: Math.max(insets.bottom, 16),
              }}
            >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {editingId ? 'Editar miembro' : 'Agregar trabajador'}
            </Text>
            <Text style={styles.modalSub}>
              {editingId
                ? 'Cargo, rol y horario de trabajo (HH:mm)'
                : 'Define cargo, rol y horario de trabajo'}
            </Text>

            <TextField
              label="Nombre"
              value={name}
              onChangeText={setName}
              placeholder="Ej. Camila"
              autoFocus
            />
            <TextField
              label="Cargo"
              value={cargo}
              onChangeText={setCargo}
              placeholder="Ej. Barbero"
            />
            <TextField
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              placeholder="+569… (opcional)"
              keyboardType="phone-pad"
            />

            <Text style={styles.fieldLabel}>Rol en el equipo</Text>
            <View style={styles.roleRow}>
              {(['trabajador', 'admin'] as TeamMemberRole[]).map((r) => {
                const on = teamRole === r;
                return (
                  <Pressable
                    key={r}
                    onPress={() => setTeamRole(r)}
                    style={[
                      styles.roleChip,
                      on && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={teamRoleLabel(r)}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        on && { color: '#fff' },
                      ]}
                    >
                      {teamRoleLabel(r)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Horario de trabajo</Text>
            <View style={styles.presetRow}>
              {WORK_HOUR_PRESETS.map((pr) => {
                const on = workStart === pr.start && workEnd === pr.end;
                return (
                  <Pressable
                    key={pr.label}
                    onPress={() => {
                      setWorkStart(pr.start);
                      setWorkEnd(pr.end);
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
                    accessibilityLabel={`Preset ${pr.label}`}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        on && { color: '#fff' },
                      ]}
                    >
                      {pr.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.hoursRow}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Desde"
                  value={workStart}
                  onChangeText={setWorkStart}
                  placeholder="09:00"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Hasta"
                  value={workEnd}
                  onChangeText={setWorkEnd}
                  placeholder="19:00"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                style={{ flex: 1 }}
                fullWidth={false}
              />
              <Button
                title={editingId ? 'Guardar' : 'Agregar'}
                onPress={submitMember}
                style={{ flex: 1 }}
                fullWidth={false}
              />
            </View>
            </ScrollView>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.surface },
  shell: { flex: 1 },
  scroll: { padding: spacing.xl },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
    minHeight: 44,
  },
  backText: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.bold,
    fontWeight: '800',
    fontSize: 24,
    color: c.onSurface,
  },
  sub: {
    marginTop: 4,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  memberCard: {
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  memberTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  memberName: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.md,
    color: c.onSurface,
  },
  memberRole: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  phoneText: {
    fontSize: fontSize.xs,
    color: c.onSurfaceVariant,
    fontFamily: fonts.medium,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  activeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.xs,
    color: c.onSurfaceVariant,
  },
  useBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: c.primaryText,
    backgroundColor: c.white,
  },
  useBtnText: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.xs,
    color: c.primaryText,
  },
  editBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surfaceContainer,
  },
  removeBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },
  hoursText: {
    marginTop: 4,
    fontSize: fontSize.xs,
    color: c.onSurfaceVariant,
    fontFamily: fonts.medium,
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
    borderColor: c.outline,
    backgroundColor: c.white,
  },
  presetChipText: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.xs,
    color: c.onSurface,
  },
  hoursRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: c.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    maxHeight: '92%',
    ...shadow.sm,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.outline,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontWeight: '800',
    fontSize: 20,
    color: c.onSurface,
  },
  modalSub: {
    marginTop: 4,
    marginBottom: spacing.lg,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  fieldLabel: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
    color: c.onSurface,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  roleChip: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: c.outline,
    backgroundColor: c.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleChipText: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
});
}

