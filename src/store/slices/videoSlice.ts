import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {VideoState, VideoData, ExerciseType, VideoStatus} from '@types/index';
import {videoService} from '@services/videoService';
import {showToast} from '@utils/toastConfig';

// Estado inicial
const initialState: VideoState = {
  videos: [],
  currentVideo: null,
  uploading: false,
  processing: false,
  error: null,
};

// Async thunks
export const uploadVideo = createAsyncThunk(
  'video/upload',
  async (
    {
      videoUri,
      exerciseType,
      metadata,
    }: {
      videoUri: string;
      exerciseType: ExerciseType;
      metadata?: any;
    },
    {rejectWithValue},
  ) => {
    try {
      showToast.videoUpload(
        'Enviando vídeo...',
        'Aguarde enquanto processamos seu vídeo.',
      );
      const response = await videoService.uploadVideo(
        videoUri,
        exerciseType,
        metadata,
      );

      showToast.success(
        'Vídeo enviado!',
        'Seu vídeo foi carregado com sucesso.',
      );

      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao enviar vídeo';

      showToast.error('Erro no upload', message);

      return rejectWithValue(message);
    }
  },
);

export const fetchVideos = createAsyncThunk(
  'video/fetchAll',
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
      const response = await videoService.getVideos({
        page,
        limit,
        exerciseType,
      });

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao carregar vídeos';

      return rejectWithValue(message);
    }
  },
);

export const fetchVideoById = createAsyncThunk(
  'video/fetchById',
  async (videoId: string, {rejectWithValue}) => {
    try {
      const response = await videoService.getVideoById(videoId);

      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar vídeo';

      return rejectWithValue(message);
    }
  },
);

