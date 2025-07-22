import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {AppState} from '@types/index';
import {appService} from '@services/appService';
import {showToast} from '@utils/toastConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Estado inicial
const initialState: AppState = {
  isFirstLaunch: true,
  onboardingCompleted: false,
  theme: 'light',
  language: 'pt-BR',
  notifications: {
    enabled: true,
    analysis: true,
    reminders: true,
    updates: true,
    marketing: false,
  },
  permissions: {
    camera: false,
    microphone: false,
    storage: false,
    notifications: false,
    location: false,
    healthKit: false,
    biometric: false,
  },
  connectivity: {
    isConnected: true,
    networkType: 'wifi',
  },
  app: {
    version: '1.0.0',
    buildNumber: '1',
    environment: 'production',
  },
  features: {
    aiAnalysis: true,
    videoRecording: true,
    socialSharing: true,
    premiumFeatures: false,
    betaFeatures: false,
  },
  cache: {
    lastCleared: null,
    size: 0,
  },
  analytics: {
    enabled: true,
    userId: null,
  },
  loading: false,
  error: null,
};

// Async thunks
export const initializeApp = createAsyncThunk(
  'app/initialize',
  async (_, {rejectWithValue}) => {
    try {
      // Verificar se é o primeiro lançamento
      const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
      const onboardingCompleted = await AsyncStorage.getItem(
        'onboardingCompleted',
      );
      const theme = await AsyncStorage.getItem('theme');
      const language = await AsyncStorage.getItem('language');

      // Verificar permissões
      const permissions = await appService.checkPermissions();

      // Verificar conectividade
      const connectivity = await appService.checkConnectivity();

      // Obter informações do app
      const appInfo = await appService.getAppInfo();

      // Verificar features disponíveis
      const features = await appService.getAvailableFeatures();

      return {
        isFirstLaunch: isFirstLaunch === null,
        onboardingCompleted: onboardingCompleted === 'true',
        theme: theme || 'light',
        language: language || 'pt-BR',
        permissions,
        connectivity,
        app: appInfo,
        features,
      };
    } catch (error: any) {
      const message = error.message || 'Erro ao inicializar aplicativo';

      return rejectWithValue(message);
    }
  },
);

export const completeOnboarding = createAsyncThunk(
  'app/completeOnboarding',
  async (_, {rejectWithValue}) => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      await AsyncStorage.setItem('isFirstLaunch', 'false');
      showToast.success('Bem-vindo!', 'Configuração inicial concluída.');

      return true;
    } catch (error: any) {
      const message = error.message || 'Erro ao completar onboarding';

      return rejectWithValue(message);
    }
  },
);

export const updateTheme = createAsyncThunk(
  'app/updateTheme',
  async (theme: 'light' | 'dark', {rejectWithValue}) => {
    try {
      await AsyncStorage.setItem('theme', theme);

      return theme;
    } catch (error: any) {
      const message = error.message || 'Erro ao atualizar tema';

      return rejectWithValue(message);
    }
  },
);

export const updateLanguage = createAsyncThunk(
  'app/updateLanguage',
  async (language: string, {rejectWithValue}) => {
    try {
      await AsyncStorage.setItem('language', language);
      showToast.success('Idioma alterado', 'As configurações foram salvas.');

      return language;
    } catch (error: any) {
      const message = error.message || 'Erro ao atualizar idioma';

      return rejectWithValue(message);
    }
  },
);

export const requestPermissions = createAsyncThunk(
  'app/requestPermissions',
  async (permissionTypes: string[], {rejectWithValue}) => {
    try {
      const permissions = await appService.requestPermissions(permissionTypes);

      return permissions;
    } catch (error: any) {
      const message = error.message || 'Erro ao solicitar permissões';

      return rejectWithValue(message);
    }
  },
);

export const updateNotificationSettings = createAsyncThunk(
  'app/updateNotifications',
  async (settings: any, {rejectWithValue}) => {
    try {
      await AsyncStorage.setItem(
        'notificationSettings',
        JSON.stringify(settings),
      );
      await appService.updateNotificationSettings(settings);
      showToast.success(
        'Configurações salvas',
        'Suas preferências de notificação foram atualizadas.',
      );

      return settings;
    } catch (error: any) {
      const message = error.message || 'Erro ao atualizar notificações';

      return rejectWithValue(message);
    }
  },
);

