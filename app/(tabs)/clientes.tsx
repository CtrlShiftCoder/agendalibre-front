import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, {useMemo, useState} from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Screen } from '@/components/Screen';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { IconButton } from '@/components/IconButton';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { StaggerItem } from '@/components/motion';
import { ListSkeleton, useListBoot } from '@/components/Skeleton';
import type { ClientRiskFlag } from '@/contracts';
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import { apiCreateClient } from '@/store/apiActions';
import { useAppStore } from '@/store/useAppStore';
import {useThemeTokens, useColors} from '@/store/useTheme';
import { radius, spacing, type AppColors } from '@/theme/colors';

type RiskFilter = 'all' | ClientRiskFlag;
type VisitFilter = 'all' | 'recent' | 'stale' | 'never';
type TagFilter = 'all' | string;

const RISK_LABEL: Record<RiskFilter, string> = {
  all: 'Todos',
  ok: 'OK',
  watch: 'Vigilancia',
  high: 'Alto riesgo',
};

const VISIT_LABEL: Record<VisitFilter, string> = {
  all: 'Visitas',
  recent: '≤30 días',
  stale: '>30 días',
  never: 'Sin visita',
};

const TAG_PRESETS = ['VIP', 'nuevo', 'alergia', 'recurrente'] as const;

function daysSince(iso?: string): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
}

