import { Alert as RNAlert } from 'react-native';

type ConfirmOptions = {
  /** Botón destructivo (default: "Confirmar") */
  confirmText?: string;
  /** Botón cancelar (default: "Cancelar") */
  cancelText?: string;
};

/**
 * Confirmaciones destructivas con copy Chile.
 * Uso: `Alert.confirm(título, mensaje, onConfirm, { confirmText })`
 */
function confirm(
  title: string,
  message: string,
  onConfirm: () => void,
  options?: ConfirmOptions
): void {
  RNAlert.alert(title, message, [
    { text: options?.cancelText ?? 'Cancelar', style: 'cancel' },
    {
      text: options?.confirmText ?? 'Confirmar',
      style: 'destructive',
      onPress: onConfirm,
    },
  ]);
}

/** Wrapper sobre RN Alert + confirm destructivo. */
export const Alert = {
  alert: RNAlert.alert.bind(RNAlert) as typeof RNAlert.alert,
  confirm,
};
