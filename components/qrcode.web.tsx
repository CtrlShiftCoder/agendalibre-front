import React from 'react';

type WebQrProps = {
  value?: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  ecl?: string;
  quietZone?: number;
  onError?: (err: unknown) => void;
};

/**
 * Web stub — Metro resolves this instead of react-native-qrcode-svg so SVG
 * TransformError cannot break /perfil. BookingQrModal renders MockQrPattern.
 */
export default function QRCode(_props: WebQrProps) {
  return null;
}
