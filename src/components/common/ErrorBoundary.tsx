import React, {Component, ReactNode} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {theme} from '@utils/theme';
import {Button} from '@components/base';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to crash reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⚠️</Text>
            </View>

            <Text style={styles.title}>Oops! Algo deu errado</Text>

            <Text style={styles.message}>
              Ocorreu um erro inesperado. Nossa equipe foi notificada e está
              trabalhando para resolver o problema.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>
                  Detalhes do erro (modo desenvolvimento):
                </Text>
                <Text style={styles.debugText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.debugText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title="Tentar Novamente"
                onPress={this.handleRetry}
                variant="primary"
                fullWidth
              />
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    maxWidth: 300,
    width: '100%',
  },

  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },

  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.large,
  },

  debugContainer: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.large,
    padding: theme.spacing.medium,
    width: '100%',
  },

  debugText: {
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
    fontSize: theme.typography.fontSize.xsmall,
    lineHeight: 16,
  },

  debugTitle: {
    color: theme.colors.error,
    fontFamily: theme.typography.fontFamily.semibold,
    fontSize: theme.typography.fontSize.small,
    marginBottom: theme.spacing.small,
  },

  icon: {
    fontSize: 64,
    textAlign: 'center',
  },

  iconContainer: {
    marginBottom: theme.spacing.large,
  },

  message: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.medium,
    lineHeight: theme.typography.lineHeight.medium,
    marginBottom: theme.spacing.xlarge,
    textAlign: 'center',
  },

  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xlarge,
    marginBottom: theme.spacing.medium,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
