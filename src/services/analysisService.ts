import {ApiResponse, AnalysisResult, ExerciseType} from '@types/index';
import {apiClient} from './apiClient';
import {showToast} from '@utils/toastConfig';

class AnalysisService {
  // Iniciar análise de vídeo
  async startAnalysis(
    videoId: string,
    exerciseType: ExerciseType,
    options?: {
      analysisType?: 'basic' | 'advanced' | 'premium';
      focusAreas?: string[];
      compareWith?: string; // ID de análise para comparação
      generateReport?: boolean;
    },
  ): Promise<AnalysisResult> {
    try {
      console.log(
        `🔬 Starting analysis for video ${videoId} (${exerciseType})`,

      const response = await apiClient.post('/analysis/create', {
        videoId,
        exerciseType,
        options: options || {},
      });

      if (response.data && response.data.success && response.data.data) {
        console.log(
          `✅ Analysis started successfully: ${response.data.data._id}`,
        );

        return response.data.data;
      }

      throw new Error(response.data?.message || 'Erro ao iniciar análise');
    } catch (error: any) {
      console.error('❌ Failed to start analysis:', error.message);
      throw new Error(
        error.response?.data?.message || error.message || 'Erro de conexão',
      );
    }
  }

  // Obter lista de análises do usuário
  async getAnalyses({
    page = 1,
    limit = 10,
    exerciseType,
    status,
    dateRange,
  }: {
    page?: number;
    limit?: number;
    exerciseType?: ExerciseType;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    dateRange?: {start: string; end: string};
  } = {}): Promise<AnalysisResult[]> {
    try {
      console.log(`📊 Loading analyses (page: ${page}, limit: ${limit})`);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (exerciseType) {params.append('exerciseType', exerciseType);}
      if (status) {params.append('status', status);}
      if (dateRange) {
        params.append('startDate', dateRange.start);
        params.append('endDate', dateRange.end);
      }

      const response = await apiClient.get(
        `/analysis/user/me?${params.toString()}`,

      if (response.data && response.data.success && response.data.data) {
        console.log(`✅ Loaded ${response.data.data.length} analyses`);

        return response.data.data;
      }

      throw new Error(response.data?.message || 'Erro ao carregar análises');
    } catch (error: any) {
      console.error('❌ Failed to load analyses:', error.message);
      throw new Error(
        error.response?.data?.message || error.message || 'Erro de conexão',
      );
    }
  }

  // Obter análise por ID
  async getAnalysisById(analysisId: string): Promise<AnalysisResult> {
    try {
      const response = await apiClient.get<ApiResponse<AnalysisResult>>(
        `/analysis/${analysisId}`,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar análise');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Excluir análise
  async deleteAnalysis(analysisId: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `/analysis/${analysisId}`,
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao excluir análise');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Compartilhar análise
  async shareAnalysis(
    analysisId: string,
    shareOptions: {
      platform?: 'social' | 'email' | 'link';
      privacy?: 'public' | 'private' | 'unlisted';
      includeVideo?: boolean;
      expiresAt?: string;
    },
  ): Promise<{shareUrl: string; shareId: string}> {
    try {
      const response = await apiClient.post<
        ApiResponse<{
          shareUrl: string;
          shareId: string;
        }>
      >(`/analysis/${analysisId}/share`, shareOptions);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao compartilhar análise');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Exportar análise
  async exportAnalysis(
    analysisId: string,
    format: 'pdf' | 'json' | 'csv',
  ): Promise<{downloadUrl: string}> {
    try {
      const response = await apiClient.post<ApiResponse<{downloadUrl: string}>>(
        `/analysis/${analysisId}/export`,
        {format},
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao exportar análise');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Comparar análises
  async compareAnalyses(analysisIds: string[]): Promise<{
    comparison: any;
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const response = await apiClient.post<
        ApiResponse<{
          comparison: any;
          insights: string[];
          recommendations: string[];
        }>
      >('/analysis/compare', {analysisIds});

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao comparar análises');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter insights da análise
  async getAnalysisInsights(analysisId: string): Promise<{
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    trends: any[];
    predictions: any[];
  }> {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          strengths: string[];
          weaknesses: string[];
          improvements: string[];
          trends: any[];
          predictions: any[];
        }>
      >(`/analysis/${analysisId}/insights`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar insights');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Gerar relatório
  async generateReport(
    analysisIds: string[],
    reportType: 'weekly' | 'monthly' | 'custom',
    options?: {
      includeComparison?: boolean;
      includeRecommendations?: boolean;
      format?: 'pdf' | 'html';
      customDateRange?: {start: string; end: string};
    },
  ): Promise<{reportUrl: string; reportId: string}> {
    try {
      const response = await apiClient.post<
        ApiResponse<{
          reportUrl: string;
          reportId: string;
        }>
      >('/analysis/report', {
        analysisIds,
        reportType,
        ...options,
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao gerar relatório');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Verificar progresso da análise
  async getAnalysisProgress(analysisId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    currentStep: string;
    estimatedTimeRemaining: number;
    error?: string;
  }> {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          status: 'pending' | 'processing' | 'completed' | 'failed';
          progress: number;
          currentStep: string;
          estimatedTimeRemaining: number;
          error?: string;
        }>
      >(`/analysis/${analysisId}/progress`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao verificar progresso');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Reprocessar análise
  async retryAnalysis(analysisId: string): Promise<AnalysisResult> {
    try {
      const response = await apiClient.post<ApiResponse<AnalysisResult>>(
        `/analysis/${analysisId}/retry`,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao reprocessar análise');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Salvar notas da análise
  async saveAnalysisNotes(
    analysisId: string,
    notes: string,
  ): Promise<AnalysisResult> {
    try {
      const response = await apiClient.put<ApiResponse<AnalysisResult>>(
        `/analysis/${analysisId}/notes`,
        {notes},
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao salvar notas');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter estatísticas de análises
  async getAnalysisStats(dateRange?: {start: string; end: string}): Promise<{
    totalAnalyses: number;
    completedAnalyses: number;
    averageScore: number;
    improvementRate: number;
    exerciseBreakdown: Record<ExerciseType, number>;
    trendsData: any[];
  }> {
    try {
      const params = new URLSearchParams();

      if (dateRange) {
        params.append('startDate', dateRange.start);
        params.append('endDate', dateRange.end);
      }

      const response = await apiClient.get<
        ApiResponse<{
          totalAnalyses: number;
          completedAnalyses: number;
          averageScore: number;
          improvementRate: number;
          exerciseBreakdown: Record<ExerciseType, number>;
          trendsData: any[];
        }>
      >(`/analysis/stats?${params.toString()}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar estatísticas');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter recomendações personalizadas
  async getPersonalizedRecommendations(
    exerciseType?: ExerciseType,
    limit: number = 5,
  ): Promise<{
    recommendations: Array<{
      type: 'exercise' | 'technique' | 'equipment' | 'nutrition';
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      estimatedImpact: number;
    }>;
  }> {
    try {
      const params = new URLSearchParams({limit: limit.toString()});

      if (exerciseType) {params.append('exerciseType', exerciseType);}

      const response = await apiClient.get<
        ApiResponse<{
          recommendations: Array<{
            type: 'exercise' | 'technique' | 'equipment' | 'nutrition';
            title: string;
            description: string;
            priority: 'high' | 'medium' | 'low';
            estimatedImpact: number;
          }>;
        }>
      >(`/analysis/recommendations?${params.toString()}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || 'Erro ao carregar recomendações',
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Avaliar análise
  async rateAnalysis(
    analysisId: string,
    rating: number,
    feedback?: string,
  ): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        `/analysis/${analysisId}/rate`,
        {rating, feedback},
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao avaliar análise');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Buscar análises
  async searchAnalyses(
    query: string,
    filters?: {
      exerciseType?: ExerciseType;
      scoreRange?: {min: number; max: number};
      dateRange?: {start: string; end: string};
      hasNotes?: boolean;
    },
    page: number = 1,
    limit: number = 10,
  ): Promise<{analyses: AnalysisResult[]; total: number; hasMore: boolean}> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, JSON.stringify(value));
          }
        });
      }

      const response = await apiClient.get<
        ApiResponse<{
          analyses: AnalysisResult[];
          total: number;
          hasMore: boolean;
        }>
      >(`/analysis/search?${params.toString()}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro na busca');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter análises em destaque
  async getFeaturedAnalyses(limit: number = 5): Promise<AnalysisResult[]> {
    try {
      const response = await apiClient.get<ApiResponse<AnalysisResult[]>>(
        `/analysis/featured?limit=${limit}`,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || 'Erro ao carregar análises em destaque',
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Marcar análise como favorita
  async toggleFavoriteAnalysis(
    analysisId: string,
  ): Promise<{isFavorite: boolean}> {
    try {
      const response = await apiClient.post<ApiResponse<{isFavorite: boolean}>>(
        `/analysis/${analysisId}/favorite`,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao favoritar análise');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter análises favoritas
  async getFavoriteAnalyses(
    page: number = 1,
    limit: number = 10,
  ): Promise<{analyses: AnalysisResult[]; total: number; hasMore: boolean}> {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          analyses: AnalysisResult[];
          total: number;
          hasMore: boolean;
        }>
      >(`/analysis/favorites?page=${page}&limit=${limit}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar favoritos');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }
}

export const analysisService = new AnalysisService();
