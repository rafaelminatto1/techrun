import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {AnalysisState, AnalysisResult, ExerciseType} from '@types/index';
import {analysisService} from '@services/analysisService';
import {showToast} from '@utils/toastConfig';

// Estado inicial
const initialState: AnalysisState = {
  analyses: [],
  currentAnalysis: null,
  loading: false,
  error: null,
};

// Async thunks
export const startAnalysis = createAsyncThunk(
  'analysis/start',
  async (
    {
      videoId,
      exerciseType,
      options,
    }: {
      videoId: string;
      exerciseType: ExerciseType;
      options?: any;
    },
    {rejectWithValue},
  ) => {
    try {
      showToast.info('Análise iniciada', 'Processando seu vídeo com IA...');
      const response = await analysisService.startAnalysis(
        videoId,
        exerciseType,
        options,
      );

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao iniciar análise';

      showToast.error('Erro na análise', message);

      return rejectWithValue(message);
    }
  },
);

export const fetchAnalyses = createAsyncThunk(
  'analysis/fetchAll',
  async (
    {
      page = 1,
      limit = 10,
      exerciseType,
    }: {
      page?: number;
      limit?: number;
      exerciseType?: ExerciseType;
    } = {},
    {rejectWithValue},
  ) => {
    try {
      const response = await analysisService.getAnalyses({
        page,
        limit,
        exerciseType,
      });

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao carregar análises';

      return rejectWithValue(message);
    }
  },
);

export const fetchAnalysisById = createAsyncThunk(
  'analysis/fetchById',
  async (analysisId: string, {rejectWithValue}) => {
    try {
      const response = await analysisService.getAnalysisById(analysisId);

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao carregar análise';

      return rejectWithValue(message);
    }
  },
);

