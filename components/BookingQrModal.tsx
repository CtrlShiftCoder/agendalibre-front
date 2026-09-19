import { Copy, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import QRCode from '@/components/qrcode';
import { ToastBanner } from '@/components/ToastBanner';

import { copyOrShare } from '@/lib/whatsapp';
import { useColors } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  shadow,
  spacing,
  type AppColors,
} from '@/theme/colors';

export type BookingQrModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Absolute share URL encoded in the QR. */
  shareUrl: string;
  /** Optional business name for the subtitle. */
  businessName?: string;
};

/**
 * Modal with a QR for the public booking link (native: react-native-qrcode-svg; web: mock grid — no svg import),
 * URL text, copy button, and tap-to-open.
 */
export function BookingQrModal({
  visible,
  onClose,
  shareUrl,
  businessName,
}: BookingQrModalProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [qrFailed, setQrFailed] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    if (visible) {
      setQrFailed(false);
      setCopiedToast(false);
    }
  }, [visible, shareUrl]);

  const displayUrl = shareUrl.replace(/^https?:\/\//, '');
  const subtitle = businessName?.trim()
    ? `Escanea para reservar en ${businessName.trim()}`
    : 'Escanea para abrir tu link de reservas';

  const copyLink = async () => {
    await copyOrShare(shareUrl, 'Link de reserva');
    setCopiedToast(true);
  };

  const openUrl = async () => {
    try {
      const can = await Linking.canOpenURL(shareUrl);
      if (can) {
        await Linking.openURL(shareUrl);
        return;
      }
    } catch {
      // fall through
    }
    Alert.alert('No se pudo abrir', shareUrl);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        />
        <View style={[styles.sheet, shadow.sm]}>
          <View style={styles.handle} />
          <ToastBanner
            visible={copiedToast}
            message="Copiado"
            variant="success"
            autoHideMs={2500}
            onDismiss={() => setCopiedToast(false)}
          />
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Código QR</Text>
              <Text style={styles.sub}>{subtitle}</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Cerrar modal QR"
              hitSlop={8}
            >
              <X size={20} color={colors.onSurface} strokeWidth={2.4} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              void openUrl();
            }}
            style={styles.qrWrap}
            accessibilityRole="button"
            accessibilityLabel="Abrir link de reserva"
            accessibilityHint="Toca el código QR para abrir el enlace"
          >
            {Platform.OS === 'web' || qrFailed ? (
              <MockQrPattern size={200} color={colors.onSurface} />
            ) : (
              <QRCode
                value={shareUrl || 'https://agendalibre.app'}
                size={200}
                color={colors.onSurface}
                backgroundColor={colors.white}
                ecl="M"
                quietZone={8}
                onError={() => setQrFailed(true)}
              />
            )}
          </Pressable>
          <Text style={styles.tapHint}>Toca el QR para abrir el link</Text>

          <View style={styles.urlPill}>
            <Text style={styles.urlText} numberOfLines={2}>
              {displayUrl}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => {
                void copyLink();
              }}
              style={styles.copyBtn}
              accessibilityRole="button"
              accessibilityLabel="Copiar enlace"
            >
              <Copy size={16} color="#fff" strokeWidth={2.4} />
              <Text style={styles.copyBtnText}>Copiar link</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={styles.doneBtn}
              accessibilityRole="button"
              accessibilityLabel="Listo"
            >
              <Text style={styles.doneBtnText}>Listo</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** Stylized QR-looking grid used only if SVG QR generation fails. */
function MockQrPattern({ size, color }: { size: number; color: string }) {
  const cells = 21;
  const cell = size / cells;
  const modules = useMemo(() => buildMockModules(cells), []);

  return (
    <View style={{ width: size, height: size, backgroundColor: '#fff' }}>
      {modules.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <View
              key={`${x}-${y}`}
              style={{
                position: 'absolute',
                left: x * cell,
                top: y * cell,
                width: cell,
                height: cell,
                backgroundColor: color,
              }}
            />
          ) : null
        )
      )}
    </View>
  );
}

function buildMockModules(n: number): boolean[][] {
  const m: boolean[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => false)
  );
  const paintFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        m[oy + y][ox + x] = edge || core;
      }
    }
  };
  paintFinder(0, 0);
  paintFinder(n - 7, 0);
  paintFinder(0, n - 7);
  for (let i = 8; i < n - 8; i++) {
    m[6][i] = i % 2 === 0;
    m[i][6] = i % 2 === 0;
  }
  // Deterministic-ish filler pattern (not scannable — fallback only)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (m[y][x]) continue;
      if (x < 9 && y < 9) continue;
      if (x >= n - 8 && y < 9) continue;
      if (x < 9 && y >= n - 8) continue;
      m[y][x] = ((x * 3 + y * 5) % 7) < 3;
    }
  }
  return m;
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: c.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: c.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.outline,
      marginBottom: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    title: {
      fontFamily: fonts.bold,
      fontWeight: '800',
      fontSize: 20,
      color: c.onSurface,
    },
    sub: {
      marginTop: 4,
      fontFamily: fonts.medium,
      fontWeight: '500',
      fontSize: fontSize.sm,
      color: c.onSurfaceVariant,
    },
    closeBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surfaceContainer,
    },
    qrWrap: {
      alignSelf: 'center',
      padding: spacing.md,
      backgroundColor: c.white,
      borderRadius: radius.lg,
      ...shadow.sm,
    },
    tapHint: {
      textAlign: 'center',
      fontFamily: fonts.medium,
      fontWeight: '500',
      fontSize: fontSize.xs,
      color: c.onSurfaceVariant,
      marginTop: -4,
    },
    urlPill: {
      backgroundColor: c.white,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      minHeight: 48,
      justifyContent: 'center',
    },
    urlText: {
      fontSize: fontSize.sm,
      fontFamily: fonts.medium,
      fontWeight: '500',
      color: c.onSurface,
      textAlign: 'center',
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    copyBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: c.primary,
      borderRadius: radius.full,
      minHeight: 48,
      paddingHorizontal: spacing.lg,
    },
    copyBtnText: {
      color: '#fff',
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.sm,
    },
    doneBtn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      minHeight: 48,
      paddingHorizontal: spacing.lg,
      backgroundColor: c.white,
      borderWidth: 1.5,
      borderColor: c.primaryText,
    },
    doneBtnText: {
      color: c.primaryText,
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.sm,
    },
  });
}
