import { Clock, Heart, MessageCircle, RotateCcw, Scissors, User } from 'lucide-react-native';
import React, {useMemo} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import type { AppointmentStatus } from '@/data/types';
import { STATUS_LABELS, statusTone } from '@/lib/statusColors';
import { useAppStore } from '@/store/useAppStore';
import {useThemeTokens, useColors} from '@/store/useTheme';
import { fontSize, radius, spacing, type AppColors } from '@/theme/colors';

interface Props {
  time: string;
  clientName: string;
  serviceName: string;
  professionalName?: string;
  status: AppointmentStatus;
  phone?: string;
  onPress?: () => void;
  onRebook?: () => void;
  onWhatsApp?: () => void;
  showRebook?: boolean;
}

export function AppointmentCard({
  time,
  clientName,
  serviceName,
  professionalName,
  status,
  phone,
  onPress,
  onRebook,
  onWhatsApp,
  showRebook,
}: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const niche = useAppStore((s) => s.profile.niche);
  const ServiceIcon = niche === 'health' ? Heart : Scissors;

  const tone = statusTone(status, colors, { accent: theme.accent });

  const hasActions = (showRebook && onRebook) || onWhatsApp;

  return (
    <Card style={styles.card} glow>
      <Pressable onPress={onPress} disabled={!onPress}>
        <View style={styles.row}>
          <View style={[styles.timeBox, { backgroundColor: theme.primary + '14' }]}>
            <Clock size={14} color={colors.primaryText} strokeWidth={2.5} />
            <Text style={[styles.time, { color: colors.primaryText }]}>{time}</Text>
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={styles.nameRow}>
              <Text style={styles.client} numberOfLines={1}>
                {clientName}
              </Text>
              <View style={[styles.badge, { backgroundColor: tone.bg }]}>
                <Text style={[styles.badgeText, { color: tone.fg }]}>
                  {STATUS_LABELS[status]}
                </Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <ServiceIcon size={14} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.meta} numberOfLines={1}>
                {serviceName}
              </Text>
            </View>
            {professionalName ? (
              <View style={styles.metaRow}>
                <User size={14} color={colors.textMuted} strokeWidth={2} />
                <Text style={styles.meta} numberOfLines={1}>
                  {professionalName}
                </Text>
              </View>
            ) : null}
            {phone ? <Text style={styles.phone}>{phone}</Text> : null}
          </View>
        </View>
      </Pressable>

      {hasActions ? (
        <View style={styles.actions}>
          {onWhatsApp ? (
            <Pressable
              onPress={onWhatsApp}
              style={[styles.actionBtn, { backgroundColor: '#25D36618' }]}
              hitSlop={8}
            >
              <MessageCircle size={14} color="#128C7E" strokeWidth={2.4} />
              <Text style={[styles.actionText, { color: '#128C7E' }]}>
                Avisar cliente
              </Text>
            </Pressable>
          ) : null}
          {showRebook && onRebook ? (
            <Pressable
              onPress={onRebook}
              style={[styles.actionBtn, { backgroundColor: theme.surfaceTint }]}
              hitSlop={8}
            >
              <RotateCcw size={14} color={colors.primaryText} strokeWidth={2.4} />
              <Text style={[styles.actionText, { color: colors.primaryText }]}>
                Repetir cita
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  timeBox: {
    minWidth: 68,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    gap: 4,
  },
  time: { fontSize: fontSize.md, fontWeight: '800' },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  client: {
    flex: 1,
    fontSize: fontSize.md + 1,
    fontWeight: '700',
    color: c.text,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { flex: 1, fontSize: fontSize.sm, color: c.textMuted },
  phone: { fontSize: fontSize.xs, color: c.textMuted, marginTop: 2 },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: '700' },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.full,
    minHeight: 36,
  },
  actionText: { fontSize: fontSize.xs + 1, fontWeight: '700' },
});
}