export const deleteAnalysis = createAsyncThunk(
  'analysis/delete',
  async (analysisId: string, {rejectWithValue}) => {
    try {
      await analysisService.deleteAnalysis(analysisId);
      showToast.success(
        'Análise excluída!',
        'A análise foi removida com sucesso.',
      );

      return analysisId;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao excluir análise';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const shareAnalysis = createAsyncThunk(
  'analysis/share',
  async (
    {analysisId, shareOptions}: {analysisId: string; shareOptions: any},
    {rejectWithValue},
  ) => {
    try {
      const response = await analysisService.shareAnalysis(
        analysisId,
        shareOptions,
      );

      showToast.success(
        'Análise compartilhada!',
        'O link foi gerado com sucesso.',
      );

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao compartilhar análise';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const exportAnalysis = createAsyncThunk(
  'analysis/export',
  async (
    {analysisId, format}: {analysisId: string; format: 'pdf' | 'json' | 'csv'},
    {rejectWithValue},
  ) => {
    try {
      const response = await analysisService.exportAnalysis(analysisId, format);

      showToast.success(
        'Análise exportada!',
        `Arquivo ${format.toUpperCase()} gerado com sucesso.`,
      );

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao exportar análise';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const compareAnalyses = createAsyncThunk(
  'analysis/compare',
  async (analysisIds: string[], {rejectWithValue}) => {
    try {
      const response = await analysisService.compareAnalyses(analysisIds);

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao comparar análises';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const getAnalysisInsights = createAsyncThunk(
  'analysis/insights',
  async (analysisId: string, {rejectWithValue}) => {
    try {
      const response = await analysisService.getAnalysisInsights(analysisId);

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao carregar insights';

      return rejectWithValue(message);
    }
  },
);

export const generateReport = createAsyncThunk(
  'analysis/generateReport',
  async (
    {
      analysisIds,
      reportType,
    }: {
      analysisIds: string[];
      reportType: 'weekly' | 'monthly' | 'custom';
    },
    {rejectWithValue},
  ) => {
    try {
      const response = await analysisService.generateReport(
        analysisIds,
        reportType,
      );

      showToast.success(
        'Relatório gerado!',
        'Seu relatório está pronto para visualização.',
      );

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao gerar relatório';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const getAnalysisProgress = createAsyncThunk(
  'analysis/progress',
  async (analysisId: string, {rejectWithValue}) => {
    try {
      const response = await analysisService.getAnalysisProgress(analysisId);

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao verificar progresso';

      return rejectWithValue(message);
    }
  },
);

export const retryAnalysis = createAsyncThunk(
  'analysis/retry',
  async (analysisId: string, {rejectWithValue}) => {
    try {
      showToast.info(
        'Reprocessando...',
        'Tentando analisar o vídeo novamente.',
      );
      const response = await analysisService.retryAnalysis(analysisId);

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao reprocessar análise';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const saveAnalysisNotes = createAsyncThunk(
  'analysis/saveNotes',
  async (
    {analysisId, notes}: {analysisId: string; notes: string},
    {rejectWithValue},
  ) => {
    try {
      const response = await analysisService.saveAnalysisNotes(
        analysisId,
        notes,
      );

      showToast.success('Notas salvas!', 'Suas anotações foram registradas.');

      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar notas';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

// Slice
const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setCurrentAnalysis: (
      state,
      action: PayloadAction<AnalysisResult | null>,
    ) => {
      state.currentAnalysis = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addAnalysis: (state, action: PayloadAction<AnalysisResult>) => {
      state.analyses.unshift(action.payload);
    },
    removeAnalysis: (state, action: PayloadAction<string>) => {
      state.analyses = state.analyses.filter(
        analysis => analysis.id !== action.payload,
      );
      if (state.currentAnalysis?.id === action.payload) {
        state.currentAnalysis = null;
      }
    },
    updateAnalysis: (state, action: PayloadAction<AnalysisResult>) => {
      const index = state.analyses.findIndex(
        analysis => analysis.id === action.payload.id,
      );

      if (index !== -1) {
        state.analyses[index] = action.payload;
      }
      if (state.currentAnalysis?.id === action.payload.id) {
        state.currentAnalysis = action.payload;
      }
    },
    clearAnalyses: state => {
      state.analyses = [];
      state.currentAnalysis = null;
      state.error = null;
    },
    updateAnalysisProgress: (
      state,
      action: PayloadAction<{analysisId: string; progress: number}>,
    ) => {
      const {analysisId, progress} = action.payload;
      const analysis = state.analyses.find(a => a.id === analysisId);

      if (analysis) {
        // Adicionar campo de progresso se necessário
        (analysis as any).progress = progress;
      }
      if (state.currentAnalysis?.id === analysisId) {
        (state.currentAnalysis as any).progress = progress;
      }
    },
  },
  extraReducers: builder => {
    builder
      // Start Analysis
      .addCase(startAnalysis.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        startAnalysis.fulfilled,
        (state, action: PayloadAction<AnalysisResult>) => {
          state.loading = false;
          state.analyses.unshift(action.payload);
          state.currentAnalysis = action.payload;
          state.error = null;
        },
      )
      .addCase(startAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Analyses
      .addCase(fetchAnalyses.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAnalyses.fulfilled,
        (state, action: PayloadAction<AnalysisResult[]>) => {
          state.loading = false;
          state.analyses = action.payload;
          state.error = null;
        },
      )
      .addCase(fetchAnalyses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Analysis By ID
      .addCase(fetchAnalysisById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAnalysisById.fulfilled,
        (state, action: PayloadAction<AnalysisResult>) => {
          state.loading = false;
          state.currentAnalysis = action.payload;
          // Atualizar na lista se existir
          const index = state.analyses.findIndex(
            analysis => analysis.id === action.payload.id,
          );

          if (index !== -1) {
            state.analyses[index] = action.payload;
          } else {
            state.analyses.unshift(action.payload);
          }
          state.error = null;
        },
      )
      .addCase(fetchAnalysisById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Analysis
      .addCase(deleteAnalysis.pending, state => {
        state.error = null;
      })
      .addCase(
        deleteAnalysis.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.analyses = state.analyses.filter(
            analysis => analysis.id !== action.payload,
          );
          if (state.currentAnalysis?.id === action.payload) {
            state.currentAnalysis = null;
          }
          state.error = null;
        },
      )
      .addCase(deleteAnalysis.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Retry Analysis
      .addCase(retryAnalysis.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        retryAnalysis.fulfilled,
        (state, action: PayloadAction<AnalysisResult>) => {
          state.loading = false;
          const index = state.analyses.findIndex(
            analysis => analysis.id === action.payload.id,
          );

          if (index !== -1) {
            state.analyses[index] = action.payload;
          }
          if (state.currentAnalysis?.id === action.payload.id) {
            state.currentAnalysis = action.payload;
          }
          state.error = null;
        },
      )
      .addCase(retryAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Save Analysis Notes
      .addCase(
        saveAnalysisNotes.fulfilled,
        (state, action: PayloadAction<AnalysisResult>) => {
          const index = state.analyses.findIndex(
            analysis => analysis.id === action.payload.id,
          );

          if (index !== -1) {
            state.analyses[index] = action.payload;
          }
          if (state.currentAnalysis?.id === action.payload.id) {
            state.currentAnalysis = action.payload;
          }
        },
      );
  },
});

export const analysisActions = {
  ...analysisSlice.actions,
  startAnalysis,
  fetchAnalyses,
  fetchAnalysisById,
  deleteAnalysis,
  shareAnalysis,
  exportAnalysis,
  compareAnalyses,
  getAnalysisInsights,
  generateReport,
  getAnalysisProgress,
  retryAnalysis,
  saveAnalysisNotes,
};

export default analysisSlice.reducer;
