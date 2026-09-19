import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/store/useTheme';
import { fonts, fontSize, radius, spacing, type AppColors } from '@/theme/colors';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

/** Catches render errors; Chile copy + Retry resets boundary state. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info?.componentStack);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <View
      style={styles.wrap}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Text style={styles.title}>Algo falló — reintenta</Text>
      <Text style={styles.subtitle}>Hubo un problema al mostrar esta pantalla.</Text>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Reintentar"
      >
        <Text style={styles.buttonText}>Reintentar</Text>
      </Pressable>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      backgroundColor: c.surface,
      gap: spacing.sm,
    },
    title: {
      fontFamily: fonts.bold,
      fontWeight: '700',
      fontSize: fontSize.lg,
      color: c.onSurface,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: fonts.regular,
      fontSize: fontSize.sm,
      color: c.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    button: {
      minHeight: 44,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonPressed: {
      opacity: 0.88,
    },
    buttonText: {
      fontFamily: fonts.semibold,
      fontWeight: '600',
      fontSize: fontSize.md,
      color: '#FFFFFF',
    },
  });
}
