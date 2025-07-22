import {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '@types/index';
import {apiClient} from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showToast} from '@utils/toastConfig';

class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login...', {email: credentials.email});

      const response = await apiClient.post('/auth/login', credentials);

      if (response.data && response.data.success && response.data.data) {
        const {token, user} = response.data.data;

        console.log('✅ Login successful', {userId: user._id, name: user.name});

        // Salvar token e dados do usuário
        await this.saveTokens(token, token); // Backend usa apenas um token
        await this.saveUserData(user);

        // Configurar header de autorização
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

        return {token, user};
      }

      throw new Error(response.data?.message || 'Erro no login');
    } catch (error: any) {
      console.error('❌ Login failed:', error.message);
      throw new Error(
        error.response?.data?.message || error.message || 'Erro de conexão',
      );
    }
  }

  // Registro
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('📝 Attempting registration...', {
        email: userData.email,
        name: userData.name,

      const response = await apiClient.post('/auth/register', userData);

      if (response.data && response.data.success && response.data.data) {
        const {token, user} = response.data.data;

        console.log('✅ Registration successful', {
          userId: user._id,
          name: user.name,

        // Salvar token e dados do usuário
        await this.saveTokens(token, token); // Backend usa apenas um token
        await this.saveUserData(user);

        // Configurar header de autorização
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

        return {token, user};
      }

      throw new Error(response.data?.message || 'Erro no registro');
    } catch (error: any) {
      console.error('❌ Registration failed:', error.message);
      throw new Error(
        error.response?.data?.message || error.message || 'Erro de conexão',
      );
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const refreshToken = await this.getRefreshToken();

      if (refreshToken) {
        await apiClient.post('/auth/logout', {refreshToken});
      }
    } catch (error) {
      // Ignorar erros de logout no servidor
      console.warn('Erro no logout do servidor:', error);
    } finally {
      // Sempre limpar dados locais
      await this.clearAuthData();
    }
  }

  // Refresh Token
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await this.getRefreshToken();

      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }

      const response = await apiClient.post<
        ApiResponse<{accessToken: string; refreshToken: string}>
      >('/auth/refresh', {refreshToken});

      if (response.data.success && response.data.data) {
        const {accessToken, refreshToken: newRefreshToken} = response.data.data;

        await this.saveTokens(accessToken, newRefreshToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        return accessToken;
      }

      throw new Error('Erro ao renovar token');
    } catch (error) {
      await this.clearAuthData();
      throw error;
    }
  }

  // Verificar se está autenticado
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();

      return !!token;
    } catch {
      return false;
    }
  }

  // Obter usuário atual
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);

      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Esqueci a senha
  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/auth/forgot-password',
        {email},

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao enviar email');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Redefinir senha
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/auth/reset-password',
        {
          token,
          password: newPassword,
        },

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao redefinir senha');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Alterar senha
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/auth/change-password',
        {
          currentPassword,
          newPassword,
        },

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao alterar senha');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Verificar email
  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/auth/verify-email',
        {token},

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro na verificação');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Reenviar email de verificação
  async resendVerificationEmail(): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/auth/resend-verification',

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao reenviar email');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Login social (Google, Apple, Facebook)
  async socialLogin(
    provider: 'google' | 'apple' | 'facebook',
    token: string,
  ): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        `/auth/social/${provider}`,
        {
          token,
        },

      if (response.data.success && response.data.data) {
        const {accessToken, refreshToken, user} = response.data.data;

        await this.saveTokens(accessToken, refreshToken);
        await this.saveUserData(user);

        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro no login social');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Excluir conta
  async deleteAccount(password: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        '/auth/account',
        {
          data: {password},
        },

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao excluir conta');
      }

      await this.clearAuthData();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Métodos auxiliares privados
  private async saveTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem(this.TOKEN_KEY, accessToken),
      AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken),
    ]);
  }

  private async saveUserData(user: User): Promise<void> {
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.TOKEN_KEY);
  }

  private async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private async clearAuthData(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(this.TOKEN_KEY),
      AsyncStorage.removeItem(this.REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(this.USER_KEY),
    ]);

    delete apiClient.defaults.headers.common.Authorization;
  }

  // Inicializar serviço (configurar token se existir)
  async initialize(): Promise<void> {
    try {
      const token = await this.getAccessToken();

      if (token) {
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Erro ao inicializar AuthService:', error);
    }
  }

  // Verificar se o token está expirado
  async isTokenExpired(): Promise<boolean> {
    try {
      const response = await apiClient.get('/auth/verify-token');

      return !response.data.success;
    } catch {
      return true;
    }
  }

  // Obter informações do token
  async getTokenInfo(): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        '/auth/token-info',
      );

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Erro ao obter informações do token',
      );
    }
  }
}

export const authService = new AuthService();