export default function ClientesScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const theme = useThemeTokens();
  const booting = useListBoot();
  const clients = useAppStore((s) => s.clients);
  const appointments = useAppStore((s) => s.appointments);
  const deleteClient = useAppStore((s) => s.deleteClient);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+569');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [visitFilter, setVisitFilter] = useState<VisitFilter>('all');
  const [tagFilter, setTagFilter] = useState<TagFilter>('all');
  const [query, setQuery] = useState('');
  const { refreshControl } = usePullToRefresh();

  const tagOptions = useMemo(() => {
    const found = new Set<string>();
    for (const c of clients) {
      for (const t of c.tags ?? []) {
        if (t.trim()) found.add(t);
      }
    }
    for (const p of TAG_PRESETS) found.add(p);
    return Array.from(found).sort((a, b) => a.localeCompare(b, 'es'));
  }, [clients]);

  /** Filter client-side — never inside useAppStore selector. */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      const risk = c.riskFlag ?? 'ok';
      if (riskFilter !== 'all' && risk !== riskFilter) return false;
      const days = daysSince(c.lastVisitAt);
      if (visitFilter === 'never' && days != null) return false;
      if (visitFilter === 'recent' && (days == null || days > 30)) return false;
      if (visitFilter === 'stale' && (days == null || days <= 30)) return false;
      if (tagFilter !== 'all') {
        const tags = (c.tags ?? []).map((t) => t.toLowerCase());
        if (!tags.includes(tagFilter.toLowerCase())) return false;
      }
      if (q) {
        const hay = `${c.name} ${c.phone} ${(c.tags ?? []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [clients, riskFilter, visitFilter, tagFilter, query]);

  const save = () => {
    if (!name.trim()) {
      Alert.alert('Falta el nombre', '¿Cómo se llama tu cliente?');
      return;
    }
    void apiCreateClient({ name: name.trim(), phone: phone.trim() });
    setOpen(false);
    setName('');
    setPhone('+569');
  };

  return (
    <Screen edges={['top']} fade constrainContent>
      <ScrollView contentContainerStyle={styles.scroll} refreshControl={refreshControl}>
        <View style={styles.top}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Clientes</Text>
            <Text style={styles.sub}>
              {filtered.length} de {clients.length} en tu agenda
            </Text>
          </View>
          <IconButton onPress={() => setOpen(true)} variant="solid" accessibilityLabel="Nuevo cliente">
            <Plus size={22} color="#fff" strokeWidth={2.5} />
          </IconButton>
        </View>
        <Button
          title="Lista de espera"
          variant="secondary"
          onPress={() => router.push('/lista-espera' as const)}
          style={{ marginBottom: spacing.md }}
        />

        <Text style={styles.filterLabel}>Riesgo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {(Object.keys(RISK_LABEL) as RiskFilter[]).map((k) => {
            const on = riskFilter === k;
            return (
              <Pressable
                key={k}
                onPress={() => setRiskFilter(k)}
                style={[
                  styles.chip,
                  on && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
              >
                <Text style={[styles.chipText, on && { color: '#fff' }]}>
                  {RISK_LABEL[k]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.filterLabel}>Última visita</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {(Object.keys(VISIT_LABEL) as VisitFilter[]).map((k) => {
            const on = visitFilter === k;
            return (
              <Pressable
                key={k}
                onPress={() => setVisitFilter(k)}
                style={[
                  styles.chip,
                  on && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
              >
                <Text style={[styles.chipText, on && { color: '#fff' }]}>
                  {VISIT_LABEL[k]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.filterLabel}>Tags</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <Pressable
            onPress={() => setTagFilter('all')}
            style={[
              styles.chip,
              tagFilter === 'all' && {
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: tagFilter === 'all' }}
          >
            <Text
              style={[
                styles.chipText,
                tagFilter === 'all' && { color: '#fff' },
              ]}
            >
              Todos
            </Text>
          </Pressable>
          {tagOptions.map((t) => {
            const on = tagFilter.toLowerCase() === t.toLowerCase();
            return (
              <Pressable
                key={t}
                onPress={() => setTagFilter(t)}
                style={[
                  styles.chip,
                  on && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text style={[styles.chipText, on && { color: '#fff' }]}>{t}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <TextField
          label="Buscar"
          value={query}
          onChangeText={setQuery}
          placeholder="Nombre, fono o tag…"
          containerStyle={{ marginBottom: spacing.md }}
        />

        {booting ? (
          <ListSkeleton rows={4} variant="card" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="users"
            title={clients.length === 0 ? 'Todavía no hay clientes' : 'Nada en este filtro'}
            subtitle={
              clients.length === 0
                ? 'Agrégalos acá o créalos al agendar una cita nueva.'
                : 'Prueba otro filtro, tag o búsqueda.'
            }
            actionLabel={clients.length === 0 ? 'Agregar cliente' : undefined}
            onAction={clients.length === 0 ? () => setOpen(true) : undefined}
          />
        ) : (
          filtered.map((c, i) => {
            const visits = appointments.filter((a) => a.clientId === c.id).length;
            const days = daysSince(c.lastVisitAt);
            return (
              <StaggerItem key={c.id} index={i}>
                <Card
                  style={styles.card}
                  onPress={() => router.push(`/cliente/${c.id}` as never)}
                >
                  <Text style={styles.name}>{c.name}</Text>
                  <Text style={styles.phone}>{c.phone}</Text>
                  <Text style={styles.meta}>
                    {visits === 0
                      ? 'Sin citas aún'
                      : `${visits} cita${visits > 1 ? 's' : ''}`}
                    {c.noShowCount ? ` · ${c.noShowCount} no-show` : ''}
                    {c.riskFlag && c.riskFlag !== 'ok'
                      ? ` · riesgo ${c.riskFlag}`
                      : ''}
                    {days == null
                      ? ' · sin visita'
                      : ` · última hace ${days}d`}
                  </Text>
                  {c.tags && c.tags.length > 0 ? (
                    <View style={styles.tagRow}>
                      {c.tags.slice(0, 2).map((t) => (
                        <View
                          key={t}
                          style={[
                            styles.tagChip,
                            { backgroundColor: theme.surfaceTint },
                          ]}
                        >
                          <Text
                            style={[styles.tagChipText, { color: theme.primary }]}
                            numberOfLines={1}
                          >
                            {t}
                          </Text>
                        </View>
                      ))}
                      {c.tags.length > 2 ? (
                        <View style={[styles.tagChip, styles.tagMore]}>
                          <Text style={styles.tagMoreText}>
                            +{c.tags.length - 2}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                  <Pressable
                    onPress={() =>
                      Alert.alert('¿Eliminar cliente?', c.name, [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: () => deleteClient(c.id),
                        },
                      ])
                    }
                  >
                    <Text style={styles.del}>Eliminar</Text>
                  </Pressable>
                </Card>
              </StaggerItem>
            );
          })
        )}
      </ScrollView>

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nuevo cliente</Text>
            <TextField
              label="Nombre"
              value={name}
              onChangeText={setName}
              placeholder="Ej. Juan Pérez"
            />
            <TextField
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+569..."
            />
            <Button title="Guardar" onPress={save} style={{ marginTop: spacing.lg }} />
            <Button title="Cancelar" variant="ghost" onPress={() => setOpen(false)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.cream },
  scroll: { padding: spacing.xl, paddingBottom: 100 },
  top: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: 28, fontWeight: '800', color: c.text },
  sub: { color: c.textMuted, marginTop: 4 },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  chipScroll: { marginBottom: spacing.md },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.white,
    marginRight: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipText: { fontWeight: '600', fontSize: 13, color: c.text },
  card: { marginBottom: spacing.md },
  name: { fontSize: 17, fontWeight: '700', color: c.text },
  phone: { color: c.textMuted, marginTop: 2 },
  meta: { fontSize: 12, color: c.textMuted, marginTop: spacing.sm },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    maxWidth: 120,
  },
  tagChipText: { fontSize: 11, fontWeight: '700' },
  tagMore: {
    backgroundColor: c.border,
  },
  tagMoreText: { fontSize: 11, fontWeight: '700', color: c.textMuted },
  del: { color: c.danger, marginTop: spacing.sm, fontWeight: '600', fontSize: 13 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: c.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: spacing.lg, color: c.text },
});
}

