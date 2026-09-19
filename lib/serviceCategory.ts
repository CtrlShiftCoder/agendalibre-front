import type { Service, ServiceCategory } from '@/contracts';

const LABELS: Record<ServiceCategory, string> = {
  servicio: 'Servicios',
  paquete: 'Paquetes',
  promo: 'Promociones',
};

/** Friendly chip label for a ServiceCategory. */
export function serviceCategoryLabel(cat: ServiceCategory): string {
  return LABELS[cat] ?? cat;
}

/**
 * Resolve catalog category: prefer `service.category`, else derive from name
 * (paquete / promo keywords). Falls back to `servicio` when name is present.
 */
export function resolveServiceCategory(
  service: Pick<Service, 'name' | 'category'>
): ServiceCategory | undefined {
  if (service.category) return service.category;
  const n = service.name.trim().toLowerCase();
  if (!n) return undefined;
  if (/\bpaquete\b|\bpack\b|ritual completo|mensual/.test(n)) return 'paquete';
  if (/\bpromo\b|promoci[oó]n|primera visita/.test(n)) return 'promo';
  return 'servicio';
}

/** Unique categories present in a list (resolved), stable order. */
export function uniqueServiceCategories(
  services: Pick<Service, 'name' | 'category'>[]
): ServiceCategory[] {
  const order: ServiceCategory[] = ['servicio', 'paquete', 'promo'];
  const found = new Set<ServiceCategory>();
  for (const s of services) {
    const c = resolveServiceCategory(s);
    if (c) found.add(c);
  }
  return order.filter((c) => found.has(c));
}
