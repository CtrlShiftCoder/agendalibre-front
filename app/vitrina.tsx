import { Stack, router } from 'expo-router';
import { ArrowLeft, Store } from 'lucide-react-native';
import React, {useMemo, useState} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ShareBookingCard } from '@/components/ShareBookingCard';
import { FadeInView } from '@/components/motion';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { TextField } from '@/components/TextField';
import { canAccess } from '@/lib/access';
import { slugFromName, vitrinaPath } from '@/lib/bookingLink';
import { apiSaveStorefront } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import {useThemeTokens, useColors} from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

export default function VitrinaScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const professionals = useAppStore((s) => s.professionals);
  const storefront = useAppStore((s) => s.storefront);

  const state = useMemo(
    () => ({ profile, professionals }),
    [profile, professionals]
  );
  const allowed = canAccess('vitrinaEdit', state);

  const [displayName, setDisplayName] = useState(storefront.displayName);
  const [bio, setBio] = useState(storefront.bio);
  const [address, setAddress] = useState(storefront.address);
  const [emoji, setEmoji] = useState(storefront.coverEmoji ?? '📅');
  const [showPrices, setShowPrices] = useState(storefront.showPrices);
  const [showTeam, setShowTeam] = useState(storefront.showTeam);

  const save = () => {
    const slug = slugFromName(displayName.trim() || storefront.slug);
    void apiSaveStorefront({
      displayName: displayName.trim() || storefront.displayName,
      bio: bio.trim(),
      address: address.trim(),
      coverEmoji: emoji.trim() || '📅',
      showPrices,
      showTeam,
      slug,
      bookingPath: vitrinaPath(slug),
    });
    Alert.alert('Listo', 'Vitrina actualizada.');
  };

  if (!allowed) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ResponsiveShell style={{ flex: 1, padding: spacing.xl }}>
          <Text style={styles.title}>Sin acceso</Text>
          <Text style={styles.sub}>
            Solo admin de empresa o persona natural pueden editar la vitrina.
          </Text>
          <Button title="Volver" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
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

            <View style={styles.headerRow}>
              <View style={[styles.headerIcon, { backgroundColor: theme.primary }]}>
                <Store size={20} color="#fff" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Vitrina pública</Text>
                <Text style={styles.sub}>
                  Cómo te ven al abrir /v/{storefront.slug}
                </Text>
              </View>
            </View>

            <ShareBookingCard
              businessName={
                displayName.trim() ||
                storefront.displayName ||
                profile.name ||
                'tu negocio'
              }
              link={{
                slug: storefront.slug,
                bookingPath:
                  storefront.bookingPath || vitrinaPath(storefront.slug),
                name:
                  displayName.trim() ||
                  storefront.displayName ||
                  profile.name,
              }}
              subtitle="Comparte tu vitrina: copiá el link o mandalo por WhatsApp"
              previewPath={
                storefront.bookingPath || vitrinaPath(storefront.slug)
              }
            />

            <TextField
              label="Nombre público"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Ej. Barbería Norte"
            />
            <TextField
              label="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              inputStyle={{ minHeight: 80, textAlignVertical: 'top' }}
            />
            <TextField
              label="Dirección"
              value={address}
              onChangeText={setAddress}
            />
            <TextField
              label="Emoji de portada"
              value={emoji}
              onChangeText={setEmoji}
              placeholder="💈"
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Mostrar precios</Text>
              <Switch
                value={showPrices}
                onValueChange={setShowPrices}
                trackColor={{ false: colors.outline, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Mostrar equipo</Text>
              <Switch
                value={showTeam}
                onValueChange={setShowTeam}
                trackColor={{ false: colors.outline, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>

            <Button title="Guardar vitrina" onPress={save} style={{ marginTop: spacing.md }} />
            <Button
              title="Ver vitrina pública"
              variant="secondary"
              onPress={() =>
                router.push(`/v/${storefront.slug}` as never)
              }
              style={{ marginTop: spacing.sm }}
            />
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 52,
  },
  switchLabel: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
    color: c.onSurface,
  },
});
}

