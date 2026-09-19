import { Redirect } from 'expo-router';

/** Tab Cliente: abre el flujo público de reserva. */
export default function ReservarTab() {
  return <Redirect href="/reservar" />;
}
