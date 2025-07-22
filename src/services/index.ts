// Exportar todos os serviços
export {authService} from './authService';
export {userService} from './userService';
export {videoService} from './videoService';
export {analysisService} from './analysisService';
export {appService} from './appService';
export {apiClient, apiUtils} from './apiClient';

// Exportar tipos e utilitários
export type {ApiResponse} from '@types/index';

// Configurações globais dos serviços
export const serviceConfig = {
  apiBaseUrl: process.env.API_BASE_URL || 'https://api.fitanalyzer.com/v1',
  apiTimeout: parseInt(process.env.API_TIMEOUT || '30000'),
  retryAttempts: 3,
  retryDelay: 1000,
};

// Inicializar serviços
export const initializeServices = async (): Promise<void> => {
  try {
    // Inicializar AuthService
    await authService.initialize();

    // Inicializar AppService
    await appService.initializeAnalytics();

    console.log('✅ Serviços inicializados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar serviços:', error);
  }
};

// Verificar saúde dos serviços
export const checkServicesHealth = async (): Promise<{
  api: boolean;
  auth: boolean;
  connectivity: boolean;
}> => {
  try {
    const [apiHealth, authHealth, connectivityHealth] =
      await Promise.allSettled([
        // Verificar API
        apiClient
          .get('/health')
          .then(() => true)
          .catch(() => false),

        // Verificar autenticação
        authService.isAuthenticated(),

        // Verificar conectividade
        appService.checkConnectivity().then(result => result.isConnected),
      ]);

    return {
      api: apiHealth.status === 'fulfilled' ? apiHealth.value : false,
      auth: authHealth.status === 'fulfilled' ? authHealth.value : false,
      connectivity:
        connectivityHealth.status === 'fulfilled'
          ? connectivityHealth.value
          : false,
    };
  } catch (error) {
    console.error('Erro ao verificar saúde dos serviços:', error);

    return {
      api: false,
      auth: false,
      connectivity: false,
    };
  }
};
