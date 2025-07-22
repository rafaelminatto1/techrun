import {useEffect, useRef, useCallback} from 'react';

// Interface para subscription cleanup
interface Subscription {
  unsubscribe: () => void;
}

// Hook para cleanup automático de subscriptions
export function useSubscription<T extends Subscription>(
  subscription: T | null,
): void {
  const subscriptionRef = useRef<T | null>(null);

  useEffect(() => {
    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [subscription]);
}

// Hook para cleanup de timers
export function useTimer() {
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const setTimeout = useCallback((callback: () => void, delay: number) => {
    const timer = global.setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);

    timersRef.current.add(timer);

    return timer;
  }, []);

  const setInterval = useCallback((callback: () => void, delay: number) => {
    const timer = global.setInterval(callback, delay);

    timersRef.current.add(timer);

    return timer;
  }, []);

  const clearTimer = useCallback((timer: NodeJS.Timeout) => {
    global.clearTimeout(timer);
    global.clearInterval(timer);
    timersRef.current.delete(timer);
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(timer => {
      global.clearTimeout(timer);
      global.clearInterval(timer);
    });
    timersRef.current.clear();
  }, []);

  // Cleanup automático no unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    setTimeout,
    setInterval,
    clearTimer,
    clearAllTimers,
    activeTimers: timersRef.current.size,
  };
}

// Hook para cleanup de event listeners
export function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: EventTarget | null,
  options?: boolean | AddEventListenerOptions,
): void {
  const handlerRef = useRef(handler);

  handlerRef.current = handler;

  useEffect(() => {
    const targetElement = element || window;

    if (!targetElement?.addEventListener) {
      return;
    }

    const eventListener = (event: Event) => {
      handlerRef.current(event as WindowEventMap[K]);
    };

    targetElement.addEventListener(event, eventListener, options);

    return () => {
      targetElement.removeEventListener(event, eventListener, options);
    };
  }, [event, element, options]);
}

// Hook para cleanup de promises/async operations
export function useAsyncCleanup() {
  const isMountedRef = useRef(true);
  const pendingPromises = useRef<Set<Promise<any>>>(new Set());

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeAsync = useCallback(
    async <T>(
      promise: Promise<T>,
      onSuccess?: (result: T) => void,
      onError?: (error: any) => void,
    ): Promise<T | null> => {
      pendingPromises.current.add(promise);

      try {
        const result = await promise;

        if (isMountedRef.current) {
          onSuccess?.(result);

          return result;
        }

        return null;
      } catch (error) {
        if (isMountedRef.current) {
          onError?.(error);
        }
        throw error;
      } finally {
        pendingPromises.current.delete(promise);
      }
    },
    [],
  );

  const cancelAllPending = useCallback(() => {
    // Note: Não podemos cancelar promises diretamente, mas podemos ignorar os resultados
    pendingPromises.current.clear();
    isMountedRef.current = false;
  }, []);

  return {
    safeAsync,
    cancelAllPending,
    isMounted: () => isMountedRef.current,
    pendingCount: () => pendingPromises.current.size,
  };
}

// Hook para gerenciamento de recursos com auto-cleanup
export function useResource<T>(
  factory: () => T,
  destroyer: (resource: T) => void,
  deps: React.DependencyList = [],
): T | null {
  const resourceRef = useRef<T | null>(null);

  useEffect(() => {
    // Limpar recurso anterior se existir
    if (resourceRef.current) {
      destroyer(resourceRef.current);
    }

    // Criar novo recurso
    resourceRef.current = factory();

    return () => {
      if (resourceRef.current) {
        destroyer(resourceRef.current);
        resourceRef.current = null;
      }
    };
  }, deps);

  return resourceRef.current;
}

// Class para monitoramento de memory leaks
export class MemoryLeakDetector {
  private static instance: MemoryLeakDetector;
  private componentCounts = new Map<string, number>();
  private warningThreshold = 10;
  private monitoring = false;

  static getInstance(): MemoryLeakDetector {
    if (!MemoryLeakDetector.instance) {
      MemoryLeakDetector.instance = new MemoryLeakDetector();
    }

    return MemoryLeakDetector.instance;
  }

  startMonitoring(): void {
    this.monitoring = true;
    console.log('🔍 Memory leak detection started');
  }

