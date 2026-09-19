import { Stack, router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, ImagePlus, Trash2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FadeInView } from '@/components/motion';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { ListSkeleton, useListBoot } from '@/components/Skeleton';
import { TextField } from '@/components/TextField';
import { Alert } from '@/lib/Alert';
import { MOCK_PHOTO_PRESETS } from '@/lib/mockGalleryPhotos';
import { canAccess, isEmpresaAdmin } from '@/lib/access';
import {
  apiAddGalleryItem,
  apiRemoveGalleryItem,
  apiUpdateGalleryItem,
} from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import { useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

/** PoC placeholder presets — no real image picker / cloud upload. */
const PLACEHOLDER_COLORS = [
  '#06C167',
  '#047857',
  '#0D9488',
  '#10B981',
  '#059669',
  '#34D399',
  '#14B8A6',
  '#0F766E',
];
const EMOJIS = [
  '✂️',
  '✨',
  '💅',
  '🩺',
  '📷',
  '⭐',
  '🧔',
  '💇',
  '🧴',
  '🎨',
  '🦶',
  '👑',
];

export default function GaleriaScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const booting = useListBoot();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const gallery = useAppStore((s) => s.gallery);

  const state = useMemo(
    () => ({ profile, professionals }),
    [profile, professionals]
  );
  const access = canAccess('galeria', state);
  const admin =
    profile.role === 'persona_natural' ||
    (profile.role === 'empresa' && isEmpresaAdmin(state));
  const trabajadorOwn = profile.role === 'empresa' && !isEmpresaAdmin(state);

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [emoji, setEmoji] = useState('✨');
  const [color, setColor] = useState(PLACEHOLDER_COLORS[0]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [visibleOnCreate, setVisibleOnCreate] = useState(true);

  const visibleItems = useMemo(() => {
    if (trabajadorOwn && profile.activeProfessionalId) {
      return gallery.filter(
        (g) =>
          g.professionalId === profile.activeProfessionalId ||
          g.professionalId === null
      );
    }
    return gallery;
  }, [gallery, trabajadorOwn, profile.activeProfessionalId]);

  /** 2-col grid: shell padding + gap between cards. */
  const colGap = spacing.sm;
  const shellPad = spacing.xl * 2;
  const cardW = Math.max(140, Math.floor((Math.min(width, 720) - shellPad - colGap) / 2));

  if (!access || profile.role === 'cliente') {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ResponsiveShell style={{ flex: 1, padding: spacing.xl }}>
          <Text style={styles.title}>Sin acceso</Text>
          <Text style={styles.sub}>
            La galería se edita desde el perfil proveedor. El público la ve en
            la vitrina.
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

  const canEdit = admin || trabajadorOwn;

  const add = () => {
    if (!title.trim()) {
      Alert.alert('Falta título', 'Ponle un nombre al trabajo.');
      return;
    }
    void apiAddGalleryItem({
      professionalId: profile.activeProfessionalId,
      title: title.trim(),
      caption: caption.trim() || undefined,
      imageUri,
      placeholderColor: color,
      emoji,
      serviceId: null,
      visible: visibleOnCreate,
    });
    setTitle('');
    setCaption('');
    setImageUri(null);
    setVisibleOnCreate(true);
    Alert.alert('Listo', 'Agregamos el trabajo a tu galería.');
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
              <View
                style={[styles.headerIcon, { backgroundColor: theme.primary }]}
              >
                <ImagePlus size={20} color="#fff" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Galería de trabajos</Text>
                <Text style={styles.sub}>
                  PoC sin cloud upload — emoji/color o foto mock (picsum).
                  Se muestra en la vitrina.
                </Text>
              </View>
            </View>

            {canEdit ? (
              <Card style={styles.form} elevated>
                <Text style={styles.formTitle}>Nuevo trabajo</Text>
                <TextField
                  label="Título"
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ej. Fade premium"
                />
                <TextField
                  label="Leyenda"
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="Detalle opcional"
                />

                <Text style={styles.miniLabel}>Emoji</Text>
                <View style={styles.chipRow}>
                  {EMOJIS.map((e) => (
                    <Pressable
                      key={e}
                      onPress={() => setEmoji(e)}
                      style={[
                        styles.emojiChip,
                        emoji === e && {
                          borderColor: theme.primary,
                          backgroundColor: theme.surfaceTint,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: emoji === e }}
                      accessibilityLabel={`Emoji ${e}`}
                    >
                      <Text style={{ fontSize: 18 }}>{e}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.miniLabel}>Color</Text>
                <View style={styles.chipRow}>
                  {PLACEHOLDER_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setColor(c)}
                      style={[
                        styles.colorChip,
                        { backgroundColor: c },
                        color === c && styles.colorChipOn,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: color === c }}
                      accessibilityLabel={`Color ${c}`}
                    />
                  ))}
                </View>

                <Text style={styles.miniLabel}>Foto mock (HTTPS)</Text>
                <View style={styles.chipRow}>
                  <Pressable
                    onPress={() => setImageUri(null)}
                    style={[
                      styles.photoChip,
                      imageUri == null && {
                        borderColor: theme.primary,
                        backgroundColor: theme.surfaceTint,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: imageUri == null }}
                  >
                    <Text style={styles.photoChipText}>Solo emoji</Text>
                  </Pressable>
                  {MOCK_PHOTO_PRESETS.map((p) => {
                    const on = imageUri === p.uri;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => setImageUri(p.uri)}
                        style={[
                          styles.photoChip,
                          on && {
                            borderColor: theme.primary,
                            backgroundColor: theme.surfaceTint,
                          },
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={p.label}
                      >
                        <Image
                          source={{ uri: p.uri }}
                          style={styles.photoThumb}
                        />
                        <Text style={styles.photoChipText}>{p.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.previewRow}>
                  <View style={[styles.previewThumb, { backgroundColor: color }]}>
                    {imageUri ? (
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.previewImg}
                      />
                    ) : (
                      <Text style={styles.previewEmoji}>{emoji}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.previewHint}>Vista previa</Text>
                    <Text style={styles.previewTitle} numberOfLines={1}>
                      {title.trim() || 'Sin título'}
                    </Text>
                    {caption.trim() ? (
                      <Text style={styles.previewCap} numberOfLines={2}>
                        {caption.trim()}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.switchInline}>
                  <Text style={styles.switchLbl}>Visible en vitrina</Text>
                  <Switch
                    value={visibleOnCreate}
                    onValueChange={setVisibleOnCreate}
                    trackColor={{
                      false: colors.outline,
                      true: theme.primary,
                    }}
                    thumbColor="#fff"
                    accessibilityLabel="Visible en vitrina"
                  />
                </View>

                <Button
                  title="Agregar a galería"
                  onPress={add}
                  style={{ marginTop: spacing.md }}
                />
              </Card>
            ) : null}

            {booting ? (
              <ListSkeleton rows={3} variant="card" />
            ) : visibleItems.length === 0 ? (
              <EmptyState
                icon="image"
                title="Galería vacía"
                subtitle="Muestra tu trabajo en la vitrina — elige emoji + color altiro."
              />
            ) : (
              <View style={[styles.grid, { gap: colGap }]}>
                {visibleItems.map((g) => {
                  const canManage =
                    admin ||
                    (trabajadorOwn &&
                      g.professionalId === profile.activeProfessionalId);
                  return (
                    <Card
                      key={g.id}
                      style={{ ...styles.gridCard, width: cardW }}
                      elevated
                    >
                      <View
                        style={[
                          styles.gridThumb,
                          { backgroundColor: g.placeholderColor },
                        ]}
                      >
                        {g.imageUri ? (
                          <Image
                            source={{ uri: g.imageUri }}
                            style={styles.gridImg}
                            accessibilityLabel={g.title}
                          />
                        ) : (
                          <Text style={styles.gridEmoji}>{g.emoji}</Text>
                        )}
                        {!g.visible ? (
                          <View style={styles.hiddenBadge}>
                            <EyeOff size={12} color="#fff" strokeWidth={2.4} />
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {g.title}
                      </Text>
                      {g.caption ? (
                        <Text style={styles.itemCap} numberOfLines={2}>
                          {g.caption}
                        </Text>
                      ) : null}
                      <Text style={styles.itemMeta}>
                        {g.visible ? 'Visible' : 'Oculto'}
                      </Text>
                      {canManage ? (
                        <View style={styles.gridActions}>
                          <Pressable
                            onPress={() =>
                              void apiUpdateGalleryItem(g.id, {
                                visible: !g.visible,
                              })
                            }
                            style={styles.iconBtn}
                            accessibilityLabel={
                              g.visible ? 'Ocultar' : 'Mostrar'
                            }
                            accessibilityRole="button"
                          >
                            {g.visible ? (
                              <Eye
                                size={18}
                                color={theme.primary}
                                strokeWidth={2.2}
                              />
                            ) : (
                              <EyeOff
                                size={18}
                                color={colors.onSurfaceVariant}
                                strokeWidth={2.2}
                              />
                            )}
                          </Pressable>
                          <Pressable
                            onPress={() =>
                              Alert.confirm(
                                '¿Eliminar de la galería?',
                                'Se quita este trabajo de la vitrina. En el PoC no se puede recuperar.',
                                () => void apiRemoveGalleryItem(g.id),
                                { confirmText: 'Eliminar' }
                              )
                            }
                            style={styles.iconBtn}
                            accessibilityLabel="Eliminar"
                          >
                            <Trash2
                              size={18}
                              color={colors.danger}
                              strokeWidth={2.2}
                            />
                          </Pressable>
                        </View>
                      ) : null}
                    </Card>
                  );
                })}
              </View>
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
    headerRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.lg,
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
    form: { marginBottom: spacing.xl },
    formTitle: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.md,
      color: c.onSurface,
      marginBottom: spacing.sm,
    },
    miniLabel: {
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.xs,
      color: c.onSurfaceVariant,
      marginBottom: 6,
      marginTop: 4,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: spacing.sm,
    },
    emojiChip: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.white,
      borderWidth: 1.5,
      borderColor: c.outline + '44',
    },
    colorChip: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    colorChipOn: {
      borderWidth: 3,
      borderColor: '#fff',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 2,
    },
    previewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: c.surfaceContainerLow,
    },
    previewThumb: {
      width: 56,
      height: 56,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    previewEmoji: { fontSize: 24 },
    previewHint: {
      fontFamily: fonts.medium,
      fontSize: fontSize.xs,
      color: c.textMuted,
    },
    previewTitle: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.sm,
      color: c.onSurface,
      marginTop: 2,
    },
    previewCap: {
      fontFamily: fonts.medium,
      fontSize: fontSize.xs,
      color: c.onSurfaceVariant,
      marginTop: 2,
    },
    switchInline: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
      marginTop: 4,
    },
    switchLbl: {
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.sm,
      color: c.onSurface,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    gridCard: {
      marginBottom: 0,
      paddingBottom: spacing.sm,
    },
    photoChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: c.outline + '44',
      backgroundColor: c.white,
      minHeight: 40,
    },
    photoThumb: { width: 24, height: 24, borderRadius: 6 },
    photoChipText: {
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.xs,
      color: c.onSurface,
    },
    previewImg: {
      width: 56,
      height: 56,
      borderRadius: radius.md,
    },
    gridThumb: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
      overflow: 'hidden',
    },
    gridImg: {
      ...StyleSheet.absoluteFill,
      width: '100%',
      height: '100%',
    },
    gridEmoji: { fontSize: 36 },
    hiddenBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemTitle: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.sm,
      color: c.onSurface,
    },
    itemCap: {
      marginTop: 2,
      fontFamily: fonts.medium,
      fontSize: fontSize.xs,
      color: c.onSurfaceVariant,
    },
    itemMeta: {
      marginTop: 4,
      fontSize: 10,
      color: c.textMuted,
      fontFamily: fonts.medium,
    },
    gridActions: {
      marginTop: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 4,
    },
    iconBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