export const deleteVideo = createAsyncThunk(
  'video/delete',
  async (videoId: string, {rejectWithValue}) => {
    try {
      await videoService.deleteVideo(videoId);
      showToast.success('Vídeo excluído!', 'O vídeo foi removido com sucesso.');

      return videoId;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao excluir vídeo';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const updateVideoMetadata = createAsyncThunk(
  'video/updateMetadata',
  async (
    {videoId, metadata}: {videoId: string; metadata: any},
    {rejectWithValue},
  ) => {
    try {
      const response = await videoService.updateVideoMetadata(
        videoId,
        metadata,
      );

      showToast.success(
        'Metadados atualizados!',
        'As informações do vídeo foram salvas.',
      );

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao atualizar metadados';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const generateThumbnail = createAsyncThunk(
  'video/generateThumbnail',
  async (videoId: string, {rejectWithValue}) => {
    try {
      const response = await videoService.generateThumbnail(videoId);

      return {videoId, thumbnailUrl: response.thumbnailUrl};
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao gerar thumbnail';

      return rejectWithValue(message);
    }
  },
);

export const shareVideo = createAsyncThunk(
  'video/share',
  async (
    {videoId, shareOptions}: {videoId: string; shareOptions: any},
    {rejectWithValue},
  ) => {
    try {
      const response = await videoService.shareVideo(videoId, shareOptions);

      showToast.success(
        'Vídeo compartilhado!',
        'O link foi gerado com sucesso.',
      );

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao compartilhar vídeo';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const downloadVideo = createAsyncThunk(
  'video/download',
  async (videoId: string, {rejectWithValue}) => {
    try {
      const response = await videoService.downloadVideo(videoId);

      showToast.success('Download iniciado!', 'O vídeo está sendo baixado.');

      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao baixar vídeo';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const processVideo = createAsyncThunk(
  'video/process',
  async (videoId: string, {rejectWithValue}) => {
    try {
      const response = await videoService.processVideo(videoId);

      showToast.info(
        'Processamento iniciado',
        'Seu vídeo está sendo analisado.',
      );

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao processar vídeo';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const getVideoAnalytics = createAsyncThunk(
  'video/analytics',
  async (videoId: string, {rejectWithValue}) => {
    try {
      const response = await videoService.getVideoAnalytics(videoId);

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao carregar analytics';

      return rejectWithValue(message);
    }
  },
);

// Slice
const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setCurrentVideo: (state, action: PayloadAction<VideoData | null>) => {
      state.currentVideo = action.payload;
    },
    updateVideoStatus: (
      state,
      action: PayloadAction<{videoId: string; status: VideoStatus}>,
    ) => {
      const {videoId, status} = action.payload;
      const video = state.videos.find(v => v.id === videoId);

      if (video) {
        video.status = status;
      }
      if (state.currentVideo?.id === videoId) {
        state.currentVideo.status = status;
      }
    },
    addVideo: (state, action: PayloadAction<VideoData>) => {
      state.videos.unshift(action.payload);
    },
    removeVideo: (state, action: PayloadAction<string>) => {
      state.videos = state.videos.filter(video => video.id !== action.payload);
      if (state.currentVideo?.id === action.payload) {
        state.currentVideo = null;
      }
    },
    updateVideo: (state, action: PayloadAction<VideoData>) => {
      const index = state.videos.findIndex(
        video => video.id === action.payload.id,
      );

      if (index !== -1) {
        state.videos[index] = action.payload;
      }
      if (state.currentVideo?.id === action.payload.id) {
        state.currentVideo = action.payload;
      }
    },
    clearVideos: state => {
      state.videos = [];
      state.currentVideo = null;
      state.error = null;
    },
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.uploading = action.payload;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.processing = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Upload Video
      .addCase(uploadVideo.pending, state => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(
        uploadVideo.fulfilled,
        (state, action: PayloadAction<VideoData>) => {
          state.uploading = false;
          state.videos.unshift(action.payload);
          state.currentVideo = action.payload;
          state.error = null;
        },
      )
      .addCase(uploadVideo.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      })

      // Fetch Videos
      .addCase(fetchVideos.pending, state => {
        state.error = null;
      })
      .addCase(
        fetchVideos.fulfilled,
        (state, action: PayloadAction<VideoData[]>) => {
          state.videos = action.payload;
          state.error = null;
        },
      )
      .addCase(fetchVideos.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Fetch Video By ID
      .addCase(fetchVideoById.pending, state => {
        state.error = null;
      })
      .addCase(
        fetchVideoById.fulfilled,
        (state, action: PayloadAction<VideoData>) => {
          state.currentVideo = action.payload;
          // Atualizar na lista se existir
          const index = state.videos.findIndex(
            video => video.id === action.payload.id,
          );

          if (index !== -1) {
            state.videos[index] = action.payload;
          } else {
            state.videos.unshift(action.payload);
          }
          state.error = null;
        },
      )
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Delete Video
      .addCase(deleteVideo.pending, state => {
        state.error = null;
      })
      .addCase(
        deleteVideo.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.videos = state.videos.filter(
            video => video.id !== action.payload,
          );
          if (state.currentVideo?.id === action.payload) {
            state.currentVideo = null;
          }
          state.error = null;
        },
      )
      .addCase(deleteVideo.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Update Video Metadata
      .addCase(
        updateVideoMetadata.fulfilled,
        (state, action: PayloadAction<VideoData>) => {
          const index = state.videos.findIndex(
            video => video.id === action.payload.id,
          );

          if (index !== -1) {
            state.videos[index] = action.payload;
          }
          if (state.currentVideo?.id === action.payload.id) {
            state.currentVideo = action.payload;
          }
        },

      // Generate Thumbnail
      .addCase(
        generateThumbnail.fulfilled,
        (
          state,
          action: PayloadAction<{videoId: string; thumbnailUrl: string}>,
        ) => {
          const {videoId, thumbnailUrl} = action.payload;
          const video = state.videos.find(v => v.id === videoId);

          if (video) {
            video.thumbnailUrl = thumbnailUrl;
          }
          if (state.currentVideo?.id === videoId) {
            state.currentVideo.thumbnailUrl = thumbnailUrl;
          }
        },

      // Process Video
      .addCase(processVideo.pending, state => {
        state.processing = true;
        state.error = null;
      })
      .addCase(
        processVideo.fulfilled,
        (state, action: PayloadAction<VideoData>) => {
          state.processing = false;
          const index = state.videos.findIndex(
            video => video.id === action.payload.id,
          );

          if (index !== -1) {
            state.videos[index] = action.payload;
          }
          if (state.currentVideo?.id === action.payload.id) {
            state.currentVideo = action.payload;
          }
          state.error = null;
        },
      )
      .addCase(processVideo.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload as string;
      });
  },
});

export const videoActions = {
  ...videoSlice.actions,
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
};

export default videoSlice.reducer;