  stopMonitoring(): void {
    this.monitoring = false;
    this.componentCounts.clear();
    console.log('🛑 Memory leak detection stopped');
  }

  trackComponent(componentName: string): void {
    if (!this.monitoring) {
      return;
    }

    const count = this.componentCounts.get(componentName) || 0;

    this.componentCounts.set(componentName, count + 1);

    if (count + 1 > this.warningThreshold) {
      console.warn(
        `⚠️ Possible memory leak detected: ${componentName} has ${
          count + 1
        } instances`,
      );
    }
  }

  untrackComponent(componentName: string): void {
    if (!this.monitoring) {
      return;
    }

    const count = this.componentCounts.get(componentName) || 0;

    if (count > 0) {
      this.componentCounts.set(componentName, count - 1);
    }
  }

  getComponentCounts(): Map<string, number> {
    return new Map(this.componentCounts);
  }

  setWarningThreshold(threshold: number): void {
    this.warningThreshold = threshold;
  }

  generateReport(): string {
    if (!this.monitoring) {
      return 'Memory leak detection is not active.';
    }

    let report = '\n🧠 Memory Leak Detection Report:\n';

    report += '===================================\n';

    if (this.componentCounts.size === 0) {
      report += 'No components being tracked.\n';

      return report;
    }

    for (const [component, count] of this.componentCounts.entries()) {
      const status = count > this.warningThreshold ? '⚠️ WARNING' : '✅ OK';

      report += `${component}: ${count} instances ${status}\n`;
    }

    return report;
  }
}

// Hook para detectar vazamentos de memória em componentes
export function useMemoryLeakDetection(componentName: string): void {
  const detector = MemoryLeakDetector.getInstance();

  useEffect(() => {
    detector.trackComponent(componentName);

    return () => {
      detector.untrackComponent(componentName);
    };
  }, [componentName, detector]);
}

// Hook para monitorar uso de memória
export function useMemoryMonitor(interval: number = 5000) {
  const memoryStats = useRef<
    {
      used: number;
      total: number;
      timestamp: number;
    }[]
  >([]);

  const {setTimeout, clearAllTimers} = useTimer();

  useEffect(() => {
    const monitor = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const stats = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          timestamp: Date.now(),
        };

        memoryStats.current.push(stats);

        // Manter apenas últimas 50 medições
        if (memoryStats.current.length > 50) {
          memoryStats.current.shift();
        }

        // Log warning se uso de memória for muito alto
        const usagePercent = (stats.used / stats.total) * 100;

        if (usagePercent > 80) {
          console.warn(`⚠️ High memory usage: ${usagePercent.toFixed(1)}%`);
        }
      }

      setTimeout(monitor, interval);
    };

    monitor();

    return () => {
      clearAllTimers();
    };
  }, [interval, setTimeout, clearAllTimers]);

  const getMemoryStats = useCallback(() => {
    return [...memoryStats.current];
  }, []);

  const getCurrentMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;

      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      };
    }

    return null;
  }, []);

  return {
    getMemoryStats,
    getCurrentMemoryUsage,
  };
}

// Utilitário para detectar objetos órfãos
export function detectOrphanedObjects() {
  if (typeof window !== 'undefined' && 'gc' in window) {
    // Force garbage collection se disponível (apenas em desenvolvimento)
    (window as any).gc();
  }

  console.log('🧹 Garbage collection triggered (if available)');
}

// Hook para auto-cleanup de refs
export function useSafeRef<T>(initialValue: T | null = null) {
  const ref = useRef<T | null>(initialValue);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      ref.current = null;
    };
  }, []);

  const safeSet = useCallback((value: T | null) => {
    if (isMountedRef.current) {
      ref.current = value;
    }
  }, []);

  const safeGet = useCallback((): T | null => {
    return isMountedRef.current ? ref.current : null;
  }, []);

  return {
    current: ref.current,
    set: safeSet,
    get: safeGet,
    isMounted: () => isMountedRef.current,
  };
}

export default {
  useSubscription,
  useTimer,
  useEventListener,
  useAsyncCleanup,
  useResource,
  MemoryLeakDetector,
  useMemoryLeakDetection,
  useMemoryMonitor,
  detectOrphanedObjects,
  useSafeRef,
};
