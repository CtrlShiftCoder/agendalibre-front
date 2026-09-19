import { router } from 'expo-router';
import { Check, Eye, EyeOff } from 'lucide-react-native';
import React, {useState, useMemo} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthDivider, AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { GoogleButton } from '@/components/GoogleButton';
import { TextField } from '@/components/TextField';
import { apiRegister } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  flujo,
  spacing,
  type AppColors,
} from '@/theme/colors';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function goAfterAuth() {
  const done = useAppStore.getState().profile.onboardingDone;
  router.replace(done ? '/(tabs)' : '/onboarding');
}

export default function RegistroScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const signInMock = useAppStore((s) => s.signInMock);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
    terms?: string;
  }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Ingresa tu nombre';
    const e = email.trim();
    if (!e || !EMAIL_RE.test(e)) next.email = 'Ingresa un correo válido';
    if (password.length < 6) next.password = 'Mínimo 6 caracteres';
    if (confirm !== password) next.confirm = 'Las contraseñas no coinciden';
    if (!acceptTerms) next.terms = 'Debes aceptar los términos';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const [busy, setBusy] = useState(false);

  const onCreate = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      await apiRegister({
        email: email.trim(),
        password,
        name: name.trim(),
        role: 'empresa',
        niche: 'barber',
      });
      goAfterAuth();
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = () => {
    signInMock({
      provider: 'google',
      email: email.trim() || 'demo@gmail.com',
      name: name.trim() || 'Usuario Google',
    });
    goAfterAuth();
  };

  const eye = (
    visible: boolean,
    toggle: () => void,
    labelShow: string,
    labelHide: string
  ) => (
    <Pressable
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={visible ? labelHide : labelShow}
      hitSlop={8}
      style={styles.eyeBtn}
    >
      {visible ? (
        <EyeOff
          size={20}
          color={colors.onSurfaceVariant}
          strokeWidth={2.2}
        />
      ) : (
        <Eye
          size={20}
          color={colors.onSurfaceVariant}
          strokeWidth={2.2}
        />
      )}
    </Pressable>
  );

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Regístrate para empezar. Demo UI — sin backend todavía."
    >
      <TextField
        label="Nombre"
        value={name}
        onChangeText={setName}
        placeholder="Ej. Camila"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        error={errors.name}
      />
      <TextField
        label="Correo"
        value={email}
        onChangeText={setEmail}
        placeholder="tu@correo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        error={errors.email}
      />
      <TextField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholder="Mínimo 6 caracteres"
        secureTextEntry={!showPass}
        autoCapitalize="none"
        autoComplete="password-new"
        textContentType="newPassword"
        error={errors.password}
        rightAccessory={eye(
          showPass,
          () => setShowPass((v) => !v),
          'Mostrar contraseña',
          'Ocultar contraseña'
        )}
      />
      <TextField
        label="Confirmar contraseña"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Repite tu contraseña"
        secureTextEntry={!showConfirm}
        autoCapitalize="none"
        autoComplete="password-new"
        textContentType="newPassword"
        error={errors.confirm}
        rightAccessory={eye(
          showConfirm,
          () => setShowConfirm((v) => !v),
          'Mostrar confirmación',
          'Ocultar confirmación'
        )}
      />

      <Pressable
        onPress={() => setAcceptTerms((v) => !v)}
        style={styles.termsRow}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: acceptTerms }}
        accessibilityLabel="Acepto términos"
      >
        <View
          style={[
            styles.checkbox,
            acceptTerms && {
              backgroundColor: flujo.primary,
              borderColor: flujo.primary,
            },
          ]}
        >
          {acceptTerms ? (
            <Check size={14} color="#fff" strokeWidth={3} />
          ) : null}
        </View>
        <Text style={styles.termsText}>
          Acepto términos y condiciones (demo)
        </Text>
      </Pressable>
      {errors.terms ? (
        <Text style={styles.termsError}>{errors.terms}</Text>
      ) : null}

      <Button
        title={busy ? "Creando…" : "Crear cuenta"}
        onPress={onCreate} disabled={busy}
        style={{ marginTop: spacing.md }}
      />

      <AuthDivider />

      <GoogleButton onPress={onGoogle} />

      <View style={styles.footer}>
        <Text style={styles.footerMuted}>¿Ya tienes cuenta? </Text>
        <Pressable
          onPress={() => router.replace('/login')}
          accessibilityRole="link"
          accessibilityLabel="Inicia sesión"
        >
          <Text style={styles.footerLink}>Inicia sesión</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  eyeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
    marginTop: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: c.outline,
    backgroundColor: c.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  termsError: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: fonts.medium,
    fontWeight: '500',
    color: c.danger,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerMuted: {
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: fontSize.md,
    color: c.onSurfaceVariant,
  },
  footerLink: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.md,
    color: c.primaryText,
  },
});
}

