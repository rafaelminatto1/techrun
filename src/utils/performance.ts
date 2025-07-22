import {useCallback, useMemo, useRef, useEffect, useState} from 'react';

// Hook para debounce de valores
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook para throttle de funções
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        fn(...args);
        lastRun.current = Date.now();
      }
    },
    [fn, delay],
  ) as T;
}

// Hook para memoização estável de objetos
export function useStableMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
): T {
  const ref = useRef<T>();
  const depsRef = useRef<React.DependencyList>();

  // Comparar dependências profundamente
  const depsChanged =
    !depsRef.current ||
    deps.length !== depsRef.current.length ||
    deps.some((dep, index) => dep !== depsRef.current![index]);

  if (depsChanged) {
    ref.current = factory();
    depsRef.current = deps;
  }

  return ref.current!;
}

// Hook para memoização com limpeza automática
export function useMemoWithCleanup<T>(
  factory: () => T,
  cleanup: (value: T) => void,
  deps: React.DependencyList,
): T {
  const valueRef = useRef<T>();
  const cleanupRef = useRef<(value: T) => void>();

  const memoizedValue = useMemo(() => {
    // Limpar valor anterior se existir
    if (valueRef.current && cleanupRef.current) {
      cleanupRef.current(valueRef.current);
    }

    const newValue = factory();

    valueRef.current = newValue;
    cleanupRef.current = cleanup;

    return newValue;
  }, deps);

  // Limpeza no unmount
  useEffect(() => {
    return () => {
      if (valueRef.current && cleanupRef.current) {
        cleanupRef.current(valueRef.current);
      }
    };
  }, []);

  return memoizedValue;
}

// Classe para monitoramento de performance
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<
    string,
    {
      startTime: number;
      endTime?: number;
      duration?: number;
      memory?: number;
    }
  > = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }

    return PerformanceMonitor.instance;
  }

  // Iniciar medição
  start(name: string): void {
    this.metrics.set(name, {
      startTime: performance.now(),
      memory: this.getMemoryUsage(),
    });
    console.log(`⏱️ Performance measurement started: ${name}`);
  }

  // Finalizar medição
  end(name: string): number | null {
    const metric = this.metrics.get(name);

    if (!metric) {
      console.warn(`Performance metric not found: ${name}`);

      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    console.log(
      `✅ Performance measurement completed: ${name} - ${duration.toFixed(
        2,
      )}ms`,

    return duration;
  }

  // Obter métricas
  getMetrics(): Array<{
    name: string;
    duration: number;
    startTime: number;
    endTime: number;
    memory?: number;
  }> {
    return Array.from(this.metrics.entries())
      .filter(([_, metric]) => metric.duration !== undefined)
      .map(([name, metric]) => ({
        name,
        duration: metric.duration!,
        startTime: metric.startTime,
        endTime: metric.endTime!,
        memory: metric.memory,
      }));
  }

  // Limpar métricas
  clear(): void {
    this.metrics.clear();
  }

  // Obter uso de memória (aproximado)
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }

    return 0;
  }

  // Relatório de performance
  generateReport(): string {
    const metrics = this.getMetrics();

    if (metrics.length === 0) {
      return 'Nenhuma métrica de performance registrada.';
    }

    let report = '\n📊 Relatório de Performance:\n';

    report += '================================\n';

    metrics.forEach(metric => {
      report += `${metric.name}: ${metric.duration.toFixed(2)}ms\n`;
      if (metric.memory) {
        report += `  Memória: ${(metric.memory / 1024 / 1024).toFixed(2)}MB\n`;
      }
    });

    const avgDuration =
      metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;

    report += `\nTempo médio: ${avgDuration.toFixed(2)}ms\n`;

    return report;
  }
}

// Decorator para medição automática de performance
export function measurePerformance(name?: string) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void {
    const method = descriptor.value!;
    const measurementName =
      name || `${target.constructor.name}.${propertyName}`;

    descriptor.value = function (this: any, ...args: any[]) {
      const monitor = PerformanceMonitor.getInstance();

      monitor.start(measurementName);

      try {
        const result = method.apply(this, args);

        // Se for Promise, aguardar conclusão
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            monitor.end(measurementName);
          });
        } else {
          monitor.end(measurementName);

          return result;
        }
      } catch (error) {
        monitor.end(measurementName);
        throw error;
      }
    } as any as T;

    return descriptor;
  };
}

// Hook para medição de performance de renderização
export function useRenderPerformance(componentName: string): void {
  const renderStart = useRef<number>();
  const renderCount = useRef(0);

  // Medir início da renderização
  renderStart.current = performance.now();
  renderCount.current += 1;

  useEffect(() => {
    // Medir fim da renderização
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart.current!;

    console.log(
      `🎨 Render Performance - ${componentName}: ${renderTime.toFixed(
        2,
      )}ms (render #${renderCount.current})`,
    );
  });
}

// Utilitário para otimização de listas
export function optimizeListData<T>(
  data: T[],
  keyExtractor: (item: T, index: number) => string,
  chunkSize: number = 50,
): {
  chunks: T[][];
  getItemLayout: (
    data: T[] | null | undefined,
    index: number,
  ) => {
    length: number;
    offset: number;
    index: number;
  };
} {
  // Dividir dados em chunks
  const chunks: T[][] = [];

  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }

  // Função otimizada para getItemLayout
  const getItemLayout = (data: T[] | null | undefined, index: number) => ({
    length: 60, // altura estimada do item
    offset: 60 * index,
    index,
  });

  return {chunks, getItemLayout};
}

// Cache LRU para otimização
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // Mover para o final (mais recente)
      const value = this.cache.get(key)!;

      this.cache.delete(key);
      this.cache.set(key, value);

      return value;
    }

    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Atualizar valor existente
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remover item mais antigo
      const firstKey = this.cache.keys().next().value;

      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  values(): IterableIterator<V> {
    return this.cache.values();
  }
}

// Hook para cache LRU
export function useLRUCache<K, V>(capacity: number = 100) {
  const cache = useMemo(() => new LRUCache<K, V>(capacity), [capacity]);

  const get = useCallback((key: K) => cache.get(key), [cache]);
  const set = useCallback((key: K, value: V) => cache.set(key, value), [cache]);
  const has = useCallback((key: K) => cache.has(key), [cache]);
  const del = useCallback((key: K) => cache.delete(key), [cache]);
  const clear = useCallback(() => cache.clear(), [cache]);
  const size = useCallback(() => cache.size(), [cache]);

  return {get, set, has, delete: del, clear, size};
}

export default {
  useDebounce,
  useThrottle,
  useStableMemo,
  useMemoWithCleanup,
  PerformanceMonitor,
  measurePerformance,
  useRenderPerformance,
  optimizeListData,
  LRUCache,
  useLRUCache,
};
