import { router } from 'expo-router';
import {
  Copy,
  ExternalLink,
  Link2,
  QrCode,
  Send,
  Share2,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookingQrModal } from '@/components/BookingQrModal';
import { ToastBanner } from '@/components/ToastBanner';
import {
  bookingShareMessage,
  bookingShareUrl,
  type PublicLinkInput,
} from '@/lib/bookingLink';
import { copyOrShare, openWhatsApp } from '@/lib/whatsapp';
import { useColors, useThemeTokens } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  flujo,
  radius,
  shadow,
  spacing,
  type AppColors,
} from '@/theme/colors';

export type ShareBookingCardProps = {
  /** Business / vitrina display name for the Chile WhatsApp copy. */
  businessName: string;
  /** Prefer storefront slug + bookingPath (`/v/slug`). */
  link: PublicLinkInput;
  /** Optional subtitle under the title. */
  subtitle?: string;
  /** Deep-link path for “Abrir vista cliente” (default: link path). */
  previewPath?: string;
};

/**
 * “Comparte tu enlace” — copy + WhatsApp with Chile message.
 * Used on Perfil and Vitrina edit.
 */
export function ShareBookingCard({
  businessName,
  link,
  subtitle = 'Tus clientes agendan solos con este link público',
  previewPath,
}: ShareBookingCardProps) {
  const theme = useThemeTokens();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [qrOpen, setQrOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const shareUrl = bookingShareUrl(link);
  const openPath =
    previewPath ??
    (link.bookingPath?.startsWith('/')
      ? link.bookingPath
      : link.slug
        ? `/v/${link.slug}`
        : '/reservar');

  const copyLink = async () => {
    await copyOrShare(shareUrl, 'Link de reserva');
    setCopiedToast(true);
  };

  const shareWhatsApp = () => {
    void openWhatsApp(bookingShareMessage(businessName, shareUrl));
  };

  return (
    <View style={[styles.shareCard, shadow.sm]}>
      <ToastBanner
        visible={copiedToast}
        message="Copiado"
        variant="success"
        autoHideMs={2500}
        onDismiss={() => setCopiedToast(false)}
      />
      <View style={styles.shareHeader}>
        <View style={[styles.shareIcon, { backgroundColor: theme.primary }]}>
          <Share2 size={16} color="#fff" strokeWidth={2.4} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.shareTitle}>Comparte tu enlace</Text>
          <Text style={styles.shareSub}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.urlPill}>
        <Link2 size={16} color={colors.onSurfaceVariant} strokeWidth={2.2} />
        <Text style={styles.urlText} numberOfLines={1}>
          {shareUrl.replace(/^https?:\/\//, '')}
        </Text>
        <Pressable
          onPress={() => {
            void copyLink();
          }}
          style={styles.copyPill}
          accessibilityRole="button"
          accessibilityLabel="Copiar enlace"
        >
          <Copy size={14} color={colors.onSurfaceVariant} strokeWidth={2.4} />
          <Text style={styles.copyPillText}>Copiar</Text>
        </Pressable>
      </View>

      <View style={styles.shareActions}>
        <Pressable
          onPress={shareWhatsApp}
          style={styles.waBtn}
          accessibilityRole="button"
          accessibilityLabel="Enviar por WhatsApp"
        >
          <Send size={16} color="#fff" strokeWidth={2.4} />
          <Text style={styles.waBtnText}>WhatsApp</Text>
        </Pressable>
        <Pressable
          onPress={() => setQrOpen(true)}
          style={styles.qrBtn}
          accessibilityRole="button"
          accessibilityLabel="Código QR"
        >
          <QrCode size={20} color={colors.onSurface} strokeWidth={2.2} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push(openPath as never)}
        style={styles.openClientLink}
        accessibilityRole="link"
        accessibilityLabel="Abrir vista cliente"
      >
        <ExternalLink
          size={14}
          color={colors.primaryText}
          strokeWidth={2.4}
        />
        <Text style={[styles.openClientText, { color: colors.primaryText }]}>
          Abrir vista cliente
        </Text>
      </Pressable>

      <BookingQrModal
        visible={qrOpen}
        onClose={() => setQrOpen(false)}
        shareUrl={shareUrl}
        businessName={businessName}
      />
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    shareCard: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      gap: spacing.md,
    },
    shareHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    shareIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    shareTitle: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.md,
      color: c.onSurface,
    },
    shareSub: {
      marginTop: 2,
      fontFamily: fonts.medium,
      fontWeight: '500',
      fontSize: fontSize.xs,
      color: c.onSurfaceVariant,
    },
    urlPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.white,
      borderRadius: radius.full,
      paddingLeft: 14,
      paddingRight: 6,
      paddingVertical: 6,
      minHeight: 48,
    },
    urlText: {
      flex: 1,
      fontSize: fontSize.sm,
      fontFamily: fonts.medium,
      fontWeight: '500',
      color: c.onSurface,
    },
    copyPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.surfaceContainer,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: radius.full,
      minHeight: 44,
    },
    copyPillText: {
      fontSize: fontSize.xs,
      fontFamily: fonts.bold,
      fontWeight: '700',
      color: c.onSurfaceVariant,
    },
    shareActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    waBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: flujo.tertiary,
      borderRadius: radius.full,
      minHeight: 48,
      paddingHorizontal: spacing.lg,
    },
    waBtnText: {
      color: '#fff',
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.sm,
    },
    qrBtn: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      backgroundColor: c.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    openClientLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
    },
    openClientText: {
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.sm,
    },
  });
}
