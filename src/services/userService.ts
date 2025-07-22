import {ApiResponse, User, UserPreferences, UserStats} from '@types/index';
import {apiClient} from './apiClient';
import {showToast} from '@utils/toastConfig';

class UserService {
  // Obter perfil do usuário
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/user/profile');

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar perfil');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Atualizar perfil do usuário
  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>(
        '/user/profile',
        profileData,

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao atualizar perfil');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Upload de avatar
  async uploadAvatar(imageUri: string): Promise<string> {
    try {
      const formData = new FormData();

      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      const response = await apiClient.post<ApiResponse<{avatarUrl: string}>>(
        '/user/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data.success && response.data.data) {
        return response.data.data.avatarUrl;
      }

      throw new Error(
        response.data.message || 'Erro ao fazer upload do avatar',
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Remover avatar
  async removeAvatar(): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        '/user/avatar',

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao remover avatar');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter preferências do usuário
  async getPreferences(): Promise<UserPreferences> {
    try {
      const response = await apiClient.get<ApiResponse<UserPreferences>>(
        '/user/preferences',

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar preferências');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Atualizar preferências do usuário
  async updatePreferences(
    preferences: Partial<UserPreferences>,
  ): Promise<UserPreferences> {
    try {
      const response = await apiClient.put<ApiResponse<UserPreferences>>(
        '/user/preferences',
        preferences,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || 'Erro ao atualizar preferências',
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter estatísticas do usuário
  async getStats(): Promise<UserStats> {
    try {
      const response = await apiClient.get<ApiResponse<UserStats>>(
        '/user/stats',

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar estatísticas');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter estatísticas por período
  async getStatsByPeriod(
    startDate: string,
    endDate: string,
  ): Promise<UserStats> {
    try {
      const response = await apiClient.get<ApiResponse<UserStats>>(
        `/user/stats?startDate=${startDate}&endDate=${endDate}`,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar estatísticas');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Atualizar configurações de notificação
  async updateNotificationSettings(settings: any): Promise<void> {
    try {
      const response = await apiClient.put<ApiResponse<void>>(
        '/user/notifications',
        settings,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Erro ao atualizar notificações',
        );
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Atualizar configurações de privacidade
  async updatePrivacySettings(settings: any): Promise<void> {
    try {
      const response = await apiClient.put<ApiResponse<void>>(
        '/user/privacy',
        settings,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Erro ao atualizar privacidade',
        );
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Exportar dados do usuário
  async exportUserData(): Promise<{downloadUrl: string}> {
    try {
      const response = await apiClient.post<ApiResponse<{downloadUrl: string}>>(
        '/user/export-data',
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao exportar dados');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Solicitar exclusão de dados
  async requestDataDeletion(): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/user/request-deletion',

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao solicitar exclusão');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter histórico de atividades
  async getActivityHistory(
    page: number = 1,
    limit: number = 20,
  ): Promise<{activities: any[]; total: number; hasMore: boolean}> {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          activities: any[];
          total: number;
          hasMore: boolean;
        }>
      >(`/user/activity-history?page=${page}&limit=${limit}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar histórico');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter conquistas do usuário
  async getAchievements(): Promise<any[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(
        '/user/achievements',

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar conquistas');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Atualizar metas do usuário
  async updateGoals(goals: any): Promise<void> {
    try {
      const response = await apiClient.put<ApiResponse<void>>(
        '/user/goals',
        goals,

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao atualizar metas');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter progresso das metas
  async getGoalsProgress(): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        '/user/goals/progress',

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar progresso');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Conectar com HealthKit/Google Fit
  async connectHealthApp(provider: 'healthkit' | 'googlefit'): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        `/user/health-connect/${provider}`,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Erro ao conectar app de saúde',
        );
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Desconectar app de saúde
  async disconnectHealthApp(
    provider: 'healthkit' | 'googlefit',
  ): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `/user/health-connect/${provider}`,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Erro ao desconectar app de saúde',
        );
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Sincronizar dados de saúde
  async syncHealthData(): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/user/health-sync',

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao sincronizar dados');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter dados de saúde
  async getHealthData(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/user/health-data?startDate=${startDate}&endDate=${endDate}`,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || 'Erro ao carregar dados de saúde',
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Reportar problema
  async reportIssue(
    category: string,
    description: string,
    attachments?: string[],
  ): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/user/report-issue',
        {
          category,
          description,
          attachments,
        },

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao reportar problema');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Enviar feedback
  async sendFeedback(
    rating: number,
    comment: string,
    category: string,
  ): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/user/feedback',
        {
          rating,
          comment,
          category,
        },

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao enviar feedback');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter configurações de conta
  async getAccountSettings(): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        '/user/account-settings',

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || 'Erro ao carregar configurações',
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Atualizar configurações de conta
  async updateAccountSettings(settings: any): Promise<void> {
    try {
      const response = await apiClient.put<ApiResponse<void>>(
        '/user/account-settings',
        settings,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Erro ao atualizar configurações',
        );
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }
}

export const userService = new UserService();
