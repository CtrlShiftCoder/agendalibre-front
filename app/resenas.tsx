import { Stack, router } from 'expo-router';
import { ArrowLeft, MessageSquare, Star } from 'lucide-react-native';
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
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ListSkeleton, useListBoot } from '@/components/Skeleton';
import { FadeInView } from '@/components/motion';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { TextField } from '@/components/TextField';
import { canAccess, isEmpresaAdmin } from '@/lib/access';
import { relativeTime } from '@/lib/relativeTime';
import { averageRating, starsLabel } from '@/lib/reviews';
import { apiReplyReview, apiToggleReviewVisible } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import {useThemeTokens, useColors} from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

export default function ResenasScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const booting = useListBoot();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const reviews = useAppStore((s) => s.reviews);
  const services = useAppStore((s) => s.services);

  const state = useMemo(
    () => ({ profile, professionals }),
    [profile, professionals]
  );
  const level = canAccess('resenas', state) ? 'ok' : 'none';
  const manage =
    profile.role === 'persona_natural' ||
    (profile.role === 'empresa' && isEmpresaAdmin(state));
  const readOnly = profile.role === 'empresa' && !isEmpresaAdmin(state);

  const [replyId, setReplyId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const avg = averageRating(reviews);

  if (level === 'none' || profile.role === 'cliente') {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ResponsiveShell style={{ flex: 1, padding: spacing.xl }}>
          <Text style={styles.title}>Reseñas</Text>
          <Text style={styles.sub}>
            Las reseñas públicas se ven en la vitrina. Los proveedores las
            gestionan acá.
          </Text>
          <Button
            title="Volver"
            onPress={() => router.back()}
            style={{ marginTop: spacing.lg }}
          />
        </ResponsiveShell>
      </View>
    );
  }

  const saveReply = () => {
    if (!replyId || !draft.trim()) return;
    void apiReplyReview(replyId, draft.trim());
    setReplyId(null);
    setDraft('');
    Alert.alert('Listo', 'Respuesta publicada.');
  };

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

            <View style={styles.headerRow}>
              <View style={[styles.headerIcon, { backgroundColor: theme.primary }]}>
                <Star size={20} color="#fff" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Reseñas</Text>
                <Text style={styles.sub}>
                  {avg != null
                    ? `Promedio ${avg} · ${starsLabel(avg)}`
                    : 'Aún sin reseñas visibles'}
                  {readOnly ? ' · Solo lectura' : ''}
                </Text>
              </View>
            </View>

            {booting ? (
              <ListSkeleton rows={3} variant="card" />
            ) : reviews.length === 0 ? (
              <EmptyState
                icon="star"
                title="Sin reseñas todavía"
                subtitle="Completa citas y pide reseña — tus clientes dejan ★ acá."
                actionLabel={readOnly ? undefined : 'Ver vitrina'}
                onAction={
                  readOnly
                    ? undefined
                    : () => router.push('/vitrina' as const)
                }
              />
            ) : (
              reviews.map((r) => {
                const svc = services.find((s) => s.id === r.serviceId);
                return (
                  <Card key={r.id} style={styles.card} elevated>
                    <View style={styles.rowBetween}>
                      <Text style={styles.client}>{r.clientName}</Text>
                      <Text style={[styles.rating, { color: theme.primary }]}>
                        {r.rating}★
                      </Text>
                    </View>
                    {svc ? (
                      <Text style={styles.meta}>{svc.name}</Text>
                    ) : null}
                    <Text style={styles.comment}>{r.comment || 'Sin comentario'}</Text>
                    {r.reply ? (
                      <View style={styles.replyBox}>
                        <MessageSquare
                          size={14}
                          color={colors.primaryText}
                          strokeWidth={2.2}
                        />
                        <Text style={styles.replyText}>{r.reply}</Text>
                      </View>
                    ) : null}
                    <Text style={styles.date}>
                      {relativeTime(r.createdAt)}
                      {r.visible ? '' : ' · Oculta'}
                    </Text>

                    {manage ? (
                      <View style={styles.actions}>
                        <Button
                          title={r.visible ? 'Ocultar' : 'Mostrar'}
                          variant="secondary"
                          fullWidth={false}
                          onPress={() => void apiToggleReviewVisible(r.id, !r.visible)}
                          style={{ paddingHorizontal: spacing.md }}
                        />
                        <Button
                          title={r.reply ? 'Editar respuesta' : 'Responder'}
                          fullWidth={false}
                          onPress={() => {
                            setReplyId(r.id);
                            setDraft(r.reply ?? '');
                          }}
                          style={{ paddingHorizontal: spacing.md }}
                        />
                      </View>
                    ) : null}

                    {manage && replyId === r.id ? (
                      <View style={{ marginTop: spacing.sm }}>
                        <TextField
                          label="Tu respuesta"
                          value={draft}
                          onChangeText={setDraft}
                          multiline
                          numberOfLines={3}
                          inputStyle={{ minHeight: 72, textAlignVertical: 'top' }}
                        />
                        <Button title="Publicar respuesta" onPress={saveReply} />
                        <Button
                          title="Cancelar"
                          variant="secondary"
                          onPress={() => {
                            setReplyId(null);
                            setDraft('');
                          }}
                          style={{ marginTop: spacing.sm }}
                        />
                      </View>
                    ) : null}
                  </Card>
                );
              })
            )}
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
  headerRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: 22,
    color: c.onSurface,
  },
  sub: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  card: { marginBottom: spacing.md },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  client: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: fontSize.md,
    color: c.onSurface,
  },
  rating: { fontFamily: fonts.bold, fontWeight: '800', fontSize: fontSize.md },
  meta: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: c.onSurfaceVariant,
  },
  comment: {
    marginTop: spacing.sm,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurface,
    lineHeight: 20,
  },
  replyBox: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: c.surfaceContainerLow,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  replyText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
  date: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    color: c.textMuted,
    fontFamily: fonts.medium,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
}

