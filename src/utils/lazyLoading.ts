import {lazy, ComponentType} from 'react';

// Cache para componentes já carregados
const componentCache = new Map<string, ComponentType<any>>();

// Função para criar componentes lazy com cache
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{default: T}>,
  cacheKey?: string,
): T {
  // Verificar cache primeiro
  if (cacheKey && componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey) as T;
  }

  // Criar componente lazy
  const LazyComponent = lazy(async () => {
    try {
      const module = await importFn();

      // Adicionar ao cache se especificado
      if (cacheKey) {
        componentCache.set(cacheKey, module.default);
      }

      return module;
    } catch (error) {
      console.error('Erro ao carregar componente lazy:', error);
      throw error;
    }
  }) as T;

  return LazyComponent;
}

// Função para pré-carregar componentes
export function preloadComponent(
  importFn: () => Promise<{default: ComponentType<any>}>,
  cacheKey?: string,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      // Verificar se já está em cache
      if (cacheKey && componentCache.has(cacheKey)) {
        resolve();

        return;
      }

      const module = await importFn();

      // Adicionar ao cache
      if (cacheKey) {
        componentCache.set(cacheKey, module.default);
      }

      console.log(`✅ Componente pré-carregado: ${cacheKey || 'unnamed'}`);
      resolve();
    } catch (error) {
      console.error('Erro ao pré-carregar componente:', error);
      reject(error);
    }
  });
}

// Função para limpar cache de componentes
export function clearComponentCache(cacheKey?: string): void {
  if (cacheKey) {
    componentCache.delete(cacheKey);
    console.log(`🗑️ Cache removido para: ${cacheKey}`);
  } else {
    componentCache.clear();
    console.log('🗑️ Todo cache de componentes limpo');
  }
}

// Função para obter estatísticas do cache
export function getCacheStats(): {
  size: number;
  keys: string[];
  memoryUsage: number;
} {
  const keys = Array.from(componentCache.keys());

  // Estimar uso de memória (aproximado)
  const memoryUsage = keys.length * 1024; // 1KB por componente (estimativa)

  return {
    size: componentCache.size,
    keys,
    memoryUsage,
  };
}

// Hook para pré-carregar componentes em background
export function usePreloadComponents(
  components: Array<{
    importFn: () => Promise<{default: ComponentType<any>}>;
    cacheKey: string;
    priority?: 'high' | 'medium' | 'low';
  }>,
): void {
  // Ordenar por prioridade
  const sortedComponents = components.sort((a, b) => {
    const priorities = {high: 3, medium: 2, low: 1};

    return (
      priorities[b.priority || 'medium'] - priorities[a.priority || 'medium']
    );
  });

  // Pré-carregar componentes com delay baseado na prioridade
  sortedComponents.forEach(
    ({importFn, cacheKey, priority = 'medium'}, index) => {
      const delay =
        {
          high: 0,
          medium: 100,
          low: 500,
        }[priority] +
        index * 50; // Espaçar carregamentos

      setTimeout(() => {
        preloadComponent(importFn, cacheKey).catch(error => {
          console.warn(`Falha ao pré-carregar ${cacheKey}:`, error);
        });
      }, delay);
    },
  );
}

// Lazy loading para screens com preload
export const createLazyScreen = <T extends ComponentType<any>>(
  importFn: () => Promise<{default: T}>,
  screenName: string,
  preload: boolean = false,
): T => {
  const LazyScreen = createLazyComponent(importFn, screenName);

  // Pré-carregar se solicitado
  if (preload) {
    // Pré-carregar após um delay para não afetar o carregamento inicial
    setTimeout(() => {
      preloadComponent(importFn, screenName).catch(console.warn);
    }, 2000);
  }

  return LazyScreen;
};

// Utilitário para carregar componentes condicionalmente
export function conditionallyLoadComponent<T extends ComponentType<any>>(
  condition: boolean,
  importFn: () => Promise<{default: T}>,
  fallback?: T,
): T | null {
  if (condition) {
    return createLazyComponent(importFn);
  }

  return fallback || null;
}

// Gerenciador de recursos lazy loading
export class LazyResourceManager {
  private static instance: LazyResourceManager;
  private resourceQueue: Array<{
    id: string;
    loader: () => Promise<any>;
    priority: number;
  }> = [];
  private isProcessing = false;

  static getInstance(): LazyResourceManager {
    if (!LazyResourceManager.instance) {
      LazyResourceManager.instance = new LazyResourceManager();
    }

    return LazyResourceManager.instance;
  }

  // Adicionar recurso à fila de carregamento
  addResource(
    id: string,
    loader: () => Promise<any>,
    priority: number = 0,
  ): void {
    this.resourceQueue.push({id, loader, priority});

    // Ordenar por prioridade
    this.resourceQueue.sort((a, b) => b.priority - a.priority);

    // Processar fila se não estiver processando
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // Processar fila de recursos
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.resourceQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.resourceQueue.length > 0) {
      const resource = this.resourceQueue.shift()!;

      try {
        console.log(`⏳ Carregando recurso lazy: ${resource.id}`);
        await resource.loader();
        console.log(`✅ Recurso carregado: ${resource.id}`);
      } catch (error) {
        console.error(`❌ Erro ao carregar recurso ${resource.id}:`, error);
      }

      // Pequeno delay entre carregamentos
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  // Limpar fila
  clearQueue(): void {
    this.resourceQueue = [];
    this.isProcessing = false;
  }

  // Obter status da fila
  getQueueStatus(): {
    pending: number;
    isProcessing: boolean;
  } {
    return {
      pending: this.resourceQueue.length,
      isProcessing: this.isProcessing,
    };
  }
}

export default {
  createLazyComponent,
  createLazyScreen,
  preloadComponent,
  clearComponentCache,
  getCacheStats,
  conditionallyLoadComponent,
  LazyResourceManager,
};
