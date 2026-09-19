import {
  Check,
  Infinity,
  Lock,
  Scissors,
  Sparkles,
  Star,
  SlidersHorizontal,
  Zap,
} from 'lucide-react-native';
import React, {useMemo} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { formatClp } from '@/lib/money';
import { hapticSelection } from '@/lib/haptics';
import type { Service, ServiceIconKey } from '@/data/types';
import {useThemeTokens, useColors} from '@/store/useTheme';
import {
  fontSize,
  fonts,
  flujo,
  radius,
  shadow,
  spacing,
  type AppColors,
} from '@/theme/colors';

interface Props {
  service: Service;
  onToggleActive: (active: boolean) => void;
  onEdit: () => void;
}

function IconFor({
  keyName,
  color,
}: {
  keyName?: ServiceIconKey;
  color: string;
}) {
  const props = { size: 22 as const, color, strokeWidth: 2.2 };
  switch (keyName) {
    case 'spa':
      return <Sparkles {...props} />;
    case 'bolt':
      return <Zap {...props} />;
    case 'all':
      return <Infinity {...props} />;
    case 'cut':
    default:
      return <Scissors {...props} />;
  }
}

export function ServiceCatalogCard({
  service,
  onToggleActive,
  onEdit,
}: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const tint = theme.primary + '14';
  const deposit =
    service.depositPercent != null && service.depositPercent > 0
      ? service.depositPercent
      : null;

  return (
    <View style={[styles.card, shadow.sm]}>
      <View style={styles.topRow}>
        <View style={[styles.iconTile, { backgroundColor: tint }]}>
          <IconFor keyName={service.iconKey} color={theme.primary} />
        </View>

        <View style={styles.titleCol}>
          <Text style={styles.title} numberOfLines={2}>
            {service.name}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaMuted}>{service.durationMin} min</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={[styles.metaPrice, { color: colors.primaryText }]}>
              {formatClp(service.priceClp)}
            </Text>
          </View>
          {service.popular ? (
            <View style={[styles.masPedido, { backgroundColor: theme.primary }]}>
              <Star size={11} color="#fff" strokeWidth={2.4} fill="#fff" />
              <Text style={styles.masPedidoText}>Más pedido</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.switchWrap}>
          <Switch
            value={service.active}
            onValueChange={(active) => {
              void hapticSelection();
              onToggleActive(active);
            }}
            trackColor={{
              false: colors.surfaceContainerHigh,
              true: flujo.tertiaryContainer,
            }}
            thumbColor={
              Platform.OS === 'android'
                ? service.active
                  ? '#fff'
                  : colors.surfaceContainerLow
                : '#fff'
            }
            ios_backgroundColor={colors.surfaceContainerHigh}
            accessibilityLabel={
              service.active ? 'Visible para clientes' : 'Oculto para clientes'
            }
          />
        </View>
      </View>

      <View
        style={[
          styles.depositChip,
          deposit
            ? { backgroundColor: theme.surfaceTint }
            : { backgroundColor: 'rgba(143, 246, 212, 0.35)' },
        ]}
      >
        {deposit ? (
          <>
            <Lock size={13} color={colors.primaryText} strokeWidth={2.4} />
            <Text style={[styles.depositText, { color: colors.primaryText }]}>
              Requiere {deposit}% de seña
            </Text>
          </>
        ) : (
          <>
            <Check size={13} color={flujo.tertiary} strokeWidth={2.6} />
            <Text style={[styles.depositText, { color: flujo.tertiary }]}>
              Sin anticipo obligatorio
            </Text>
          </>
        )}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.visibleRow}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: service.active
                  ? flujo.tertiary
                  : colors.outline,
              },
            ]}
          />
          <Text
            style={[
              styles.visibleText,
              {
                color: service.active
                  ? flujo.tertiary
                  : colors.onSurfaceVariant,
              },
            ]}
          >
            {service.active ? 'Visible para clientes' : 'Oculto para clientes'}
          </Text>
        </View>

        <Pressable
          onPress={onEdit}
          style={styles.editPill}
          accessibilityRole="button"
          accessibilityLabel="Editar servicio"
          hitSlop={6}
        >
          <SlidersHorizontal
            size={14}
            color={colors.onSurfaceVariant}
            strokeWidth={2.3}
          />
          <Text style={styles.editText}>Editar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  card: {
    backgroundColor: c.surfaceContainerLowest,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  masPedido: {
    alignSelf: 'flex-start',
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  masPedidoText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  switchWrap: { paddingTop: 4 },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: fontSize.md,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: c.onSurface,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaMuted: {
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
    fontWeight: '500',
    color: c.onSurfaceVariant,
  },
  metaDot: {
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
  },
  metaPrice: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
  depositChip: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  depositText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    fontWeight: '600',
  },
  footerRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  visibleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  visibleText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    fontWeight: '600',
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: c.surfaceContainerLow,
    minHeight: 44,
  },
  editText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: c.onSurfaceVariant,
  },
});
}

