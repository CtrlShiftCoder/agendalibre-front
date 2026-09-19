import { LinearGradient } from 'expo-linear-gradient';
import { Check, MessageCircle, QrCode, Share2 } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FadeInView } from '@/components/motion';
import { formatLongDate } from '@/data/slots';
import { formatClp } from '@/lib/money';
import { relativeTime } from '@/lib/relativeTime';
import { useColors, useThemeTokens } from '@/store/useTheme';
import { fontSize, radius, shadow, spacing, type AppColors } from '@/theme/colors';

interface Props {
  code: string;
  serviceName: string;
  professionalName: string;
  clientName: string;
  date: string;
  startTime: string;
  durationMin: number;
  priceClp: number;
  place: string;
  businessName?: string;
  /** ISO booking timestamp — shows “Reservada · …” meta when set */
  createdAt?: string;
  onDone?: () => void;
  onWhatsApp?: () => void;
}

export function Ticket(props: Props) {
  const theme = useThemeTokens();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const shareText = [
    `🎟️ Cita confirmada — ${props.code}`,
    props.businessName ? `${props.businessName}` : null,
    `${props.serviceName}`,
    `Con: ${props.professionalName}`,
    `${formatLongDate(props.date)} a las ${props.startTime}`,
    `Lugar: ${props.place}`,
    `Duración: ${props.durationMin} min · ${formatClp(props.priceClp)}`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <FadeInView preset="zoom" duration={420} style={styles.wrap}>
      <View style={[styles.ticket, shadow.lg]}>
        <LinearGradient
          colors={theme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Text style={styles.airline}>
            {props.businessName || 'AgendaLibre'}
          </Text>
          <Text style={styles.bannerTitle}>Pase de embarque · Cita</Text>
          <Text style={styles.code}>{props.code}</Text>
          <View style={styles.flightRow}>
            <View style={styles.flightCol}>
              <Text style={styles.flightLabel}>Servicio</Text>
              <Text style={styles.flightValue} numberOfLines={1}>
                {props.serviceName}
              </Text>
            </View>
            <View style={styles.flightSep}>
              <View style={styles.flightDot} />
              <View style={styles.flightLine} />
              <View style={styles.flightDot} />
            </View>
            <View style={[styles.flightCol, { alignItems: 'flex-end' }]}>
              <Text style={styles.flightLabel}>Hora</Text>
              <Text style={styles.flightValue}>{props.startTime}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <Row label="Pasajero / Cliente" value={props.clientName} styles={styles} />
          <Row label="Con" value={props.professionalName} styles={styles} />
          <Row
            label="Fecha"
            value={`${formatLongDate(props.date)} · ${props.startTime}`}
            styles={styles}
          />
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Row label="Duración" value={`${props.durationMin} min`} styles={styles} />
            </View>
            <View style={{ flex: 1 }}>
              <Row label="Precio" value={formatClp(props.priceClp)} styles={styles} />
            </View>
          </View>
          <Row label="Dónde" value={props.place} styles={styles} />
          {props.createdAt ? (
            <Text style={styles.createdMeta}>
              Reservada · {relativeTime(props.createdAt)}
            </Text>
          ) : null}
        </View>

        <View style={styles.perforationRow}>
          <View style={[styles.notch, styles.notchLeft]} />
          <View style={styles.dashLine}>
            {Array.from({ length: 18 }).map((_, i) => (
              <View key={i} style={styles.dash} />
            ))}
          </View>
          <View style={[styles.notch, styles.notchRight]} />
        </View>

        <View style={styles.stub}>
          <View style={[styles.qrFake, { borderColor: theme.primary + '33' }]}>
            <QrCode size={48} color={theme.primary} strokeWidth={1.6} />
            <Text style={styles.qrHint}>{props.code}</Text>
          </View>
          <Text style={styles.footer}>
            Guarda este ticket o compártelo por WhatsApp
          </Text>
        </View>
      </View>

      <Button
        title="Compartir ticket"
        icon={<Share2 size={18} color="#fff" strokeWidth={2.4} />}
        onPress={() => Share.share({ message: shareText })}
        style={{ marginTop: spacing.lg }}
      />
      {props.onWhatsApp ? (
        <Button
          title="Avisar por WhatsApp"
          variant="secondary"
          gradient={false}
          icon={<MessageCircle size={18} color={colors.primaryText} strokeWidth={2.4} />}
          onPress={props.onWhatsApp}
          style={{ marginTop: spacing.sm }}
        />
      ) : null}
      {props.onDone ? (
        <Button
          title="Listo, volver a Hoy"
          variant="secondary"
          gradient={false}
          icon={<Check size={18} color={colors.primaryText} strokeWidth={2.4} />}
          onPress={props.onDone}
          style={{ marginTop: spacing.sm }}
        />
      ) : null}
    </FadeInView>
  );
}

function Row({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  wrap: { width: '100%' },
  ticket: {
    backgroundColor: c.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: c.border,
  },
  banner: {
    padding: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'stretch',
  },
  airline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fontSize.xs,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bannerTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  code: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: spacing.sm,
    letterSpacing: 3,
  },
  flightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  flightCol: { flex: 1 },
  flightLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  flightValue: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '800',
    marginTop: 2,
  },
  flightSep: {
    width: 48,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  flightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  flightLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 1,
  },
  body: { padding: spacing.xl, gap: spacing.md },
  twoCol: { flexDirection: 'row', gap: spacing.md },
  row: { gap: 2 },
  rowLabel: {
    fontSize: fontSize.xs,
    color: c.textMuted,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: fontSize.md + 1,
    color: c.text,
    fontWeight: '600',
  },
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  notch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: c.cream,
  },
  notchLeft: { marginLeft: -9 },
  notchRight: { marginRight: -9 },
  dashLine: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  dash: {
    width: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: c.border,
  },
  stub: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  qrFake: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: c.cream,
  },
  qrHint: {
    fontSize: 9,
    fontWeight: '800',
    color: c.textMuted,
    letterSpacing: 1,
  },
  footer: {
    textAlign: 'center',
    color: c.textMuted,
    fontSize: fontSize.sm,
  },
  createdMeta: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: c.textMuted,
    fontWeight: '600',
  },
});
}

