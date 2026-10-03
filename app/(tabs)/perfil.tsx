import React from 'react';

import NegocioScreen from '@/components/NegocioScreen';
import MiPerfilProScreen from '@/components/MiPerfilProScreen';
import PerfilScreen from '@/components/PerfilScreen';
import { useAppStore } from '@/store/useAppStore';
import { usePaletteId } from '@/store/useTheme';

/** Pestaña de perfil: Negocio (admin empresa) · Mi perfil (persona/trabajador) · Perfil clásico (cliente). */
export default function PerfilTab() {
  const role = useAppStore((s) => s.profile.role);
  const palette = usePaletteId();
  if (role === 'cliente') return <PerfilScreen />;
  return palette === 'indigo' ? <NegocioScreen /> : <MiPerfilProScreen />;
}
