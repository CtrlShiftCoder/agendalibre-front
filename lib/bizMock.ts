import { useAppStore, usePref } from '@/store/useAppStore';

export type ProExtra = {
  shift: 'fixed' | 'specific' | 'flexible';
  space: string;
  agreement: string;
  email: string;
  services: Record<string, boolean>;
};

export const DEFAULT_PERMS: Record<string, boolean> = {
  'ver.propia': true,
  'ver.equipo': false,
  'ver.contactos': false,
  'citas.web': true,
  'citas.reagendar': true,
  'citas.manual': true,
  'fin.cobro': true,
  'fin.propia': true,
  'fin.total': false,
  'not.push': true,
  'not.wa': true,
  'not.resumen': true,
};

export const PERMISSION_GROUPS: { title: string; items: { key: string; title: string; desc: string; adminOnly?: boolean }[] }[] = [
  { title: 'Visibilidad de agenda', items: [
    { key: 'ver.propia', title: 'Solo su propia agenda', desc: 'Ideal para independientes o arriendo de sillón. Oculta clientes ajenos.' },
    { key: 'ver.equipo', title: 'Ver agenda general del equipo', desc: 'Permite consultar el cronograma de otros profesionales y estaciones.' },
    { key: 'ver.contactos', title: 'Ver datos de contacto de otros clientes', desc: 'Restringe teléfonos, emails y notas de clientes no asignados.' },
  ] },
  { title: 'Gestión de citas y aprobaciones', items: [
    { key: 'citas.web', title: 'Aceptar / rechazar citas web', desc: 'Control directo sobre solicitudes del link de reservas.' },
    { key: 'citas.reagendar', title: 'Reagendar o cancelar confirmadas', desc: 'Modifica horarios con aviso automático al cliente.' },
    { key: 'citas.manual', title: 'Crear citas manuales', desc: 'Bloquea espacios para clientes espontáneos o reservas por llamada.' },
  ] },
  { title: 'Finanzas y cobros', items: [
    { key: 'fin.cobro', title: 'Registrar cobro en efectivo / transferencia', desc: 'Marca servicios completados y el método de pago.' },
    { key: 'fin.propia', title: 'Ver su propia recaudación y comisiones', desc: 'Métricas individuales del día, propinas y % liquidable.' },
    { key: 'fin.total', title: 'Ver recaudación total del negocio', desc: 'Balances de caja global y comisiones de colegas.', adminOnly: true },
  ] },
  { title: 'Canales de notificación', items: [
    { key: 'not.push', title: 'Notificación push móvil', desc: 'Inmediata al entrar solicitud, confirmación o cancelación.' },
    { key: 'not.wa', title: 'Alerta por WhatsApp Business', desc: 'Vinculado al teléfono del profesional.' },
    { key: 'not.resumen', title: 'Resumen matutino diario (08:30)', desc: 'Listado consolidado de citas del día.' },
  ] },
];

export function defaultProExtra(index: number): ProExtra {
  return {
    shift: (['fixed', 'specific', 'flexible'] as const)[index % 3],
    space: ['Sillón Principal #1', 'Sillón #2', 'Box #1 Estética'][index % 3],
    agreement: ['Arriendo mensual', 'Arriendo por día', '30% comisión'][index % 3],
    email: '',
    services: {},
  };
}

export function useProExtra(proId: string | undefined): [ProExtra, (p: Partial<ProExtra>) => void] {
  const idx = useAppStore((s) => Math.max(0, s.professionals.findIndex((p) => p.id === proId)));
  const [v, set] = usePref<ProExtra | null>(`pro.${proId}`, null);
  const cur = v ?? defaultProExtra(idx);
  return [cur, (p) => set({ ...cur, ...p })];
}

export const DEFAULT_BANK = {
  banco: 'Banco Santander • Cta. Corriente',
  cuenta: '74-89210-4',
  rut: '76.432.901-K',
  titular: 'Atelier Central SpA',
  email: 'pagos@ateliercentral.cl',
};
