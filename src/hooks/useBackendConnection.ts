import {useState, useEffect, useCallback} from 'react';
import {authService} from '@services/authService';
import {videoService} from '@services/videoService';
import {analysisService} from '@services/analysisService';
import {apiClient} from '@services/apiClient';
import {showToast} from '@utils/toastConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BackendConnectionState {
  isConnected: boolean;
  isLoading: boolean;
  lastChecked: Date | null;
  error: string | null;
  retryCount: number;
}

interface BackendHealth {
  status: 'OK' | 'ERROR';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
}

export const useBackendConnection = () => {
  const [connectionState, setConnectionState] =
    useState<BackendConnectionState>({
      isConnected: false,
      isLoading: true,
      lastChecked: null,
      error: null,
      retryCount: 0,
    });

  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(
    null,
  );

  // Verificar saúde do backend
  const checkBackendHealth = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🏥 Checking backend health...');

      const response = await apiClient.get('/health', {timeout: 10000});

      if (response.data && response.data.status === 'OK') {
        setBackendHealth(response.data);
        console.log('✅ Backend is healthy:', response.data);

        return true;
      }

      throw new Error('Backend returned unhealthy status');

    } catch (error: any) {
      console.error('❌ Backend health check failed:', error.message);
      setBackendHealth(null);

      return false;
    }
  }, []);

  // Testar autenticação
  const testAuthentication = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔐 Testing authentication...');

      const isAuth = await authService.isAuthenticated();

      if (isAuth) {
        // Verificar se o token ainda é válido
        const isExpired = await authService.isTokenExpired();

        if (isExpired) {
          console.log('🔄 Token expired, attempting refresh...');
          await authService.refreshToken();
        }

        console.log('✅ Authentication test passed');

        return true;
      }

      console.log('⚠️ User not authenticated');

      return false;

    } catch (error: any) {
      console.error('❌ Authentication test failed:', error.message);

      return false;
    }
  }, []);

  // Testar funcionalidades principais
  const testCoreFeatures = useCallback(async (): Promise<{
    videoService: boolean;
    analysisService: boolean;
  }> => {
    const results = {
      videoService: false,
      analysisService: false,
    };

    try {
      console.log('🧪 Testing core features...');

      // Testar serviço de vídeo (listar vídeos)
      try {
        await videoService.getVideos(1, 1);
        results.videoService = true;
        console.log('✅ Video service test passed');
      } catch (error) {
        console.warn('⚠️ Video service test failed:', error);
      }

      // Testar serviço de análise (listar análises)
      try {
        await analysisService.getAnalyses({page: 1, limit: 1});
        results.analysisService = true;
        console.log('✅ Analysis service test passed');
      } catch (error) {
        console.warn('⚠️ Analysis service test failed:', error);
      }
    } catch (error) {
      console.error('❌ Core features test failed:', error);
    }

    return results;
  }, []);

  // Conectar com backend
  const connectToBackend = useCallback(async (): Promise<boolean> => {
    setConnectionState(prev => ({...prev, isLoading: true, error: null}));

    try {
      console.log('🔌 Connecting to backend...');

      // 1. Verificar saúde do backend
      const isHealthy = await checkBackendHealth();

      if (!isHealthy) {
        throw new Error('Backend não está saudável');
      }

      // 2. Inicializar serviço de autenticação
      await authService.initialize();

      // 3. Testar autenticação se usuário está logado
      const isAuth = await testAuthentication();

      // 4. Testar funcionalidades principais (se autenticado)
      let coreFeatures = {videoService: false, analysisService: false};

      if (isAuth) {
        coreFeatures = await testCoreFeatures();
      }

      // 5. Salvar informações de conexão
      await AsyncStorage.setItem(
        'backend_connection_info',
        JSON.stringify({
          connectedAt: new Date().toISOString(),
          backendHealth,
          isAuthenticated: isAuth,
          coreFeatures,
        }),
      );

      setConnectionState({
        isConnected: true,
        isLoading: false,
        lastChecked: new Date(),
        error: null,
        retryCount: 0,
      });

      console.log('✅ Successfully connected to backend');

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro de conexão';

      setConnectionState(prev => ({
        isConnected: false,
        isLoading: false,
        lastChecked: new Date(),
        error: errorMessage,
        retryCount: prev.retryCount + 1,
      }));

      console.error('❌ Failed to connect to backend:', errorMessage);

      return false;
    }
  }, [checkBackendHealth, testAuthentication, testCoreFeatures, backendHealth]);

  // Reconectar automaticamente
  const autoReconnect = useCallback(
    async (delay: number = 5000) => {
      if (connectionState.retryCount >= 5) {
        console.log('🛑 Max retry attempts reached, stopping auto-reconnect');
        showToast(
          'Não foi possível conectar ao servidor. Verifique sua conexão.',
          'error',
        );

        return;
      }

      console.log(
        `🔄 Auto-reconnecting in ${delay}ms (attempt ${
          connectionState.retryCount + 1
        }/5)`,


      setTimeout(async () => {
        const success = await connectToBackend();

      if (!success && connectionState.retryCount < 5) {
          const nextDelay = Math.min(delay * 2, 30000); // Max 30s delay

          autoReconnect(nextDelay);
        }
      }, delay);
    },
    [connectToBackend, connectionState.retryCount],
  );

  // Desconectar do backend
  const disconnectFromBackend = useCallback(async () => {
    try {
      console.log('🔌 Disconnecting from backend...');

      await authService.logout();
      await AsyncStorage.removeItem('backend_connection_info');

      setConnectionState({
        isConnected: false,
        isLoading: false,
        lastChecked: null,
        error: null,
        retryCount: 0,
      });

      setBackendHealth(null);

      console.log('✅ Disconnected from backend');
    } catch (error) {
      console.error('❌ Error disconnecting from backend:', error);
    }
  }, []);

  // Verificar conexão periodicamente
  const scheduleHealthCheck = useCallback(() => {
    const interval = setInterval(async () => {
      if (connectionState.isConnected) {
        console.log('🕒 Scheduled health check...');
        const isHealthy = await checkBackendHealth();

        if (!isHealthy) {
          console.log(
            '⚠️ Backend became unhealthy, attempting reconnection...',
          );
          autoReconnect(1000);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [connectionState.isConnected, checkBackendHealth, autoReconnect]);

  // Inicializar conexão quando o hook é montado
  useEffect(() => {
    connectToBackend();
  }, []);

  // Configurar verificações periódicas
  useEffect(() => {
    if (connectionState.isConnected) {
      const cleanup = scheduleHealthCheck();

      return cleanup;
    }
  }, [connectionState.isConnected, scheduleHealthCheck]);

  // Auto-reconectar quando perde conexão
  useEffect(() => {
    if (
      !connectionState.isConnected &&
      !connectionState.isLoading &&
      connectionState.error
    ) {
      autoReconnect();
    }
  }, [
    connectionState.isConnected,
    connectionState.isLoading,
    connectionState.error,
    autoReconnect,
  ]);

  return {
    // Estado da conexão
    isConnected: connectionState.isConnected,
    isLoading: connectionState.isLoading,
    error: connectionState.error,
    lastChecked: connectionState.lastChecked,
    retryCount: connectionState.retryCount,

    // Informações do backend
    backendHealth,

    // Ações
    connectToBackend,
    disconnectFromBackend,
    checkBackendHealth,

    // Status detalhado
    connectionDetails: {
      hasHealthCheck: !!backendHealth,
      backendVersion: backendHealth?.version,
      backendEnvironment: backendHealth?.environment,
      uptime: backendHealth?.uptime,
    }
  };
};

export default useBackendConnection;
