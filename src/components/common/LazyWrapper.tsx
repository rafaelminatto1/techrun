import React, {Suspense, memo, ComponentType} from 'react';
import {View, StyleSheet} from 'react-native';
import LoadingSpinner from './LoadingSpinner';

interface LazyWrapperProps {
  fallback?: React.ComponentType;
  errorBoundary?: boolean;
  children: React.ReactNode;
}

// HOC para lazy loading de componentes
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ComponentType,
): ComponentType<P> {
  const LazyComponent = memo((props: P) => {
    return (
      <Suspense
        fallback={
          fallback ? (
            React.createElement(fallback)
          ) : (
            <View style={styles.fallbackContainer}>
              <LoadingSpinner size='large' text='Carregando componente...' />
            </View>
          )
        }>
        <Component {...props} />
      </Suspense>
    );
  });

  LazyComponent.displayName = `withLazyLoading(${
    Component.displayName || Component.name
  })`;

  return LazyComponent;
}

// Wrapper para carregamento lazy com Suspense
const LazyWrapper: React.FC<LazyWrapperProps> = memo(
  ({children, fallback: FallbackComponent, errorBoundary = true}) => {
    const fallbackElement = FallbackComponent ? (
      <FallbackComponent />
    ) : (
      <View style={styles.fallbackContainer}>
        <LoadingSpinner size="large" text="Carregando..." />
      </View>
    );

    const content = <Suspense fallback={fallbackElement}>{children}</Suspense>;

    // Adicionar Error Boundary se solicitado
    if (errorBoundary) {
      const ErrorBoundary = require('./ErrorBoundary').default;

      return <ErrorBoundary>{content}</ErrorBoundary>;
    }

    return content;
  },
);

LazyWrapper.displayName = 'LazyWrapper';

const styles = StyleSheet.create({
  fallbackContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 200,
  },
});

export default LazyWrapper;
