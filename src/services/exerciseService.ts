import apiClient from './apiClient';

export interface ExerciseMetrics {
  accuracy: number;
  consistency: number;
  form: number;
  timing: number;
}

export interface PersonalBests {
  isNewRecord: boolean;
  previousBest?: number;
  improvement?: number;
}

export interface ExerciseFeedback {
  overall?: string;
  improvements: string[];
  strengths: string[];
}

export interface Exercise {
  _id: string;
  userId: string;
  videoId: string;
  analysisId: string;
  exerciseType:
    | 'squat'
    | 'pushup'
    | 'pullup'
    | 'deadlift'
    | 'benchpress'
    | 'other';
  duration: number; // em segundos
  repetitions: number;
  score: number;
  feedback?: ExerciseFeedback;
  metrics: ExerciseMetrics;
  personalBests?: PersonalBests;
  tags?: string[];
  notes?: string;
  isCompleted: boolean;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseStats {
  totalExercises: number;
  totalDuration: number;
  totalRepetitions: number;
  averageScore: number;
  bestScore: number;
  exerciseTypes: string[];
  averageAccuracy: number;
  averageConsistency: number;
  averageForm: number;
  averageTiming: number;
}

export interface ExerciseProgress {
  score: number;
  metrics: ExerciseMetrics;
  completedAt: string;
  duration: number;
  repetitions: number;
}

export interface ExerciseTypeSummary {
  _id: string;
  count: number;
  totalDuration: number;
  totalRepetitions: number;
  averageScore: number;
  bestScore: number;
  lastExercise: string;
}

export interface ExerciseListParams {
  page?: number;
  limit?: number;
  exerciseType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface ExerciseListResponse {
  exercises: Exercise[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface CreateExerciseData {
  videoId: string;
  analysisId: string;
  exerciseType: Exercise['exerciseType'];
  duration: number;
  repetitions?: number;
  score?: number;
  feedback?: ExerciseFeedback;
  metrics?: ExerciseMetrics;
  personalBests?: PersonalBests;
  tags?: string[];
  notes?: string;
}

class ExerciseService {
  /**
   * Lista exercícios do usuário
   */
  async getExercises(
    params: ExerciseListParams = {},
  ): Promise<ExerciseListResponse> {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiClient.get(
        `/exercises?${queryParams.toString()}`,
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar exercícios:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas do usuário
   */
  async getStats(
    timeframe: '7d' | '30d' | '90d' | '1y' = '30d',
  ): Promise<ExerciseStats> {
    try {
      const response = await apiClient.get(
        `/exercises/stats?timeframe=${timeframe}`,
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  /**
   * Obtém progresso por tipo de exercício
   */
  async getProgressByType(
    exerciseType: string,
    limit: number = 10,
  ): Promise<ExerciseProgress[]> {
    try {
      const response = await apiClient.get(
        `/exercises/progress/${exerciseType}?limit=${limit}`,
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      throw error;
    }
  }

  /**
   * Obtém resumo por tipos de exercício
   */
  async getTypesSummary(
    timeframe: '7d' | '30d' | '90d' | '1y' = '30d',
  ): Promise<ExerciseTypeSummary[]> {
    try {
      const response = await apiClient.get(
        `/exercises/types/summary?timeframe=${timeframe}`,
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar resumo por tipos:', error);
      throw error;
    }
  }

  /**
   * Obtém detalhes de um exercício específico
   */
  async getExerciseById(id: string): Promise<Exercise> {
    try {
      const response = await apiClient.get(`/exercises/${id}`);

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar exercício:', error);
      throw error;
    }
  }

  /**
   * Cria um novo exercício
   */
  async createExercise(exerciseData: CreateExerciseData): Promise<Exercise> {
    try {
      const response = await apiClient.post('/exercises', exerciseData);

      return response.data;
    } catch (error) {
      console.error('Erro ao criar exercício:', error);
      throw error;
    }
  }

  /**
   * Atualiza um exercício existente
   */
  async updateExercise(
    id: string,
    exerciseData: Partial<CreateExerciseData>,
  ): Promise<Exercise> {
    try {
      const response = await apiClient.put(`/exercises/${id}`, exerciseData);

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar exercício:', error);
      throw error;
    }
  }

  /**
   * Deleta um exercício
   */
  async deleteExercise(id: string): Promise<void> {
    try {
      await apiClient.delete(`/exercises/${id}`);
    } catch (error) {
      console.error('Erro ao deletar exercício:', error);
      throw error;
    }
  }

  /**
   * Obtém exercícios recentes
   */
  async getRecentExercises(limit: number = 5): Promise<Exercise[]> {
    try {
      const response = await this.getExercises({
        limit,
        sortBy: 'completedAt',
        sortOrder: 'desc',
      });

      return response.exercises;
    } catch (error) {
      console.error('Erro ao buscar exercícios recentes:', error);
      throw error;
    }
  }

  /**
   * Obtém exercícios por tipo
   */
  async getExercisesByType(
    exerciseType: string,
    params: Omit<ExerciseListParams, 'exerciseType'> = {},
  ): Promise<ExerciseListResponse> {
    try {
      return await this.getExercises({...params, exerciseType});
    } catch (error) {
      console.error('Erro ao buscar exercícios por tipo:', error);
      throw error;
    }
  }

  /**
   * Calcula tendência de progresso
   */
  calculateProgressTrend(exercises: ExerciseProgress[]): {
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  } {
    if (exercises.length < 2) {
      return {trend: 'stable', percentage: 0};
    }

    const recent = exercises.slice(0, Math.ceil(exercises.length / 2));
    const older = exercises.slice(Math.ceil(exercises.length / 2));

    const recentAvg =
      recent.reduce((sum, ex) => sum + ex.score, 0) / recent.length;
    const olderAvg =
      older.reduce((sum, ex) => sum + ex.score, 0) / older.length;

    const percentage = Math.abs(((recentAvg - olderAvg) / olderAvg) * 100);

    if (recentAvg > olderAvg + 2) {
      return {trend: 'up', percentage};
    } else if (recentAvg < olderAvg - 2) {
      return {trend: 'down', percentage};
    } else {
      return {trend: 'stable', percentage};
    }
  }

  /**
   * Formata duração em formato legível
   */
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${remainingSeconds}s`;
  }

  /**
   * Obtém cor baseada no score
   */
  getScoreColor(score: number): string {
    if (score >= 90) {
      return '#4CAF50';
    } // Verde
    if (score >= 80) {
      return '#8BC34A';
    } // Verde claro
    if (score >= 70) {
      return '#FFC107';
    } // Amarelo
    if (score >= 60) {
      return '#FF9800';
    } // Laranja

    return '#F44336'; // Vermelho
  }

  /**
   * Obtém classificação baseada no score
   */
  getScoreRating(score: number): string {
    if (score >= 95) {
      return 'Excelente';
    }
    if (score >= 85) {
      return 'Muito Bom';
    }
    if (score >= 75) {
      return 'Bom';
    }
    if (score >= 65) {
      return 'Regular';
    }

    return 'Precisa Melhorar';
  }
}

export default new ExerciseService();
