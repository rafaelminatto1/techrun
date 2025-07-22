import {Platform, PermissionsAndroid, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo';
import DeviceInfo from 'react-native-device-info';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {apiClient} from './apiClient';
import {ApiResponse} from '@types/index';
import {showToast} from '@utils/toastConfig';

class AppService {
  // Verificar permissões
  async checkPermissions(): Promise<{
    camera: boolean;
    microphone: boolean;
    storage: boolean;
    notifications: boolean;
    location: boolean;
    healthKit: boolean;
    biometric: boolean;
  }> {
    try {
      const permissions = {
        camera: false,
        microphone: false,
        storage: false,
        notifications: false,
        location: false,
        healthKit: false,
        biometric: false,
      };

      if (Platform.OS === 'ios') {
        // iOS permissions
        const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
        const microphoneStatus = await check(PERMISSIONS.IOS.MICROPHONE);
        const photoLibraryStatus = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
        const locationStatus = await check(
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        );
        const motionStatus = await check(PERMISSIONS.IOS.MOTION);
        const faceIdStatus = await check(PERMISSIONS.IOS.FACE_ID);

        permissions.camera = cameraStatus === RESULTS.GRANTED;
        permissions.microphone = microphoneStatus === RESULTS.GRANTED;
        permissions.storage = photoLibraryStatus === RESULTS.GRANTED;
        permissions.location = locationStatus === RESULTS.GRANTED;
        permissions.healthKit = motionStatus === RESULTS.GRANTED;
        permissions.biometric = faceIdStatus === RESULTS.GRANTED;
      } else {
        // Android permissions
        const cameraStatus = await check(PERMISSIONS.ANDROID.CAMERA);
        const microphoneStatus = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
        const storageStatus = await check(
          PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        );
        const locationStatus = await check(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        );
        const biometricStatus = await check(PERMISSIONS.ANDROID.USE_BIOMETRIC);

        permissions.camera = cameraStatus === RESULTS.GRANTED;
        permissions.microphone = microphoneStatus === RESULTS.GRANTED;
        permissions.storage = storageStatus === RESULTS.GRANTED;
        permissions.location = locationStatus === RESULTS.GRANTED;
        permissions.biometric = biometricStatus === RESULTS.GRANTED;
      }

      return permissions;
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      throw error;
    }
  }

  // Solicitar permissões
  async requestPermissions(permissionTypes: string[]): Promise<any> {
    try {
      const results: any = {};

      for (const permissionType of permissionTypes) {
        let permission;

        if (Platform.OS === 'ios') {
          switch (permissionType) {
            case 'camera':
              permission = PERMISSIONS.IOS.CAMERA;
              break;
            case 'microphone':
              permission = PERMISSIONS.IOS.MICROPHONE;
              break;
            case 'storage':
              permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
              break;
            case 'location':
              permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
              break;
            case 'healthKit':
              permission = PERMISSIONS.IOS.MOTION;
              break;
            case 'biometric':
              permission = PERMISSIONS.IOS.FACE_ID;
              break;
            default:
              continue;
          }
        } else {
          switch (permissionType) {
            case 'camera':
              permission = PERMISSIONS.ANDROID.CAMERA;
              break;
            case 'microphone':
              permission = PERMISSIONS.ANDROID.RECORD_AUDIO;
              break;
            case 'storage':
              permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
              break;
            case 'location':
              permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
              break;
            case 'biometric':
              permission = PERMISSIONS.ANDROID.USE_BIOMETRIC;
              break;
            default:
              continue;
          }
        }

        if (permission) {
          const result = await request(permission);

          results[permissionType] = result === RESULTS.GRANTED;
        }
      }

      return results;
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      throw error;
    }
  }

  // Verificar conectividade
  async checkConnectivity(): Promise<{
    isConnected: boolean;
    networkType: string;
  }> {
    try {
      const netInfo = await NetInfo.fetch();

      return {
        isConnected: netInfo.isConnected || false,
        networkType: netInfo.type || 'unknown',
      };
    } catch (error) {
      console.error('Erro ao verificar conectividade:', error);

      return {
        isConnected: false,
        networkType: 'unknown',
      };
    }
  }

  // Obter informações do app
  async getAppInfo(): Promise<{
    version: string;
    buildNumber: string;
    environment: string;
  }> {
    try {
      const version = DeviceInfo.getVersion();
      const buildNumber = DeviceInfo.getBuildNumber();
      const environment = __DEV__ ? 'development' : 'production';

      return {
        version,
        buildNumber,
        environment,
      };
    } catch (error) {
      console.error('Erro ao obter informações do app:', error);

      return {
        version: '1.0.0',
        buildNumber: '1',
        environment: 'production',
      };
    }
  }

  // Obter features disponíveis
  async getAvailableFeatures(): Promise<{
    aiAnalysis: boolean;
    videoRecording: boolean;
    socialSharing: boolean;
    premiumFeatures: boolean;
    betaFeatures: boolean;
  }> {
    try {
      // Verificar features baseado na versão do app, plano do usuário, etc.
      const userPlan = await AsyncStorage.getItem('userPlan');
      const betaUser = await AsyncStorage.getItem('betaUser');

      return {
        aiAnalysis: true,
        videoRecording: true,
        socialSharing: true,
        premiumFeatures: userPlan === 'premium' || userPlan === 'pro',
        betaFeatures: betaUser === 'true',
      };
    } catch (error) {
      console.error('Erro ao verificar features:', error);

      return {
        aiAnalysis: true,
        videoRecording: true,
        socialSharing: true,
        premiumFeatures: false,
        betaFeatures: false,
      };
    }
  }

  // Atualizar configurações de notificação
  async updateNotificationSettings(settings: any): Promise<void> {
    try {
      // Salvar localmente
      await AsyncStorage.setItem(
        'notificationSettings',
        JSON.stringify(settings),

      // Enviar para o servidor
      await apiClient.put('/user/notification-settings', settings);
    } catch (error) {
      console.error('Erro ao atualizar configurações de notificação:', error);
      throw error;
    }
  }

  // Limpar cache
  async clearCache(): Promise<number> {
    try {
      // Simular limpeza de cache e retornar tamanho liberado em MB
      const cacheKeys = await AsyncStorage.getAllKeys();
      const cacheKeysToRemove = cacheKeys.filter(
        key =>
          key.startsWith('cache_') ||
          key.startsWith('temp_') ||
          key.startsWith('thumbnail_'),
      );

      await AsyncStorage.multiRemove(cacheKeysToRemove);

      // Simular tamanho liberado (em produção, seria calculado baseado nos arquivos removidos)
      const clearedSize = Math.floor(Math.random() * 50) + 10; // 10-60 MB

      return clearedSize;
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      throw error;
    }
  }

  // Verificar atualizações
  async checkForUpdates(): Promise<{
    available: boolean;
    version?: string;
    mandatory?: boolean;
    releaseNotes?: string;
    downloadUrl?: string;
  }> {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          available: boolean;
          version?: string;
          mandatory?: boolean;
          releaseNotes?: string;
          downloadUrl?: string;
        }>
      >('/app/check-updates');

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return {available: false};
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);

      return {available: false};
    }
  }

  // Reportar bug
  async reportBug({
    description,
    category,
    logs,
  }: {
    description: string;
    category: string;
    logs?: any;
  }): Promise<{ticketId: string}> {
    try {
      const deviceInfo = {
        platform: Platform.OS,
        version: Platform.Version,
        appVersion: DeviceInfo.getVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
        deviceId: await DeviceInfo.getUniqueId(),
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
      };

      const response = await apiClient.post<ApiResponse<{ticketId: string}>>(
        '/app/report-bug',
        {
          description,
          category,
          logs,
          deviceInfo,
          timestamp: new Date().toISOString(),
        },
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao reportar bug');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Enviar feedback
  async sendFeedback({
    message,
    rating,
    category,
  }: {
    message: string;
    rating: number;
    category: string;
  }): Promise<{feedbackId: string}> {
    try {
      const response = await apiClient.post<ApiResponse<{feedbackId: string}>>(
        '/app/feedback',
        {
          message,
          rating,
          category,
          timestamp: new Date().toISOString(),
        },
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao enviar feedback');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Inicializar analytics
  async initializeAnalytics(): Promise<void> {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const analyticsEnabled = await AsyncStorage.getItem('analyticsEnabled');

      if (analyticsEnabled === 'true') {
        // Inicializar serviços de analytics (Firebase, Mixpanel, etc.)
        console.log('Analytics inicializado para usuário:', userId);
      }
    } catch (error) {
      console.error('Erro ao inicializar analytics:', error);
    }
  }

  // Desabilitar analytics
  async disableAnalytics(): Promise<void> {
    try {
      await AsyncStorage.setItem('analyticsEnabled', 'false');
      // Desabilitar serviços de analytics
      console.log('Analytics desabilitado');
    } catch (error) {
      console.error('Erro ao desabilitar analytics:', error);
    }
  }

  // Obter tamanho do cache
  async getCacheSize(): Promise<number> {
    try {
      // Simular cálculo do tamanho do cache em MB
      const cacheKeys = await AsyncStorage.getAllKeys();
      const cacheKeysCount = cacheKeys.filter(
        key =>
          key.startsWith('cache_') ||
          key.startsWith('temp_') ||
          key.startsWith('thumbnail_'),
      ).length;

      // Simular tamanho baseado no número de itens em cache
      const estimatedSize = Math.floor(cacheKeysCount * 0.5); // ~0.5MB por item

      return estimatedSize;
    } catch (error) {
      console.error('Erro ao calcular tamanho do cache:', error);

      return 0;
    }
  }

  // Configurar tema escuro/claro
  async setTheme(theme: 'light' | 'dark'): Promise<void> {
    try {
      await AsyncStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Erro ao definir tema:', error);
      throw error;
    }
  }

  // Obter tema atual
  async getTheme(): Promise<'light' | 'dark'> {
    try {
      const theme = await AsyncStorage.getItem('theme');

      return (theme as 'light' | 'dark') || 'light';
    } catch (error) {
      console.error('Erro ao obter tema:', error);

      return 'light';
    }
  }

  // Configurar idioma
  async setLanguage(language: string): Promise<void> {
    try {
      await AsyncStorage.setItem('language', language);
    } catch (error) {
      console.error('Erro ao definir idioma:', error);
      throw error;
    }
  }

  // Obter idioma atual
  async getLanguage(): Promise<string> {
    try {
      const language = await AsyncStorage.getItem('language');

      return language || 'pt-BR';
    } catch (error) {
      console.error('Erro ao obter idioma:', error);

      return 'pt-BR';
    }
  }

  // Verificar se é primeira execução
  async isFirstLaunch(): Promise<boolean> {
    try {
      const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');

      return isFirstLaunch === null;
    } catch (error) {
      console.error('Erro ao verificar primeira execução:', error);

      return true;
    }
  }

  // Marcar onboarding como completo
  async completeOnboarding(): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ['isFirstLaunch', 'false'],
        ['onboardingCompleted', 'true'],
      ]);
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      throw error;
    }
  }

  // Obter configurações do app
  async getAppSettings(): Promise<any> {
    try {
      const settings = await AsyncStorage.getItem('appSettings');

      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Erro ao obter configurações:', error);

      return {};
    }
  }

  // Salvar configurações do app
  async saveAppSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    }
  }

  // Resetar app para configurações padrão
  async resetApp(): Promise<void> {
    try {
      const keysToKeep = ['access_token', 'refresh_token', 'user_data'];
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));

      await AsyncStorage.multiRemove(keysToRemove);

      showToast.success(
        'App resetado!',
        'Configurações restauradas para o padrão.',
      );
    } catch (error) {
      console.error('Erro ao resetar app:', error);
      throw error;
    }
  }
}

export const appService = new AppService();
