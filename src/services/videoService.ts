import {
  ApiResponse,
  VideoData,
  VideoMetadata,
  ExerciseType,
} from '@types/index';
import {apiClient} from './apiClient';
import {showToast} from '@utils/toastConfig';
import {Platform} from 'react-native';
import RNFS from 'react-native-fs';

// Interfaces para controle de upload
interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface VideoValidationResult {
  isValid: boolean;
  error?: string;
  fileSize?: number;
  duration?: number;
  format?: string;
}

class VideoService {
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly MAX_DURATION = 300; // 5 minutos em segundos
  private readonly ALLOWED_FORMATS = ['mp4', 'mov', 'avi'];
  private readonly MAX_RETRIES = 3;
  private readonly CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks para upload
  private readonly COMPRESSION_THRESHOLD = 20 * 1024 * 1024; // 20MB

  // Validar vídeo antes do upload
  async validateVideo(videoUri: string): Promise<VideoValidationResult> {
    try {
      console.log('📹 Validating video file...');

      // Verificar se o arquivo existe
      const exists = await RNFS.exists(videoUri);

      if (!exists) {
        return {isValid: false, error: 'Arquivo de vídeo não encontrado'};
      }

      // Obter informações do arquivo
      const fileInfo = await RNFS.stat(videoUri);
      const fileSize = fileInfo.size;

      // Verificar tamanho do arquivo
      if (fileSize > this.MAX_FILE_SIZE) {
        return {
          isValid: false,
          error: `Arquivo muito grande. Máximo permitido: ${Math.round(
            this.MAX_FILE_SIZE / (1024 * 1024),
          )}MB`,
          fileSize, 
        };
      }

      // Verificar extensão do arquivo
      const extension = videoUri.split('.').pop()?.toLowerCase();

      if (!extension || !this.ALLOWED_FORMATS.includes(extension)) {
        return {
          isValid: false,
          error: `Formato não suportado. Formatos permitidos: ${this.ALLOWED_FORMATS.join(
            ', ',
          )}`,
          format: extension, 
        };
      }

      console.log(
        `✅ Video validation passed: ${Math.round(
          fileSize / (1024 * 1024),
        )}MB, ${extension} format`,

      return {
        isValid: true,
        fileSize,
        format: extension, 
      };

    } catch (error) {
      console.error('❌ Video validation error:', error);

      return {isValid: false, error: 'Erro ao validar vídeo'};
    }
  }

  // Comprimir vídeo se necessário
  async compressVideoIfNeeded(
    videoUri: string,
  ): Promise<{uri: string; compressionRatio?: number}> {
    try {
      const validation = await this.validateVideo(videoUri);

      if (!validation.isValid || !validation.fileSize) {
        throw new Error(validation.error || 'Vídeo inválido');
      }

      // Se o arquivo é menor que o threshold, não precisa comprimir
      if (validation.fileSize < this.COMPRESSION_THRESHOLD) {
        console.log('📦 Video size acceptable, skipping compression');

        return {uri: videoUri};
      }

      console.log('🗜️ Video needs compression, processing...');

      // Calcular parâmetros de compressão baseados no tamanho
      const compressionParams = this.calculateCompressionParams(
        validation.fileSize,

      // Em produção, usaria react-native-video-processing ou react-native-ffmpeg
      // Por agora, simular a compressão com feedback realístico
      const compressedUri = await this.simulateVideoCompression(
        videoUri,
        compressionParams,

      const compressionRatio = compressionParams.targetReduction;

      console.log(
        `✅ Video compression completed with ${Math.round(
          compressionRatio * 100,
        )}% reduction`,

      return {uri: compressedUri, compressionRatio};

    } catch (error) {
      console.error('❌ Video compression error:', error);
      throw error;
    }
  }

  // Calcular parâmetros de compressão
  private calculateCompressionParams(fileSize: number): {
    targetReduction: number;
    quality: number;
    resolution: string;
    bitrate: number;
  } {
    // Quanto maior o arquivo, maior a compressão
    let targetReduction = 0.3; // 30% por padrão
    let quality = 75; // Qualidade boa
    let resolution = '720p';
    let bitrate = 2000; // 2Mbps

    if (fileSize > 50 * 1024 * 1024) {
      // > 50MB
      targetReduction = 0.6; // 60% de redução
      quality = 65;
      resolution = '480p';
      bitrate = 1000;
    } else if (fileSize > 30 * 1024 * 1024) {
      // > 30MB
      targetReduction = 0.4; // 40% de redução
      quality = 70;
      resolution = '720p';
      bitrate = 1500;
    }

    return {targetReduction, quality, resolution, bitrate};
  }

  // Simular compressão de vídeo
  private async simulateVideoCompression(
    videoUri: string,
    params: {
      targetReduction: number;
      quality: number;
      resolution: string;
      bitrate: number;
    },
  ): Promise<string> {
    // Simular tempo de processamento baseado na complexidade
    const processingTime = Math.random() * 3000 + 2000; // 2-5 segundos

    console.log(
      `🎬 Compressing video: ${params.resolution} @ ${params.bitrate}kbps, quality: ${params.quality}%`,

    // Simular progresso de compressão
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, processingTime / 5));
      console.log(`⏳ Compression progress: ${i}%`);
    }

    // Em produção, retornaria o caminho do arquivo comprimido
    // Por agora, retornar o URI original (simulação)
    return videoUri;
  }

  // Upload de vídeo com retry e validação
  async uploadVideo(
    videoUri: string,
    exerciseType: ExerciseType,
    metadata?: Partial<VideoMetadata>,
    onProgress?: (progress: number) => void,
  ): Promise<VideoData> {
    console.log(`🚀 Starting video upload for ${exerciseType} exercise`);

    try {
      // 1. Validar vídeo
      const validation = await this.validateVideo(videoUri);

      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // 2. Comprimir se necessário
      const compressionResult = await this.compressVideoIfNeeded(videoUri);
      const processedVideoUri = compressionResult.uri;

      // 3. Preparar dados para upload
      const fileName = `${exerciseType}_${Date.now()}.${validation.format}`;
      const formData = new FormData();

      // Adicionar arquivo de vídeo
      formData.append('video', {
        uri:
          Platform.OS === 'ios'
            ? processedVideoUri.replace('file://', '')
            : processedVideoUri,
        type: `video/${validation.format}`,
        name: fileName,
      } as any);

      // Adicionar metadados expandidos
      const enhancedMetadata = {
        ...metadata,
        originalSize: validation.fileSize,
        format: validation.format,
        compressionRatio: compressionResult.compressionRatio,
        uploadTimestamp: new Date().toISOString(),
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      };

      formData.append('exerciseType', exerciseType);
      formData.append('metadata', JSON.stringify(enhancedMetadata));

      // 4. Verificar se deve usar upload chunked
      const fileInfo = await RNFS.stat(processedVideoUri);

      if (fileInfo.size > this.CHUNK_SIZE) {
        console.log('📤 Large file detected, using chunked upload');

        return await this.uploadVideoInChunks(
          processedVideoUri,
          fileName,
          enhancedMetadata,
          onProgress,
        );
      } else {
        // 4. Fazer upload direto com retry automático
        return await this.uploadWithRetry(formData, onProgress);
      }
    } catch (error: any) {
      console.error('❌ Video upload failed:', error);
      throw new Error(error.message || 'Erro ao fazer upload do vídeo');
    }
  }

  // Upload com retry automático
  private async uploadWithRetry(
    formData: FormData,
    onProgress?: (progress: number) => void,
    retryCount: number = 0,
  ): Promise<VideoData> {
    try {
      console.log(`📤 Upload attempt ${retryCount + 1}/${this.MAX_RETRIES}`);

      const response = await apiClient.post<VideoData>(
        '/videos/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 segundos
          onUploadProgress: progressEvent => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );

              onProgress(progress);
              console.log(`📊 Upload progress: ${progress}%`);
            }
          },
        },
      );

