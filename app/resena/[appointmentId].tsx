import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import React, {useMemo, useState} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { SuccessLottie } from '@/components/SuccessLottie';
import { FadeInView } from '@/components/motion';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { TextField } from '@/components/TextField';
import { formatLongDate } from '@/data/slots';
import { canAccess } from '@/lib/access';
import { apiCreateReview } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import {useThemeTokens, useColors} from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

export default function DejarResenaScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const appointments = useAppStore((s) => s.appointments);
  const services = useAppStore((s) => s.services);
  const reviews = useAppStore((s) => s.reviews);
  const appointment = useMemo(
    () => appointments.find((a) => a.id === appointmentId),
    [appointments, appointmentId]
  );
  const service = useMemo(
    () => services.find((x) => x.id === appointment?.serviceId),
    [services, appointment?.serviceId]
  );

  const state = useMemo(
    () => ({ profile, professionals }),
    [profile, professionals]
  );
  const allowed = canAccess('dejarResena', state);

  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const already = reviews.some((r) => r.appointmentId === appointmentId);

  const submit = async () => {
    if (!appointmentId) return;
    const r = await apiCreateReview({
      appointmentId,
      rating,
      comment,
    });
    if (!r) {
      Alert.alert(
        'No se pudo guardar',
        'La cita debe estar completada y sin reseña previa.'
      );
      return;
    }
    setSubmitted(true);
  };

  if (!allowed) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ResponsiveShell style={{ flex: 1, padding: spacing.xl }}>
          <Text style={styles.title}>Sin acceso</Text>
          <Text style={styles.sub}>Solo clientes pueden dejar reseñas.</Text>
          <Button title="Volver" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </ResponsiveShell>
      </View>
    );
  }

  if (
    !appointment ||
    appointment.status !== 'completada' ||
    appointment.clientId !== profile.linkedClientId
  ) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ResponsiveShell style={{ flex: 1, padding: spacing.xl }}>
          <Text style={styles.title}>Cita no disponible</Text>
          <Text style={styles.sub}>
            Solo puedes reseñar tus citas completadas.
          </Text>
          <Button title="Volver" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </ResponsiveShell>
      </View>
    );
  }

  if (already && !submitted) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ResponsiveShell style={{ flex: 1, padding: spacing.xl }}>
          <Text style={styles.title}>Ya dejaste tu reseña</Text>
          <Text style={styles.sub}>Gracias por tu feedback.</Text>
          <Button title="Volver" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </ResponsiveShell>
      </View>
    );
  }

  if (submitted) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ResponsiveShell style={{ flex: 1, padding: spacing.xl }}>
          <FadeInView preset="fade" duration={420}>
            <SuccessLottie size={88} style={{ marginBottom: spacing.md }} />
            <Text style={styles.title}>¡Gracias!</Text>
            <Text style={styles.sub}>Tu reseña quedó publicada.</Text>
            <View style={styles.successStars} accessibilityLabel={`${rating} estrellas`}>
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <Star
                  key={n}
                  size={28}
                  color={n <= rating ? theme.primary : colors.onSurfaceVariant}
                  fill={n <= rating ? theme.primary : 'transparent'}
                  strokeWidth={2.2}
                />
              ))}
            </View>
            <Button
              title="Listo"
              onPress={() => router.back()}
              style={{ marginTop: spacing.lg }}
            />
          </FadeInView>
        </ResponsiveShell>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ResponsiveShell style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <FadeInView>
            <Pressable onPress={() => router.back()} style={styles.backRow}>
              <ArrowLeft size={20} color={colors.onSurface} strokeWidth={2.4} />
              <Text style={styles.backText}>Volver</Text>
            </Pressable>

            <Text style={styles.title}>¿Cómo estuvo tu cita?</Text>
            <Text style={styles.sub}>
              {service?.name ?? 'Servicio'} · {formatLongDate(appointment.date)}{' '}
              {appointment.startTime}
            </Text>

            <Text style={styles.label}>Tu nota</Text>
            <View style={styles.stars}>
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <Pressable
                  key={n}
                  onPress={() => setRating(n)}
                  hitSlop={6}
                  style={[
                    styles.starBtn,
                    n <= rating && { backgroundColor: theme.primary },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: n <= rating }}
                  accessibilityLabel={`${n} estrellas`}
                >
                  <Star
                    size={24}
                    color={n <= rating ? '#fff' : colors.onSurfaceVariant}
                    fill={n <= rating ? '#fff' : 'transparent'}
                    strokeWidth={2.2}
                  />
                </Pressable>
              ))}
            </View>

            <TextField
              label="Comentario (opcional)"
              value={comment}
              onChangeText={setComment}
              placeholder="Cuéntanos qué te gustó…"
              multiline
              numberOfLines={4}
              inputStyle={{ minHeight: 100, textAlignVertical: 'top' }}
            />

            <Button title="Enviar reseña" onPress={submit} style={{ marginTop: spacing.md }} />
          </FadeInView>
        </ScrollView>
      </ResponsiveShell>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.surface },
  scroll: { padding: spacing.xl },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
    minHeight: 44,
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  title: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: 22,
    color: c.onSurface,
  },
  sub: {
    marginTop: 6,
    marginBottom: spacing.xl,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  label: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
    color: c.onSurface,
    marginBottom: spacing.sm,
  },
  stars: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  starBtn: {
    minWidth: 44,
    minHeight: 44,
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.outline + '55',
  },
  successStars: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    alignItems: 'center',
  },
});
}

