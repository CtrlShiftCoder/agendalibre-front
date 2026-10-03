import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Badge, FormSection, InfoBanner, PageScaffold, ProfileHeader, ScreenHeader, ToggleRow, toast } from '@/components/ui';
import { DEFAULT_PERMS, PERMISSION_GROUPS } from '@/lib/bizMock';
import { useAppStore, usePref } from '@/store/useAppStore';

/** Stitch: "Permisos y Notificaciones de Personal". Los interruptores se guardan al instante en el store. */
export default function PermisosPersonal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pro = useAppStore((s) => s.professionals.find((p) => p.id === id));
  const [perms, setPerms] = usePref<Record<string, boolean>>(`perm.${id}`, DEFAULT_PERMS);
  const [saved, setSaved] = usePref<boolean>(`perm.${id}.saved`, false);
  const get = (k: string) => perms[k] ?? DEFAULT_PERMS[k] ?? false;
  return (
    <PageScaffold footer={<Button title="Guardar configuración de permisos" onPress={() => { setSaved(true); toast('Permisos guardados y sincronizados'); }} />}>
      <ScreenHeader title="Permisos de personal" subtitle={pro ? `${pro.name} · ${pro.role}` : undefined} />
      {pro ? <ProfileHeader name={pro.name} role={pro.role} status="Activo en Staff Portal" color={pro.color} /> : null}
      {saved ? <InfoBanner title="Cambio sincronizado." text="Configuración actualizada en tiempo real." /> : null}
      {PERMISSION_GROUPS.map((g) => (
        <FormSection key={g.title} title={g.title}>
          {g.items.map((it) => (
            <ToggleRow
              key={it.key}
              title={it.title}
              description={it.desc}
              value={get(it.key)}
              badge={it.adminOnly ? <Badge label="Solo Admin" tone="warn" /> : undefined}
              onValueChange={(v) => { setPerms({ ...DEFAULT_PERMS, ...perms, [it.key]: v }); setSaved(false); }}
            />
          ))}
        </FormSection>
      ))}
      <View><Text accessibilityElementsHidden style={{ height: 1 }}>{' '}</Text></View>
    </PageScaffold>
  );
}