export const clearCache = createAsyncThunk(
  'app/clearCache',
  async (_, {rejectWithValue}) => {
    try {
      const clearedSize = await appService.clearCache();

      showToast.success('Cache limpo!', `${clearedSize}MB de espaço liberado.`);

      return {
        lastCleared: new Date().toISOString(),
        size: 0,
      };
    } catch (error: any) {
      const message = error.message || 'Erro ao limpar cache';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const checkForUpdates = createAsyncThunk(
  'app/checkUpdates',
  async (_, {rejectWithValue}) => {
    try {
      const updateInfo = await appService.checkForUpdates();

      if (updateInfo.available) {
        showToast.info(
          'Atualização disponível',
          'Uma nova versão está disponível!',
        );
      }

      return updateInfo;
    } catch (error: any) {
      const message = error.message || 'Erro ao verificar atualizações';

      return rejectWithValue(message);
    }
  },
);

export const reportBug = createAsyncThunk(
  'app/reportBug',
  async (
    {
      description,
      category,
      logs,
    }: {
      description: string;
      category: string;
      logs?: any;
    },
    {rejectWithValue},
  ) => {
    try {
      const response = await appService.reportBug({
        description,
        category,
        logs,
      });

      showToast.success(
        'Relatório enviado!',
        'Obrigado pelo feedback. Analisaremos o problema.',
      );

      return response;
    } catch (error: any) {
      const message = error.message || 'Erro ao enviar relatório';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const sendFeedback = createAsyncThunk(
  'app/sendFeedback',
  async (
    {
      message,
      rating,
      category,
    }: {
      message: string;
      rating: number;
      category: string;
    },
    {rejectWithValue},
  ) => {
    try {
      const response = await appService.sendFeedback({
        message,
        rating,
        category,
      });

      showToast.success('Feedback enviado!', 'Obrigado pela sua opinião!');

      return response;
    } catch (error: any) {
      const message = error.message || 'Erro ao enviar feedback';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const updateConnectivity = createAsyncThunk(
  'app/updateConnectivity',
  async (_, {rejectWithValue}) => {
    try {
      const connectivity = await appService.checkConnectivity();

      return connectivity;
    } catch (error: any) {
      const message = error.message || 'Erro ao verificar conectividade';

      return rejectWithValue(message);
    }
  },
);

export const enableAnalytics = createAsyncThunk(
  'app/enableAnalytics',
  async (enabled: boolean, {rejectWithValue}) => {
    try {
      await AsyncStorage.setItem('analyticsEnabled', enabled.toString());
      if (enabled) {
        await appService.initializeAnalytics();
      } else {
        await appService.disableAnalytics();
      }

      return enabled;
    } catch (error: any) {
      const message = error.message || 'Erro ao configurar analytics';

      return rejectWithValue(message);
    }
  },
);

export const getCacheSize = createAsyncThunk(
  'app/getCacheSize',
  async (_, {rejectWithValue}) => {
    try {
      const size = await appService.getCacheSize();

      return size;
    } catch (error: any) {
      const message = error.message || 'Erro ao verificar cache';

      return rejectWithValue(message);
    }
  },
);

// Slice
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setConnectivity: (
      state,
      action: PayloadAction<{isConnected: boolean; networkType: string}>,
    ) => {
      state.connectivity = action.payload;
    },
    updatePermission: (
      state,
      action: PayloadAction<{permission: string; granted: boolean}>,
    ) => {
      const {permission, granted} = action.payload;

      (state.permissions as any)[permission] = granted;
    },
    toggleFeature: (
      state,
      action: PayloadAction<{feature: string; enabled: boolean}>,
    ) => {
      const {feature, enabled} = action.payload;

      (state.features as any)[feature] = enabled;
    },
    updateCacheSize: (state, action: PayloadAction<number>) => {
      state.cache.size = action.payload;
    },
    setAnalyticsUserId: (state, action: PayloadAction<string | null>) => {
      state.analytics.userId = action.payload;
    },
    resetApp: () => {
      return {
        ...initialState,
        isFirstLaunch: false,
      };
    },
  },
  extraReducers: builder => {
    builder
      // Initialize App
      .addCase(initializeApp.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
        state.error = null;
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Complete Onboarding
      .addCase(completeOnboarding.fulfilled, state => {
        state.onboardingCompleted = true;
        state.isFirstLaunch = false;
      })

      // Update Theme
      .addCase(
        updateTheme.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.theme = action.payload as 'light' | 'dark';
        },

      // Update Language
      .addCase(
        updateLanguage.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.language = action.payload;
        },

      // Request Permissions
      .addCase(requestPermissions.fulfilled, (state, action) => {
        state.permissions = {...state.permissions, ...action.payload};
      })

      // Update Notification Settings
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.notifications = {...state.notifications, ...action.payload};
      })

      // Clear Cache
      .addCase(clearCache.fulfilled, (state, action) => {
        state.cache = action.payload;
      })

      // Update Connectivity
      .addCase(updateConnectivity.fulfilled, (state, action) => {
        state.connectivity = action.payload;
      })

      // Enable Analytics
      .addCase(
        enableAnalytics.fulfilled,
        (state, action: PayloadAction<boolean>) => {
          state.analytics.enabled = action.payload;
        },

      // Get Cache Size
      .addCase(
        getCacheSize.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.cache.size = action.payload;
        },
      );
  },
});

export const appActions = {
  ...appSlice.actions,
  initializeApp,
  completeOnboarding,
  updateTheme,
  updateLanguage,
  requestPermissions,
  updateNotificationSettings,
  clearCache,
  checkForUpdates,
  reportBug,
  sendFeedback,
  updateConnectivity,
  enableAnalytics,
  getCacheSize,
};

export default appSlice.reducer;