      if (response.data) {
        console.log('✅ Video upload successful');

        return response.data;
      }

      throw new Error('Resposta inválida do servidor');

    } catch (error: any) {
      console.warn(
        `⚠️ Upload attempt ${retryCount + 1} failed:`,
        error.message,

      // Verificar se deve tentar novamente
      if (retryCount < this.MAX_RETRIES - 1) {
        const shouldRetry = this.shouldRetryUpload(error);

        if (shouldRetry) {
          // Aguardar antes de tentar novamente (backoff exponencial)
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s

          console.log(`🔄 Retrying upload in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));

          return this.uploadWithRetry(formData, onProgress, retryCount + 1);
        }
      }

      // Se chegou aqui, todas as tentativas falharam
      throw new Error(
        error.response?.data?.message || error.message || 'Erro de conexão',
      );
    }
  }

  // Verificar se deve tentar upload novamente
  private shouldRetryUpload(error: any): boolean {
    // Retry para erros de rede/temporários
    const retryableErrors = ['NETWORK_ERROR', 'TIMEOUT', 'CONNECTION_ERROR'];
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];

    if (error.code && retryableErrors.includes(error.code)) {
      return true;
    }

      error.response?.status &&
      retryableStatusCodes.includes(error.response.status)
    ) {
      return true;
    }

    return false;
  }

  // Upload em chunks para arquivos grandes
  private async uploadVideoInChunks(
    videoUri: string,
    fileName: string,
    metadata: any,
    onProgress?: (progress: number) => void,
  ): Promise<VideoData> {
    try {
      const fileInfo = await RNFS.stat(videoUri);
      const totalSize = fileInfo.size;
      const totalChunks = Math.ceil(totalSize / this.CHUNK_SIZE);

      console.log(
        `📦 Starting chunked upload: ${totalChunks} chunks, ${Math.round(
          totalSize / (1024 * 1024),
        )}MB total`,

      // 1. Inicializar upload chunked no backend
      const uploadSession = await this.initializeChunkedUpload(
        fileName,
        totalSize,
        metadata,

      let uploadedBytes = 0;

      // 2. Upload cada chunk
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * this.CHUNK_SIZE;
        const end = Math.min(start + this.CHUNK_SIZE, totalSize);
        const chunkSize = end - start;

        console.log(
          `📤 Uploading chunk ${chunkIndex + 1}/${totalChunks} (${Math.round(
            chunkSize / 1024,
          )}KB)`,

        // Ler chunk do arquivo
        const chunkData = await RNFS.read(videoUri, chunkSize, start, 'base64');

        // Upload do chunk com retry
        await this.uploadChunkWithRetry(
          uploadSession.uploadId,
          chunkIndex,
          chunkData,
          chunkSize,

        uploadedBytes += chunkSize;

        // Atualizar progresso
        if (onProgress) {
          const progress = Math.round((uploadedBytes * 100) / totalSize);

          onProgress(progress);
        }

        console.log(`✅ Chunk ${chunkIndex + 1} uploaded successfully`);
      }

      // 3. Finalizar upload chunked
      console.log('🔄 Finalizing chunked upload...');
      const result = await this.finalizeChunkedUpload(uploadSession.uploadId);

      console.log('✅ Chunked upload completed successfully');

      return result;

    } catch (error: any) {
      console.error('❌ Chunked upload failed:', error);
      throw new Error(error.message || 'Erro no upload chunked');
    }
  }

  // Inicializar sessão de upload chunked
  private async initializeChunkedUpload(
    fileName: string,
    totalSize: number,
    metadata: any,
  ): Promise<{uploadId: string}> {
    try {
      const response = await apiClient.post<{uploadId: string}>(
        '/videos/upload/init',
        {
          fileName,
          totalSize,
          metadata,
        },

      if (response.data && response.data.uploadId) {
        return response.data;
      }

      throw new Error('Resposta inválida ao inicializar upload chunked');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Erro ao inicializar upload chunked',
      );
    }
  }

  // Upload de um chunk individual com retry
  private async uploadChunkWithRetry(
    uploadId: string,
    chunkIndex: number,
    chunkData: string,
    chunkSize: number,
    retryCount: number = 0,
  ): Promise<void> {
    try {
      await apiClient.post('/videos/upload/chunk', {
          uploadId,
          chunkIndex,
          chunkData,
          chunkSize,
        },
        {
          timeout: 30000, // 30 segundos por chunk
        },

    } catch (error: any) {
      if (retryCount < this.MAX_RETRIES - 1 && this.shouldRetryUpload(error)) {
        const delay = Math.pow(2, retryCount) * 500; // 500ms, 1s, 2s

        console.log(`🔄 Retrying chunk ${chunkIndex} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));

        return this.uploadChunkWithRetry(
          uploadId,
          chunkIndex,
          chunkData,
          chunkSize,
          retryCount + 1,
        );

      throw error;
    }
  }

  // Finalizar upload chunked
  private async finalizeChunkedUpload(uploadId: string): Promise<VideoData> {
    try {
      const response = await apiClient.post<VideoData>('/videos/upload/finalize', {
          uploadId,
        },
        {
          timeout: 60000, // 60 segundos para finalizar
        },

      if (response.data) {
        return response.data;
      }

      throw new Error('Resposta inválida ao finalizar upload chunked');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Erro ao finalizar upload chunked',
      );
    }
  }

  // Upload em lote (múltiplos vídeos)
  async uploadMultipleVideos(
    videoUploads: Array<{
      videoUri: string;
      exerciseType: ExerciseType;
      metadata?: Partial<VideoMetadata>;
    }>,
    onProgress?: (
      currentIndex: number,
      totalCount: number,
      currentProgress: number,
    ) => void,
  ): Promise<VideoData[]> {
    console.log(`📚 Starting batch upload of ${videoUploads.length} videos`);

    const results: VideoData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < videoUploads.length; i++) {
      const upload = videoUploads[i];

      try {
        console.log(`📹 Processing video ${i + 1}/${videoUploads.length}`);

        const result = await this.uploadVideo(
          upload.videoUri,
          upload.exerciseType,
          upload.metadata,
          progress => {
            if (onProgress) {
              onProgress(i, videoUploads.length, progress);
            }
          },
        );

        results.push(result);
        console.log(`✅ Video ${i + 1} uploaded successfully`);
      } catch (error: any) {
        console.error(`❌ Video ${i + 1} upload failed:`, error.message);
        errors.push(`Video ${i + 1}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.warn(
        `⚠️ Batch upload completed with ${errors.length} errors:`,
        errors,
      );
      showToast(
        `${results.length} vídeos enviados com sucesso. ${errors.length} falharam.`,
        'info',
      );
    } else {
      console.log('✅ Batch upload completed successfully');
      showToast(
        `Todos os ${results.length} vídeos foram enviados com sucesso!`,
        'success',
      );

    return results;
  }

  // Obter lista de vídeos
  async getVideos(
    page: number = 1,
    limit: number = 10,
    exerciseType?: ExerciseType,
    status?: string,
  ): Promise<{videos: VideoData[]; total: number; hasMore: boolean}> {
    try {
      let url = `/videos?page=${page}&limit=${limit}`;

      if (exerciseType) {
        url += `&exerciseType=${exerciseType}`;
      }

      if (status) {
        url += `&status=${status}`;
      }

      const response = await apiClient.get<{
        videos: VideoData[];
        total: number;
        hasMore: boolean;
      }>(url);

      if (response.data) {
        return response.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar vídeos');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter vídeo por ID
  async getVideoById(videoId: string): Promise<VideoData> {
    try {
      const response = await apiClient.get<ApiResponse<VideoData>>(
        `/videos/${videoId}`,

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar vídeo');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Atualizar metadados do vídeo
  async updateVideoMetadata(
    videoId: string,
    metadata: Partial<VideoMetadata>,
  ): Promise<VideoData> {
    try {
      const response = await apiClient.put<ApiResponse<VideoData>>(
        `/videos/${videoId}/metadata`,
        metadata,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao atualizar metadados');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Excluir vídeo
  async deleteVideo(videoId: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `/videos/${videoId}`,

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao excluir vídeo');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Gerar miniatura do vídeo
  async generateThumbnail(
    videoId: string,
    timestamp?: number,
  ): Promise<{thumbnailUrl: string}> {
    try {
      const response = await apiClient.post<
        ApiResponse<{thumbnailUrl: string}>
      >(`/videos/${videoId}/thumbnail`, {timestamp});

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao gerar miniatura');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Compartilhar vídeo
  async shareVideo(
    videoId: string,
    shareOptions: {
      platform?: 'social' | 'email' | 'link';
      privacy?: 'public' | 'private' | 'unlisted';
      expiresAt?: string;
    },
  ): Promise<{shareUrl: string; shareId: string}> {
    try {
      const response = await apiClient.post<
        ApiResponse<{
          shareUrl: string;
          shareId: string;
        }>
      >(`/videos/${videoId}/share`, shareOptions);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao compartilhar vídeo');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Download do vídeo
  async downloadVideo(
    videoId: string,
    quality?: 'original' | 'high' | 'medium' | 'low',
    onProgress?: (progress: number) => void,
  ): Promise<{downloadUrl: string}> {
    try {
      const response = await apiClient.post<ApiResponse<{downloadUrl: string}>>(
        `/videos/${videoId}/download`,
        {quality},
        {
          onDownloadProgress: progressEvent => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );

              onProgress(progress);
            }
          },
        },
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao baixar vídeo');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Processar vídeo (conversão, compressão, etc.)
  async processVideo(
    videoId: string,
    processOptions: {
      operation: 'compress' | 'convert' | 'trim' | 'stabilize';
      parameters?: any;
    },
  ): Promise<{processId: string}> {
    try {
      const response = await apiClient.post<ApiResponse<{processId: string}>>(
        `/videos/${videoId}/process`,
        processOptions,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao processar vídeo');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Verificar status do processamento
  async getProcessingStatus(processId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    result?: any;
    error?: string;
  }> {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          status: 'pending' | 'processing' | 'completed' | 'failed';
          progress: number;
          result?: any;
          error?: string;
        }>
      >(`/videos/process/${processId}/status`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao verificar status');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter análises do vídeo
  async getVideoAnalyses(videoId: string): Promise<any[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(
        `/videos/${videoId}/analyses`,

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar análises');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Adicionar marcadores ao vídeo
  async addVideoMarkers(
    videoId: string,
    markers: Array<{
      timestamp: number;
      type: 'error' | 'improvement' | 'highlight';
      description: string;
    }>,
  ): Promise<VideoData> {
    try {
      const response = await apiClient.post<ApiResponse<VideoData>>(
        `/videos/${videoId}/markers`,
        {markers},
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao adicionar marcadores');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter estatísticas do vídeo
  async getVideoStats(videoId: string): Promise<{
    views: number;
    analyses: number;
    shares: number;
    downloads: number;
    avgRating: number;
    totalRatings: number;
  }> {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          views: number;
          analyses: number;
          shares: number;
          downloads: number;
          avgRating: number;
          totalRatings: number;
        }>
      >(`/videos/${videoId}/stats`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar estatísticas');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Avaliar vídeo
  async rateVideo(
    videoId: string,
    rating: number,
    comment?: string,
  ): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        `/videos/${videoId}/rate`,
        {rating, comment},
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao avaliar vídeo');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter vídeos similares
  async getSimilarVideos(
    videoId: string,
    limit: number = 5,
  ): Promise<VideoData[]> {
    try {
      const response = await apiClient.get<ApiResponse<VideoData[]>>(
        `/videos/${videoId}/similar?limit=${limit}`,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || 'Erro ao carregar vídeos similares',
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Buscar vídeos
  async searchVideos(
    query: string,
    filters?: {
      exerciseType?: ExerciseType;
      dateRange?: {start: string; end: string};
      duration?: {min: number; max: number};
      rating?: {min: number; max: number};
    },
    page: number = 1,
    limit: number = 10,
  ): Promise<{videos: VideoData[]; total: number; hasMore: boolean}> {
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
          videos: VideoData[];
          total: number;
          hasMore: boolean;
        }>
      >(`/videos/search?${params.toString()}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro na busca');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter vídeos em destaque
  async getFeaturedVideos(limit: number = 10): Promise<VideoData[]> {
    try {
      const response = await apiClient.get<ApiResponse<VideoData[]>>(
        `/videos/featured?limit=${limit}`,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || 'Erro ao carregar vídeos em destaque',
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Marcar vídeo como favorito
  async toggleFavorite(videoId: string): Promise<{isFavorite: boolean}> {
    try {
      const response = await apiClient.post<ApiResponse<{isFavorite: boolean}>>(
        `/videos/${videoId}/favorite`,
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao favoritar vídeo');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }

  // Obter vídeos favoritos
  async getFavoriteVideos(
    page: number = 1,
    limit: number = 10,
  ): Promise<{videos: VideoData[]; total: number; hasMore: boolean}> {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          videos: VideoData[];
          total: number;
          hasMore: boolean;
        }>
      >(`/videos/favorites?page=${page}&limit=${limit}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Erro ao carregar favoritos');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro de conexão');
    }
  }
}

export const videoService = new VideoService();
