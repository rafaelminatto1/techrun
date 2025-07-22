import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '@store/index';
import {analysisActions} from '@store/index';
import {AnalysisData} from '@types/index';

/**
 * Hook personalizado para gerenciar análises
 */
export const useAnalysis = () => {
  const dispatch = useAppDispatch();
  const {analyses, currentAnalysis, loading, error} = useAppSelector(
    state => state.analysis,
  );

  const startAnalysis = useCallback(
    async (analysisData: AnalysisData) => {
      try {
        const result = await dispatch(
          analysisActions.startAnalysis(analysisData),
        );

        return result;
      } catch (error) {
        console.error('Start analysis error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const fetchAnalyses = useCallback(async () => {
    try {
      const result = await dispatch(analysisActions.fetchAnalyses());

      return result;
    } catch (error) {
      console.error('Fetch analyses error:', error);
      throw error;
    }
  }, [dispatch]);

  const fetchAnalysisById = useCallback(
    async (analysisId: string) => {
      try {
        const result = await dispatch(
          analysisActions.fetchAnalysisById(analysisId),
        );

        return result;
      } catch (error) {
        console.error('Fetch analysis by ID error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const fetchAnalysesByVideoId = useCallback(
    async (videoId: string) => {
      try {
        const result = await dispatch(
          analysisActions.fetchAnalysesByVideoId(videoId),
        );

        return result;
      } catch (error) {
        console.error('Fetch analyses by video ID error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const deleteAnalysis = useCallback(
    async (analysisId: string) => {
      try {
        const result = await dispatch(
          analysisActions.deleteAnalysis(analysisId),
        );

        return result;
      } catch (error) {
        console.error('Delete analysis error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const updateAnalysisMetadata = useCallback(
    async (analysisId: string, metadata: any) => {
      try {
        const result = await dispatch(
          analysisActions.updateAnalysisMetadata({analysisId, metadata}),
        );

        return result;
      } catch (error) {
        console.error('Update analysis metadata error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const shareAnalysis = useCallback(
    async (analysisId: string, shareOptions: any) => {
      try {
        const result = await dispatch(
          analysisActions.shareAnalysis({analysisId, shareOptions}),
        );

        return result;
      } catch (error) {
        console.error('Share analysis error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const exportAnalysis = useCallback(
    async (analysisId: string, format: string) => {
      try {
        const result = await dispatch(
          analysisActions.exportAnalysis({analysisId, format}),
        );

        return result;
      } catch (error) {
        console.error('Export analysis error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const getAnalysisReport = useCallback(
    async (analysisId: string) => {
      try {
        const result = await dispatch(
          analysisActions.getAnalysisReport(analysisId),
        );

        return result;
      } catch (error) {
        console.error('Get analysis report error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const compareAnalyses = useCallback(
    async (analysisIds: string[]) => {
      try {
        const result = await dispatch(
          analysisActions.compareAnalyses(analysisIds),
        );

        return result;
      } catch (error) {
        console.error('Compare analyses error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const retryAnalysis = useCallback(
    async (analysisId: string) => {
      try {
        const result = await dispatch(
          analysisActions.retryAnalysis(analysisId),
        );

        return result;
      } catch (error) {
        console.error('Retry analysis error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const cancelAnalysis = useCallback(
    async (analysisId: string) => {
      try {
        const result = await dispatch(
          analysisActions.cancelAnalysis(analysisId),
        );

        return result;
      } catch (error) {
        console.error('Cancel analysis error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const getAnalysisMetrics = useCallback(
    async (timeRange?: string) => {
      try {
        const result = await dispatch(
          analysisActions.getAnalysisMetrics(timeRange),
        );

        return result;
      } catch (error) {
        console.error('Get analysis metrics error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const setCurrentAnalysis = useCallback(
    (analysis: any) => {
      dispatch(analysisActions.setCurrentAnalysis(analysis));
    },
    [dispatch],
  );

  const clearError = useCallback(() => {
    dispatch(analysisActions.clearError());
  }, [dispatch]);

  const clearAnalyses = useCallback(() => {
    dispatch(analysisActions.clearAnalyses());
  }, [dispatch]);

  return {
    // Estado
    analyses,
    currentAnalysis,
    loading,
    error,

    // Ações
    startAnalysis,
    fetchAnalyses,
    fetchAnalysisById,
    fetchAnalysesByVideoId,
    deleteAnalysis,
    updateAnalysisMetadata,
    shareAnalysis,
    exportAnalysis,
    getAnalysisReport,
    compareAnalyses,
    retryAnalysis,
    cancelAnalysis,
    getAnalysisMetrics,
    setCurrentAnalysis,
    clearError,
    clearAnalyses,
  };
};

export default useAnalysis;
