import React, { useMemo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { useColors } from '@/store/useTheme';
import {
  fontSize,
  fonts,
  radius,
  spacing,
  type AppColors,
} from '@/theme/colors';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  /** Always-visible label above the field (required) */
  label: string;
  hint?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextInputProps['style'];
  /** Optional trailing control (e.g. show/hide password) */
  rightAccessory?: React.ReactNode;
}

/**
 * Accessible text field: visible label, ≥16px input, outline border,
 * focus ring in primaryText, placeholder token, optional hint/error.
 */
export function TextField({
  label,
  hint,
  error,
  containerStyle,
  inputStyle,
  rightAccessory,
  onFocus,
  onBlur,
  placeholderTextColor,
  textContentType,
  ...rest
}: TextFieldProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  // iOS-only; omit on web to avoid unknown DOM prop warnings
  const iosOnly =
    Platform.OS === 'ios' && textContentType
      ? { textContentType }
      : undefined;

  return (
    <View style={[styles.wrap, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          {...rest}
          {...iosOnly}
          style={[
            styles.input,
            rightAccessory ? styles.inputWithAccessory : null,
            focused && !hasError && styles.inputFocused,
            hasError && styles.inputError,
            inputStyle,
          ]}
          placeholderTextColor={
            placeholderTextColor ?? colors.placeholder
          }
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          accessibilityLabel={label}
        />
        {rightAccessory ? (
          <View style={styles.accessory}>{rightAccessory}</View>
        ) : null}
      </View>
      {hasError ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: fontSize.sm,
    color: c.onSurfaceVariant,
    marginBottom: 6,
  },
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1.5,
    borderColor: c.outline,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 52,
    color: c.onSurface,
    backgroundColor: c.surfaceContainerLowest,
    fontFamily: fonts.regular,
  },
  inputWithAccessory: {
    paddingRight: 52,
  },
  accessory: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: c.primaryText,
  },
  inputError: {
    borderWidth: 2,
    borderColor: c.danger,
  },
  hint: {
    marginTop: 6,
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
    fontWeight: '500',
    color: c.onSurfaceVariant,
  },
  error: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: fonts.medium,
    fontWeight: '500',
    color: c.danger,
  },
});
}

