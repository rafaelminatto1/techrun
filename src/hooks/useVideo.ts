import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '@store/index';
import {videoActions} from '@store/index';
import {VideoUploadData, VideoMetadata} from '@types/index';
import {poseAnalysisService, ExerciseMetrics} from '@services/poseAnalysis';

/**
 * Hook personalizado para gerenciar vídeos
 */
export const useVideo = () => {
  const dispatch = useAppDispatch();
  const {videos, currentVideo, uploading, processing, error} = useAppSelector(
    state => state.video,
  );

  const uploadVideo = useCallback(
    async (videoData: VideoUploadData) => {
      try {
        const result = await dispatch(videoActions.uploadVideo(videoData));

        return result;
      } catch (error) {
        console.error('Upload video error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const analyzeVideo = useCallback(
    async (
      videoUri: string,
      exerciseType: string = 'general',
    ): Promise<ExerciseMetrics> => {
      try {
        const metrics = await poseAnalysisService.analyzeVideo(
          videoUri,
          exerciseType,
        );

        return metrics;
      } catch (error) {
        console.error('Error analyzing video:', error);
        throw error;
      }
    },
    [],
  );

  const fetchVideos = useCallback(async () => {
    try {
      const result = await dispatch(videoActions.fetchVideos());

      return result;
    } catch (error) {
      console.error('Fetch videos error:', error);
      throw error;
    }
  }, [dispatch]);

  const fetchVideoById = useCallback(
    async (videoId: string) => {
      try {
        const result = await dispatch(videoActions.fetchVideoById(videoId));

        return result;
      } catch (error) {
        console.error('Fetch video by ID error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const deleteVideo = useCallback(
    async (videoId: string) => {
      try {
        const result = await dispatch(videoActions.deleteVideo(videoId));

        return result;
      } catch (error) {
        console.error('Delete video error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const updateVideoMetadata = useCallback(
    async (videoId: string, metadata: Partial<VideoMetadata>) => {
      try {
        const result = await dispatch(
          videoActions.updateVideoMetadata({videoId, metadata}),
        );

        return result;
      } catch (error) {
        console.error('Update video metadata error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const generateThumbnail = useCallback(
    async (videoId: string) => {
      try {
        const result = await dispatch(videoActions.generateThumbnail(videoId));

        return result;
      } catch (error) {
        console.error('Generate thumbnail error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const shareVideo = useCallback(
    async (videoId: string, shareOptions: any) => {
      try {
        const result = await dispatch(
          videoActions.shareVideo({videoId, shareOptions}),
        );

        return result;
      } catch (error) {
        console.error('Share video error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const downloadVideo = useCallback(
    async (videoId: string) => {
      try {
        const result = await dispatch(videoActions.downloadVideo(videoId));

        return result;
      } catch (error) {
        console.error('Download video error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const processVideo = useCallback(
    async (videoId: string) => {
      try {
        const result = await dispatch(videoActions.processVideo(videoId));

        return result;
      } catch (error) {
        console.error('Process video error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const getVideoAnalytics = useCallback(
    async (videoId: string) => {
      try {
        const result = await dispatch(videoActions.getVideoAnalytics(videoId));

        return result;
      } catch (error) {
        console.error('Get video analytics error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const setCurrentVideo = useCallback(
    (video: any) => {
      dispatch(videoActions.setCurrentVideo(video));
    },
    [dispatch],
  );

  const clearError = useCallback(() => {
    dispatch(videoActions.clearError());
  }, [dispatch]);

  const clearVideos = useCallback(() => {
    dispatch(videoActions.clearVideos());
  }, [dispatch]);

  return {
    // Estado
    videos,
    currentVideo,
    uploading,
    processing,
    error,

    // Ações
    uploadVideo,
    fetchVideos,
    fetchVideoById,
    deleteVideo,
    updateVideoMetadata,
    generateThumbnail,
    shareVideo,
    downloadVideo,
    processVideo,
    getVideoAnalytics,
    setCurrentVideo,
    clearError,
    clearVideos,
    analyzeVideo,
  };
};

export default useVideo;
