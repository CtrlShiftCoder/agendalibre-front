import { Platform, Share } from 'react-native';
import type { DayCashSummary } from '@/contracts';

export function dayCashToCsv(summary: DayCashSummary): string {
  const lines: string[] = [];
  lines.push('campo,valor');
  lines.push(`fecha,${summary.date}`);
  lines.push(`moneda,${summary.currency}`);
  lines.push(`citas,${summary.appointmentsCount}`);
  lines.push(`completadas,${summary.completedCount}`);
  lines.push(`canceladas,${summary.cancelledCount}`);
  lines.push(`noshow,${summary.noShowCount}`);
  lines.push(`bruto_clp,${summary.grossClp}`);
  lines.push(`depositos_retenidos_clp,${summary.depositsHeldClp}`);
  if (summary.byMethod) {
    lines.push(`metodo_efectivo,${summary.byMethod.cash}`);
    lines.push(`metodo_transferencia,${summary.byMethod.transfer}`);
    lines.push(`metodo_tarjeta,${summary.byMethod.card}`);
    lines.push(`metodo_otro,${summary.byMethod.other}`);
  }
  if (summary.byProfessionalId) {
    for (const [proId, amount] of Object.entries(summary.byProfessionalId)) {
      lines.push(`pro_${proId},${amount}`);
    }
  }
  return lines.join('\n');
}

export async function exportCsv(
  filename: string,
  csv: string
): Promise<'downloaded' | 'shared' | 'copied'> {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return 'downloaded';
  }
  if (
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    navigator.clipboard?.writeText
  ) {
    await navigator.clipboard.writeText(csv);
    return 'copied';
  }
  await Share.share({ message: csv, title: filename });
  return 'shared';
}
