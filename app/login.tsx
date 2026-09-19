import { router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, {useState, useMemo} from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthDivider, AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { GoogleButton } from '@/components/GoogleButton';
import { TextField } from '@/components/TextField';
import { apiLogin } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  spacing,
  type AppColors,
} from '@/theme/colors';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function goAfterAuth() {
  const done = useAppStore.getState().profile.onboardingDone;
  router.replace(done ? '/(tabs)' : '/onboarding');
}

export default function LoginScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const signInMock = useAppStore((s) => s.signInMock);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passError, setPassError] = useState<string | undefined>();

  const validate = () => {
    let ok = true;
    const e = email.trim();
    if (!e || !EMAIL_RE.test(e)) {
      setEmailError('Ingresa un correo válido');
      ok = false;
    } else {
      setEmailError(undefined);
    }
    if (password.length < 6) {
      setPassError('Mínimo 6 caracteres');
      ok = false;
    } else {
      setPassError(undefined);
    }
    return ok;
  };

  const [busy, setBusy] = useState(false);

  const onEmailSubmit = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      await apiLogin({ email: email.trim(), password });
      goAfterAuth();
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = () => {
    signInMock({
      provider: 'google',
      email: email.trim() || 'demo@gmail.com',
      name: 'Usuario Google',
    });
    goAfterAuth();
  };

  return (
    <AuthShell
      title="Inicia sesión"
      subtitle="Mock API · empresa@agendalibre.cl / demo1234"
    >
      <TextField
        label="Correo"
        value={email}
        onChangeText={setEmail}
        placeholder="tu@correo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        error={emailError}
      />
      <TextField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry={!showPass}
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        error={passError}
        rightAccessory={
          <Pressable
            onPress={() => setShowPass((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={
              showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
            hitSlop={8}
            style={styles.eyeBtn}
          >
            {showPass ? (
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
        }
      />

      <Pressable
        onPress={() =>
          Alert.alert('Pronto', 'Pronto — sin backend aún')
        }
        style={styles.forgot}
        accessibilityRole="link"
        accessibilityLabel="¿Olvidaste tu contraseña?"
      >
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </Pressable>

      <Button title={busy ? "Entrando…" : "Entrar"} onPress={onEmailSubmit} disabled={busy} />

      <AuthDivider />

      <GoogleButton onPress={onGoogle} />

      <View style={styles.footer}>
        <Text style={styles.footerMuted}>¿No tienes cuenta? </Text>
        <Pressable
          onPress={() => router.push('/registro')}
          accessibilityRole="link"
          accessibilityLabel="Regístrate"
        >
          <Text style={styles.footerLink}>Regístrate</Text>
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
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: -4,
    minHeight: 44,
    justifyContent: 'center',
  },
  forgotText: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
    color: c.primaryText,
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

