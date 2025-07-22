import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showToast} from '@utils/toastConfig';
import NetInfo from '@react-native-netinfo/lib/commonjs';

// Configuração base da API
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api' // Backend local na porta 3000
  : process.env.API_BASE_URL || 'https://api.techrun.app/api';
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '30000');

console.log(`🌐 API Client configured: ${API_BASE_URL}`);

// Criar instância do axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interface para retry de requisições
interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

// Configuração de retry padrão
const defaultRetryConfig: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    return !error.response || error.response.status >= 500;
  },
};

// Interceptor de requisição
apiClient.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    // Verificar conectividade
    const netInfo = await NetInfo.fetch();

    if (!netInfo.isConnected) {
      throw new Error('Sem conexão com a internet');
    }

    // Adicionar token de autorização se existir
    const token = await AsyncStorage.getItem('access_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adicionar ID de requisição único
    if (config.headers) {
      config.headers['X-Request-ID'] = generateRequestId();
    }

    // Log da requisição em desenvolvimento
    if (__DEV__) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  error => {
    console.error('❌ Request Error:', error);

    return Promise.reject(error);
  },
);

// Interceptor de resposta
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log da resposta em desenvolvimento
    if (__DEV__) {
      console.log(
        `✅ ${response.status} ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        {
          data: response.data,
        },
      );
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Log do erro em desenvolvimento
    if (__DEV__) {
      console.error(
        `❌ ${
          error.response?.status
        } ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
        {
          error: error.response?.data,
          message: error.message,
        },
      );
    }

    // Tratar erro 401 (token expirado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');

        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          if (response.data.success) {
            const {accessToken, refreshToken: newRefreshToken} =
              response.data.data;

            // Salvar novos tokens
            await AsyncStorage.setItem('access_token', accessToken);
            await AsyncStorage.setItem('refresh_token', newRefreshToken);

            // Atualizar header de autorização
            apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

            // Repetir requisição original
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Falha no refresh, fazer logout
        await handleAuthFailure();

        return Promise.reject(refreshError);
      }
    }

    // Tratar outros erros
    handleApiError(error);

    return Promise.reject(error);
  },
);

// Função para gerar ID único de requisição
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Função para tratar falha de autenticação
async function handleAuthFailure(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      'access_token',
      'refresh_token',
      'user_data',
    ]);
    delete apiClient.defaults.headers.common.Authorization;

    showToast.error('Sessão expirada', 'Faça login novamente para continuar.');

    // Navegar para tela de login (será implementado no contexto de navegação)
    // NavigationService.navigate('Login');
  } catch (error) {
    console.error('Erro ao limpar dados de autenticação:', error);
  }
}

// Função para tratar erros da API
function handleApiError(error: AxiosError): void {
  const status = error.response?.status;
  const message = (error.response?.data as any)?.message || error.message;

  switch (status) {
    case 400:
      showToast.error('Dados inválidos', message);
      break;
    case 403:
      showToast.error(
        'Acesso negado',
        'Você não tem permissão para esta ação.',
      );
      break;
    case 404:
      showToast.error(
        'Não encontrado',
        'O recurso solicitado não foi encontrado.',
      );
      break;
    case 422:
      showToast.error('Dados inválidos', message);
      break;
    case 429:
      showToast.error(
        'Muitas tentativas',
        'Aguarde um momento antes de tentar novamente.',
      );
      break;
    case 500:
      showToast.error(
        'Erro do servidor',
        'Tente novamente em alguns instantes.',
      );
      break;
    case 503:
      showToast.error(
        'Serviço indisponível',
        'O servidor está temporariamente indisponível.',
      );
      break;
    default:
      if (!error.response) {
        showToast.error(
          'Erro de conexão',
          'Verifique sua conexão com a internet.',
        );
      } else {
        showToast.error('Erro inesperado', message);
      }
  }
}

// Função para fazer requisições com retry
async function requestWithRetry<T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  config: Partial<RetryConfig> = {},
): Promise<AxiosResponse<T>> {
  const retryConfig = {...defaultRetryConfig, ...config};
  let lastError: AxiosError;

  for (let attempt = 0; attempt <= retryConfig.retries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as AxiosError;

      // Verificar se deve tentar novamente
      if (
        attempt === retryConfig.retries ||
        !retryConfig.retryCondition?.(lastError)
      ) {
        throw lastError;
      }

      // Aguardar antes da próxima tentativa
      await new Promise(resolve =>
        setTimeout(resolve, retryConfig.retryDelay * Math.pow(2, attempt)),
      );
    }
  }

  throw lastError!;
}

// Funções utilitárias para diferentes tipos de requisição
export const apiUtils = {
  // GET com retry
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    requestWithRetry(() => apiClient.get<T>(url, config)),

  // POST com retry
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    requestWithRetry(() => apiClient.post<T>(url, data, config)),

  // PUT com retry
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    requestWithRetry(() => apiClient.put<T>(url, data, config)),

  // DELETE com retry
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    requestWithRetry(() => apiClient.delete<T>(url, config)),

  // PATCH com retry
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    requestWithRetry(() => apiClient.patch<T>(url, data, config)),

  // Upload de arquivo
  upload: <T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
  ) => {
    return apiClient.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );

          onProgress(progress);
        }
      },
    });
  },

  // Download de arquivo
  download: (url: string, onProgress?: (progress: number) => void) => {
    return apiClient.get(url, {
      responseType: 'blob',
      onDownloadProgress: progressEvent => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );

          onProgress(progress);
        }
      },
    });
  },

  // Cancelar requisições
  createCancelToken: () => axios.CancelToken.source(),

  // Verificar se erro é de cancelamento
  isCancel: (error: any) => axios.isCancel(error),
};

// Configurar timeout personalizado
export const setApiTimeout = (timeout: number): void => {
  apiClient.defaults.timeout = timeout;
};

// Configurar base URL personalizada
export const setApiBaseUrl = (baseURL: string): void => {
  apiClient.defaults.baseURL = baseURL;
};

// Obter configurações atuais
export const getApiConfig = () => ({
  baseURL: apiClient.defaults.baseURL,
  timeout: apiClient.defaults.timeout,
});

export {apiClient};
export default apiClient;
